import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, TextInput, ActivityIndicator } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "@firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../config/firebase";
import { BottomNavBar } from "./BottomNavBar";
import { ui } from "../config/designSystem";
import { getRestaurantFallbackMenu } from "../data/restaurantMenus";

const MENU_SECTIONS = ["starters", "mains", "desserts", "drinks"];

export const FavouritesScreen = ({ navigation }) => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [userFavorites, setUserFavorites] = useState({});
  const [searchText, setSearchText] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cleanDocumentId = (name = "") => name.replace(/[ /#$[\]@&]/g, "");

  const getFavoritePayload = (restaurantData) => {
    if (Array.isArray(restaurantData)) {
      return restaurantData[0] || null;
    }
    return restaurantData || null;
  };

  const hasMenuItems = (restaurant) => {
    if (!restaurant?.restaurantName) {
      return false;
    }

    const hasDbSections = MENU_SECTIONS.some((section) => {
      const items = restaurant?.[section];
      return Array.isArray(items) && items.some((item) => `${item?.name ?? ""}`.trim().length > 0);
    });

    if (hasDbSections) {
      return true;
    }

    return Boolean(getRestaurantFallbackMenu(restaurant.restaurantName));
  };

  const getPriceTier = (rawPrice) => {
    const price = Number(rawPrice);
    if (!Number.isFinite(price)) {
      return "$$";
    }
    if (price <= 15) {
      return "$";
    }
    if (price <= 30) {
      return "$$";
    }
    return "$$$";
  };

  const fetchRestaurantDetailsByNames = async (restaurantNames) => {
    if (!restaurantNames.length) {
      return {};
    }

    const detailsMap = {};

    const chunkSize = 10;
    for (let i = 0; i < restaurantNames.length; i += chunkSize) {
      const chunk = restaurantNames.slice(i, i + chunkSize);
      const q = query(
        collection(db, "restaurant"),
        where("restaurantName", "in", chunk),
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((restaurantDoc) => {
        const data = restaurantDoc.data();
        if (data?.restaurantName) {
          detailsMap[data.restaurantName] = data;
        }
      });
    }

    return detailsMap;
  };

  const loadFavorites = async ({ refreshing = false } = {}) => {
    try {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const user = auth.currentUser;
      if (!user?.email) {
        setUserFavorites({});
        setFavoriteRestaurants([]);
        return;
      }

      const userFavoriteDoc = doc(collection(db, "favorites"), user.email);
      const userFavoriteSnapshot = await getDoc(userFavoriteDoc);

      if (!userFavoriteSnapshot.exists()) {
        setUserFavorites({});
        setFavoriteRestaurants([]);
        return;
      }

      const favoritesData = userFavoriteSnapshot.data() || {};
      const favoriteEntries = Object.entries(favoritesData)
        .map(([restaurantName, restaurantData]) => ({
          restaurantName,
          payload: getFavoritePayload(restaurantData),
        }))
        .filter((entry) => Boolean(entry.payload?.isFavorited));

      if (!favoriteEntries.length) {
        setUserFavorites(favoritesData);
        setFavoriteRestaurants([]);
        return;
      }

      const detailsMap = await fetchRestaurantDetailsByNames(
        favoriteEntries.map((entry) => entry.restaurantName),
      );

      const mergedFavorites = favoriteEntries
        .map((entry) => {
          const details = detailsMap[entry.restaurantName] || null;
          const cuisine = details?.cuisine || entry.payload?.cuisine || "Unknown";

          return {
            name: entry.restaurantName,
            image: entry.payload?.image || details?.logo || "",
            isFavorited: true,
            cuisine,
            priceTier: getPriceTier(details?.price ?? entry.payload?.price),
            hasMenu: hasMenuItems(details),
            restaurant: details || {
              restaurantName: entry.restaurantName,
              logo: entry.payload?.image || "",
              address: entry.payload?.address || "",
              cuisine: entry.payload?.cuisine || "",
              price: entry.payload?.price ?? "",
              lat: entry.payload?.lat ?? null,
              long: entry.payload?.long ?? null,
              phone: entry.payload?.phone || "",
              url: entry.payload?.url || "",
            },
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      setUserFavorites(favoritesData);
      setFavoriteRestaurants(mergedFavorites);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (restaurantName) => {
    try {
      const user = auth.currentUser;
      if (!user?.email) {
        return;
      }

      const userFavoriteDoc = doc(collection(db, "favorites"), user.email);
      const keys = Object.keys(userFavorites);
      const favoriteKey =
        keys.find((key) => key === restaurantName) ||
        keys.find((key) => cleanDocumentId(key) === cleanDocumentId(restaurantName));

      if (!favoriteKey) {
        return;
      }

      await updateDoc(userFavoriteDoc, {
        [favoriteKey]: deleteField(),
      });

      setUserFavorites((prev) => {
        const updated = { ...prev };
        delete updated[favoriteKey];
        return updated;
      });

      setFavoriteRestaurants((prev) => prev.filter((restaurant) => restaurant.name !== restaurantName));
    } catch (error) {
      console.error("Error unfavoriting restaurant:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const cuisineFilters = useMemo(() => {
    const cuisineSet = new Set(
      favoriteRestaurants
        .map((restaurant) => restaurant.cuisine)
        .filter((cuisine) => typeof cuisine === "string" && cuisine.trim().length > 0),
    );

    return ["All", ...Array.from(cuisineSet).sort((a, b) => a.localeCompare(b))];
  }, [favoriteRestaurants]);

  const visibleFavorites = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return favoriteRestaurants.filter((restaurant) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        restaurant.name.toLowerCase().includes(normalizedSearch) ||
        restaurant.cuisine.toLowerCase().includes(normalizedSearch);

      const matchesCuisine =
        selectedCuisine === "All" || restaurant.cuisine === selectedCuisine;

      return matchesSearch && matchesCuisine;
    });
  }, [favoriteRestaurants, searchText, selectedCuisine]);

  const openRestaurant = (favoriteRestaurant) => {
    const restaurantPayload =
      favoriteRestaurant.restaurant || {
        restaurantName: favoriteRestaurant.name,
        logo: favoriteRestaurant.image,
      };

    navigation.navigate("Menu", { restaurant: restaurantPayload });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Favourites</Text>
        <Text style={styles.subtitle}>
          {favoriteRestaurants.length} saved {favoriteRestaurants.length === 1 ? "place" : "places"}
        </Text>
      </View>

      <View style={styles.toolbar}>
        <TextInput
          mode="outlined"
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search saved places"
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchText.length > 0 ? <TextInput.Icon icon="close" onPress={() => setSearchText("")} /> : null
          }
          theme={{
            roundness: ui.radius.full,
            colors: {
              primary: ui.colors.primary,
            },
          }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroller}
        contentContainerStyle={styles.filterRow}
      >
        {cuisineFilters.map((cuisine) => {
          const isActive = cuisine === selectedCuisine;
          return (
            <TouchableOpacity
              key={cuisine}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.85}
              onPress={() => setSelectedCuisine(cuisine)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={ui.colors.primary} />
          <Text style={styles.loadingText}>Loading favourites...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadFavorites({ refreshing: true })}
              tintColor={ui.colors.primary}
            />
          }
        >
          {visibleFavorites.length === 0 ? (
            <View style={styles.emptyCard}>
              <IconButton icon="heart-outline" size={28} iconColor={ui.colors.primary} />
              <Text style={styles.emptyTitle}>
                {favoriteRestaurants.length === 0 ? "No favourites yet" : "No matches found"}
              </Text>
              <Text style={styles.emptyText}>
                {favoriteRestaurants.length === 0
                  ? "Save restaurants from menu pages and they will show up here."
                  : "Try a different search term or cuisine filter."}
              </Text>
            </View>
          ) : (
            visibleFavorites.map((restaurant) => (
              <Swipeable
                key={restaurant.name}
                overshootRight={false}
                renderRightActions={() => (
                  <TouchableOpacity
                    onPress={() => handleDelete(restaurant.name)}
                    style={styles.deleteAction}
                  >
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                )}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => openRestaurant(restaurant)}
                >
                  <View style={styles.card}>
                    <View style={styles.cardContent}>
                      {restaurant.image ? (
                        <Image source={{ uri: restaurant.image }} style={styles.image} />
                      ) : (
                        <View style={styles.imageFallback}>
                          <Text style={styles.imageFallbackText}>
                            {restaurant.name.slice(0, 1).toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View style={styles.textWrap}>
                        <Text style={styles.restaurantName}>{restaurant.name}</Text>
                        <View style={styles.metaRow}>
                          <Text style={styles.restaurantMeta}>{restaurant.cuisine}</Text>
                          <Text style={styles.dot}>•</Text>
                          <Text style={styles.restaurantMeta}>{restaurant.priceTier}</Text>
                          <Text style={styles.dot}>•</Text>
                          <Text style={styles.restaurantMeta}>
                            {restaurant.hasMenu ? "Menu ready" : "Menu soon"}
                          </Text>
                        </View>
                      </View>

                      <IconButton
                        icon="chevron-right"
                        iconColor={ui.colors.textMuted}
                        size={20}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))
          )}
        </ScrollView>
      )}

      <BottomNavBar activeTab="Favourites" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  header: {
    paddingHorizontal: ui.spacing.lg,
    paddingTop: ui.spacing.md,
  },
  title: {
    fontSize: ui.type.h1,
    fontWeight: "900",
    color: ui.colors.text,
  },
  subtitle: {
    marginTop: 2,
    color: ui.colors.textMuted,
    fontSize: ui.type.caption,
    fontWeight: "600",
  },
  toolbar: {
    paddingHorizontal: ui.spacing.lg,
    paddingTop: ui.spacing.sm,
  },
  searchInput: {
    backgroundColor: ui.colors.surface,
  },
  filterRow: {
    paddingHorizontal: ui.spacing.lg,
    paddingTop: ui.spacing.sm,
    paddingBottom: ui.spacing.xs,
    alignItems: "center",
    gap: ui.spacing.xs,
  },
  filterScroller: {
    maxHeight: 62,
  },
  filterChip: {
    borderRadius: ui.radius.full,
    paddingHorizontal: 12,
    minHeight: 36,
    justifyContent: "center",
    backgroundColor: ui.colors.surface,
    borderWidth: 1,
    borderColor: ui.colors.border,
  },
  filterChipActive: {
    backgroundColor: ui.colors.primarySoft,
    borderColor: "#BEEDEA",
  },
  filterChipText: {
    color: ui.colors.textMuted,
    fontSize: ui.type.caption,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: "#0F766E",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    color: ui.colors.textMuted,
    fontSize: ui.type.caption,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: ui.spacing.lg,
    paddingBottom: ui.spacing.lg,
    paddingTop: ui.spacing.sm,
    gap: ui.spacing.sm,
  },
  card: {
    borderRadius: ui.radius.md,
    backgroundColor: ui.colors.surface,
    borderWidth: 1,
    borderColor: ui.colors.border,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: ui.spacing.xs,
    paddingHorizontal: ui.spacing.sm,
    gap: ui.spacing.sm,
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: ui.radius.sm,
    backgroundColor: ui.colors.primarySoft,
  },
  imageFallback: {
    width: 58,
    height: 58,
    borderRadius: ui.radius.sm,
    backgroundColor: ui.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackText: {
    color: ui.colors.primary,
    fontSize: ui.type.h2,
    fontWeight: "900",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  restaurantName: {
    fontSize: ui.type.body,
    fontWeight: "800",
    color: ui.colors.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  restaurantMeta: {
    color: ui.colors.textMuted,
    fontSize: ui.type.caption,
    fontWeight: "600",
  },
  dot: {
    color: ui.colors.textMuted,
    fontSize: ui.type.caption,
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 96,
    marginVertical: 6,
    borderRadius: ui.radius.md,
    backgroundColor: ui.colors.danger,
  },
  deleteText: {
    color: ui.colors.white,
    fontWeight: "800",
  },
  emptyCard: {
    marginTop: 40,
    alignItems: "center",
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    padding: ui.spacing.lg,
    ...ui.shadow.card,
  },
  emptyTitle: {
    marginTop: ui.spacing.xs,
    fontSize: ui.type.h2,
    fontWeight: "800",
    color: ui.colors.text,
  },
  emptyText: {
    marginTop: ui.spacing.xs,
    textAlign: "center",
    color: ui.colors.textMuted,
    fontSize: ui.type.body,
  },
});
