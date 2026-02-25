import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking } from "react-native";
import { auth, db } from "../config/firebase";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "@firebase/firestore";

export const useRestaurantMeta = (restaurant) => {
  const [commentsLength, setCommentsLength] = useState(0);
  const [closingTimes, setClosingTimes] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const daysOfWeek = useMemo(
    () => [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    [],
  );

  const fetchCommentsLengthForRestaurant = useCallback(async (restaurantName) => {
    try {
      const commentsCollection = collection(db, "comments");
      const q = query(commentsCollection, where("restaurantName", "==", restaurantName));
      const querySnapshot = await getDocs(q);

      const length = querySnapshot.size;
      setCommentsLength(length);
      return length;
    } catch (error) {
      console.error("Error fetching comments length:", error);
      return 0;
    }
  }, []);

  const fetchRestaurantCommentsLength = useCallback(async () => {
    try {
      const restaurantNameToQuery = restaurant.restaurantName;
      const length = await fetchCommentsLengthForRestaurant(restaurantNameToQuery);
      setCommentsLength(length);
    } catch (error) {
      console.error("Error fetching restaurant comments length:", error);
    }
  }, [fetchCommentsLengthForRestaurant, restaurant.restaurantName]);

  const fetchClosingTimes = useCallback(async () => {
    try {
      const closingTimeCollection = collection(db, "restaurant");
      const q = query(
        closingTimeCollection,
        where("restaurantName", "==", restaurant.restaurantName),
      );
      const querySnapshot = await getDocs(q);

      const closingTimeData = [];
      querySnapshot.forEach((record) => {
        const data = record.data();
        if (data.closingTime) {
          closingTimeData.push({ id: record.id, closingTime: data.closingTime });
        }
      });

      setClosingTimes(closingTimeData);
    } catch (error) {
      console.error("Error fetching closing times from Firestore:", error);
    }
  }, [restaurant.restaurantName]);

  const checkIfFavorited = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const favoritesRef = collection(db, "favorites");
      const userFavoriteDoc = doc(favoritesRef, user.email);
      const userFavoriteSnapshot = await getDoc(userFavoriteDoc);

      if (userFavoriteSnapshot.exists()) {
        const userFavoriteData = userFavoriteSnapshot.data();
        if (userFavoriteData[restaurant.restaurantName]) {
          setIsFavorite(userFavoriteData[restaurant.restaurantName][0].isFavorited);
        }
      }
    } catch (error) {
      console.error("Error checking if restaurant is favorited:", error);
    }
  }, [restaurant.restaurantName]);

  const addToFavorites = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated.");
        return;
      }

      if (!restaurant?.restaurantName) {
        console.error("The restaurant or restaurantName is not defined.");
        return;
      }

      const favoritesRef = collection(db, "favorites");
      const userFavoriteDoc = doc(favoritesRef, user.email);

      const favoriteRestaurant = {
        [restaurant.restaurantName]: [
          {
            name: restaurant.restaurantName,
            isFavorited: true,
            image: restaurant.logo,
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

      await setDoc(userFavoriteDoc, favoriteRestaurant, { merge: true });
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  }, [restaurant]);

  const removeFromFavorites = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated.");
        return;
      }

      if (!restaurant?.restaurantName) {
        console.error("The restaurant or restaurantName is not defined.");
        return;
      }

      const restaurantName = restaurant.restaurantName;
      const favoritesRef = collection(db, "favorites");
      const userFavoriteDoc = doc(favoritesRef, user.email);
      const userFavoriteSnapshot = await getDoc(userFavoriteDoc);

      if (!userFavoriteSnapshot.exists()) {
        console.error(`User with email ${user.email} has no favorites.`);
        return;
      }

      const userFavoriteData = userFavoriteSnapshot.data();
      if (!userFavoriteData[restaurantName]) {
        console.error(`Restaurant ${restaurantName} is not in user favorites.`);
        return;
      }

      delete userFavoriteData[restaurantName];
      await setDoc(userFavoriteDoc, userFavoriteData);
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  }, [restaurant]);

  const handleFavoriteToggle = useCallback(async () => {
    if (isFavorite) {
      await removeFromFavorites();
    } else {
      await addToFavorites();
    }
    setIsFavorite((prev) => !prev);
  }, [addToFavorites, isFavorite, removeFromFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchRestaurantCommentsLength(), fetchClosingTimes()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchClosingTimes, fetchRestaurantCommentsLength]);

  const openUrlInBrowser = useCallback((url) => {
    Linking.openURL(url).catch((err) => console.error("Error opening URL: ", err));
  }, []);

  useEffect(() => {
    fetchRestaurantCommentsLength();
  }, [fetchRestaurantCommentsLength]);

  useEffect(() => {
    fetchClosingTimes();
  }, [fetchClosingTimes]);

  useEffect(() => {
    checkIfFavorited();
  }, [checkIfFavorited]);

  return {
    commentsLength,
    closingTimes,
    daysOfWeek,
    isFavorite,
    refreshing,
    handleFavoriteToggle,
    onRefresh,
    openUrlInBrowser,
  };
};

export default useRestaurantMeta;
