import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import * as Location from "expo-location";
import { Button, IconButton } from "react-native-paper";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faFire, faStar } from "@fortawesome/free-solid-svg-icons";
import FilterModal from "../components/FilterModal";
import SearchHeader from "../components/SearchHeader";
import LocationServices from "./Location";
import styles from "../screens/AppStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  dedupeRestaurants,
  fetchRestaurantsPage as fetchRestaurantsDataPage,
  loadRestaurantsSWR,
  setCachedRestaurants,
} from "../services/restaurantDataService";
import {
  DEFAULT_USER_PREFERENCES,
  fetchCurrentUserOnboardingState,
  fetchCurrentUserPreferences,
  setCurrentUserOnboardingState,
} from "../services/userPreferencesService";
import {
  getAdminUiSettings,
  getCurrentUserAdminAccess,
} from "../services/adminUiService";
import RestaurantLogo from "./RestaurantLogo";

const PAGE_SIZE = 24;
const TOP_DIVERSITY_WINDOW = 12;
const PER_CUISINE_CAP = 3;
const HOME_TOUR_STEPS = [
  {
    id: "search",
    target: "search",
    title: "Start with search",
    body: "Use the top search bar to quickly find restaurants by name or cuisine.",
  },
  {
    id: "filters",
    target: "filters",
    title: "Tune your feed",
    body: "Use the filter button to narrow by rating, cuisine, or halal preference.",
  },
  {
    id: "foryou",
    target: "forYou",
    title: "Personalized picks",
    body: "Your “For you” and top sections adapt from your taste profile settings.",
  },
  {
    id: "menu",
    target: "menuSection",
    title: "Search inside menus",
    body: "Open any restaurant to search that menu using prompts like “hot and cheesy”.",
  },
];

const getRestaurantKey = (restaurant) =>
  restaurant?.restaurantName || restaurant?.name || JSON.stringify(restaurant);

const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeArray = (values) => {
  if (!values.length) {
    return [];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) {
    return values.map(() => 1);
  }
  return values.map((value) => (value - min) / (max - min));
};

const getPriceTier = (rawPrice) => {
  const price = safeNumber(rawPrice, 20);
  if (price <= 15) {
    return 1;
  }
  if (price <= 30) {
    return 2;
  }
  return 3;
};

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const isPlaceholderMenuItemName = (value) => {
  const normalized = toText(value).toLowerCase();
  if (!normalized) {
    return true;
  }
  return (
    /^starter\s*\d+$/i.test(normalized) ||
    /^main\s*\d+$/i.test(normalized) ||
    /^dessert\s*\d+$/i.test(normalized) ||
    /^drink\s*\d+$/i.test(normalized) ||
    /^item\s*\d+$/i.test(normalized)
  );
};

const hasMeaningfulMenuItems = (restaurant) => {
  const sections = ["starters", "mains", "desserts", "drinks"];
  return sections.some((section) => {
    const items = Array.isArray(restaurant?.[section]) ? restaurant[section] : [];
    return items.some((item) => {
      const name = typeof item === "string" ? item : item?.name;
      return !isPlaceholderMenuItemName(name);
    });
  });
};

const isLikelyInvalidCoordinates = (restaurant) => {
  const lat = Number(restaurant?.lat);
  const lng = Number(restaurant?.long);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return false;
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return true;
  }

  const addressText = `${restaurant?.address || ""}`.toLowerCase();
  const isUkAddress =
    addressText.includes(" uk") ||
    addressText.includes("united kingdom") ||
    addressText.includes("england") ||
    addressText.includes("manchester") ||
    addressText.includes("london") ||
    addressText.includes("birmingham") ||
    addressText.includes("leeds") ||
    addressText.includes("liverpool");

  if (!isUkAddress) {
    return false;
  }

  const inUkLatRange = lat >= 49 && lat <= 61;
  const inUkLngRange = lng >= -9 && lng <= 2.5;
  return !(inUkLatRange && inUkLngRange);
};

const assessRestaurantDataQuality = (restaurant, rating) => {
  const hasLogo = Boolean(toText(restaurant?.logoStorageUrl || restaurant?.logo));
  const hasStorageLogo = Boolean(toText(restaurant?.logoStorageUrl));
  const hasAddress = Boolean(toText(restaurant?.address));
  const hasCuisine = Boolean(toText(restaurant?.cuisine));
  const hasUrl = Boolean(toText(restaurant?.url));
  const hasMenu = hasMeaningfulMenuItems(restaurant);
  const hasRating = Number.isFinite(Number(rating)) && Number(rating) > 0;
  const missingFieldCount = Number(restaurant?.missingFieldCount || 0);
  const needsReview = Boolean(restaurant?.dataQualityNeedsReview);
  const missingLogoFlag =
    `${restaurant?.logoStatus || ""}`.toLowerCase() === "missing" || !hasLogo;
  const invalidCoords = isLikelyInvalidCoordinates(restaurant);

  let score =
    (hasLogo ? 0.2 : 0) +
    (hasStorageLogo ? 0.08 : 0) +
    (hasAddress ? 0.16 : 0) +
    (hasCuisine ? 0.16 : 0) +
    (hasRating ? 0.16 : 0) +
    (hasUrl ? 0.1 : 0) +
    (hasMenu ? 0.14 : 0);

  const flags = [];
  let penalty = 0;
  if (missingLogoFlag) {
    flags.push("missing_logo");
    penalty += 0.1;
  }
  if (!hasMenu) {
    flags.push("weak_menu");
    penalty += 0.14;
  }
  if (missingFieldCount >= 3) {
    flags.push("missing_fields");
    penalty += 0.08;
  }
  if (needsReview) {
    flags.push("needs_review");
    penalty += 0.08;
  }
  if (invalidCoords) {
    flags.push("invalid_coords");
    penalty += 0.16;
  }

  score = Math.max(0, Math.min(1, score));
  return {
    score,
    penalty: Math.min(0.38, penalty),
    flags,
  };
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const haversineDistanceKm = (a, b) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(b.latitude - a.latitude);
  const deltaLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const Restaurants = ({ navigation, toggleDrawer, topInset = 0 }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedFoodType, setSelectedFoodType] = useState(null);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [hasMoreRestaurants, setHasMoreRestaurants] = useState(true);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [geoFilterNotice, setGeoFilterNotice] = useState("");
  const [userPreferences, setUserPreferences] = useState(DEFAULT_USER_PREFERENCES);
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(true);
  const [isTourVisible, setTourVisible] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [forYouLayoutY, setForYouLayoutY] = useState(0);
  const [menuSectionLayoutY, setMenuSectionLayoutY] = useState(0);
  const [showAdminQualityBadges, setShowAdminQualityBadges] = useState(false);
  const feedScrollRef = useRef(null);
  const userLocationCoordsRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const forYouOpacity = useRef(new Animated.Value(0)).current;
  const forYouTranslateY = useRef(new Animated.Value(10)).current;
  const effectiveHalalOnly = isHalal || userPreferences?.dietary?.halalOnly;
  const tasteTags = Array.isArray(userPreferences?.tasteTags)
    ? userPreferences.tasteTags
    : [];
  const preferredCuisineSet = useMemo(
    () =>
      new Set(
        (userPreferences?.favoriteCuisines || [])
          .map((item) => `${item}`.toLowerCase().trim())
          .filter(Boolean),
      ),
    [userPreferences?.favoriteCuisines],
  );
  const hasPreferenceProfile =
    preferredCuisineSet.size > 0 || effectiveHalalOnly || tasteTags.length > 0;
  const prioritizeTopRated = userPreferences?.discovery?.prioritizeTopRated !== false;

  // Function to handle "Show More" button press
  const handleShowMore = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
    // Get the restaurants for the selected category
    setSelectedRestaurants(groupedRestaurants[category]);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    // Other necessary state updates or functionality upon modal close
  };

  // Function to close the modal
  const FullScreenModal = ({
    selectedCategory,
    selectedRestaurants,
    onClose,
    navigateToFoodScreen,
    navigation,
  }) => {
    return (
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, marginTop: 40 }}>
          <IconButton
            icon="chevron-left"
            title="Go Back"
            onPress={() => {
              setModalVisible(false); // Update the state to close the modal
            }}
          />
          <Text style={{ fontSize: 30, fontWeight: "900", marginLeft: 20 }}>
            {selectedCategory}
          </Text>
          <View style={styles.fullScreenModalContainer}>
            <ScrollView contentContainerStyle={styles.restaurantListContainer}>
              {selectedRestaurants.map((restaurant, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.restaurantCardFullScreen}
                  onPress={() => {
                    navigateToFoodScreen(restaurant);
                    navigation.navigate("Menu", { restaurant });
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ width: "30%" }}>
                      <RestaurantLogo
                        uri={restaurant.logo}
                        name={restaurant.restaurantName}
                        style={styles.restaurantImage}
                      />
                    </View>
                    <View style={styles.restaurantInfo}>
                      <Text style={styles.restaurantName}>
                        {restaurant.restaurantName}
                      </Text>
                      <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <FontAwesomeIcon
                          icon={faStar}
                          size={12}
                          color="#00CDBC"
                          style={{ marginRight: 5 }}
                        />
                        <Text style={styles.ratingText}>
                          {(restaurant.rating * 2).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  const runFilters = (
    dataset,
    rating,
    foodType,
    halalOnly,
    text,
    radiusKm = null,
    userCoords = null,
  ) => {
    let filtered = [...dataset];

    if (text.trim() !== "") {
      const searchLowerCase = text.toLowerCase();
      filtered = filtered.filter((restaurant) =>
        restaurant.restaurantName?.toLowerCase().includes(searchLowerCase),
      );
    }

    if (rating !== null) {
      filtered = filtered.filter((restaurant) => restaurant.rating >= rating);
    }

    if (foodType !== null) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.cuisine?.toLowerCase() === foodType.toLowerCase(),
      );
    }

    if (halalOnly) {
      filtered = filtered.filter((restaurant) => restaurant.isHalal);
    }

    if (radiusKm !== null && userCoords) {
      filtered = filtered.filter((restaurant) => {
        const lat = toNumber(restaurant?.lat);
        const long = toNumber(restaurant?.long);
        if (lat === null || long === null) {
          return false;
        }

        const distance = haversineDistanceKm(userCoords, {
          latitude: lat,
          longitude: long,
        });
        return distance <= radiusKm;
      });
    }

    return filtered;
  };

  const mergeRestaurants = (current, incoming) => {
    return dedupeRestaurants([...current, ...incoming]);
  };

  const fetchRestaurantsPage = async ({ reset = false } = {}) => {
    if (isFetchingPage) {
      return;
    }

    if (!reset && !hasMoreRestaurants) {
      return;
    }

    setIsFetchingPage(true);
    setFetchError("");
    try {
      const page = await fetchRestaurantsDataPage({
        pageSize: PAGE_SIZE,
        startAfterDoc: reset ? null : lastVisibleDoc,
      });

      const nextRestaurants = reset
        ? page.restaurants
        : mergeRestaurants(restaurants, page.restaurants);

      setRestaurants(nextRestaurants);
      setFilteredRestaurants(
        runFilters(
          nextRestaurants,
          selectedRating,
          selectedFoodType,
          effectiveHalalOnly,
          searchText,
          selectedRadiusKm,
          userLocationCoordsRef.current,
        ),
      );
      setLastVisibleDoc(page.lastVisibleDoc);
      setHasMoreRestaurants(page.hasMore);
      setIsDataLoaded(true);
      await setCachedRestaurants(nextRestaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setFetchError("Couldn’t load restaurants. Check connection and try again.");
      setIsDataLoaded(true);
    } finally {
      setIsFetchingPage(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadRestaurants = async () => {
      try {
        const fresh = await loadRestaurantsSWR({
          pageSize: PAGE_SIZE,
          onCached: (cached) => {
            if (!isMounted) {
              return;
            }
            setRestaurants(cached);
            setFilteredRestaurants(
              runFilters(
                cached,
                selectedRating,
                selectedFoodType,
                effectiveHalalOnly,
                searchText,
                selectedRadiusKm,
                userLocationCoordsRef.current,
              ),
            );
            setIsDataLoaded(true);
          },
        });

        if (isMounted) {
          setRestaurants(fresh.restaurants);
          setFilteredRestaurants(
            runFilters(
              fresh.restaurants,
              selectedRating,
              selectedFoodType,
              effectiveHalalOnly,
              searchText,
              selectedRadiusKm,
              userLocationCoordsRef.current,
            ),
          );
          setLastVisibleDoc(fresh.lastVisibleDoc);
          setHasMoreRestaurants(fresh.hasMore);
          setIsDataLoaded(true);
        }
      } catch (loadError) {
        console.error("Failed to load restaurants feed:", loadError);
        if (isMounted) {
          setFetchError("Couldn’t load restaurants. Check connection and try again.");
          setIsDataLoaded(true);
        }
      }
    };

    loadRestaurants();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilteredRestaurants(
      runFilters(
        restaurants,
        selectedRating,
        selectedFoodType,
        effectiveHalalOnly,
        searchText,
        selectedRadiusKm,
        userLocationCoordsRef.current,
      ),
    );
    const hasActiveFilters =
      selectedRating !== null ||
      selectedFoodType !== null ||
      effectiveHalalOnly ||
      selectedRadiusKm !== null ||
      searchText.trim().length > 0;
    setIsFilterActive(hasActiveFilters);
  }, [
    effectiveHalalOnly,
    restaurants,
    searchText,
    selectedFoodType,
    selectedRadiusKm,
    selectedRating,
  ]);

  const loadPreferences = React.useCallback(async () => {
    try {
      setIsPreferencesLoading(true);
      const [prefs, onboarding] = await Promise.all([
        fetchCurrentUserPreferences(),
        fetchCurrentUserOnboardingState(),
      ]);
      setUserPreferences(prefs);
      if (onboarding?.preferencesCompleted && !onboarding?.tourCompleted) {
        setTourStepIndex(0);
        setTourVisible(true);
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
    } finally {
      setIsPreferencesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useFocusEffect(
    React.useCallback(() => {
      loadPreferences();
    }, [loadPreferences]),
  );

  const loadAdminVisibility = React.useCallback(async () => {
    try {
      const [isAdmin, adminUi] = await Promise.all([
        getCurrentUserAdminAccess(),
        getAdminUiSettings(),
      ]);
      setShowAdminQualityBadges(Boolean(isAdmin && adminUi?.showQualityBadges));
    } catch (error) {
      console.error("Failed to load admin quality badge settings:", error);
    }
  }, []);

  useEffect(() => {
    loadAdminVisibility();
  }, [loadAdminVisibility]);

  useFocusEffect(
    React.useCallback(() => {
      loadAdminVisibility();
    }, [loadAdminVisibility]),
  );

  const ensureUserLocationCoords = React.useCallback(async () => {
    if (userLocationCoordsRef.current) {
      return userLocationCoordsRef.current;
    }

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setGeoFilterNotice("Location permission denied. Distance filter was not applied.");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      userLocationCoordsRef.current = coords;
      setGeoFilterNotice("");
      return coords;
    } catch (error) {
      console.error("Failed to fetch current location for radius filter:", error);
      setGeoFilterNotice("Couldn’t fetch your location. Distance filter was not applied.");
      return null;
    }
  }, []);

  const applyFilters = (
    rating,
    foodType,
    halalOnly,
    text,
    radiusKm = selectedRadiusKm,
    userCoords = userLocationCoordsRef.current,
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const effectiveHalal = halalOnly || userPreferences?.dietary?.halalOnly;
    const filtered = runFilters(
      restaurants,
      rating,
      foodType,
      effectiveHalal,
      text,
      radiusKm,
      userCoords,
    );
    setFilteredRestaurants(filtered);
    const hasActiveFilters =
      rating !== null ||
      foodType !== null ||
      effectiveHalal ||
      radiusKm !== null ||
      text.trim().length > 0;
    setIsFilterActive(hasActiveFilters);
  };

  const handleApplyFilters = async (rating, foodType, halalOnly, radiusKm) => {
    setSelectedRating(rating);
    setSelectedFoodType(foodType);
    setIsHalal(halalOnly);

    let activeCoords = userLocationCoordsRef.current;
    let effectiveRadiusKm = radiusKm;
    if (radiusKm !== null) {
      activeCoords = await ensureUserLocationCoords();
      if (!activeCoords) {
        effectiveRadiusKm = null;
      }
    } else {
      setGeoFilterNotice("");
    }

    setSelectedRadiusKm(effectiveRadiusKm);

    applyFilters(
      rating,
      foodType,
      halalOnly,
      searchText,
      effectiveRadiusKm,
      activeCoords,
    );
  };

  const handleInputChange = (text) => {
    setSearchText(text);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilteredRestaurants(
      runFilters(
        restaurants,
        selectedRating,
        selectedFoodType,
        effectiveHalalOnly,
        text,
        selectedRadiusKm,
        userLocationCoordsRef.current,
      ),
    );
    const hasActiveFilters =
      selectedRating !== null ||
      selectedFoodType !== null ||
      effectiveHalalOnly ||
      selectedRadiusKm !== null ||
      text.trim().length > 0;
    setIsFilterActive(hasActiveFilters);
  };

  const handleShowAll = () => {
    setFilteredRestaurants(restaurants);
    setSearchText("");
    setSelectedRating(null);
    setSelectedFoodType(null);
    setSelectedRadiusKm(null);
    setIsHalal(false);
    setIsFilterActive(false);
    setGeoFilterNotice("");
  };
  const handleShowFeatured = () => {
    setSelectedCategory("Featured today");
    setSelectedRestaurants(featuredRestaurants.map((item) => item.restaurant));
    setModalVisible(true);
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const navigateToFoodScreen = (restaurant) => {
    navigation.navigate("Menu", { restaurant });
    setModalVisible(false);
  };

  const groupRestaurantsByCuisine = (restaurants) => {
    const groupedRestaurants = {};

    restaurants.forEach((restaurant) => {
      const cuisineType = `${restaurant?.cuisine || "other"}`.toLowerCase();
      if (!groupedRestaurants[cuisineType]) {
        groupedRestaurants[cuisineType] = [];
      }
      groupedRestaurants[cuisineType].push(restaurant);
    });

    return groupedRestaurants;
  };

  const rankingMeta = useMemo(() => {
    if (!filteredRestaurants.length) {
      return { ranked: [], reasonByKey: {}, forYou: [], qualityByKey: {} };
    }

    const tokens = searchText
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 1);

    const wantsBudget = tokens.some((token) =>
      ["cheap", "budget", "affordable", "value"].includes(token),
    );
    const wantsPremium = tokens.some((token) =>
      ["premium", "fancy", "luxury", "high-end"].includes(token),
    );

    // Bayesian smoothed rating: protects against tiny-sample over-ranking.
    const priorMean = 3.8;
    const priorWeight = 10;

    const base = filteredRestaurants.map((restaurant) => {
      const rating = safeNumber(restaurant?.rating, 0);
      const reviewCount = Math.max(
        1,
        safeNumber(
          restaurant?.reviewCount ??
            restaurant?.reviewsCount ??
            restaurant?.numReviews,
          5,
        ),
      );
      const smoothedRating =
        ((reviewCount * rating) + priorWeight * priorMean) /
        (reviewCount + priorWeight);

      const popularityRaw = safeNumber(
        restaurant?.orderCount ??
          restaurant?.ordersCount ??
          restaurant?.popularity ??
          restaurant?.reviewCount,
        reviewCount,
      );

      const haystack = `${restaurant?.restaurantName || ""} ${restaurant?.cuisine || ""}`.toLowerCase();
      const queryMatchRaw =
        tokens.length === 0
          ? 0.5
          : tokens.filter((token) => haystack.includes(token)).length / tokens.length;

      const cuisineKey = `${restaurant?.cuisine || ""}`.toLowerCase().trim();
      const cuisineAffinityRaw =
        preferredCuisineSet.size === 0
          ? 0.5
          : preferredCuisineSet.has(cuisineKey)
            ? 1
            : 0.2;

      let dietaryPreferenceRaw = 0.5;
      if (userPreferences?.dietary?.halalOnly) {
        dietaryPreferenceRaw = restaurant?.isHalal ? 1 : 0;
      }

      const quality = assessRestaurantDataQuality(restaurant, rating);

      const priceTier = getPriceTier(restaurant?.price);
      let priceFitRaw = 0.5;
      if (wantsBudget) {
        priceFitRaw = priceTier === 1 ? 1 : priceTier === 2 ? 0.45 : 0.1;
      } else if (wantsPremium) {
        priceFitRaw = priceTier === 3 ? 1 : priceTier === 2 ? 0.55 : 0.2;
      }

      return {
        restaurant,
        smoothedRating,
        popularityRaw,
        queryMatchRaw,
        cuisineAffinityRaw,
        dietaryPreferenceRaw,
        dataQualityRaw: quality.score,
        dataQualityPenaltyRaw: quality.penalty,
        dataQualityFlags: quality.flags,
        priceFitRaw,
      };
    });

    const normRating = normalizeArray(base.map((entry) => entry.smoothedRating));
    const normPopularity = normalizeArray(base.map((entry) => entry.popularityRaw));

    const weighted = base.map((entry, index) => {
      const ratingWeight = prioritizeTopRated ? 0.34 : 0.26;
      const queryWeight = prioritizeTopRated ? 0.2 : 0.22;
      const popularityWeight = prioritizeTopRated ? 0.16 : 0.12;
      const cuisineWeight = preferredCuisineSet.size > 0 ? 0.16 : 0.08;
      const dietaryWeight = userPreferences?.dietary?.halalOnly ? 0.08 : 0.04;
      const priceWeight = 0.1;
      const qualityWeight = 0.16;
      const qualityPenaltyWeight = 0.22;

      const score =
        ratingWeight * normRating[index] +
        queryWeight * entry.queryMatchRaw +
        popularityWeight * normPopularity[index] +
        cuisineWeight * entry.cuisineAffinityRaw +
        dietaryWeight * entry.dietaryPreferenceRaw +
        priceWeight * entry.priceFitRaw +
        qualityWeight * entry.dataQualityRaw -
        qualityPenaltyWeight * entry.dataQualityPenaltyRaw;

      const reasons = [];
      if (normRating[index] >= 0.75) {
        reasons.push("Top rated");
      }
      if (entry.queryMatchRaw >= 0.66 && tokens.length > 0) {
        reasons.push("Best match");
      }
      if (normPopularity[index] >= 0.75) {
        reasons.push("Popular");
      }
      if (preferredCuisineSet.size > 0 && entry.cuisineAffinityRaw >= 1) {
        reasons.push("Matches your cuisines");
      }
      if (userPreferences?.dietary?.halalOnly && entry.dietaryPreferenceRaw >= 1) {
        reasons.push("Fits your dietary settings");
      }
      if (wantsBudget && entry.priceFitRaw >= 0.9) {
        reasons.push("Good value");
      }
      if (wantsPremium && entry.priceFitRaw >= 0.9) {
        reasons.push("Premium pick");
      }
      if (entry.dataQualityRaw >= 0.8 && entry.dataQualityPenaltyRaw <= 0.08) {
        reasons.push("Complete profile");
      }
      if (reasons.length === 0) {
        reasons.push("Recommended");
      }

      return {
        restaurant: entry.restaurant,
        score,
        reasons,
        dataQualityRaw: entry.dataQualityRaw,
        dataQualityPenaltyRaw: entry.dataQualityPenaltyRaw,
        dataQualityFlags: entry.dataQualityFlags,
      };
    });

    const sorted = [...weighted].sort((a, b) => b.score - a.score);
    const healthyPoolCount = sorted.filter(
      (item) => item.dataQualityRaw >= 0.46 && item.dataQualityPenaltyRaw <= 0.22,
    ).length;
    const qualityFiltered =
      healthyPoolCount >= 10
        ? sorted.filter(
            (item) =>
              item.dataQualityRaw >= 0.22 &&
              !(item.dataQualityFlags || []).includes("invalid_coords"),
          )
        : sorted;

    const forYou = qualityFiltered
      .filter(
        (item) =>
          item.reasons.includes("Matches your cuisines") ||
          item.reasons.includes("Fits your dietary settings"),
      )
      .slice(0, 6)
      .map((item) => item.restaurant);

    // Diversity cap in top window so one cuisine does not dominate.
    const cuisineCounts = {};
    const topWindow = [];
    const overflow = [];

    qualityFiltered.forEach((item, index) => {
      if (index >= TOP_DIVERSITY_WINDOW) {
        overflow.push(item);
        return;
      }

      const cuisineKey = `${item.restaurant?.cuisine || "other"}`.toLowerCase();
      const count = cuisineCounts[cuisineKey] || 0;
      if (count < PER_CUISINE_CAP) {
        cuisineCounts[cuisineKey] = count + 1;
        topWindow.push(item);
      } else {
        overflow.push(item);
      }
    });

    const finalRanked = [...topWindow, ...overflow].map((item) => item.restaurant);
    const reasonByKey = qualityFiltered.reduce((acc, item) => {
      acc[getRestaurantKey(item.restaurant)] = item.reasons[0];
      return acc;
    }, {});
    const qualityByKey = qualityFiltered.reduce((acc, item) => {
      acc[getRestaurantKey(item.restaurant)] = {
        score: item.dataQualityRaw,
        penalty: item.dataQualityPenaltyRaw,
        flags: item.dataQualityFlags,
      };
      return acc;
    }, {});

    return { ranked: finalRanked, reasonByKey, forYou, qualityByKey };
  }, [
    filteredRestaurants,
    preferredCuisineSet,
    prioritizeTopRated,
    searchText,
    userPreferences?.dietary?.halalOnly,
  ]);
  const shouldShowForYou = hasPreferenceProfile && rankingMeta?.forYou?.length > 0;

  const groupedRestaurants = groupRestaurantsByCuisine(rankingMeta.ranked);
  const cuisineEntries = Object.entries(groupedRestaurants);
  const tourSteps = useMemo(() => {
    const base = [
      HOME_TOUR_STEPS[0],
      HOME_TOUR_STEPS[1],
    ];

    if (shouldShowForYou) {
      base.push(HOME_TOUR_STEPS[2]);
    } else {
      base.push({
        ...HOME_TOUR_STEPS[2],
        target: "menuSection",
        title: "Smart feed sections",
        body: "Your feed groups restaurants by quality and cuisine so you can browse faster.",
      });
    }

    base.push(HOME_TOUR_STEPS[3]);
    return base;
  }, [shouldShowForYou]);
  const activeFilterCount =
    (selectedRating !== null ? 1 : 0) +
    (selectedFoodType ? 1 : 0) +
    (effectiveHalalOnly ? 1 : 0) +
    (selectedRadiusKm !== null ? 1 : 0);
  const isInitialLoading = !isDataLoaded && restaurants.length === 0;

  const formatCuisineTitle = (cuisineType) =>
    cuisineType
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  const getQualityBadgeLabel = (restaurant) => {
    const meta = rankingMeta?.qualityByKey?.[getRestaurantKey(restaurant)];
    if (!meta) {
      return "Q: n/a";
    }
    const quality = Math.max(0, Math.min(1, Number(meta.score || 0)));
    return `Q: ${Math.round(quality * 100)}`;
  };
  const topRatedRestaurants = [...rankingMeta.ranked]
    .sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0))
    .slice(0, 6);
  const featuredRestaurants = useMemo(() => {
    if (!rankingMeta?.ranked?.length) {
      return [];
    }

    const withSignals = rankingMeta.ranked
      .map((restaurant) => {
        const key = getRestaurantKey(restaurant);
        const quality = rankingMeta?.qualityByKey?.[key] || {};
        return {
          restaurant,
          qualityScore: Number(quality?.score || 0),
          rating: Number(restaurant?.rating || 0),
          hasLogo: Boolean(toText(restaurant?.logoStorageUrl || restaurant?.logo)),
          reason: rankingMeta?.reasonByKey?.[key] || "Recommended",
        };
      })
      .sort((a, b) => {
        const aScore = (a.hasLogo ? 0.45 : 0) + a.qualityScore * 0.35 + a.rating * 0.2;
        const bScore = (b.hasLogo ? 0.45 : 0) + b.qualityScore * 0.35 + b.rating * 0.2;
        return bScore - aScore;
      });

    const cuisineCounts = {};
    const picked = [];
    withSignals.forEach((entry) => {
      if (picked.length >= 6) {
        return;
      }
      const cuisineKey = `${entry.restaurant?.cuisine || "other"}`.toLowerCase();
      const count = cuisineCounts[cuisineKey] || 0;
      if (count >= 2) {
        return;
      }
      cuisineCounts[cuisineKey] = count + 1;
      picked.push(entry);
    });

    if (!picked.length) {
      return rankingMeta.ranked.slice(0, 6).map((restaurant) => ({
        restaurant,
        reason: rankingMeta?.reasonByKey?.[getRestaurantKey(restaurant)] || "Recommended",
      }));
    }

    return picked;
  }, [rankingMeta]);

  const clearSearch = () => {
    setSearchText("");
    applyFilters(selectedRating, selectedFoodType, effectiveHalalOnly, "");
  };

  const currentTourStep = tourSteps[tourStepIndex] || null;
  const isDeepFocusStep =
    currentTourStep?.target === "forYou" || currentTourStep?.target === "menuSection";

  const finishTour = async () => {
    setTourVisible(false);
    try {
      await setCurrentUserOnboardingState({
        tourCompleted: true,
      });
    } catch (error) {
      console.error("Failed to mark tour as completed:", error);
    }
  };

  const handleTourNext = () => {
    if (tourStepIndex >= tourSteps.length - 1) {
      finishTour();
      return;
    }
    setTourStepIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isTourVisible || !currentTourStep) {
      return;
    }

    if (
      currentTourStep.target === "search" ||
      currentTourStep.target === "filters"
    ) {
      feedScrollRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
      return;
    }

    if (currentTourStep.target === "forYou" && forYouLayoutY > 0) {
      feedScrollRef.current?.scrollToOffset({
        offset: Math.max(forYouLayoutY - 90, 0),
        animated: true,
      });
    }

    if (currentTourStep.target === "menuSection" && menuSectionLayoutY > 0) {
      feedScrollRef.current?.scrollToOffset({
        offset: Math.max(menuSectionLayoutY - 90, 0),
        animated: true,
      });
    }
  }, [currentTourStep, forYouLayoutY, isTourVisible, menuSectionLayoutY]);

  useEffect(() => {
    if (!isTourVisible) {
      return;
    }
    if (tourStepIndex >= tourSteps.length) {
      setTourStepIndex(Math.max(tourSteps.length - 1, 0));
    }
  }, [isTourVisible, tourStepIndex, tourSteps.length]);

  useEffect(() => {
    if (!shouldShowForYou) {
      forYouOpacity.setValue(0);
      forYouTranslateY.setValue(10);
      return;
    }

    Animated.parallel([
      Animated.timing(forYouOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(forYouTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [forYouOpacity, forYouTranslateY, shouldShowForYou]);

  return (
    <View style={styles.restaurantContainer}>
      <View style={[homeTopStyles.searchBlock, { paddingTop: topInset + 2 }]}>
        <View
          style={[
            isTourVisible && currentTourStep?.target === "search"
              ? homeTopStyles.spotlightTarget
              : null,
          ]}
        >
          <SearchHeader
            value={searchText}
            onChangeText={handleInputChange}
            onPressClear={clearSearch}
            placeholder="Search for a food place"
            leftAccessory={(
              <TouchableOpacity
                activeOpacity={0.8}
                style={homeTopStyles.menuButton}
                onPress={toggleDrawer || (() => {})}
              >
                <IconButton
                  icon="menu"
                  iconColor="#FFFFFF"
                  size={22}
                  style={homeTopStyles.menuButtonIcon}
                />
              </TouchableOpacity>
            )}
            trailingInShell={(
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  homeTopStyles.filterAction,
                  isTourVisible && currentTourStep?.target === "filters"
                    ? homeTopStyles.spotlightTarget
                    : null,
                ]}
                onPress={openFilterModal}
              >
                <IconButton
                  icon="tune"
                  iconColor="#0F172A"
                  size={20}
                  style={homeTopStyles.iconNoMargin}
                />
                {activeFilterCount > 0 ? (
                  <View style={homeTopStyles.filterBadge}>
                    <Text style={homeTopStyles.filterBadgeText}>
                      {activeFilterCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            )}
          />
        </View>
        <FilterModal
          visible={isFilterModalVisible}
          onClose={closeFilterModal}
          isHalal={effectiveHalalOnly}
          selectedRating={selectedRating}
          selectedFoodType={selectedFoodType}
          selectedRadiusKm={selectedRadiusKm}
          onApplyFilters={handleApplyFilters}
        />
        {!!fetchError ? (
          <View style={homeTopStyles.retryStrip}>
            <Text style={homeTopStyles.retryText}>{fetchError}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => fetchRestaurantsPage({ reset: restaurants.length === 0 })}
              style={homeTopStyles.retryButton}
            >
              <Text style={homeTopStyles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {!!geoFilterNotice ? (
          <View style={homeTopStyles.geoNoticeStrip}>
            <Text style={homeTopStyles.geoNoticeText}>{geoFilterNotice}</Text>
          </View>
        ) : null}

        {isPreferencesLoading ? (
          <View style={homeTopStyles.preferenceRibbonSkeleton}>
            <View style={homeTopStyles.preferenceSkeletonChipWide} />
            <View style={homeTopStyles.preferenceSkeletonChip} />
            <View style={homeTopStyles.preferenceSkeletonChip} />
            <View style={homeTopStyles.preferenceSkeletonCta} />
          </View>
        ) : null}

        {hasPreferenceProfile ? (
          <View style={homeTopStyles.preferenceRibbon}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={homeTopStyles.preferenceChipsRow}>
                {effectiveHalalOnly ? (
                  <View style={homeTopStyles.preferenceChip}>
                    <Text style={homeTopStyles.preferenceChipText}>Halal only</Text>
                  </View>
                ) : null}
                {Array.from(preferredCuisineSet)
                  .slice(0, 3)
                  .map((cuisine) => (
                    <View key={cuisine} style={homeTopStyles.preferenceChip}>
                      <Text style={homeTopStyles.preferenceChipText}>
                        {formatCuisineTitle(cuisine)}
                      </Text>
                    </View>
                  ))}
                {tasteTags.slice(0, 2).map((tag) => (
                  <View key={tag} style={homeTopStyles.preferenceChip}>
                    <Text style={homeTopStyles.preferenceChipText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={homeTopStyles.preferenceEditButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={homeTopStyles.preferenceEditText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!hasPreferenceProfile ? (
          <TouchableOpacity
            activeOpacity={0.86}
            style={homeTopStyles.onboardingNudge}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={homeTopStyles.onboardingNudgeIcon}>
              <IconButton icon="star-four-points" size={16} iconColor="#00CDBC" style={homeTopStyles.iconNoMargin} />
            </View>
            <View style={homeTopStyles.onboardingNudgeCopy}>
              <Text style={homeTopStyles.onboardingNudgeTitle}>Tune your taste profile</Text>
              <Text style={homeTopStyles.onboardingNudgeText}>
                Pick cuisines and dietary settings for smarter suggestions.
              </Text>
            </View>
            <Text style={homeTopStyles.onboardingNudgeAction}>Set up</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isInitialLoading ? (
        <ScrollView contentContainerStyle={homeTopStyles.skeletonContent}>
          <View style={homeTopStyles.skeletonLocation} />
          <View style={homeTopStyles.skeletonHero} />
          {[0, 1, 2].map((section) => (
            <View key={`skeleton-${section}`} style={homeTopStyles.skeletonSection}>
              <View style={homeTopStyles.skeletonHeading} />
              <View style={homeTopStyles.skeletonCardsRow}>
                {[0, 1, 2].map((item) => (
                  <View key={`card-${section}-${item}`} style={homeTopStyles.skeletonCard}>
                    <View style={homeTopStyles.skeletonImage} />
                    <View style={homeTopStyles.skeletonLineWide} />
                    <View style={homeTopStyles.skeletonLineShort} />
                  </View>
                ))}
              </View>
            </View>
          ))}
          <ActivityIndicator
            size="small"
            color="#00CDBC"
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      ) : null}

      {isDataLoaded && filteredRestaurants.length > 0 ? (
        <FlatList
          ref={feedScrollRef}
          data={cuisineEntries}
          keyExtractor={([cuisineType]) => cuisineType}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 84 }}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          onEndReachedThreshold={0.35}
          onEndReached={() => {
            if (!isFilterActive && hasMoreRestaurants && !isFetchingPage) {
              fetchRestaurantsPage();
            }
          }}
          ListHeaderComponent={(
            <>
              <LocationServices />

              {featuredRestaurants.length > 0 ? (
                <View style={homeTopStyles.featuredSectionCard}>
                  <View style={homeTopStyles.cuisineSectionHeader}>
                    <View>
                      <Text style={homeTopStyles.cuisineTitle}>Featured today</Text>
                      <Text style={homeTopStyles.cuisineMeta}>
                        High quality picks curated from today&apos;s feed
                      </Text>
                    </View>
                    {featuredRestaurants.length > 3 ? (
                      <TouchableOpacity
                        activeOpacity={0.82}
                        style={homeTopStyles.cuisineAction}
                        onPress={handleShowFeatured}
                      >
                        <Text style={homeTopStyles.cuisineActionText}>View all</Text>
                        <IconButton
                          style={homeTopStyles.cuisineActionIcon}
                          iconColor="#00CDBC"
                          icon="arrow-right"
                          size={16}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={homeTopStyles.sectionListContent}
                  >
                    {featuredRestaurants.map((entry, idx) => {
                      const restaurant = entry.restaurant;
                      return (
                        <TouchableOpacity
                          key={`${restaurant.restaurantName}-featured-${idx}`}
                          style={[
                            styles.restaurantCardHorizontal,
                            homeTopStyles.featuredCardItem,
                          ]}
                          onPress={() => navigateToFoodScreen(restaurant)}
                        >
                          <View>
                            <RestaurantLogo
                              uri={restaurant.logo}
                              name={restaurant.restaurantName}
                              style={homeTopStyles.featuredLogo}
                              surface="neutral"
                            />
                            <View style={homeTopStyles.featuredInfo}>
                              <Text
                                style={homeTopStyles.featuredName}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                              >
                                {restaurant.restaurantName}
                              </Text>
                              <View style={homeTopStyles.reasonPill}>
                                <Text style={homeTopStyles.reasonPillText}>
                                  {entry.reason}
                                </Text>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginTop: 0,
                                }}
                              >
                                <Text style={styles.restaurantRating}>
                                  {(restaurant.rating * 2).toFixed(1)}
                                </Text>
                                {restaurant.rating >= 4.5 ? (
                                  <FontAwesomeIcon icon={faFire} size={12} color="orange" />
                                ) : null}
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              {shouldShowForYou ? (
                <Animated.View
                  onLayout={(event) => setForYouLayoutY(event.nativeEvent.layout.y)}
                  style={[
                    homeTopStyles.personalizedSectionCard,
                    isTourVisible && currentTourStep?.target === "forYou"
                      ? homeTopStyles.spotlightTargetDeep
                      : null,
                    {
                      opacity: forYouOpacity,
                      transform: [{ translateY: forYouTranslateY }],
                    },
                  ]}
                >
                  <View style={homeTopStyles.cuisineSectionHeader}>
                    <View>
                      <Text style={homeTopStyles.cuisineTitle}>For you</Text>
                      <Text style={homeTopStyles.cuisineMeta}>
                        Personalized from your profile preferences
                      </Text>
                    </View>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={homeTopStyles.sectionListContent}
                  >
                    {rankingMeta.forYou.map((restaurant, idx) => (
                      <TouchableOpacity
                        key={`${restaurant.restaurantName}-for-you-${idx}`}
                        style={[
                          styles.restaurantCardHorizontal,
                          homeTopStyles.sectionCardItem,
                        ]}
                        onPress={() => navigateToFoodScreen(restaurant)}
                      >
                        <View>
                          <RestaurantLogo
                            uri={restaurant.logo}
                            name={restaurant.restaurantName}
                            style={styles.logoHorizontal}
                          />
                          <View style={styles.restaurantInfoHorizontal}>
                            <Text
                              style={styles.restaurantNameHorizontal}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {restaurant.restaurantName}
                            </Text>
                            <View style={homeTopStyles.reasonPill}>
                              <Text style={homeTopStyles.reasonPillText}>
                                {rankingMeta.reasonByKey[getRestaurantKey(restaurant)] ||
                                  "Recommended"}
                              </Text>
                            </View>
                            {showAdminQualityBadges ? (
                              <View style={homeTopStyles.adminQualityPill}>
                                <Text style={homeTopStyles.adminQualityPillText}>
                                  {getQualityBadgeLabel(restaurant)}
                                </Text>
                              </View>
                            ) : null}
                            <Text style={styles.restaurantRating}>
                              {(restaurant.rating * 2).toFixed(1)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              ) : null}

              {topRatedRestaurants.length > 0 ? (
                <View
                  onLayout={(event) => setMenuSectionLayoutY(event.nativeEvent.layout.y)}
                  style={[
                    homeTopStyles.cuisineSectionCard,
                    isTourVisible && currentTourStep?.target === "menuSection"
                      ? homeTopStyles.spotlightTargetDeep
                      : null,
                  ]}
                >
                  <View style={homeTopStyles.cuisineSectionHeader}>
                    <View>
                      <Text style={homeTopStyles.cuisineTitle}>Top rated</Text>
                      <Text style={homeTopStyles.cuisineMeta}>
                        Best performing restaurants right now
                      </Text>
                    </View>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={homeTopStyles.sectionListContent}
                  >
                    {topRatedRestaurants.map((restaurant, idx) => (
                      <TouchableOpacity
                        key={`${restaurant.restaurantName}-top-${idx}`}
                        style={[
                          styles.restaurantCardHorizontal,
                          homeTopStyles.sectionCardItem,
                        ]}
                        onPress={() => navigateToFoodScreen(restaurant)}
                      >
                        <View>
                          <RestaurantLogo
                            uri={restaurant.logo}
                            name={restaurant.restaurantName}
                            style={styles.logoHorizontal}
                          />
                          <View style={styles.restaurantInfoHorizontal}>
                            <Text
                              style={styles.restaurantNameHorizontal}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {restaurant.restaurantName}
                            </Text>
                            {showAdminQualityBadges ? (
                              <View style={homeTopStyles.adminQualityPill}>
                                <Text style={homeTopStyles.adminQualityPillText}>
                                  {getQualityBadgeLabel(restaurant)}
                                </Text>
                              </View>
                            ) : null}
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 0,
                              }}
                            >
                              <Text style={styles.restaurantRating}>
                                {(restaurant.rating * 2).toFixed(1)}
                              </Text>
                              {restaurant.rating >= 4.5 ? (
                                <FontAwesomeIcon icon={faFire} size={12} color="orange" />
                              ) : null}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </>
          )}
          renderItem={({ item, index: sectionIndex }) => {
            const [cuisineType, restaurantsInCategory] = item;
            const cuisineLabel = formatCuisineTitle(cuisineType);
            const topRated = restaurantsInCategory.reduce(
              (max, restaurant) => Math.max(max, Number(restaurant?.rating || 0)),
              0,
            );

            return (
              <View
                onLayout={
                  !topRatedRestaurants.length && sectionIndex === 0
                    ? (event) => setMenuSectionLayoutY(event.nativeEvent.layout.y)
                    : undefined
                }
                style={[
                  homeTopStyles.cuisineSectionCard,
                  !topRatedRestaurants.length &&
                  sectionIndex === 0 &&
                  isTourVisible &&
                  currentTourStep?.target === "menuSection"
                    ? homeTopStyles.spotlightTargetDeep
                    : null,
                ]}
              >
                <View style={homeTopStyles.cuisineSectionHeader}>
                  <View>
                    <Text style={homeTopStyles.cuisineTitle}>{cuisineLabel}</Text>
                    <Text style={homeTopStyles.cuisineMeta}>
                      {restaurantsInCategory.length} spots · Top rated {(topRated * 2).toFixed(1)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.82}
                    style={homeTopStyles.cuisineAction}
                    onPress={() => handleShowMore(cuisineType)}
                  >
                    <Text style={homeTopStyles.cuisineActionText}>View all</Text>
                    <IconButton
                      style={homeTopStyles.cuisineActionIcon}
                      iconColor="#00CDBC"
                      icon="arrow-right"
                      size={16}
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={homeTopStyles.sectionListContent}
                >
                  {restaurantsInCategory
                    .slice(0, 5)
                    .map((restaurant, idx) => (
                    <TouchableOpacity
                      key={`${restaurant.restaurantName}-${idx}`}
                      style={[
                        styles.restaurantCardHorizontal,
                        homeTopStyles.sectionCardItem,
                      ]}
                      onPress={() => navigateToFoodScreen(restaurant)}
                    >
                      <View>
                        <RestaurantLogo
                          uri={restaurant.logo}
                          name={restaurant.restaurantName}
                          style={styles.logoHorizontal}
                        />
                        <View style={styles.restaurantInfoHorizontal}>
                            <Text
                              style={styles.restaurantNameHorizontal}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {restaurant.restaurantName}
                            </Text>
                          <View style={homeTopStyles.reasonPill}>
                            <Text style={homeTopStyles.reasonPillText}>
                              {rankingMeta.reasonByKey[getRestaurantKey(restaurant)] || "Recommended"}
                            </Text>
                          </View>
                          {showAdminQualityBadges ? (
                            <View style={homeTopStyles.adminQualityPill}>
                              <Text style={homeTopStyles.adminQualityPillText}>
                                {getQualityBadgeLabel(restaurant)}
                              </Text>
                            </View>
                          ) : null}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginTop: 0,
                            }}
                          >
                            <Text style={styles.restaurantRating}>
                              {(restaurant.rating * 2).toFixed(1)}
                            </Text>
                            {restaurant.rating >= 4.5 ? (
                              <FontAwesomeIcon
                                icon={faFire}
                                size={12}
                                color="orange"
                              />
                            ) : null}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                    ))}
                  {restaurantsInCategory.length > 5 ? (
                    <IconButton
                      style={homeTopStyles.sectionChevronMore}
                      containerColor="#00CDBC"
                      iconColor="white"
                      icon="chevron-right"
                      size={12}
                      onPress={() => handleShowMore(cuisineType)}
                    />
                  ) : null}
                </ScrollView>
              </View>
            );
          }}
          ListFooterComponent={
            !isFilterActive && hasMoreRestaurants ? (
              <View style={homeTopStyles.loadMoreWrap}>
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => fetchRestaurantsPage()}
                  disabled={isFetchingPage}
                  style={homeTopStyles.loadMoreButton}
                >
                  <Text style={homeTopStyles.loadMoreMeta}>
                    Loaded {restaurants.length} spots
                  </Text>
                  <View style={homeTopStyles.loadMoreCta}>
                    <Text style={homeTopStyles.loadMoreText}>
                      {isFetchingPage ? "Loading more..." : "Show more"}
                    </Text>
                    <IconButton
                      icon="chevron-down"
                      iconColor="#00AFA2"
                      size={16}
                      style={homeTopStyles.loadMoreIcon}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      ) : null}

      <FullScreenModal
        selectedCategory={selectedCategory}
        selectedRestaurants={selectedRestaurants}
        onClose={handleCloseModal}
        navigateToFoodScreen={navigateToFoodScreen}
        navigation={navigation}
      />
      {isTourVisible ? (
        <View
          pointerEvents="none"
          style={[
            homeTopStyles.tourDimmer,
            isDeepFocusStep ? homeTopStyles.tourDimmerDeep : null,
          ]}
        />
      ) : null}
      {isTourVisible ? (
        <View style={homeTopStyles.tourOverlayInline} pointerEvents="box-none">
          <View style={homeTopStyles.tourCard}>
            <Text style={homeTopStyles.tourStepMeta}>
              {`Quick tour ${tourStepIndex + 1}/${tourSteps.length}`}
            </Text>
            <Text style={homeTopStyles.tourTitle}>{currentTourStep?.title}</Text>
            <Text style={homeTopStyles.tourBody}>{currentTourStep?.body}</Text>
            <View style={homeTopStyles.tourActions}>
              <TouchableOpacity
                style={homeTopStyles.tourSkipButton}
                onPress={finishTour}
                activeOpacity={0.85}
              >
                <Text style={homeTopStyles.tourSkipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={homeTopStyles.tourNextButton}
                onPress={handleTourNext}
                activeOpacity={0.85}
              >
                <Text style={homeTopStyles.tourNextText}>
                  {tourStepIndex >= tourSteps.length - 1 ? "Done" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
      {isFilterActive && filteredRestaurants.length === 0 ? (
        <View style={homeTopStyles.emptyStateWrap}>
          <View style={homeTopStyles.emptyStateCard}>
            <View style={homeTopStyles.emptyIllustrationWrap}>
              <View style={homeTopStyles.emptyBlob} />
              <View style={homeTopStyles.emptyIllustrationBadge}>
                <Image
                  source={require("../assets/bigburger.png")}
                  style={homeTopStyles.emptyIllustrationImage}
                />
              </View>
            </View>
            <Text style={homeTopStyles.emptyStateTitle}>No spots for this search</Text>
            <Text style={homeTopStyles.emptyStateText}>
              {searchText.trim()
                ? `No restaurant fits "${searchText.trim()}" right now.`
                : "Your current filters are too tight for this area."}
            </Text>
            <View style={homeTopStyles.emptyStateActions}>
              <Button
                mode="outlined"
                textColor="#0F766E"
                onPress={handleShowAll}
                style={homeTopStyles.emptyPrimaryButton}
                labelStyle={homeTopStyles.emptyPrimaryButtonLabel}
              >
                Reset discovery
              </Button>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openFilterModal}
                style={homeTopStyles.emptyLinkButton}
              >
                <Text style={homeTopStyles.emptyLinkButtonText}>
                  Tune filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default Restaurants;

const homeTopStyles = StyleSheet.create({
  searchBlock: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: "#00CDBC",
  },
  preferenceRibbon: {
    marginTop: 8,
    marginHorizontal: 2,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  preferenceRibbonSkeleton: {
    marginTop: 8,
    marginHorizontal: 2,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  preferenceSkeletonChipWide: {
    width: 78,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.38)",
  },
  preferenceSkeletonChip: {
    width: 54,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  preferenceSkeletonCta: {
    marginLeft: "auto",
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(15,23,42,0.26)",
  },
  onboardingNudge: {
    marginTop: 8,
    marginHorizontal: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(15,23,42,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  onboardingNudgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  onboardingNudgeCopy: {
    flex: 1,
  },
  onboardingNudgeTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  onboardingNudgeText: {
    marginTop: 1,
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
    fontWeight: "600",
  },
  onboardingNudgeAction: {
    color: "#E6FFFC",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  preferenceChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 6,
  },
  preferenceChip: {
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  preferenceChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F766E",
  },
  preferenceEditButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(15,23,42,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  preferenceEditText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  personalizedSectionCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 2,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F8FEFD",
    borderColor: "#BEEDEA",
  },
  featuredSectionCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 2,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderColor: "#D9F3F1",
  },
  featuredCardItem: {
    marginRight: 12,
    marginBottom: 6,
  },
  featuredLogo: {
    width: 210,
    height: 142,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: "cover",
    backgroundColor: "#F3F4F6",
  },
  featuredInfo: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    width: 210,
    minHeight: 94,
  },
  featuredName: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
    minHeight: 44,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  menuButtonIcon: {
    margin: 0,
  },
  filterAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  iconNoMargin: {
    margin: 0,
  },
  filterBadge: {
    position: "absolute",
    right: -1,
    top: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 12,
  },
  retryStrip: {
    marginTop: 8,
    marginHorizontal: 2,
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  retryText: {
    flex: 1,
    color: "#B42318",
    fontSize: 12,
    fontWeight: "600",
  },
  retryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  retryButtonText: {
    color: "#B42318",
    fontSize: 12,
    fontWeight: "800",
  },
  geoNoticeStrip: {
    marginTop: 8,
    marginHorizontal: 2,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  geoNoticeText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
  },
  loadMoreWrap: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
  },
  loadMoreButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9F3F1",
    backgroundColor: "#F8FEFD",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loadMoreMeta: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  loadMoreCta: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadMoreText: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "800",
  },
  loadMoreIcon: {
    margin: 0,
    marginLeft: 2,
  },
  cuisineSectionCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 2,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  cuisineSectionHeader: {
    paddingHorizontal: 2,
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cuisineTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: "#0F172A",
    paddingHorizontal: 10,
  },
  cuisineMeta: {
    marginTop: 2,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  cuisineAction: {
    marginRight: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BEEDEA",
    backgroundColor: "#F2FCFB",
    paddingLeft: 10,
    paddingRight: 4,
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  cuisineActionText: {
    color: "#0F766E",
    fontSize: 12,
    fontWeight: "800",
  },
  cuisineActionIcon: {
    margin: 0,
    marginLeft: 1,
  },
  sectionListContent: {
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 8,
  },
  sectionCardItem: {
    marginRight: 10,
    marginBottom: 6,
  },
  sectionChevronMore: {
    marginTop: 46,
    marginRight: 8,
  },
  reasonPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#ECFDFB",
    borderWidth: 1,
    borderColor: "#C7F3EE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  reasonPillText: {
    color: "#0F766E",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  adminQualityPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#111827",
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 4,
  },
  adminQualityPillText: {
    color: "#ECFEFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  tourOverlayInline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 96,
    paddingHorizontal: 18,
    zIndex: 60,
  },
  tourDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.48)",
    zIndex: 50,
  },
  tourDimmerDeep: {
    backgroundColor: "rgba(2, 6, 23, 0.62)",
  },
  tourCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE3EA",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  tourStepMeta: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F766E",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tourTitle: {
    marginTop: 6,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  tourBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#475569",
  },
  tourActions: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  tourSkipButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  tourSkipText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "800",
  },
  tourNextButton: {
    flex: 1.2,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "#00CDBC",
    alignItems: "center",
    justifyContent: "center",
  },
  tourNextText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "900",
  },
  spotlightTarget: {
    position: "relative",
    zIndex: 70,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 22,
    elevation: 18,
  },
  spotlightTargetDeep: {
    position: "relative",
    zIndex: 72,
    borderWidth: 3.5,
    borderColor: "#E6FFFC",
    borderRadius: 16,
    backgroundColor: "rgba(0, 205, 188, 0.24)",
    shadowColor: "#CCFBF1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 24,
  },
  emptyStateWrap: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
    paddingBottom: 84,
  },
  emptyStateCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  emptyIllustrationWrap: {
    width: 96,
    height: 96,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emptyBlob: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 30,
    backgroundColor: "#F8FAFC",
  },
  emptyIllustrationBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F9FBFC",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIllustrationImage: {
    width: 42,
    height: 42,
    resizeMode: "cover",
    borderRadius: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  emptyStateText: {
    marginTop: 4,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
    maxWidth: 230,
  },
  emptyStateActions: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  emptyPrimaryButton: {
    minWidth: 126,
    borderRadius: 999,
    borderColor: "#D5EDEA",
  },
  emptyPrimaryButtonLabel: {
    fontWeight: "600",
    fontSize: 12,
  },
  emptyLinkButton: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  emptyLinkButtonText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
  },
  skeletonContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 84,
  },
  skeletonLocation: {
    width: 150,
    height: 18,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  skeletonHero: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    backgroundColor: "#D9FBF6",
    borderWidth: 1,
    borderColor: "#C7F3EE",
    marginBottom: 12,
  },
  skeletonSection: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 10,
    marginBottom: 10,
  },
  skeletonHeading: {
    width: 130,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },
  skeletonCardsRow: {
    flexDirection: "row",
  },
  skeletonCard: {
    width: 140,
    marginRight: 10,
  },
  skeletonImage: {
    width: "100%",
    height: 108,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    marginBottom: 8,
  },
  skeletonLineWide: {
    width: "90%",
    height: 13,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  skeletonLineShort: {
    width: "44%",
    height: 13,
    borderRadius: 6,
    backgroundColor: "#D1FAE5",
  },
});
