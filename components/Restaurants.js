import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  Image,
  TouchableOpacity,
  Animated, // Import Animated from react-native
  Easing,
} from "react-native";
import * as Speech from "expo-speech";
import * as Location from "expo-location";
import { Button, IconButton, TextInput } from "react-native-paper";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faFire, faStar } from "@fortawesome/free-solid-svg-icons";
import { Audio } from "expo-av";
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
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);

  // Function to handle "Show More" button press
  const handleShowMore = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
    // Get the restaurants for the selected category
    setSelectedRestaurants(groupedRestaurants[category]);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    // Other necessary state updates or functionality upon modal close
  };

  // Function to close the modal
  const FullScreenModal = ({
    selectedCategory,
    selectedRestaurants,
    onClose,
    navigateToFoodScreen,
    navigation,
  }) => {
    return (
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, marginTop: 40 }}>
          <IconButton
            icon="chevron-left"
            title="Go Back"
            onPress={() => {
              setModalVisible(false); // Update the state to close the modal
            }}
          />
          <Text style={{ fontSize: 30, fontWeight: "900", marginLeft: 20 }}>
            {selectedCategory}
          </Text>
          <View style={styles.fullScreenModalContainer}>
            <ScrollView contentContainerStyle={styles.restaurantListContainer}>
              {selectedRestaurants.map((restaurant, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.restaurantCardFullScreen}
                  onPress={() => {
                    navigateToFoodScreen(restaurant);
                    navigation.navigate("Menu", { restaurant });
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ width: "30%" }}>
                      <Image
                        source={{ uri: restaurant.logo }}
                        style={styles.restaurantImage}
                      />
                    </View>
                    <View style={styles.restaurantInfo}>
                      <Text style={styles.restaurantName}>
                        {restaurant.restaurantName}
                      </Text>
                      <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <FontAwesomeIcon
                          icon={faStar}
                          size={12}
                          color="#00CDBC"
                          style={{ marginRight: 5 }}
                        />
                        <Text style={styles.ratingText}>
                          {(restaurant.rating * 2).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

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

  const captureVoiceInput = async () => {
    try {
      // ... your existing logic to capture voice input
    } catch (error) {
      console.error("Error capturing voice input:", error);
    }
  };

  useEffect(() => {
    const handleCaptureVoiceInput = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access the microphone was denied");
          return;
        }

        // Set audio mode and start capturing voice input
        await Audio.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentModeIOS: true,
        });

        await captureVoiceInput(); // Start capturing voice input
      } catch (error) {
        console.error("Error initiating voice input:", error);
      }
    };

    handleCaptureVoiceInput(); // Trigger voice input capturing
  }, []);

  useEffect(() => {
    if (currentLocation && fetchCount === 0) {
      setSelectedLocation("Manchester");
      fetchRestaurantsFromFirestore(currentLocation);
      setFetchCount(1);
    }
  }, [currentLocation, fetchCount]);

  const fetchRestaurantsFromFirestore = async (locationCoords) => {
    try {
      let city = "";

      if (locationCoords) {
        const cityData = await Location.reverseGeocodeAsync({
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
        });

        if (cityData.length > 0) {
          city = cityData[0].city;
        }
      }

      const restaurantsCollection = collection(db, "restaurant");
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
        query(restaurantsCollection, where("city", "==", city), limit(10))
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
    setModalVisible(false);
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
            .map((cuisineType, index) => {
              const restaurantsInCategory = groupedRestaurants[cuisineType];

              return (
                <View key={index}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.cuisineHeader}>
                      {cuisineType
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </Text>
                    <IconButton
                      style={{ marginTop: 0 }}
                      iconColor="#00CDBC"
                      icon="arrow-right"
                      size={20}
                      animated={true}
                      onPress={() => {
                        handleShowMore(cuisineType);
                      }}
                    />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.restaurantHorizontalList}
                  >
                    {restaurantsInCategory
                      .slice(0, 5) // Show 10 restaurants
                      .map((restaurant, idx) => (
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
                    {restaurantsInCategory.length > 5 && (
                      <IconButton
                        style={{ marginTop: 40 }}
                        containerColor="#00CDBC"
                        iconColor="white"
                        icon="chevron-right"
                        size={10}
                        animated={true}
                        onPress={() => {
                          handleShowMore(cuisineType);
                        }}
                      />
                    )}
                  </ScrollView>
                </View>
              );
            })}
        </ScrollView>
      ) : null}

      <FullScreenModal
        selectedCategory={selectedCategory}
        selectedRestaurants={selectedRestaurants}
        onClose={handleCloseModal}
        navigateToFoodScreen={navigateToFoodScreen}
        navigation={navigation}
      />
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
