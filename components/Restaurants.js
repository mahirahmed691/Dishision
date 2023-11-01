import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Button, IconButton, TextInput } from "react-native-paper";
import { Icon } from "@rneui/themed";
import DropDownPicker from "react-native-dropdown-picker";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import FilterModal from "../components/FilterModal";
import RestaurantForm from "../components/RestaurantForm";
import Branded from "./Branded";
import LocationServices from "./Location";
import * as Location from "expo-location";

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
  const [selectedLocation, setSelectedLocation] = useState("Manchester");
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (currentLocation) {
      const currentLocationItem = {
        label: "Current Location",
        value: currentLocation, // Update with the current location name
      };

      const reverseGeocode = async () => {
        try {
          const reverseGeocoding = await Location.reverseGeocodeAsync({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          });

          const cityName = reverseGeocoding[0].city; // Access the city name from the reverse geocoding result
          const updatedItems = [
            currentLocationItem,
            { label: "All Locations", value: "All Locations" },
            { label: "Manchester", value: "Manchester" },
            { label: "London", value: "London" },
            { label: "Birmingham", value: "Birmingham" },
            { label: "Liverpool", value: "Liverpool" },
          ];

          setItems(updatedItems);
          setSelectedLocation(cityName); // Set the selected location to the current location's city
        } catch (error) {
          console.error("Error fetching city name: ", error);
          // Fallback or error handling if there's an issue with reverse geocoding
        }
      };

      reverseGeocode(); // Perform reverse geocoding to get the city name
    }
  }, [currentLocation]);

  // Function to fetch restaurants from Firestore
  const fetchRestaurantsFromFirestore = async () => {
    const restaurantsCollection = collection(db, "restaurant");
    const querySnapshot = await getDocs(restaurantsCollection);

    const restaurantsData = [];
    querySnapshot.forEach((doc) => {
      const restaurant = doc.data();
      restaurantsData.push(restaurant);
    });

    setRestaurants(restaurantsData);
    setFilteredRestaurants(restaurantsData);
    setIsDataLoaded(true);
  };

  useEffect(() => {
    fetchRestaurantsFromFirestore();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Fetch your data again here
      await fetchRestaurantsFromFirestore();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
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

    // Check if there are no search results
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
    setSelectedLocation(location);

    if (location === "All Locations") {
      setFilteredRestaurants(restaurants); // Show all restaurants if "All Locations" is selected
    } else {
      const filteredByLocation = filterByLocation(restaurants, location);
      if (filteredByLocation.length === 0) {
        setFilteredRestaurants(restaurants); // If no items found, show all restaurants
      } else {
        setFilteredRestaurants(filteredByLocation);
      }
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
  ]);

  const groupedRestaurants = groupRestaurantsByCuisine(filteredRestaurants);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          theme={{
            roundness: 30,
            colors: {
              primary: "white",
              primaryContainer: "#fff",
            },
          }}
          mode="outlined"
          label="Search for a food place"
          value={searchText}
          onChangeText={handleInputChange}
          style={styles.searchInput}
          clearButtonMode="always"
          right={
            searchText.length > 0 && (
              <TextInput.Icon
                icon="close"
                color="black"
                onPress={() => [
                  setSearchText(""),
                  setFilteredRestaurants(restaurants), // Display all restaurants
                  setIsFilterActive(false), // Hide the filter status
                ]}
              />
            )
          }
          dense
        />
        <IconButton
          icon="tune"
          onPress={openFilterModal}
          style={{ marginTop: 10, marginLeft: 10 }}
          iconColor="#fff"
          size={30}
        >
          Filter
        </IconButton>
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
              defaultValue={selectedLocation} // Set default value to the selectedLocation state
              containerStyle={{ height: 40, width: "50%" }}
              style={{ backgroundColor: "#fafafa" }}
              itemStyle={{
                justifyContent: "flex-start",
              }}
              dropDownStyle={{ backgroundColor: "#fafafa" }}
              onChangeItem={(item) => handleLocationChange(value)}
              zIndex={5000}
              searchable={true}
              searchablePlaceholder="Search for location"
              searchablePlaceholderTextColor="gray"
              onChangeValue={(value) => {
                handleLocationChange(value);
              }}
            />
          </View>

          <View style={styles.brandedContainer}>
            <Branded />
          </View>
          {Object.keys(groupedRestaurants).map((cuisineType, index) => (
            <View key={index}>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={styles.cuisineHeader}>
                  {" "}
                  {cuisineType
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}{" "}
                </Text>
                <Text style={{ fontSize: 12, fontWeight:'700' }}>
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
                            <Icon
                              name="fire-circle"
                              size={8}
                              iconColor="orange"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#00CDBC",
    margin: -10,
    marginBottom: 10,
    alignItems: "center",
  },
  brandedContainer: {
    marginVertical: 10,
  },
  cuisineHeader: {
    fontSize: 24,
    fontWeight: "bold",
  },
  restaurantHorizontalList: {
    backgroundColor: "#fff",
  },
  restaurantCardHorizontal: {
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  logoHorizontal: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
    resizeMode: "cover",
  },
  restaurantInfoHorizontal: {
    padding: 10,
  },
  restaurantNameHorizontal: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  restaurantRating: {
    color: "#00CDBC",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  noFoodContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  gif: {
    width: "100%",
    height: 300,
    marginBottom: 20,
  },
  showAllButton: {
    borderColor: "#00CDBC",
  },
  showAllButtonLabel: {
    color: "#00CDBC",
  },
  searchInput: {
    width: "80%",
    margin: 10,
  },
  locationContainer: {
    flexDirection: "row",
  },
  pickerWrapper: {
    flexDirection: "row",
  },
  pickerContent: {
    marginTop: 10,
    backgroundColor: "#f0f0f0",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#00CDBC",
    borderRadius: 8,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 16,
    marginRight: 10,
  },
  pickerContainer: {
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    zIndex: 100, // Adjust the z-index value as needed
  },
  pickerOverlay: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  pickerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default Restaurants;
