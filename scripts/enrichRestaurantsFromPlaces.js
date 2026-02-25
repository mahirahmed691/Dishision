/* eslint-disable no-console */
const admin = require("firebase-admin");
const axios = require("axios");
const path = require("path");

const DEFAULT_LIMIT = 300;
const BATCH_SIZE = 200;
const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACES_BASE_URL = "https://places.googleapis.com/v1/places";

const parseArgs = () => {
  const args = process.argv.slice(2);
  const hasFlag = (flag) => args.includes(flag);
  const getValue = (prefix, fallback) => {
    const raw = args.find((item) => item.startsWith(`${prefix}=`));
    if (!raw) {
      return fallback;
    }
    return raw.slice(prefix.length + 1);
  };

  return {
    dryRun: !hasFlag("--apply"),
    force: hasFlag("--force"),
    limit: Number(getValue("--limit", String(DEFAULT_LIMIT))),
    onlyMissingLogo: hasFlag("--only-missing-logo"),
    serviceAccountPath: getValue("--service-account", "google-service.json"),
  };
};

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

const hasValidLogo = (value) => /^https?:\/\//i.test(toText(value));

const titleCase = (value) =>
  toText(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const GOOGLE_TYPE_TO_CUISINE = {
  american_restaurant: "American",
  burger_restaurant: "American",
  steak_house: "Steak",
  chicken_restaurant: "Chicken",
  pizza_restaurant: "Italian",
  italian_restaurant: "Italian",
  mexican_restaurant: "Mexican",
  indian_restaurant: "Indian",
  chinese_restaurant: "Chinese",
  japanese_restaurant: "Japanese",
  korean_restaurant: "Korean",
  thai_restaurant: "Thai",
  turkish_restaurant: "Turkish",
  lebanese_restaurant: "Lebanese",
  mediterranean_restaurant: "Mediterranean",
  french_restaurant: "French",
  seafood_restaurant: "Seafood",
  vegan_restaurant: "Vegan",
  halal_restaurant: "Halal",
};

const PRICE_LEVEL_MAP = {
  PRICE_LEVEL_INEXPENSIVE: "$",
  PRICE_LEVEL_MODERATE: "$$",
  PRICE_LEVEL_EXPENSIVE: "$$$",
  PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
};

const CITY_PLACEHOLDERS = new Set([
  "location not specified",
  "unknown",
  "n/a",
  "na",
  "none",
  "null",
  "undefined",
  "placeholder",
  "test",
  "sample",
]);

const NAME_ALIASES = {
  inamointer: "Inamo",
  "dunkin doughnuts": "Dunkin Donuts",
  "asta luegos": "Hasta Luego",
  bundobust: "Bundobust",
  "ancoats coffee co": "Ancoats Coffee Co",
  "burger u k": "Burger UK",
};

const stripDiacritics = (value) =>
  toText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const sanitizeName = (value) =>
  stripDiacritics(value)
    .replace(/[_]+/g, " ")
    .replace(/[^\w\s&'+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeLookupKey = (value) =>
  sanitizeName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getAliasName = (name) => {
  const key = normalizeLookupKey(name);
  return NAME_ALIASES[key] || "";
};

const cleanCity = (value) => {
  const city = sanitizeName(value);
  if (!city) {
    return "";
  }
  return CITY_PLACEHOLDERS.has(city.toLowerCase()) ? "" : city;
};

const detectCuisine = (types = [], existingCuisine) => {
  if (toText(existingCuisine)) {
    return toText(existingCuisine);
  }

  for (const type of types) {
    const cuisine = GOOGLE_TYPE_TO_CUISINE[type];
    if (cuisine) {
      return cuisine;
    }
  }

  const restaurantType = types.find((type) => type.endsWith("_restaurant"));
  if (restaurantType) {
    return titleCase(restaurantType.replace("_restaurant", ""));
  }
  return "Unknown";
};

const buildNeedsEnrichment = (data, onlyMissingLogo) => {
  if (onlyMissingLogo) {
    return !hasValidLogo(data?.logo);
  }

  return (
    !toText(data?.address) ||
    !toText(data?.phone) ||
    !toText(data?.url) ||
    !toText(data?.cuisine) ||
    !hasOwn(data, "price") ||
    !hasOwn(data, "rating") ||
    !hasOwn(data, "reviewCount") ||
    !hasValidLogo(data?.logo)
  );
};

const buildQueryVariants = (docId, data) => {
  const rawName = toText(data?.restaurantName || docId);
  const name = sanitizeName(rawName);
  const alias = getAliasName(name);
  const city = cleanCity(data?.city);
  const byCity = city ? [`${name}, ${city}`, `${name} restaurant, ${city}`] : [];
  const aliasByCity = alias && city ? [`${alias}, ${city}`] : [];
  const noCity = [name, `${name} restaurant UK`, alias].filter(Boolean);

  return [...new Set([...byCity, ...aliasByCity, ...noCity].filter(Boolean))];
};

const getHeaders = (apiKey, fieldMask) => ({
  "X-Goog-Api-Key": apiKey,
  "X-Goog-FieldMask": fieldMask,
});

const findPlace = async (apiKey, queryText) => {
  const response = await axios.post(
    PLACES_SEARCH_URL,
    {
      textQuery: queryText,
      includedType: "restaurant",
      maxResultCount: 1,
      languageCode: "en-GB",
    },
    {
      headers: getHeaders(
        apiKey,
        "places.id,places.displayName,places.formattedAddress,places.types",
      ),
      timeout: 15000,
    },
  );

  const place = response?.data?.places?.[0];
  if (!place) {
    return null;
  }

  return {
    place_id: toText(place.id),
    name: toText(place?.displayName?.text),
    formatted_address: toText(place.formattedAddress),
    types: Array.isArray(place.types) ? place.types : [],
  };
};

const getPlaceDetails = async (apiKey, placeId) => {
  const response = await axios.get(`${PLACES_BASE_URL}/${placeId}`, {
    headers: getHeaders(
      apiKey,
      "id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,rating,userRatingCount,priceLevel,types",
    ),
    timeout: 15000,
  });

  const place = response?.data;
  if (!place) {
    return null;
  }

  return {
    name: toText(place?.displayName?.text),
    formatted_address: toText(place.formattedAddress),
    formatted_phone_number: toText(place.nationalPhoneNumber),
    website: toText(place.websiteUri),
    rating: typeof place.rating === "number" ? place.rating : null,
    user_ratings_total:
      typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    price_level: PRICE_LEVEL_MAP[place.priceLevel] || "",
    types: Array.isArray(place.types) ? place.types : [],
  };
};

const buildPatchFromPlace = (docId, data, place, details) => {
  if (!place || !details) {
    return null;
  }

  const types = Array.isArray(details.types) ? details.types : [];
  const website = toText(details.website);

  const patch = {
    address: toText(details.formatted_address || data?.address || ""),
    phone: toText(details.formatted_phone_number || data?.phone || ""),
    url: website || toText(data?.url || ""),
    cuisine: detectCuisine(types, data?.cuisine),
    rating:
      typeof details.rating === "number" ? details.rating : Number(data?.rating || 0),
    reviewCount:
      typeof details.user_ratings_total === "number"
        ? details.user_ratings_total
        : Number(data?.reviewCount || 0),
    price: toText(details.price_level || data?.price || ""),
    logo: hasValidLogo(data?.logo) ? data.logo : toText(data?.logo || ""),
    logoExternalUrl: toText(data?.logoExternalUrl || data?.logo || ""),
    logoStatus: hasValidLogo(data?.logo) ? "available" : "missing",
    enrichedBy: "google_places",
    lastEnrichedAt: admin.firestore.FieldValue.serverTimestamp(),
    placeId: toText(place.place_id || data?.placeId || ""),
  };

  // Keep existing non-empty values if new data is missing.
  if (!patch.address && toText(data?.address)) patch.address = data.address;
  if (!patch.phone && toText(data?.phone)) patch.phone = data.phone;
  if (!patch.url && toText(data?.url)) patch.url = data.url;
  if (!patch.price && toText(data?.price)) patch.price = data.price;
  if (!patch.logo && hasValidLogo(data?.logo)) patch.logo = data.logo;

  const hasAnyMeaningfulChange = Object.keys(patch).some((key) => {
    if (key === "lastEnrichedAt") return true;
    const oldValue = data?.[key];
    const newValue = patch[key];
    return JSON.stringify(oldValue ?? "") !== JSON.stringify(newValue ?? "");
  });

  return hasAnyMeaningfulChange ? patch : null;
};

const isMissingValue = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const buildFinalPatch = (existingData, candidatePatch, force) => {
  if (!candidatePatch) {
    return null;
  }

  if (force) {
    return candidatePatch;
  }

  const finalPatch = {};
  Object.keys(candidatePatch).forEach((key) => {
    if (key === "lastEnrichedAt" || key === "enrichedBy") {
      finalPatch[key] = candidatePatch[key];
      return;
    }

    if (key === "logoStatus") {
      const existingLogo = toText(existingData?.logo);
      if (!existingLogo) {
        finalPatch[key] = candidatePatch[key];
      }
      return;
    }

    if (key === "placeId") {
      if (isMissingValue(existingData?.placeId)) {
        finalPatch[key] = candidatePatch[key];
      }
      return;
    }

    if (isMissingValue(existingData?.[key])) {
      finalPatch[key] = candidatePatch[key];
    }
  });

  if (Object.keys(finalPatch).length === 2) {
    // only metadata keys were set
    return null;
  }

  return finalPatch;
};

const initializeAdmin = (serviceAccountPath) => {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  const absolutePath = path.resolve(process.cwd(), serviceAccountPath);
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const serviceAccount = require(absolutePath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return admin.firestore();
};

const run = async () => {
  const { dryRun, force, limit, onlyMissingLogo, serviceAccountPath } = parseArgs();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is required.");
  }

  const db = initializeAdmin(serviceAccountPath);
  const snap = await db.collection("restaurant").limit(limit).get();

  let scanned = 0;
  let matched = 0;
  let patched = 0;
  let written = 0;
  let unresolved = 0;

  const debugRows = [];
  let batch = db.batch();
  let batchWrites = 0;

  for (const docSnap of snap.docs) {
    scanned += 1;
    const docId = docSnap.id;
    const data = docSnap.data() || {};

    if (!buildNeedsEnrichment(data, onlyMissingLogo)) {
      continue;
    }

    const queryVariants = buildQueryVariants(docId, data);
    const queryText = queryVariants[0] || toText(data?.restaurantName || docId);
    let selectedPlace = null;
    let selectedQuery = "";

    try {
      for (const queryCandidate of queryVariants) {
        // Try with city then fallback to name-only for fuzzy matching.
        // eslint-disable-next-line no-await-in-loop
        const placeCandidate = await findPlace(apiKey, queryCandidate);
        if (placeCandidate?.place_id) {
          selectedPlace = placeCandidate;
          selectedQuery = queryCandidate;
          break;
        }
      }

      if (!selectedPlace?.place_id) {
        unresolved += 1;
        debugRows.push({
          id: docId,
          queryText,
          status: "no_place_match",
          attemptedQueries: queryVariants,
        });
        continue;
      }

      const details = await getPlaceDetails(apiKey, selectedPlace.place_id);
      const candidatePatch = buildPatchFromPlace(docId, data, selectedPlace, details);
      const patch = buildFinalPatch(data, candidatePatch, force);

      matched += 1;
      if (!patch) {
        debugRows.push({
          id: docId,
          queryText: selectedQuery,
          status: "matched_no_changes",
        });
        continue;
      }

        patched += 1;
      debugRows.push({
        id: docId,
        queryText: selectedQuery,
        status: dryRun ? "would_patch" : "patched",
        patchKeys: Object.keys(patch),
      });

      if (!dryRun) {
        batch.update(docSnap.ref, patch);
        batchWrites += 1;
        if (batchWrites >= BATCH_SIZE) {
          await batch.commit();
          written += batchWrites;
          batch = db.batch();
          batchWrites = 0;
        }
      }
    } catch (error) {
      unresolved += 1;
      debugRows.push({
        id: docId,
        queryText,
        status: "error",
        message:
          error?.response?.data?.error?.message ||
          error?.response?.data?.error_message ||
          error.message,
      });
    }
  }

  if (!dryRun && batchWrites > 0) {
    await batch.commit();
    written += batchWrites;
  }

  console.log(
    JSON.stringify(
      {
        scanned,
        matched,
        patched,
        written,
        unresolved,
        dryRun,
        force,
        onlyMissingLogo,
        inspectedLimit: limit,
      },
      null,
      2,
    ),
  );
  console.log("\nSample results:");
  debugRows.slice(0, 40).forEach((row) => console.log(row));
};

run().catch((error) => {
  console.error("Enrichment failed:", error.message);
  process.exit(1);
});
