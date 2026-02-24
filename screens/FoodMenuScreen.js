import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Share,
  RefreshControl,
  Image,
  Linking,
  StyleSheet,
} from "react-native";
import {
  TextInput,
  IconButton,
  Snackbar,
} from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
} from "react-native-reanimated";
import { axiosGPT, hasOpenAIKey } from "../utils/request";
import { db, auth } from "../config/firebase";
import { getDoc, doc, setDoc } from "@firebase/firestore";
import { collection, where, query, getDocs } from "@firebase/firestore";
import { BottomNavBar } from "./BottomNavBar";
// import Reviews from "../components/Reviews";
import { styles } from "./styles";
import ImageRestaurants from "../components/ImageRestaurants";
import Map from "../components/Map";
import { SafeAreaView } from "react-native-safe-area-context";
import { ui } from "../config/designSystem";
import { getRestaurantFallbackMenu } from "../data/restaurantMenus";

export const FoodMenuScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { restaurant } = route.params;
  const [activeTab, setActiveTab] = useState("Home");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [commentsLength, setCommentsLength] = useState(0);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [menuData, setMenuData] = useState(null);
  const [expandedSection, setExpandedSection] = useState("mains");
  const searchButtonScale = useSharedValue(1);
  const [closingTimes, setClosingTimes] = useState([]);
  const currentDay = new Date().getDay();
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const smartPrompts = [
    "Find me something hot and cheesy.",
    "What should I order if I want a spicy main?",
    "Show me the most popular comfort-food item.",
    "Suggest a crispy and flavorful option.",
    "I want something light but satisfying.",
  ];

  const scrollRef = useRef(null);
  const menuSectionY = useRef(0);

  const fetchCommentsLengthForRestaurant = async (restaurantName) => {
    try {
      const commentsCollection = collection(db, "comments");
      const q = query(
        commentsCollection,
        where("restaurantName", "==", restaurantName),
      );
      const querySnapshot = await getDocs(q);

      const length = querySnapshot.size;
      setCommentsLength(length); // Set the length in the state

      return length;
    } catch (error) {
      console.error("Error fetching comments length:", error);
      return 0;
    }
  };

  const handleClearSearch = () => {
    setSearchText("");
    setApiResponse("");
    setError(null);
    setShowPromptLibrary(false);
  };

  const handleSearch = async (queryOverride) => {
    const queryText = (queryOverride ?? searchText).trim();
    if (!queryText) {
      setSnackbarVisible(true);
      return;
    }

    setError(null);
    setApiResponse("");

    const localFallback = () => {
      const fallbackItems =
        localSuggestions.length > 0 ? localSuggestions : fallbackMenuPicks;

      if (fallbackItems.length > 0) {
        setApiResponse(
          fallbackItems
            .slice(0, 5)
            .map((item, index) => `${index + 1}. ${item.name}`)
            .join("\n"),
        );
      } else {
        setError("Menu items are still loading. Try again in a moment.");
      }
    };

    if (!hasOpenAIKey) {
      localFallback();
      return;
    }

    setLoading(true);
    const requestData = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a restaurant menu assistant. Return concise recommendations only.",
        },
        {
          role: "user",
          content: `For ${route.params.restaurant.restaurantName}, suggest up to 5 menu items for: ${queryText}. Use a numbered list, one line each.`,
        },
      ],
    };

    try {
      const response = await axiosGPT.post("", requestData);
      const choices = response.data.choices[0].message.content ?? "";
      const meaningfulLines = choices
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !/^\d+[\.\)]\s*$/.test(line));

      if (meaningfulLines.length > 0) {
        setApiResponse(meaningfulLines.join("\n"));
      } else {
        localFallback();
      }
    } catch (searchError) {
      if (searchError?.response?.status === 401) {
        localFallback();
      } else {
        localFallback();
      }
    } finally {
      setLoading(false);
    }
  };

  const runPromptSearch = (promptText) => {
    setSearchText(promptText);
    animateSearchButton();
    setShowPromptLibrary(false);
    handleSearch(promptText);
  };

  const runFlavorSearch = (tag) => {
    runPromptSearch(`Find me ${tag} options on this menu.`);
  };

  const toggleSection = (sectionKey) => {
    setExpandedSection((prev) => (prev === sectionKey ? "" : sectionKey));
  };

  const jumpToMenu = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(menuSectionY.current - 80, 0),
      animated: true,
    });
  };

  const searchButtonStyle = useAnimatedStyle(() => {
    const scale = withSpring(searchButtonScale.value, {
      damping: 2,
      stiffness: 80,
      mass: 0.1,
      stiffness: 120,
      damping: 8,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      overshootClamping: false,
      toValue: 1,
    });
    return {
      transform: [{ scale }],
    };
  });

  const animateSearchButton = () => {
    searchButtonScale.value = withSequence(
      withTiming(1.1, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
    );
  };

  const fetchRestaurantCommentsLength = async () => {
    try {
      const restaurantNameToQuery = restaurant.restaurantName;
      const length = await fetchCommentsLengthForRestaurant(
        restaurantNameToQuery,
      );
      setCommentsLength(length);
    } catch (error) {
      console.error("Error fetching restaurant comments length:", error);
    }
  };

  useEffect(() => {
    fetchRestaurantCommentsLength();
  }, []);

  const addToFavorites = async (restaurant) => {
    try {
      const user = auth.currentUser; // Get the current user
      if (user) {
        const userEmail = user.email; // Get the user's email
        if (restaurant && restaurant.restaurantName) {
          const favoritesRef = collection(db, "favorites");
          const userFavoriteDoc = doc(favoritesRef, userEmail);

          // Check if the user already has a document in the "Favorites" collection
          // If not, create a new document; otherwise, update the existing one
          const favoriteRestaurant = {
            [restaurant.restaurantName]: [
              {
                name: restaurant.restaurantName,
                isFavorited: true,
                image: restaurant.logo, // Add the restaurant's image to the data
                address: restaurant.address ?? "",
                cuisine: restaurant.cuisine ?? "",
                price: restaurant.price ?? "",
                lat: restaurant.lat ?? null,
                long: restaurant.long ?? null,
                phone: restaurant.phone ?? "",
                url: restaurant.url ?? "",
              },
            ],
          };

          // Set the user's favorite restaurant with a boolean value of true
          // To remove a restaurant, set its value to false
          await setDoc(userFavoriteDoc, favoriteRestaurant, { merge: true });

        } else {
          console.error("The restaurant or restaurantName is not defined.");
        }
      } else {
        // Handle the case where the user is not authenticated
        console.error("User is not authenticated.");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const shareMenu = async () => {
    try {
      const suggestionLines = topPickNames.slice(0, 5);

      const promptLine = searchText.trim()
        ? `Prompt: ${searchText.trim()}`
        : "Prompt: Menu suggestions";

      const suggestionsBlock =
        suggestionLines.length > 0
          ? `Suggestions:\n${suggestionLines
              .map((line, index) => `${index + 1}. ${line}`)
              .join("\n")}`
          : "Suggestions: Open Dishision to see menu picks.";

      const shareContent = {
        message: `${restaurant.restaurantName}\n${promptLine}\n\n${suggestionsBlock}`,
        title: "Share Restaurant Menu",
      };

      Share.share(shareContent).catch((error) => {
        console.error("Error sharing:", error);
      });
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  const removeFromFavorites = async (restaurant) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        if (restaurant && restaurant.restaurantName) {
          const restaurantName = restaurant.restaurantName;

          const favoritesRef = collection(db, "favorites");
          const userFavoriteDoc = doc(favoritesRef, userEmail);

          const userFavoriteSnapshot = await getDoc(userFavoriteDoc);

          if (userFavoriteSnapshot.exists()) {
            const userFavoriteData = userFavoriteSnapshot.data();
            if (userFavoriteData[restaurantName]) {
              delete userFavoriteData[restaurantName]; // Remove the restaurant entry
              await setDoc(userFavoriteDoc, userFavoriteData); // Update the document

            } else {
              console.error(
                `Restaurant ${restaurantName} is not in user favorites.`,
              );
            }
          } else {
            console.error(`User with email ${userEmail} has no favorites.`);
          }
        } else {
          console.error("The restaurant or restaurantName is not defined.");
        }
      } else {
        console.error("User is not authenticated.");
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (isFavorite) {
      // Remove the restaurant from favorites
      await removeFromFavorites(restaurant);
    } else {
      // Add the restaurant to favorites
      await addToFavorites(restaurant);
    }
    setIsFavorite(!isFavorite); // Toggle the favorite status
  };

  const checkIfFavorited = async (restaurantName) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        const favoritesRef = collection(db, "favorites");
        const userFavoriteDoc = doc(favoritesRef, userEmail);

        const userFavoriteSnapshot = await getDoc(userFavoriteDoc);

        if (userFavoriteSnapshot.exists()) {
          const userFavoriteData = userFavoriteSnapshot.data();
          if (userFavoriteData[restaurantName]) {
            setIsFavorite(userFavoriteData[restaurantName][0].isFavorited);
          }
        }
      }
    } catch (error) {
      console.error("Error checking if restaurant is favorited:", error);
    }
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

  useEffect(() => {
    checkIfFavorited(restaurant.restaurantName);
  }, [restaurant.restaurantName]);

  const parsedApiSuggestions = useMemo(() => {
    if (!apiResponse) {
      return [];
    }
    return apiResponse
      .split("\n")
      .map((line) => line.trim().replace(/^\d+[\.\)]\s*/, ""))
      .filter((line) => line.length > 0)
      .slice(0, 4);
  }, [apiResponse]);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        fetchRestaurantCommentsLength(),
        fetchClosingTimes(restaurant.restaurantName),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderPromptSystem = () => {
    if (searchText.trim().length > 0) {
      return (
        <View style={fmStyles.promptCompact}>
          <Text style={fmStyles.promptCompactTitle}>Refine from this menu</Text>
          <View style={fmStyles.tagRow}>
            {dynamicRefineTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={fmStyles.tagChip}
                activeOpacity={0.85}
                onPress={() => runFlavorSearch(tag)}
              >
                <Text style={fmStyles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    const visiblePrompts = showPromptLibrary ? smartPrompts : smartPrompts.slice(0, 2);

    return (
      <View style={fmStyles.promptSection}>
        <View style={fmStyles.promptHeaderRow}>
          <Text style={fmStyles.promptTitle}>Need ideas?</Text>
          <TouchableOpacity
            onPress={() => setShowPromptLibrary((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Text style={fmStyles.promptToggleText}>
              {showPromptLibrary ? "Show less" : "More ideas"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={fmStyles.promptGrid}>
          {visiblePrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={fmStyles.promptChip}
              activeOpacity={0.85}
              onPress={() => runPromptSearch(prompt)}
            >
              <Text style={fmStyles.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={fmStyles.tagRow}>
          {dynamicRefineTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={fmStyles.tagChip}
              activeOpacity={0.85}
              onPress={() => runFlavorSearch(tag)}
            >
              <Text style={fmStyles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const fetchClosingTimes = async (restaurantName) => {
    try {
      const closingTimeCollection = collection(db, "restaurant");
      const q = query(
        closingTimeCollection,
        where("restaurantName", "==", restaurantName),
      );
      const querySnapshot = await getDocs(q);

      const closingTimeData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.closingTime) {
          closingTimeData.push({ id: doc.id, closingTime: data.closingTime });
        }
      });

      setClosingTimes(closingTimeData);
    } catch (error) {
      console.error("Error fetching closing times from Firestore:", error);
    }
  };

  useEffect(() => {
    fetchClosingTimes(restaurant.restaurantName);
  }, [restaurant.restaurantName]);

  useEffect(() => {
    const fetchRestaurantMenuData = async () => {
      const normalized = (value) => (typeof value === "string" ? value.trim() : "");
      const itemName = (item) =>
        normalized(
          item?.name ??
            item?.title ??
            item?.itemName ??
            item?.dish ??
            item?.dishName ??
            "",
        );
      const hasValidItems = (items) =>
        Array.isArray(items) && items.some((entry) => itemName(entry).length > 0);

      const hasMenuSections = (data) => {
        if (!data) {
          return false;
        }
        const sections = ["starters", "mains", "desserts", "drinks"];
        return sections.some((key) => hasValidItems(data[key]));
      };

      const buildDevMenuFallback = () => ({
        restaurantName: restaurant.restaurantName,
        starters: [
          { name: "Garlic Bread", price: "6", description: "Toasted, buttery, and warm." },
          { name: "Loaded Fries", price: "7", description: "Crispy fries with house sauce." },
        ],
        mains: [
          { name: "Spicy Chicken Burger", price: "14", description: "Hot, crispy chicken with melted cheese." },
          { name: "Cheesy Beef Burger", price: "15", description: "Beef patty, cheddar, pickles, and sauce." },
        ],
        desserts: [
          { name: "Chocolate Brownie", price: "6", description: "Rich brownie with vanilla ice cream." },
        ],
        drinks: [
          { name: "Lemon Iced Tea", price: "4", description: "Freshly brewed and lightly sweet." },
        ],
      });

      try {
        // 1) Prefer data already passed in navigation payload.
        if (hasMenuSections(restaurant)) {
          setMenuData(restaurant);
          return;
        }

        // 2) Try document-id lookup (RestaurantForm writes docs by restaurantName as id).
        const docRef = doc(db, "restaurant", restaurant.restaurantName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && hasMenuSections(docSnap.data())) {
          setMenuData(docSnap.data());
          return;
        }

        // 3) Fallback to query by restaurantName field.
        const restaurantRef = collection(db, "restaurant");
        const q = query(
          restaurantRef,
          where("restaurantName", "==", restaurant.restaurantName),
        );
        const querySnapshot = await getDocs(q);
        const firstWithMenu =
          querySnapshot.docs.map((docItem) => docItem.data()).find(hasMenuSections) ??
          querySnapshot.docs[0]?.data() ??
          null;

        if (hasMenuSections(firstWithMenu)) {
          setMenuData(firstWithMenu);
          return;
        }

        const localFallbackMenu = getRestaurantFallbackMenu(restaurant.restaurantName);
        if (hasMenuSections(localFallbackMenu)) {
          setMenuData(localFallbackMenu);
          return;
        }

        if (__DEV__) {
          setMenuData(buildDevMenuFallback());
          return;
        }

        setMenuData(firstWithMenu);
      } catch (fetchError) {
        console.error("Error retrieving restaurant menu data:", fetchError);
        if (__DEV__) {
          setMenuData(buildDevMenuFallback());
        }
      }
    };

    fetchRestaurantMenuData();
  }, [restaurant.restaurantName]);

  const normalizedQuery = searchText.trim().toLowerCase();
  const rawTokens = useMemo(
    () => normalizedQuery.split(/\s+/).filter(Boolean),
    [normalizedQuery],
  );

  const queryTokens = useMemo(() => {
    const stopwords = new Set([
      "find",
      "me",
      "something",
      "i",
      "want",
      "show",
      "options",
      "on",
      "this",
      "menu",
      "the",
      "a",
      "an",
      "for",
      "to",
      "with",
      "and",
      "or",
      "please",
    ]);

    const synonymMap = {
      hot: ["spicy", "chilli", "chili", "pepper", "jalapeno", "buffalo"],
      spicy: ["hot", "chilli", "chili", "pepper", "jalapeno"],
      cheesy: ["cheese", "cheddar", "mozzarella", "parmesan", "mac"],
      crispy: ["fried", "crunchy", "golden"],
      creamy: ["cream", "cheese", "butter", "mayo", "sauce"],
      light: ["fresh", "salad", "grilled", "small"],
      sweet: ["dessert", "cake", "milkshake", "ice", "chocolate"],
    };

    const base = rawTokens.filter((token) => token.length > 1 && !stopwords.has(token));
    const expanded = new Set(base);

    base.forEach((token) => {
      const synonyms = synonymMap[token] || [];
      synonyms.forEach((syn) => expanded.add(syn));
    });

    return Array.from(expanded);
  }, [rawTokens]);

  const getSectionItems = (sectionKey) => {
    const section = menuData?.[sectionKey];
    if (!Array.isArray(section)) {
      return [];
    }
    return section.filter((item) => {
      const name =
        item?.name ??
        item?.title ??
        item?.itemName ??
        item?.dish ??
        item?.dishName ??
        "";
      return typeof name === "string" && name.trim().length > 0;
    });
  };

  const hasAnyMenuItems = useMemo(() => {
    return ["starters", "mains", "desserts", "drinks"].some(
      (sectionKey) => getSectionItems(sectionKey).length > 0,
    );
  }, [menuData]);

  const allMenuItems = useMemo(() => {
    const sections = ["starters", "mains", "desserts", "drinks"];
    return sections.flatMap((section) =>
      getSectionItems(section).map((item) => ({
        section,
        name:
          item?.name ??
          item?.title ??
          item?.itemName ??
          item?.dish ??
          item?.dishName ??
          "",
        description: item?.description ?? item?.descriptions ?? "",
        price: item?.price ?? "",
      })),
    );
  }, [menuData]);

  const localSuggestions = useMemo(() => {
    if (!queryTokens.length) {
      return [];
    }

    const scored = allMenuItems
      .map((item) => {
        const haystack = `${item.name} ${item.description}`.toLowerCase();
        let score = 0;

        queryTokens.forEach((token) => {
          if (haystack.includes(token)) {
            score += 1;
          }
        });

        return { ...item, _score: score };
      })
      .filter((item) => item._score > 0)
      .sort((a, b) => b._score - a._score);

    if (scored.length > 0) {
      return scored;
    }

    // No direct token hit: return closest practical defaults instead of empty state.
    return allMenuItems
      .filter((item) => item.section === "mains" || item.section === "starters")
      .slice(0, 6)
      .map((item) => ({ ...item, _score: 0 }));
  }, [allMenuItems, queryTokens]);

  const dynamicRefineTags = useMemo(() => {
    const tagKeywordMap = {
      spicy: ["spicy", "nashville", "jalapeno", "habanero", "buffalo", "hot"],
      cheesy: ["cheese", "cheesy", "mac", "cheddar", "mozzarella", "parmesan"],
      crispy: ["crispy", "fried", "crunchy", "tenders", "wings", "fries"],
      creamy: ["cream", "creamy", "mayo", "sauce", "truffle", "milkshake"],
      smoky: ["bbq", "smokey", "smoky", "chipotle", "grill"],
      sweet: ["dessert", "chocolate", "lotus", "toffee", "shake", "sweet"],
      light: ["salad", "water", "tea", "falafel", "fresh"],
    };

    const menuText = allMenuItems
      .map((item) => `${item.name} ${item.description}`.toLowerCase())
      .join(" ");

    const rankedTags = Object.entries(tagKeywordMap)
      .map(([tag, keywords]) => ({
        tag,
        score: keywords.reduce(
          (total, keyword) => total + (menuText.includes(keyword) ? 1 : 0),
          0,
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.tag);

    const sectionTags = [];
    if (getSectionItems("starters").length > 0) {
      sectionTags.push("starters");
    }
    if (getSectionItems("mains").length > 0) {
      sectionTags.push("mains");
    }
    if (getSectionItems("desserts").length > 0) {
      sectionTags.push("desserts");
    }
    if (getSectionItems("drinks").length > 0) {
      sectionTags.push("drinks");
    }

    const prioritized = queryTokens
      .filter((token) => rankedTags.includes(token))
      .slice(0, 2);

    return Array.from(new Set([...prioritized, ...rankedTags, ...sectionTags])).slice(0, 6);
  }, [allMenuItems, queryTokens]);

  const topPickNames = useMemo(() => {
    const normalize = (value) =>
      value
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const bestMenuMatch = (suggestion) => {
      const normalizedSuggestion = normalize(suggestion);
      if (!normalizedSuggestion) {
        return null;
      }

      const suggestionTokens = normalizedSuggestion
        .split(" ")
        .filter((token) => token.length > 2);

      let best = null;
      let bestScore = 0;

      allMenuItems.forEach((menuItem) => {
        const normalizedMenuName = normalize(menuItem.name);
        const normalizedMenuDesc = normalize(menuItem.description || "");
        const haystack = `${normalizedMenuName} ${normalizedMenuDesc}`;

        let score = 0;
        if (normalizedMenuName.includes(normalizedSuggestion)) {
          score += 6;
        }
        if (normalizedSuggestion.includes(normalizedMenuName)) {
          score += 3;
        }
        suggestionTokens.forEach((token) => {
          if (haystack.includes(token)) {
            score += 1;
          }
        });

        if (score > bestScore) {
          bestScore = score;
          best = menuItem.name;
        }
      });

      return bestScore > 0 ? best : null;
    };

    const matchedFromApi = parsedApiSuggestions
      .map((item) => bestMenuMatch(item))
      .filter(Boolean);

    const uniqueApiMatches = Array.from(new Set(matchedFromApi));
    if (uniqueApiMatches.length > 0) {
      return uniqueApiMatches.slice(0, 4);
    }

    return Array.from(new Set(localSuggestions.map((item) => item.name))).slice(0, 4);
  }, [allMenuItems, localSuggestions, parsedApiSuggestions]);

  const fallbackMenuPicks = useMemo(() => {
    if (!allMenuItems.length) {
      return [];
    }
    const mainsAndStarters = allMenuItems.filter(
      (item) => item.section === "mains" || item.section === "starters",
    );
    if (mainsAndStarters.length > 0) {
      return mainsAndStarters;
    }
    return allMenuItems;
  }, [allMenuItems]);

  const openUrlInBrowser = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Error opening URL: ", err),
    );
  };

  return (
    <SafeAreaView style={fmStyles.screen} edges={["top"]}>
      <View style={fmStyles.searchInputContainer}>
          <TextInput
            theme={{
              roundness: 30,
              colors: {
                primary: "#00CDBC",
                underlineColor: "transparent",
              },
            }}
            style={fmStyles.searchInput}
            mode="outlined"
            placeholder='Try "hot and cheesy"'
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {searchText.length > 0 ? (
            <IconButton
              icon="close"
              color="#555"
              size={20}
              onPress={handleClearSearch}
              style={fmStyles.clearButton}
            />
          ) : null}
          {searchText.length > 0 ? (
            <TouchableOpacity
              onPress={handleSearch}
              activeOpacity={0.7}
              style={fmStyles.searchButtonTouchable}
            >
              <Animated.View style={[fmStyles.searchButton, searchButtonStyle]}>
                <IconButton icon="magnify" name="search" />
              </Animated.View>
            </TouchableOpacity>
          ) : null}
          <Snackbar
            visible={snackbarVisible}
            style={styles.snackbar}
            onDismiss={() => setSnackbarVisible(false)}
          >
            Enter what you want, like "hot and cheesy".
          </Snackbar>

          {searchText == "" ? (
            <>
              <IconButton
                icon={isFavorite ? "heart" : "heart-outline"}
                size={22}
                iconColor={isFavorite ? "red" : "black"}
                onPress={handleFavoriteToggle}
              />
            </>
          ) : null}
          {topPickNames.length > 0 ? (
            <IconButton
              icon="share"
              size={22}
              iconColor="#00CDBC"
              onPress={shareMenu}
            />
          ) : null}
      </View>

      {renderPromptSystem()}

      {loading && (
        <ActivityIndicator
          size="large"
          color="#333"
          style={fmStyles.loadingIndicator}
        />
      )}

      {topPickNames.length > 0 && (
        <View style={fmStyles.aiPicksStrip}>
          <View style={fmStyles.aiPicksHeader}>
            <View style={fmStyles.aiPicksTitleRow}>
              <Icon name="auto-fix" size={16} color={ui.colors.primary} />
              <Text style={fmStyles.aiPicksTitle}>AI picks for this craving</Text>
            </View>
            <TouchableOpacity onPress={jumpToMenu} activeOpacity={0.75}>
              <Text style={fmStyles.aiPicksAction}>Menu</Text>
            </TouchableOpacity>
          </View>
          <View style={fmStyles.aiPillsWrap}>
            {topPickNames.map((item) => (
              <View key={item} style={fmStyles.aiSuggestionPill}>
                <Text style={fmStyles.aiSuggestionPillText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!!error && (
        <View style={fmStyles.errorBanner}>
          <Text style={fmStyles.errorBannerText}>{error}</Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={fmStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00CDBC"
          />
        }
      >
        <View style={fmStyles.restaurantCard}>
            <View style={fmStyles.detailsContainer}>
                <ImageRestaurants
                  restaurantName={restaurant.restaurantName}
                  location={restaurant.address}
                />
                <View style={fmStyles.heroRow}>
                  <Image
                    source={{ uri: restaurant.logo }}
                    style={fmStyles.logo}
                  />
                  <View style={fmStyles.heroInfo}>
                    <Text style={fmStyles.restaurantName}>
                      {restaurant.restaurantName}
                    </Text>
                    {!!restaurant.address && (
                      <View style={fmStyles.infoRow}>
                        <Icon
                          name="pin-outline"
                          size={18}
                          style={fmStyles.infoIcon}
                          color={ui.colors.textMuted}
                        />
                        <Text style={fmStyles.infoText}>{restaurant.address}</Text>
                      </View>
                    )}
                    {!!restaurant.phone && (
                      <View style={fmStyles.infoRow}>
                        <Icon
                          name="phone"
                          size={18}
                          style={fmStyles.infoIcon}
                          color={ui.colors.textMuted}
                        />
                        <Text style={fmStyles.infoText}>{restaurant.phone}</Text>
                      </View>
                    )}
                    {!!restaurant.url && (
                      <TouchableOpacity
                        onPress={() => openUrlInBrowser(restaurant.url)}
                        activeOpacity={0.7}
                      >
                        <View style={fmStyles.infoRow}>
                          <Icon
                            name="web"
                            size={18}
                            style={fmStyles.infoIcon}
                            color={ui.colors.textMuted}
                          />
                          <Text style={fmStyles.linkText}>{restaurant.url}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {!!restaurant.cuisine && (
                      <View style={fmStyles.infoRow}>
                        <Icon
                          name="silverware-fork-knife"
                          size={18}
                          style={fmStyles.infoIcon}
                          color={ui.colors.textMuted}
                        />
                        <Text style={fmStyles.infoText}>
                          {capitalizeFirstLetter(restaurant.cuisine)}
                        </Text>
                      </View>
                    )}
                    {!!restaurant.price && (
                      <View style={fmStyles.infoRow}>
                        <Icon
                          name="cash"
                          size={18}
                          style={fmStyles.infoIcon}
                          color={ui.colors.textMuted}
                        />
                        <Text style={fmStyles.infoText}>
                          {getPriceTier(restaurant.price)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {!!restaurant.description &&
                  restaurant.description.trim().length > 28 && (
                  <Text style={fmStyles.restaurantDescription}>
                    {restaurant.description}
                  </Text>
                )}
                <View style={styles.closingTimes}>
                  {closingTimes.map((restaurant, index) => (
                    <View key={index}>
                      <Text style={styles.closingTimesText}>
                        Opening Times:
                      </Text>
                      <View>
                        {daysOfWeek.map((day, dayIndex) => (
                          <Text
                            key={day}
                            style={[
                              styles.dayText,
                              currentDay === dayIndex
                                ? styles.currentDayText
                                : null,
                            ]}
                          >
                            {day}: {restaurant.closingTime[day] || "Closed"}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                <View>
                  <View style={fmStyles.quickActions}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("Maps", { restaurant })
                      }
                    >
                      <View
                        style={fmStyles.actionRow}
                      >
                        <View style={fmStyles.menuList}>
                          <Icon
                            name="information"
                            size={20}
                            color="#00CDBC"
                            style={{ marginRight: 10 }}
                          />
                          <Text style={fmStyles.actionLabel}>
                            Info, Maps & Hygiene Rating
                          </Text>
                        </View>
                        <Icon
                          name="chevron-right"
                          color="#00CDBC"
                          style={fmStyles.chevronIcon}
                        />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("Reviews", { restaurant })
                      }
                    >
                      <View
                        style={fmStyles.actionRow}
                      >
                        <View style={fmStyles.menuList}>
                          <Icon
                            name="star"
                            size={20}
                            color="#00CDBC"
                            style={{ marginRight: 10 }}
                          />
                          <Text style={fmStyles.actionLabel}>
                            See all {commentsLength} reviews
                          </Text>
                        </View>
                        <Icon
                          name="chevron-right"
                          color="#00CDBC"
                          style={fmStyles.chevronIcon}
                        />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={jumpToMenu}>
                      <View style={fmStyles.actionRow}>
                        <View style={fmStyles.menuList}>
                          <Icon
                            name="book"
                            size={20}
                            color="#00CDBC"
                            style={{ marginRight: 10 }}
                          />
                          <Text style={fmStyles.actionLabel}>Jump to Menu</Text>
                        </View>
                        <Icon
                          name="chevron-right"
                          color="#00CDBC"
                          style={fmStyles.chevronIcon}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={fmStyles.mapWrap}>
                  <Map
                    latitude={restaurant.lat}
                    longitude={restaurant.long}
                    title={restaurant.restaurantName}
                  />
                </View>
              </View>
        </View>
        <View
          onLayout={(event) => {
            menuSectionY.current = event.nativeEvent.layout.y;
          }}
          style={fmStyles.menuSection}
        >
          <View style={fmStyles.menuSectionHeader}>
            <Text style={fmStyles.menuSectionTitle}>Menu</Text>
            <Text style={fmStyles.menuSectionHint}>
              {searchText.trim().length > 0
                ? "Filtered by your search"
                : "Browse by category"}
            </Text>
          </View>
          {hasAnyMenuItems ? [
            { key: "starters", label: "Starters" },
            { key: "mains", label: "Mains" },
            { key: "desserts", label: "Desserts" },
            { key: "drinks", label: "Drinks" },
          ].map((section) => {
            const sectionItems = getSectionItems(section.key).filter((item) => {
              if (!queryTokens.length) {
                return true;
              }
              const haystack = `${item?.name ?? ""} ${item?.description ?? item?.descriptions ?? ""}`.toLowerCase();
              return queryTokens.some((token) => haystack.includes(token));
            });

            if (queryTokens.length > 0 && sectionItems.length === 0) {
              return null;
            }

            return (
              <View key={section.key} style={fmStyles.menuBlock}>
                <TouchableOpacity
                  style={fmStyles.menuBlockHeader}
                  activeOpacity={0.8}
                  onPress={() => toggleSection(section.key)}
                >
                  <Text style={fmStyles.menuBlockTitle}>
                    {section.label} ({sectionItems.length})
                  </Text>
                  <Icon
                    name={expandedSection === section.key ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={ui.colors.primary}
                  />
                </TouchableOpacity>
                {expandedSection === section.key &&
                  sectionItems.map((item, index) => (
                    <View key={`${section.key}-${item?.name ?? "item"}-${index}`} style={fmStyles.menuItemCard}>
                      <View style={fmStyles.menuItemTop}>
                        <Text style={fmStyles.menuItemName}>{item?.name}</Text>
                        <Text style={fmStyles.menuItemPrice}>{item?.price}</Text>
                      </View>
                      {!!(item?.description ?? item?.descriptions) && (
                        <Text style={fmStyles.menuItemDesc}>
                          {item?.description ?? item?.descriptions}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            );
          }) : (
            <View style={fmStyles.emptyMenuWrap}>
              <Text style={fmStyles.emptyMenuText}>
                Menu items are not available for this restaurant yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar
        activeTab={activeTab}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        navigation={navigation}
      ></BottomNavBar>
    </SafeAreaView>
  );
};

const fmStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ui.spacing.md,
    paddingTop: ui.spacing.xs,
    paddingBottom: ui.spacing.xs,
    gap: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.xl,
  },
  clearButton: {
    margin: 0,
  },
  searchButtonTouchable: {
    borderRadius: 24,
  },
  searchButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  promptCompact: {
    marginHorizontal: ui.spacing.md,
    marginBottom: ui.spacing.sm,
    paddingHorizontal: 2,
  },
  promptCompactTitle: {
    fontSize: ui.type.caption,
    color: ui.colors.textMuted,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginLeft: 4,
  },
  aiPicksStrip: {
    marginHorizontal: ui.spacing.md,
    marginBottom: ui.spacing.sm,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    borderColor: "#BEEDEA",
    backgroundColor: "#ECFBF9",
    paddingHorizontal: ui.spacing.sm,
    paddingVertical: ui.spacing.sm,
  },
  aiPicksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ui.spacing.xs,
  },
  aiPicksTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiPicksTitle: {
    fontSize: ui.type.caption,
    color: "#0F766E",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  aiPicksAction: {
    fontSize: ui.type.caption,
    color: ui.colors.primary,
    fontWeight: "800",
  },
  aiPillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ui.spacing.xs,
  },
  aiSuggestionPill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: ui.radius.full,
    borderWidth: 1,
    borderColor: "#A7E7E2",
    backgroundColor: "#D4F5F1",
  },
  aiSuggestionPillText: {
    color: "#0F766E",
    fontSize: ui.type.body,
    fontWeight: "800",
  },
  errorBanner: {
    marginHorizontal: ui.spacing.md,
    marginBottom: ui.spacing.xs,
    backgroundColor: "#FEECEC",
    borderColor: "#F8B4B4",
    borderWidth: 1,
    borderRadius: ui.radius.md,
    paddingHorizontal: ui.spacing.sm,
    paddingVertical: ui.spacing.xs,
  },
  errorBannerText: {
    color: "#B42318",
    fontSize: ui.type.caption,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: ui.spacing.md,
  },
  promptSection: {
    marginHorizontal: ui.spacing.md,
    marginBottom: ui.spacing.sm,
    padding: ui.spacing.md,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    borderColor: ui.colors.border,
    backgroundColor: ui.colors.surface,
  },
  promptHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: ui.spacing.xs,
  },
  promptTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: ui.colors.text,
  },
  promptToggleText: {
    fontSize: ui.type.caption,
    color: ui.colors.primary,
    fontWeight: "800",
  },
  promptGrid: {
    gap: 8,
  },
  promptChip: {
    paddingHorizontal: ui.spacing.sm,
    paddingVertical: 9,
    borderRadius: ui.radius.full,
    borderWidth: 1,
    borderColor: "#CDEEEE",
    backgroundColor: "#F0FCFB",
  },
  promptChipText: {
    color: ui.colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  tagRow: {
    marginTop: ui.spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ui.spacing.xs,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: ui.radius.full,
    backgroundColor: ui.colors.primarySoft,
    borderWidth: 1,
    borderColor: "#BEEDEA",
  },
  tagText: {
    color: "#0F766E",
    fontSize: ui.type.caption,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  restaurantCard: {
    paddingHorizontal: ui.spacing.md,
  },
  detailsContainer: {
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    padding: ui.spacing.md,
    borderWidth: 1,
    borderColor: ui.colors.border,
    gap: ui.spacing.sm,
    ...ui.shadow.card,
  },
  heroRow: {
    flexDirection: "row",
    gap: 12,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: ui.radius.md,
    resizeMode: "cover",
    backgroundColor: "#F3F4F6",
  },
  heroInfo: {
    flex: 1,
    gap: 5,
  },
  restaurantName: {
    fontSize: ui.type.h1,
    fontWeight: "900",
    color: ui.colors.text,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: ui.type.body,
    lineHeight: 19,
    color: ui.colors.text,
    fontWeight: "700",
  },
  linkText: {
    flex: 1,
    fontSize: ui.type.body,
    lineHeight: 19,
    color: ui.colors.primary,
    fontWeight: "700",
  },
  restaurantDescription: {
    fontSize: ui.type.body,
    lineHeight: 21,
    color: ui.colors.textMuted,
    fontWeight: "500",
    marginTop: 4,
  },
  quickActions: {
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: ui.colors.text,
  },
  chevronIcon: {
    marginTop: 0,
  },
  mapWrap: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  menuSection: {
    marginTop: ui.spacing.sm,
    marginHorizontal: ui.spacing.md,
    marginBottom: ui.spacing.md,
    paddingTop: ui.spacing.sm,
    borderRadius: ui.radius.md,
    borderTopWidth: 1,
    borderTopColor: ui.colors.border,
  },
  menuSectionHeader: {
    marginBottom: ui.spacing.sm,
  },
  menuSectionTitle: {
    fontSize: ui.type.h2,
    fontWeight: "900",
    color: ui.colors.text,
  },
  menuSectionHint: {
    marginTop: 2,
    fontSize: ui.type.caption,
    color: ui.colors.textMuted,
    fontWeight: "600",
  },
  menuBlock: {
    marginBottom: ui.spacing.sm,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    overflow: "hidden",
  },
  menuBlockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ui.spacing.sm,
    paddingVertical: ui.spacing.sm,
    backgroundColor: "#F8FAFC",
  },
  menuBlockTitle: {
    color: ui.colors.text,
    fontSize: ui.type.body,
    fontWeight: "800",
  },
  menuItemCard: {
    paddingHorizontal: ui.spacing.sm,
    paddingVertical: ui.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: ui.colors.border,
    backgroundColor: ui.colors.surface,
  },
  menuItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemName: {
    flex: 1,
    paddingRight: ui.spacing.xs,
    fontSize: ui.type.body,
    fontWeight: "700",
    color: ui.colors.text,
  },
  menuItemPrice: {
    fontSize: ui.type.body,
    fontWeight: "800",
    color: ui.colors.primary,
  },
  menuItemDesc: {
    marginTop: 4,
    fontSize: ui.type.caption,
    lineHeight: 18,
    color: ui.colors.textMuted,
  },
  emptyMenuWrap: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: ui.spacing.md,
    backgroundColor: "#F8FAFC",
  },
  emptyMenuText: {
    fontSize: ui.type.body,
    color: ui.colors.textMuted,
    fontWeight: "600",
  },
});

export default FoodMenuScreen;
