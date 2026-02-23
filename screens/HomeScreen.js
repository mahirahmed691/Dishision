import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { View } from "react-native";

import { DrawerSlider } from "./DrawerSlider";
import { BottomNavBar } from "./BottomNavBar";
import { styles } from "./styles";

export const HomeScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filterResultsEmpty, setFilterResultsEmpty] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [isRestaurantFormVisible, setIsRestaurantFormVisible] = useState(false);
  const [restaurantFormMode, setRestaurantFormMode] = useState("add");
  const [searchText, setSearchText] = useState("");

  const [user, setUser] = useState(null);

  // ✅ Auth listener (safe)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return unsubscribe;
  }, []);

  // ✅ Update profile info
  useEffect(() => {
    if (user) {
      setUserName(user.displayName || "");
      setUserPhotoURL(user.photoURL || "");
    } else {
      setUserName("");
      setUserPhotoURL("");
    }
  }, [user]);

  // ✅ Fetch restaurants
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const restaurantsCollection = collection(db, "restaurant");
        const snapshot = await getDocs(restaurantsCollection);

        if (snapshot?.docs) {
          const restaurants = snapshot.docs.map((doc) => doc.data());
          setFilteredRestaurants(restaurants);
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      }
    };

    fetchRestaurantData();
  }, []);

  useEffect(() => {
    filterRestaurantsByFavorites();
  }, [favorites, showFavoritesOnly]);

  const handleLogout = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  const toggleRestaurantForm = (mode) => {
    setRestaurantFormMode(mode);
    setIsRestaurantFormVisible(true);
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      setActiveTab("Home");
    }
    setDrawerOpen(!isDrawerOpen);
  };

  const filterRestaurantsByFavorites = () => {
    let filtered = showFavoritesOnly
      ? filteredRestaurants.filter((restaurant) =>
          favorites.includes(restaurant.name),
        )
      : [...filteredRestaurants];

    if (inputText) {
      filtered = filtered.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(inputText.toLowerCase()),
      );
    }

    setFilteredRestaurants(filtered);
    setFilterResultsEmpty(filtered.length === 0);
  };

  return (
    <View style={styles.container}>
      <DrawerSlider
        userName={userName}
        userPhotoURL={userPhotoURL}
        isDrawerOpen={isDrawerOpen}
        setDrawerOpen={setDrawerOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favorites={favorites}
        selectedRestaurant={selectedRestaurant}
        isRestaurantFormVisible={isRestaurantFormVisible}
        setIsRestaurantFormVisible={setIsRestaurantFormVisible}
        restaurantFormMode={restaurantFormMode}
        setRestaurantFormMode={setRestaurantFormMode}
        handleLogout={handleLogout}
        toggleRestaurantForm={toggleRestaurantForm}
        toggleDrawer={toggleDrawer}
        navigation={navigation}
        restaurants={filteredRestaurants}
      />

      <BottomNavBar
        styles={styles.BottomNavBar}
        activeTab={activeTab}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        navigation={navigation}
      />
    </View>
  );
};

export default HomeScreen;
