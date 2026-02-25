import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  writeBatch,
  where,
} from "@firebase/firestore";
import { db } from "../config/firebase";
import { getRestaurantFallbackMenu } from "../data/restaurantMenus";

const RESTAURANTS_CACHE_KEY = "@dishision_restaurants_v2";
const MENU_SECTION_KEYS = ["starters", "mains", "desserts", "drinks"];

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const menuItemName = (item) =>
  toText(
    item?.name ??
      item?.title ??
      item?.itemName ??
      item?.dish ??
      item?.dishName ??
      "",
  );

const menuItemDescription = (item) =>
  toText(item?.description ?? item?.descriptions ?? "");

const menuItemPrice = (item) => toText(item?.price ?? item?.cost ?? "");

const normalizeIdentityToken = (value) =>
  `${value || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getRestaurantIdentityKey = (restaurant) => {
  const placeId = toText(restaurant?.placeId);
  if (placeId) {
    return `place:${placeId.toLowerCase()}`;
  }

  const normalizedName = normalizeIdentityToken(
    restaurant?.restaurantName || restaurant?.name || "",
  );
  const normalizedAddress = normalizeIdentityToken(restaurant?.address || "");
  if (normalizedName && normalizedAddress) {
    return `name:${normalizedName}|address:${normalizedAddress}`;
  }
  if (normalizedName) {
    return `name:${normalizedName}`;
  }
  return "";
};

const getRestaurantCompletenessScore = (restaurant) => {
  const normalized = normalizeRestaurantData(restaurant);
  if (!normalized) {
    return 0;
  }

  let score = 0;
  if (toText(normalized.restaurantName)) {
    score += 2;
  }
  if (toText(normalized.cuisine)) {
    score += 1;
  }
  if (toText(normalized.address)) {
    score += 1;
  }
  if (toText(normalized.url)) {
    score += 1;
  }
  if (toText(normalized.logoStorageUrl || normalized.logo)) {
    score += 2;
  }
  if (Number.isFinite(Number(normalized.rating)) && Number(normalized.rating) > 0) {
    score += 1;
  }
  MENU_SECTION_KEYS.forEach((section) => {
    if (Array.isArray(normalized[section]) && normalized[section].length > 0) {
      score += 1;
    }
  });
  return score;
};

const normalizeMenuItem = (item, section) => {
  const name = menuItemName(item);
  if (!name) {
    return null;
  }

  return {
    name,
    description: menuItemDescription(item),
    price: menuItemPrice(item),
    section,
    tags: Array.isArray(item?.tags)
      ? item.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0)
      : [],
  };
};

export const normalizeRestaurantData = (restaurant) => {
  if (!restaurant || typeof restaurant !== "object") {
    return null;
  }

  const preferredLogo = toText(restaurant?.logoStorageUrl || restaurant?.logo || "");
  const normalized = {
    ...restaurant,
    restaurantName: toText(restaurant?.restaurantName || restaurant?.name || ""),
    cuisine: toText(restaurant?.cuisine || ""),
    logoStorageUrl: toText(restaurant?.logoStorageUrl || ""),
    logoExternalUrl: toText(restaurant?.logoExternalUrl || restaurant?.logo || ""),
    logo: preferredLogo,
  };

  MENU_SECTION_KEYS.forEach((section) => {
    const rawItems = Array.isArray(restaurant?.[section]) ? restaurant[section] : [];
    normalized[section] = rawItems
      .map((item) => normalizeMenuItem(item, section))
      .filter(Boolean);
  });

  return normalized;
};

export const dedupeRestaurants = (restaurants) => {
  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    return [];
  }

  const byIdentity = new Map();
  const unnamed = [];

  restaurants
    .map(normalizeRestaurantData)
    .filter(Boolean)
    .forEach((restaurant) => {
      const key = getRestaurantIdentityKey(restaurant);
      if (!key) {
        unnamed.push(restaurant);
        return;
      }

      const existing = byIdentity.get(key);
      if (!existing) {
        byIdentity.set(key, restaurant);
        return;
      }

      const existingScore = getRestaurantCompletenessScore(existing);
      const nextScore = getRestaurantCompletenessScore(restaurant);
      byIdentity.set(key, nextScore >= existingScore ? restaurant : existing);
    });

  const merged = [...byIdentity.values(), ...unnamed];
  return merged.sort((a, b) =>
    toText(a?.restaurantName).localeCompare(toText(b?.restaurantName)),
  );
};

export const hasMenuSections = (restaurant) => {
  const normalized = normalizeRestaurantData(restaurant);
  if (!normalized) {
    return false;
  }
  return MENU_SECTION_KEYS.some((section) => normalized[section].length > 0);
};

export const getCachedRestaurants = async () => {
  try {
    const cached = await AsyncStorage.getItem(RESTAURANTS_CACHE_KEY);
    if (!cached) {
      return [];
    }
    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return dedupeRestaurants(parsed);
  } catch (error) {
    console.error("Failed to read restaurants cache:", error);
    return [];
  }
};

export const setCachedRestaurants = async (restaurants) => {
  try {
    const payload = dedupeRestaurants(restaurants);
    await AsyncStorage.setItem(RESTAURANTS_CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to write restaurants cache:", error);
  }
};

export const fetchRestaurantsPage = async ({ pageSize = 24, startAfterDoc = null } = {}) => {
  const restaurantsCollection = collection(db, "restaurant");
  const pageQuery = startAfterDoc
    ? query(
        restaurantsCollection,
        orderBy("restaurantName"),
        startAfter(startAfterDoc),
        limit(pageSize),
      )
    : query(restaurantsCollection, orderBy("restaurantName"), limit(pageSize));

  const snapshot = await getDocs(pageQuery);
  const restaurants = dedupeRestaurants(
    snapshot.docs
    .map((docItem) => normalizeRestaurantData(docItem.data()))
    .filter(Boolean),
  );

  return {
    restaurants,
    lastVisibleDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
};

export const loadRestaurantsSWR = async ({ pageSize = 24, onCached } = {}) => {
  const cached = await getCachedRestaurants();
  if (cached.length > 0 && typeof onCached === "function") {
    onCached(cached);
  }

  const fresh = await fetchRestaurantsPage({ pageSize });
  const dedupedFreshRestaurants = dedupeRestaurants(fresh.restaurants);
  await setCachedRestaurants(dedupedFreshRestaurants);
  return {
    ...fresh,
    restaurants: dedupedFreshRestaurants,
  };
};

const hasValidLogoUrl = (value) => {
  const logo = toText(value);
  if (!logo) {
    return false;
  }
  return /^https?:\/\//i.test(logo);
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

const buildRestaurantBackfillPatch = (
  restaurantDocData,
  docId,
  { includeTimestamp = true } = {},
) => {
  const data = restaurantDocData || {};
  const patch = {};
  const missingFields = [];

  const normalizedName = toText(data.restaurantName || docId);
  if (!toText(data.restaurantName)) {
    patch.restaurantName = normalizedName;
    missingFields.push("restaurantName");
  }

  if (!toText(data.cuisine)) {
    patch.cuisine = "Unknown";
    missingFields.push("cuisine");
  }

  if (!hasOwn(data, "address")) {
    patch.address = "";
    missingFields.push("address");
  }

  if (!hasOwn(data, "phone")) {
    patch.phone = "";
    missingFields.push("phone");
  }

  if (!hasOwn(data, "url")) {
    patch.url = "";
    missingFields.push("url");
  }

  if (!hasOwn(data, "price")) {
    patch.price = "";
    missingFields.push("price");
  }

  if (!hasOwn(data, "isHalal")) {
    patch.isHalal = false;
    missingFields.push("isHalal");
  }

  if (!hasOwn(data, "rating")) {
    patch.rating = 0;
    missingFields.push("rating");
  }

  if (!hasOwn(data, "reviewCount")) {
    patch.reviewCount = 0;
    missingFields.push("reviewCount");
  }

  MENU_SECTION_KEYS.forEach((section) => {
    if (!Array.isArray(data?.[section])) {
      patch[section] = [];
      missingFields.push(section);
    }
  });

  const effectiveLogo = toText(data?.logoStorageUrl || data?.logo || "");
  if (!hasValidLogoUrl(effectiveLogo)) {
    if (!hasOwn(data, "logo")) {
      patch.logo = "";
      missingFields.push("logo");
    }
    patch.logoStatus = "missing";
  } else if (data?.logoStatus === "missing") {
    patch.logoStatus = "available";
  }

  if (Object.keys(patch).length === 0) {
    return null;
  }

  if (includeTimestamp) {
    patch.lastBackfillAt = serverTimestamp();
  }
  patch.missingFieldCount = missingFields.length;
  return patch;
};

export const getRestaurantLogoCoverage = async ({ pageSize = 500 } = {}) => {
  const restaurantsCollection = collection(db, "restaurant");
  const snapshot = await getDocs(
    query(restaurantsCollection, orderBy("restaurantName"), limit(pageSize)),
  );

  const restaurants = snapshot.docs
    .map((docItem) => normalizeRestaurantData(docItem.data()))
    .filter(Boolean);

  const withLogo = [];
  const missingLogo = [];

  restaurants.forEach((restaurant) => {
    const name = toText(restaurant?.restaurantName || "Unknown");
    const effectiveLogo = toText(restaurant?.logoStorageUrl || restaurant?.logo || "");
    if (hasValidLogoUrl(effectiveLogo)) {
      withLogo.push(name);
    } else {
      missingLogo.push(name);
    }
  });

  return {
    total: restaurants.length,
    withLogoCount: withLogo.length,
    missingLogoCount: missingLogo.length,
    withLogo,
    missingLogo,
  };
};

export const backfillRestaurantMissingData = async ({
  pageSize = 500,
  dryRun = true,
} = {}) => {
  const restaurantsCollection = collection(db, "restaurant");
  const snapshot = await getDocs(
    query(restaurantsCollection, orderBy("restaurantName"), limit(pageSize)),
  );

  let batch = writeBatch(db);
  let pendingWrites = 0;
  let totalWrites = 0;
  const patchedRestaurants = [];

  for (const docItem of snapshot.docs) {
    const patch = buildRestaurantBackfillPatch(docItem.data(), docItem.id, {
      includeTimestamp: true,
    });
    if (!patch) {
      continue;
    }

    patchedRestaurants.push({
      id: docItem.id,
      restaurantName: toText(docItem.data()?.restaurantName || docItem.id),
      patchedFields: Object.keys(patch).filter((field) => field !== "lastBackfillAt"),
    });

    if (!dryRun) {
      batch.update(docItem.ref, patch);
      pendingWrites += 1;
      if (pendingWrites >= 400) {
        await batch.commit();
        totalWrites += pendingWrites;
        batch = writeBatch(db);
        pendingWrites = 0;
      }
    }
  }

  if (!dryRun && pendingWrites > 0) {
    await batch.commit();
    totalWrites += pendingWrites;
  }

  return {
    totalScanned: snapshot.docs.length,
    totalPatched: patchedRestaurants.length,
    totalWritten: dryRun ? 0 : totalWrites,
    dryRun,
    patchedRestaurants,
  };
};

export const fetchRestaurantMissingDataQueue = async ({ pageSize = 500 } = {}) => {
  const restaurantsCollection = collection(db, "restaurant");
  const snapshot = await getDocs(
    query(restaurantsCollection, orderBy("restaurantName"), limit(pageSize)),
  );

  const items = snapshot.docs
    .map((docItem) => {
      const data = docItem.data();
      const patch = buildRestaurantBackfillPatch(data, docItem.id, {
        includeTimestamp: false,
      });

      if (!patch) {
        return null;
      }

      return {
        id: docItem.id,
        restaurantName: toText(data?.restaurantName || docItem.id || "Unknown"),
        patchedFields: Object.keys(patch),
        patch,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.restaurantName.localeCompare(b.restaurantName));

  return {
    totalScanned: snapshot.docs.length,
    totalMissing: items.length,
    items,
  };
};

export const applyRestaurantBackfillById = async (docId) => {
  const restaurantRef = doc(db, "restaurant", docId);
  const snapshot = await getDoc(restaurantRef);

  if (!snapshot.exists()) {
    return { updated: false, reason: "not_found" };
  }

  const patch = buildRestaurantBackfillPatch(snapshot.data(), docId, {
    includeTimestamp: true,
  });

  if (!patch) {
    return { updated: false, reason: "no_changes" };
  }

  await updateDoc(restaurantRef, patch);
  return { updated: true, patchedFields: Object.keys(patch) };
};

const fetchRestaurantByName = async (restaurantName) => {
  const trimmedName = toText(restaurantName);
  if (!trimmedName) {
    return null;
  }

  const byIdRef = doc(db, "restaurant", trimmedName);
  const byIdSnapshot = await getDoc(byIdRef);
  if (byIdSnapshot.exists()) {
    const byIdData = normalizeRestaurantData(byIdSnapshot.data());
    if (byIdData) {
      return byIdData;
    }
  }

  const byFieldQuery = query(
    collection(db, "restaurant"),
    where("restaurantName", "==", trimmedName),
    limit(1),
  );
  const byFieldSnapshot = await getDocs(byFieldQuery);
  const firstMatch = byFieldSnapshot.docs[0]?.data();
  return firstMatch ? normalizeRestaurantData(firstMatch) : null;
};

export const resolveRestaurantMenuData = async ({
  restaurantName,
  seedRestaurant,
  devMenuFactory,
} = {}) => {
  const seed = normalizeRestaurantData(seedRestaurant);
  if (hasMenuSections(seed)) {
    return seed;
  }

  const remoteRestaurant = await fetchRestaurantByName(restaurantName);
  if (hasMenuSections(remoteRestaurant)) {
    return remoteRestaurant;
  }

  const fallbackMenu = normalizeRestaurantData(
    getRestaurantFallbackMenu(restaurantName),
  );
  if (hasMenuSections(fallbackMenu)) {
    return {
      ...(seed || {}),
      ...(fallbackMenu || {}),
      restaurantName:
        toText(seed?.restaurantName || restaurantName || fallbackMenu?.restaurantName),
    };
  }

  if (__DEV__ && typeof devMenuFactory === "function") {
    const devMenu = normalizeRestaurantData(devMenuFactory());
    if (devMenu) {
      return devMenu;
    }
  }

  return remoteRestaurant || seed || null;
};
