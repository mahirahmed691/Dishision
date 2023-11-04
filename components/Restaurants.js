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
import * as Speech from 'expo-speech';
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
import * as Location from "expo-location";
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
  const [voiceInputText, setVoiceInputText] = useState('');

  // Function to load more categories
  const handleLoadMoreCategories = () => {
    setLoadingMore(true);

    setTimeout(() => {
      setVisibleCategories((prevCount) => prevCount + 3);
      setLoadingMore(false);
      fetchMoreRestaurants(); // Fetch more data
    }, 1000);
  };

  // Check if the user is close to the bottom of the scroll
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
    );
  };

  // Event listener for scrolling to load more categories
  const handleScroll = ({ nativeEvent }) => {
    const paddingToBottom = 20;
    const currentOffset = nativeEvent.contentOffset.y;
    const contentHeight = nativeEvent.contentSize.height;
    const layoutHeight = nativeEvent.layoutMeasurement.height;

    // Check if the user is close to the bottom and not already loading more data
    if (
      layoutHeight + currentOffset >= contentHeight - paddingToBottom &&
      !loadingMore
    ) {
      handleLoadMoreCategories();
    }
  };

  useEffect(() => {
    prevScrollY.current = 0;
    setVisibleCategories(5);
  }, []);

  const getMicrophonePermission = async () => {
    const { status } = await Speech.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access microphone was denied');
      return;
    }
  };

  const captureVoiceInput = async () => {
    try {
      const spokenText = await Speech.recognize(); // Use Speech.recognize instead of Speech.recognizeAsync
      if (spokenText) {
        setSearchText(spokenText); // Assuming you want to use the spoken text for search
        setVoiceInputText(spokenText); // Set the spoken text in the state
        applyFilters(null, null, isHalal, spokenText); // Apply filters based on spoken text
      } else {
        Speech.speak('Please try again', { language: 'en-US' }); // Ask the user to repeat
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      Speech.speak('An error occurred. Please try again.', { language: 'en-US' });
    }
  };

  useEffect(() => {
    getMicrophonePermission();
  }, []);


  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          // You might need to prompt the user to grant permission here
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      } catch (error) {
        console.error("Error getting location: ", error);
        // Specific error handling based on the caught error
        if (error.code === "E_LOCATION_SERVICES_DISABLED") {
          // Provide a message for disabled location services
        } else if (error.code === "E_NO_LOCATION_PERMISSION") {
          // Handle when permission is not granted
        } else {
          // Handle other location-related errors
        }
      }
    };

    getLocation();
  }, []);

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
      setSelectedLocation("Manchester"); // Set the initial selected location to "All Locations"
      fetchRestaurantsFromFirestore(currentLocation);
      setFetchCount(1);
    }
  }, [currentLocation, fetchCount]);

  const fetchRestaurantsFromFirestore = async (locationCoords) => {
    try {
      const restaurantsCollection = collection(db, "restaurant");

      const querySnapshot = await getDocs(
        query(restaurantsCollection, where("city", "==", "Manchester"))
      );
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

      if (error.code === "permission-denied") {
        console.log("Permission denied to access Firestore.");
      } else {
        console.log("Using fallback data due to Firestore error.");
        const fallbackData = require("/Users/mahirahmed/Dishision/collectionData.json");
        setRestaurants(fallbackData);
        setFilteredRestaurants(fallbackData);
        setIsDataLoaded(true);
      }
    }
  };

  // Function to fetch restaurant data from Firestore
  const fetchMoreRestaurants = async () => {
    try {
      const restaurantsCollection = collection(db, "restaurant");
      const querySnapshot = await getDocs(
        query(
          restaurantsCollection,
          where("city", "==", "Manchester"),
          limit(10) // Limit the number of documents to fetch
          // Add an offset here for pagination if needed
        )
      );

      setReadCount((prevCount) => prevCount + querySnapshot.size);

      const newRestaurants = [];
      querySnapshot.forEach((doc) => {
        const restaurant = doc.data();
        newRestaurants.push(restaurant);
      });

      // Filter out duplicates before adding to state
      setRestaurants((prevRestaurants) => {
        const updatedRestaurants = [
          ...prevRestaurants,
          ...newRestaurants.filter(
            (newRestaurant) =>
              !prevRestaurants.some(
                (existingRestaurant) =>
                  existingRestaurant.id === newRestaurant.id // Assuming an 'id' field
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
                  existingRestaurant.id === newRestaurant.id // Assuming an 'id' field
              )
          ),
        ];
        return updatedFilteredRestaurants;
      });
    } catch (error) {
      console.error("Error fetching more restaurants:", error);
    }
  };

  // Function to handle filtered search
  const applyFilters = (rating, foodType, isHalal, searchText, location) => {
    let filtered = [...restaurants];

    // Apply search filter first
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
    setIsFilterActive(true); // Set the filter state to active
  };

  const handleInputChange = (text) => {
    setSearchText(text);
    applyFilters(null, null, isHalal, text);

    // Check if the search input is empty, and if it is, reset the list
    if (text.trim() === "") {
      setIsFilterActive(false); // Reset the filter state
    }
  };

  const handleShowAll = () => {
    setFilteredRestaurants(restaurants); // Reset filtered restaurants
    setSearchText(""); // Clear the search input
    setIsFilterActive(false); // Reset the filter state
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
      const cuisineType = restaurant.cuisine.toLowerCase(); // Normalize to lowercase
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
    setOpen(false); // Close the drop-down
    setValue(location); // Set the selected value directly

    // Apply filtering based on the selected location
    setSelectedLocation(location); // Set the selected location in the state

    if (location === "All Locations") {
      setFilteredRestaurants(restaurants); // Show all restaurants if "All Locations" is selected
    } else {
      const filteredByLocation = filterByLocation(restaurants, location);
      setFilteredRestaurants(
        filteredByLocation.length > 0 ? filteredByLocation : restaurants
      ); // Set filtered restaurants based on the location
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
          style={styles.searchInput}
          dense
        />
        <IconButton
          icon={searchText.length > 0 ? "close" : "microphone"}
          color="#00CDBC"
          size={20}
          onPress={() => {
            if (searchText.length > 0) {
              setSearchText("");
              setFilteredRestaurants(restaurants);
              setIsFilterActive(false);
            } else {
              captureVoiceInput() // Speak function called here
            }
          }}
        />
        <IconButton
          icon="tune"
          onPress={openFilterModal}
          style={{ marginTop: 10, marginRight: 10 }}
          iconColor="#fff"
          size={30}
        />
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
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00CDBC"
            />
          }
        >
          <View style={{ flexDirection: "row", zIndex: 9999 }}>
            <LocationServices />
            <DropDownPicker
              value={value}
              items={items}
              open={open}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              defaultValue={selectedLocation}
              containerStyle={{ height: 40, width: "50%" }}
              style={{ backgroundColor: "#fafafa" }}
              itemStyle={{
                justifyContent: "flex-start",
              }}
              dropDownStyle={{ backgroundColor: "#fafafa" }}
              onChangeItem={(item) => handleLocationChange(item.value)} // Pass the item's value to handleLocationChange
              zIndex={5000}
              searchable={true}
              searchablePlaceholder="Search for location"
              searchablePlaceholderTextColor="gray"
              onChangeValue={(value) => {
                handleLocationChange(value); // Make sure to call handleLocationChange with the value
              }}
            />
          </View>

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
            outputRange: [1, 0], // Fading out when the user scrolls
            extrapolate: "clamp",
          }),
        }}
      >
        <IconButton
          icon="arrow-down" // Replace with your desired arrow icon
          onPress={handleLoadMoreCategories} // Trigger loading more data on button press
          color="#00CDBC" // Change the arrow color as needed
          size={10} // Adjust the size of the arrow icon
          style={{ alignSelf: "center" }} // Align the button/icon to the center
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
