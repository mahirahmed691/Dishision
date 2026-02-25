import AsyncStorage from "@react-native-async-storage/async-storage";

const SEARCH_ANALYTICS_KEY = "@dishision_search_analytics_v1";
const MAX_EVENTS = 250;

const readEvents = async () => {
  try {
    const raw = await AsyncStorage.getItem(SEARCH_ANALYTICS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read search analytics:", error);
    return [];
  }
};

export const logSearchEvent = async ({
  screen = "unknown",
  restaurantName = "",
  query = "",
  resultsCount = 0,
  source = "unknown",
  clickedItem = "",
} = {}) => {
  const event = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    screen,
    restaurantName,
    query,
    resultsCount,
    source,
    clickedItem,
  };

  try {
    const existing = await readEvents();
    const next = [event, ...existing].slice(0, MAX_EVENTS);
    await AsyncStorage.setItem(SEARCH_ANALYTICS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Failed to write search analytics:", error);
  }
};

export const getSearchAnalyticsEvents = async () => readEvents();

