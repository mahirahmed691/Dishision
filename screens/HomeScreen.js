import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { firestore, auth } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { View, Dimensions } from "react-native";

import { DrawerSlider } from "./DrawerSlider";
import { BottomNavBar } from "./BottomNavBar";
import { styles } from "./styles";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      setUserName(user.displayName);
      setUserPhotoURL(user.photoURL);
    }
  }, [user]);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const restaurantsCollection = collection(db, 'restaurant'); // Updated syntax
        const snapshot = await getDocs(restaurantsCollection); // Updated syntax
    
        if (snapshot && snapshot.docs) {
          const restaurants = snapshot.docs.map((doc) => doc.data());
          setFilteredRestaurants(restaurants);
        } else {
          console.error('No data retrieved from Firestore.');
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
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
    // Set the mode when toggling the form
    setRestaurantFormMode(mode);
    setIsRestaurantFormVisible(true);
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      const activeTab = "Home";
      setActiveTab(activeTab);
    }
    setDrawerOpen(!isDrawerOpen);
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const filterRestaurantsByFavorites = () => {
    let filtered = showFavoritesOnly
      ? filteredRestaurants.filter((restaurant) =>
          favorites.includes(restaurant.name)
        )
      : [...filteredRestaurants];

    if (inputText) {
      filtered = filtered.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(inputText.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
    setFilterResultsEmpty(filtered.length === 0);
  };

  const favoriteRestaurants = filteredRestaurants.filter((restaurant) =>
    favorites.includes(restaurant.name)
  );

  return (
    <SafeAreaView style={styles.container}>
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
      ></DrawerSlider>

      <BottomNavBar
        styles={styles.BottomNavBar}
        activeTab={activeTab}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        navigation={navigation}
      ></BottomNavBar>
    </SafeAreaView>
  );
};



export default HomeScreen;