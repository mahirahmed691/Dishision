import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated, // Import Animated from react-native
  Easing,
} from "react-native";
import * as Speech from "expo-speech";
import * as Location from "expo-location";
import { Button, IconButton, TextInput } from "react-native-paper";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import DropDownPicker from "react-native-dropdown-picker";
import {
  getDocs,
  collection,
  where,
  query,
  limit,
  push,
} from "firebase/firestore";
import { db } from "../config/firebase";
import FilterModal from "../components/FilterModal";
import RestaurantForm from "../components/RestaurantForm";
import Branded from "./Branded";
import LocationServices from "./Location";
import styles from "../screens/styles";

export const Restaurants = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isRestaurantFormVisible, setIsRestaurantFormVisible] = useState(false);
  const [restaurantFormMode, setRestaurantFormMode] = useState("add");
  const [isHalal, setIsHalal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedFoodType, setSelectedFoodType] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [visibleCategories, setVisibleCategories] = useState(3);
  const [loadingMore, setLoadingMore] = useState(false);
  const prevScrollY = useRef(0);
  const animatedScrollY = useRef(new Animated.Value(0)).current;
  const [fetchCount, setFetchCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [voiceInputText, setVoiceInputText] = useState("");
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const handleLoadMoreCategories = () => {
    setLoadingMore(true);

    setTimeout(() => {
      setVisibleCategories((prevCount) => prevCount + 3);
      setLoadingMore(false);
      fetchMoreRestaurants();
    }, 1000);
  };

  useEffect(() => {
    prevScrollY.current = 0;
    setVisibleCategories(5);
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      const city = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setSelectedLocation(city[0].city); // Assuming city is available in reverse geocoded data
    } catch (error) {
      console.error("Error getting location: ", error);
      if (error.code === "E_LOCATION_SERVICES_DISABLED") {
        // Handle location services disabled error
      } else if (error.code === "E_NO_LOCATION_PERMISSION") {
        // Handle no location permission error
      } else {
        // Handle other location error cases
      }
    }
  };

  const getMicrophonePermission = async () => {
    try {
      const { status } =
        await Speech.requestDeviceAudioRecordingPermissionAsync();
      if (status === "granted") {
        console.log("Microphone permission granted");
        setIsPermissionGranted(true);
      } else {
        console.log("Microphone permission denied");
      }
    } catch (error) {
      console.error("Error getting microphone permission:", error);
    }
  };

  const captureVoiceInput = async () => {
    try {
      const { status } = await Speech.getPermissionsAsync();
      if (status !== "granted") {
        alert(
          "Permission to access the microphone is required for voice input"
        );
        return;
      }

      let spokenText = await Speech.recognizeAsync();
    } catch (error) {
      console.error("Error capturing voice input:", error);
      alert("An error occurred while capturing voice input. Please try again.");
    }
  };

  const checkAndRequestPermissions = async () => {
    await getMicrophonePermission();
  };

  checkAndRequestPermissions();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRestaurantsFromFirestore();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentLocation && fetchCount === 0) {
      setSelectedLocation("Manchester");
      fetchRestaurantsFromFirestore(currentLocation);
      setFetchCount(1);
    }
  }, [currentLocation, fetchCount]);

  const fetchRestaurantsFromFirestore = async (locationCoords) => {
    try {
      let city = ""; // Default city value

      if (locationCoords) {
        const cityData = await Location.reverseGeocodeAsync({
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
        });

        if (cityData.length > 0) {
          city = cityData[0].city; // Assuming city is available in reverse geocoded data
        }
      }

      const restaurantsCollection = collection(db, "restaurant"); // change to restaurant
      const querySnapshot = await getDocs(
        query(restaurantsCollection, where("city", "==", city))
      );
      console.log(city);

      setReadCount((prevCount) => prevCount + querySnapshot.size);

      const restaurantsData = [];
      querySnapshot.forEach((doc) => {
        const restaurant = doc.data();
        restaurantsData.push(restaurant);
      });

      setRestaurants(restaurantsData);
      setFilteredRestaurants(restaurantsData);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      // Handle error cases
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  // Function to fetch restaurant data from Firestore
  const fetchMoreRestaurants = async () => {
    try {
      const restaurantsCollection = collection(db, "restaurant");
      const querySnapshot = await getDocs(
        query(
          restaurantsCollection,
          where("city", "==", "Manchester"),
          limit(10)
        )
      );

      setReadCount((prevCount) => prevCount + querySnapshot.size);

      const newRestaurants = [];
      querySnapshot.forEach((doc) => {
        const restaurant = doc.data();
        newRestaurants.push(restaurant);
      });

      setRestaurants((prevRestaurants) => {
        const updatedRestaurants = [
          ...prevRestaurants,
          ...newRestaurants.filter(
            (newRestaurant) =>
              !prevRestaurants.some(
                (existingRestaurant) =>
                  existingRestaurant.id === newRestaurant.id
              )
          ),
        ];
        return updatedRestaurants;
      });

      setFilteredRestaurants((prevRestaurants) => {
        const updatedFilteredRestaurants = [
          ...prevRestaurants,
          ...newRestaurants.filter(
            (newRestaurant) =>
              !prevRestaurants.some(
                (existingRestaurant) =>
                  existingRestaurant.id === newRestaurant.id
              )
          ),
        ];
        return updatedFilteredRestaurants;
      });
    } catch (error) {
      console.error("Error fetching more restaurants:", error);
    }
  };

  const applyFilters = (rating, foodType, isHalal, searchText, location) => {
    let filtered = [...restaurants];

    if (searchText.trim() !== "") {
      const searchLowerCase = searchText.toLowerCase();
      filtered = filtered.filter((restaurant) => {
        return restaurant.restaurantName
          .toLowerCase()
          .includes(searchLowerCase);
      });
    }

    // Apply other filters
    if (rating !== null) {
      filtered = filtered.filter((restaurant) => restaurant.rating >= rating);
    }

    if (foodType !== null) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.cuisine.toLowerCase() === foodType.toLowerCase()
      );
    }

    if (isHalal) {
      filtered = filtered.filter((restaurant) => restaurant.isHalal);
    }

    setFilteredRestaurants(filtered);
    setIsFilterActive(true);
  };

  const handleInputChange = (text) => {
    setSearchText(text);
    applyFilters(null, null, isHalal, text);

    if (text.trim() === "") {
      setIsFilterActive(false);
    }
  };

  const handleShowAll = () => {
    setFilteredRestaurants(restaurants);
    setSearchText("");
    setIsFilterActive(false);
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const navigateToFoodScreen = (restaurant) => {
    navigation.navigate("Menu", { restaurant });
  };

  const groupRestaurantsByCuisine = (restaurants) => {
    const groupedRestaurants = {};

    restaurants.forEach((restaurant) => {
      const cuisineType = restaurant.cuisine.toLowerCase();
      if (!groupedRestaurants[cuisineType]) {
        groupedRestaurants[cuisineType] = [];
      }
      groupedRestaurants[cuisineType].push(restaurant);
    });

    return groupedRestaurants;
  };

  const filterByLocation = (restaurants, location) => {
    return restaurants.filter((restaurant) => restaurant.city === location);
  };

  const handleLocationChange = (location) => {
    setOpen(false);
    setValue(location);

    setSelectedLocation(location);

    if (location === "All Locations") {
      setFilteredRestaurants(restaurants);
    } else {
      const filteredByLocation = filterByLocation(restaurants, location);
      setFilteredRestaurants(
        filteredByLocation.length > 0 ? filteredByLocation : restaurants
      );
    }
  };

  useEffect(() => {
    setSelectedLocation(currentLocation);
    const filteredByCurrentLocation = filterByLocation(
      restaurants,
      currentLocation
    );
    if (filteredByCurrentLocation.length === 0) {
      setFilteredRestaurants(restaurants);
    } else {
      setFilteredRestaurants(filteredByCurrentLocation);
    }
  }, [currentLocation, restaurants]);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "All Locations", value: "All Locations" },
    { label: "Manchester", value: "Manchester" },
    { label: "London", value: "London" },
    { label: "Birmingham", value: "Birmingham" },
    { label: "Liverpool", value: "Liverpool" },
    { label: "Leeds", value: "Leeds" },
  ]);

  const groupedRestaurants = groupRestaurantsByCuisine(filteredRestaurants);
  console.log("Reads from Firestore:", readCount);
  return (
    <View style={styles.restaurantContainer}>
      <View style={styles.filterContainer}>
        <TextInput
          theme={{
            roundness: 30,
            colors: {
              primary: "#00CDBC",
              background: "#fff",
            },
          }}
          mode="outlined"
          label="Search for a food place"
          value={searchText}
          onChangeText={handleInputChange}
          style={{ width: 270, margin: 10 }}
        />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconButton
            icon={searchText.length > 0 ? "close" : "microphone"}
            iconColor="white"
            size={20}
            onPress={() => {
              if (searchText.length > 0) {
                setSearchText("");
                setFilteredRestaurants(restaurants);
                setIsFilterActive(false);
              } else {
                captureVoiceInput();
              }
            }}
          />
          <IconButton
            icon="tune"
            onPress={openFilterModal}
            style={{ marginTop: 10, marginRight: 10 }}
            iconColor="#fff"
            size={20}
          />
        </View>
        <FilterModal
          visible={isFilterModalVisible}
          onClose={closeFilterModal}
          isHalal={isHalal}
          selectedRating={selectedRating}
          selectedFoodType={selectedFoodType}
          onApplyFilters={() => {
            applyFilters(selectedRating, selectedFoodType, isHalal, searchText);
          }}
        />
        <RestaurantForm
          isVisible={isRestaurantFormVisible}
          onClose={() => setIsRestaurantFormVisible(false)}
          mode={restaurantFormMode}
        />
      </View>

      {isDataLoaded && filteredRestaurants.length > 0 ? (
        <ScrollView>
          <LocationServices />

          <View style={styles.brandedContainer}>
            <Branded />
          </View>
          {Object.keys(groupedRestaurants)
            .slice(0, visibleCategories)
            .map((cuisineType, index) => (
              <View key={index}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.cuisineHeader}>
                    {" "}
                    {cuisineType
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}{" "}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: "700" }}>
                    ({groupedRestaurants[cuisineType].length})
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.restaurantHorizontalList}
                >
                  {groupedRestaurants[cuisineType].map((restaurant, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.restaurantCardHorizontal}
                      onPress={() => navigateToFoodScreen(restaurant)}
                    >
                      <View>
                        <Image
                          source={{ uri: restaurant.logo }}
                          style={styles.logoHorizontal}
                        />
                        <View style={styles.restaurantInfoHorizontal}>
                          <Text style={styles.restaurantNameHorizontal}>
                            {restaurant.restaurantName}
                          </Text>
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
                </ScrollView>
              </View>
            ))}
        </ScrollView>
      ) : null}
      <Animated.View
        style={{
          opacity: animatedScrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [1, 0],
            extrapolate: "clamp",
          }),
        }}
      >
        <IconButton
          icon="arrow-down"
          onPress={handleLoadMoreCategories}
          color="#00CDBC"
          size={10}
          style={{ alignSelf: "center" }}
        />
      </Animated.View>

      {isFilterActive && filteredRestaurants.length === 0 ? (
        <View>
          <Image source={require("../assets/no-food.gif")} style={styles.gif} />
          <Button
            mode="outlined"
            labelStyle={styles.showAllButtonLabel}
            onPress={handleShowAll}
          >
            Show All
          </Button>
        </View>
      ) : null}
    </View>
  );
};

export default Restaurants;
