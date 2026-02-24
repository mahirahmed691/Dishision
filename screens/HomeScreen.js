import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { collection, getDocs } from "@firebase/firestore";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "../config/firebaseAuth";
import { BottomNavBar } from "./BottomNavBar";
import { DrawerSlider } from "./DrawerSlider";
import { ui } from "../config/designSystem";

export const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState("");
  const [user, setUser] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isRestaurantFormVisible, setIsRestaurantFormVisible] = useState(false);
  const [restaurantFormMode, setRestaurantFormMode] = useState("add");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || "");
      setUserPhotoURL(user.photoURL || "");
    } else {
      setUserName("");
      setUserPhotoURL("");
    }
  }, [user]);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const restaurantsCollection = collection(db, "restaurant");
        const snapshot = await getDocs(restaurantsCollection);
        if (snapshot?.docs) {
          const restaurants = snapshot.docs.map((docItem) => docItem.data());
          setFilteredRestaurants(restaurants);
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      }
    };

    fetchRestaurantData();
  }, []);

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
        activeTab={activeTab}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        setActiveTab={setActiveTab}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
});

export default HomeScreen;
