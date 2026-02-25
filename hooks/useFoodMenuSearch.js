import { useMemo, useState } from "react";
import { axiosGPT, hasOpenAIKey } from "../utils/request";
import {
  deriveTopPickNames,
  extractMenuVocabulary,
  extractSearchTokens,
  getDynamicPromptIdeas,
  getDynamicRefineTags,
  getLocalSuggestions,
  tokenizeText,
} from "../services/menuSearchService";
import { logSearchEvent } from "../services/searchAnalyticsService";
import { foodMenuCopy } from "../constants/foodMenuCopy";

export const useFoodMenuSearch = ({
  restaurantName,
  allMenuItems,
  hasAnyMenuItems,
  searchText,
  setSearchText,
  userPreferences,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);

  const normalizedQuery = searchText.trim().toLowerCase();
  const rawTokens = useMemo(() => tokenizeText(normalizedQuery), [normalizedQuery]);
  const preferenceTokens = useMemo(() => {
    const taste = Array.isArray(userPreferences?.tasteTags)
      ? userPreferences.tasteTags
      : [];
    const cuisines = Array.isArray(userPreferences?.favoriteCuisines)
      ? userPreferences.favoriteCuisines
      : [];
    return [...taste, ...cuisines]
      .flatMap((item) => tokenizeText(`${item}`))
      .filter(Boolean);
  }, [userPreferences?.favoriteCuisines, userPreferences?.tasteTags]);

  const menuVocabulary = useMemo(
    () => extractMenuVocabulary(allMenuItems),
    [allMenuItems],
  );

  const queryTokens = useMemo(() => {
    const shouldBlendPreferenceTokens =
      rawTokens.length > 0 || userPreferences?.discovery?.autoMenuSuggestions;
    const sourceTokens = shouldBlendPreferenceTokens
      ? [...rawTokens, ...preferenceTokens]
      : rawTokens;
    return extractSearchTokens(sourceTokens, menuVocabulary);
  }, [
    menuVocabulary,
    preferenceTokens,
    rawTokens,
    userPreferences?.discovery?.autoMenuSuggestions,
  ]);

  const localSuggestions = useMemo(() => {
    return getLocalSuggestions(allMenuItems, queryTokens);
  }, [allMenuItems, queryTokens]);

  const dynamicRefineTags = useMemo(() => {
    const base = getDynamicRefineTags(allMenuItems, queryTokens);
    const personalized = (userPreferences?.tasteTags || [])
      .map((tag) => `${tag}`.toLowerCase().trim())
      .filter(Boolean);
    return Array.from(new Set([...personalized, ...base])).slice(0, 6);
  }, [allMenuItems, queryTokens, userPreferences?.tasteTags]);

  const dynamicPromptIdeas = useMemo(() => {
    const base = getDynamicPromptIdeas({
      hasAnyMenuItems,
      dynamicRefineTags,
    });
    const favoriteCuisine = userPreferences?.favoriteCuisines?.[0];
    const tasteTag = userPreferences?.tasteTags?.[0];
    const personalized = [];
    if (favoriteCuisine) {
      personalized.push(`Show me your best ${favoriteCuisine} style item.`);
    }
    if (tasteTag) {
      personalized.push(`Find me something ${tasteTag.toLowerCase()} from this menu.`);
    }
    return Array.from(new Set([...personalized, ...base])).slice(0, 5);
  }, [
    dynamicRefineTags,
    hasAnyMenuItems,
    userPreferences?.favoriteCuisines,
    userPreferences?.tasteTags,
  ]);

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

  const topPickNames = useMemo(() => {
    return deriveTopPickNames({
      allMenuItems,
      parsedApiSuggestions,
      localSuggestions,
    });
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
        return {
          source: "local_fallback",
          resultsCount: Math.min(5, fallbackItems.length),
        };
      }

      setError(foodMenuCopy.loadingMenuItemsError);
      return { source: "empty", resultsCount: 0 };
    };

    if (!hasOpenAIKey) {
      const fallbackMeta = localFallback();
      await logSearchEvent({
        screen: "FoodMenu",
        restaurantName,
        query: queryText,
        source: fallbackMeta.source,
        resultsCount: fallbackMeta.resultsCount,
      });
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
          content: `For ${restaurantName}, suggest up to 5 menu items for: ${queryText}. Use a numbered list, one line each.`,
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
        await logSearchEvent({
          screen: "FoodMenu",
          restaurantName,
          query: queryText,
          source: "ai",
          resultsCount: Math.min(5, meaningfulLines.length),
        });
      } else {
        const fallbackMeta = localFallback();
        await logSearchEvent({
          screen: "FoodMenu",
          restaurantName,
          query: queryText,
          source: fallbackMeta.source,
          resultsCount: fallbackMeta.resultsCount,
        });
      }
    } catch (searchError) {
      const fallbackMeta = localFallback();
      await logSearchEvent({
        screen: "FoodMenu",
        restaurantName,
        query: queryText,
        source:
          searchError?.response?.status === 401
            ? "local_fallback_unauthorized"
            : fallbackMeta.source,
        resultsCount: fallbackMeta.resultsCount,
      });
    } finally {
      setLoading(false);
    }
  };

  const runPromptSearch = (promptText, onSearchAnimation) => {
    setSearchText(promptText);
    onSearchAnimation?.();
    setShowPromptLibrary(false);
    handleSearch(promptText);
  };

  const runFlavorSearch = (tag, onSearchAnimation) => {
    runPromptSearch(`Find me ${tag} options on this menu.`, onSearchAnimation);
  };

  const handleTopPickPress = async (itemName, onSelect) => {
    setSearchText(itemName);
    onSelect?.();
    await logSearchEvent({
      screen: "FoodMenu",
      restaurantName,
      query: itemName,
      source: "pick_click",
      resultsCount: topPickNames.length,
      clickedItem: itemName,
    });
  };

  return {
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
  };
};

export default useFoodMenuSearch;
