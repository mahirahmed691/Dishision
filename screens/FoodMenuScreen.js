import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Share,
  RefreshControl,
} from "react-native";
import { Snackbar } from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
} from "react-native-reanimated";
import { BottomNavBar } from "./BottomNavBar";
import { styles } from "./AppStyles";
import SearchHeader from "../components/SearchHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { filterMenuItemsByQuery } from "../services/menuSearchService";
import useFoodMenuSearch from "../hooks/useFoodMenuSearch";
import useRestaurantMenuData from "../hooks/useRestaurantMenuData";
import useRestaurantMeta from "../hooks/useRestaurantMeta";
import useMenuSections from "../hooks/useMenuSections";
import {
  DEFAULT_USER_PREFERENCES,
  fetchCurrentUserPreferences,
} from "../services/userPreferencesService";
import PromptSystemPanel from "../components/FoodMenu/PromptSystemPanel";
import AIPicksStrip from "../components/FoodMenu/AIPicksStrip";
import RestaurantHeroCard from "../components/FoodMenu/RestaurantHeroCard";
import MenuSectionsPanel from "../components/FoodMenu/MenuSectionsPanel";
import fmStyles from "./FoodMenuStyles";
import { foodMenuCopy } from "../constants/foodMenuCopy";

export const FoodMenuScreen = ({ navigation, route }) => {
  const { restaurant } = route.params;
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedSection, setExpandedSection] = useState("mains");
  const [userPreferences, setUserPreferences] = useState(DEFAULT_USER_PREFERENCES);

  const searchButtonScale = useSharedValue(1);
  const currentDay = new Date().getDay();

  const scrollRef = useRef(null);
  const menuSectionY = useRef(0);

  const { menuData } = useRestaurantMenuData(restaurant);

  useEffect(() => {
    let isMounted = true;
    const loadPreferences = async () => {
      try {
        const prefs = await fetchCurrentUserPreferences();
        if (isMounted) {
          setUserPreferences(prefs);
        }
      } catch (error) {
        console.error("Failed to load preferences for menu search:", error);
      }
    };
    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, []);
  const {
    commentsLength,
    closingTimes,
    daysOfWeek,
    isFavorite,
    refreshing,
    handleFavoriteToggle,
    onRefresh,
    openUrlInBrowser,
  } = useRestaurantMeta(restaurant);

  const toggleSection = useCallback((sectionKey) => {
    setExpandedSection((prev) => (prev === sectionKey ? "" : sectionKey));
  }, []);

  const jumpToMenu = useCallback(() => {
    scrollRef.current?.scrollTo({
      y: Math.max(menuSectionY.current - 80, 0),
      animated: true,
    });
  }, []);

  const searchButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: searchButtonScale.value }],
    };
  });

  const animateSearchButton = useCallback(() => {
    searchButtonScale.value = withSequence(
      withTiming(1.1, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
    );
  }, [searchButtonScale]);

  const shareMenu = useCallback(async () => {
    try {
      const suggestionLines = topPickNames.slice(0, 5);
      const safeRestaurantName = restaurant.restaurantName || "Restaurant";

      const promptLine = searchText.trim()
        ? `Prompt: ${searchText.trim()}`
        : foodMenuCopy.defaultPromptLine;

      const suggestionsBlock =
        suggestionLines.length > 0
          ? `Suggestions:\n${suggestionLines
              .map((line, index) => `${index + 1}. ${line}`)
              .join("\n")}`
          : foodMenuCopy.defaultSuggestionsLine;

      const shareContent = {
        message: `${safeRestaurantName}\n${promptLine}\n\n${suggestionsBlock}`,
        title: "Share Restaurant Menu",
      };

      Share.share(shareContent).catch((error) => {
        console.error("Error sharing:", error);
      });
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  }, [restaurant.restaurantName, searchText, topPickNames]);

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

  const {
    menuSections,
    getSectionItems,
    hasAnyMenuItems,
    allMenuItems,
  } = useMenuSections({
    menuData,
  });

  const {
    loading,
    error,
    snackbarVisible,
    showPromptLibrary,
    queryTokens,
    dynamicRefineTags,
    dynamicPromptIdeas,
    localSuggestions,
    topPickNames,
    setSnackbarVisible,
    setShowPromptLibrary,
    handleClearSearch,
    handleSearch,
    runPromptSearch,
    runFlavorSearch,
    handleTopPickPress,
  } = useFoodMenuSearch({
    restaurantName: restaurant.restaurantName,
    allMenuItems,
    hasAnyMenuItems,
    searchText,
    setSearchText,
    userPreferences,
  });

  const filteredSectionItems = useMemo(() => {
    return menuSections.reduce((acc, section) => {
      acc[section.key] = filterMenuItemsByQuery(
        getSectionItems(section.key),
        queryTokens,
      );
      return acc;
    }, {});
  }, [getSectionItems, menuSections, queryTokens]);

  const hasQueryMatches = useMemo(() => {
    return menuSections.some(
      (section) => (filteredSectionItems[section.key] || []).length > 0,
    );
  }, [filteredSectionItems, menuSections]);

  const handleSearchPress = useCallback(() => {
    animateSearchButton();
    handleSearch();
  }, [animateSearchButton, handleSearch]);
  const handleSubmitEditing = useCallback(() => {
    handleSearch();
  }, [handleSearch]);

  const dismissSnackbar = useCallback(() => {
    setSnackbarVisible(false);
  }, [setSnackbarVisible]);

  const handleTopPickSelect = useCallback((item) => {
    handleTopPickPress(item, jumpToMenu);
  }, [handleTopPickPress, jumpToMenu]);

  const handleMenuSectionLayout = useCallback((event) => {
    menuSectionY.current = event.nativeEvent.layout.y;
  }, []);

  const searchActionContent = useMemo(() => (
    <Animated.View style={searchButtonStyle}>
      <Icon name="magnify" size={20} color="#111827" />
    </Animated.View>
  ), [searchButtonStyle]);

  const rightAccessory = useMemo(() => (
    <View style={fmStyles.headerActions}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={fmStyles.topActionButton}
        onPress={handleFavoriteToggle}
      >
        <Icon
          name={isFavorite ? "heart" : "heart-outline"}
          size={21}
          color={isFavorite ? "#DC2626" : "#4B5563"}
        />
      </TouchableOpacity>
      {topPickNames.length > 0 ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={fmStyles.topActionButton}
          onPress={shareMenu}
        >
          <Icon name="share-variant-outline" size={20} color="#00CDBC" />
        </TouchableOpacity>
      ) : null}
    </View>
  ), [handleFavoriteToggle, isFavorite, shareMenu, topPickNames.length]);

  return (
    <SafeAreaView style={fmStyles.screen} edges={["top"]}>
      <SearchHeader
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSubmitEditing}
        onPressClear={handleClearSearch}
        onPressSearch={handleSearchPress}
        showSearchAction
        placeholder='Try "hot and cheesy"'
        searchActionContent={searchActionContent}
        rightAccessory={rightAccessory}
        containerStyle={fmStyles.searchInputContainer}
      />
      <Snackbar
        visible={snackbarVisible}
        style={styles.snackbar}
        onDismiss={dismissSnackbar}
      >
        {foodMenuCopy.searchHint}
      </Snackbar>

      <PromptSystemPanel
        searchText={searchText}
        dynamicRefineTags={dynamicRefineTags}
        dynamicPromptIdeas={dynamicPromptIdeas}
        showPromptLibrary={showPromptLibrary}
        setShowPromptLibrary={setShowPromptLibrary}
        runFlavorSearch={runFlavorSearch}
        runPromptSearch={runPromptSearch}
        animateSearchButton={animateSearchButton}
        styles={fmStyles}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#333"
          style={fmStyles.loadingIndicator}
        />
      )}

      <AIPicksStrip
        topPickNames={topPickNames}
        onPressMenu={jumpToMenu}
        onPressPick={handleTopPickSelect}
        styles={fmStyles}
      />

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
        <RestaurantHeroCard
          restaurant={restaurant}
          closingTimes={closingTimes}
          daysOfWeek={daysOfWeek}
          currentDay={currentDay}
          commentsLength={commentsLength}
          openUrlInBrowser={openUrlInBrowser}
          capitalizeFirstLetter={capitalizeFirstLetter}
          getPriceTier={getPriceTier}
          jumpToMenu={jumpToMenu}
          navigation={navigation}
          styles={fmStyles}
          legacyStyles={styles}
        />
        <MenuSectionsPanel
          onLayout={handleMenuSectionLayout}
          searchText={searchText}
          hasAnyMenuItems={hasAnyMenuItems}
          queryTokens={queryTokens}
          hasQueryMatches={hasQueryMatches}
          handleClearSearch={handleClearSearch}
          dynamicRefineTags={dynamicRefineTags}
          runFlavorSearch={runFlavorSearch}
          fallbackSuggestions={localSuggestions}
          onPressFallbackSuggestion={handleTopPickSelect}
          menuSections={menuSections}
          filteredSectionItems={filteredSectionItems}
          expandedSection={expandedSection}
          toggleSection={toggleSection}
          styles={fmStyles}
        />
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

export default FoodMenuScreen;
