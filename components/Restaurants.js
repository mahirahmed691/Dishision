import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Button, IconButton, TextInput } from 'react-native-paper';
import { collection, getDocs } from 'firebase/firestore';
import StarRating from 'react-native-star-rating';
import { db } from '../config/firebase';
import Colors from '../config/colors';
import FilterModal from '../components/FilterModal';
import RestaurantForm from '../components/RestaurantForm';

export const Restaurants = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isRestaurantFormVisible, setIsRestaurantFormVisible] = useState(false);
  const [restaurantFormMode, setRestaurantFormMode] = useState('add');
  const [isHalal, setIsHalal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedFoodType, setSelectedFoodType] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false); 
  const [filteredRestaurants, setFilteredRestaurants] = useState([]); 
  const [isDataLoaded, setIsDataLoaded] = useState(false); 

  // Function to fetch restaurants from Firestore
  const fetchRestaurantsFromFirestore = async () => {
    const restaurantsCollection = collection(db, 'restaurant');
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

  // Function to handle filtered search
  const applyFilters = (rating, foodType, isHalal, searchText) => {
    let filtered = [...restaurants];
  
    // Apply search filter first
    if (searchText.trim() !== '') {
      const searchLowerCase = searchText.toLowerCase();
      filtered = filtered.filter((restaurant) => {
        return restaurant.restaurantName.toLowerCase().includes(searchLowerCase);
      });
    }
  
    // Apply other filters
    if (rating !== null) {
      filtered = filtered.filter((restaurant) => restaurant.rating >= rating);
    }
  
    if (foodType !== null) {
      filtered = filtered.filter(
        (restaurant) => restaurant.cuisine.toLowerCase() === foodType.toLowerCase()
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
    if (text.trim() === '') {
      setIsFilterActive(false); // Reset the filter state
    }
  };

  const handleShowAll = () => {
    setFilteredRestaurants(restaurants); // Reset filtered restaurants
    setSearchText(''); // Clear the search input
    setIsFilterActive(false); // Reset the filter state
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };


  const navigateToFoodScreen = (restaurant) => {
    navigation.navigate('Menu', { restaurant });
  };

  const windowWidth = Dimensions.get('window').width; // Get window width

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          theme={{
            roundness: 30,
            colors: {
              primary: '#00CDBC',
              underlineColor: 'transparent',
            },
          }}
          mode="outlined"
          label="Search for a food place"
          value={searchText}
          onChangeText={handleInputChange}
          style={styles.searchInput}
          clearButtonMode="always"
        />
        <IconButton
          icon="tune"
          onPress={openFilterModal}
          style={{ marginBottom: 10, marginLeft: 10 }}
          iconColor="#00CDBC"
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
        <ScrollView>
          {filteredRestaurants.map((restaurant, index) => (
            <TouchableOpacity
              key={index}
              style={styles.restaurantCard}
              onPress={() => navigateToFoodScreen(restaurant)}
            >
              <Image source={{ uri: restaurant.logo }} style={styles.logo} />
              <View style={styles.restaurantInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.restaurantName}>{restaurant.restaurantName}</Text>
                </View>
                <View style={styles.starRating}>
                  <StarRating
                    width={100}
                    starSize={18}
                    disabled
                    fullStarColor={Colors.green}
                    maxStars={5}
                    rating={restaurant.rating}
                  />
                </View>
                <Text style={styles.address}>{restaurant.address}</Text>
                <Text style={styles.cuisine}>
                  {restaurant.cuisine
                    ? restaurant.cuisine.charAt(0).toUpperCase() + restaurant.cuisine.slice(1)
                    : ''}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
      {isFilterActive && filteredRestaurants.length === 0 ? ( 
        <View>
        <Image source={require('../assets/no-food2.gif')} style={styles.gif} />
        <Text style={styles.nofoodtext}>No food places found</Text>
        <Button mode="outlined" onPress={handleShowAll}>
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
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    marginRight: 15,
  },
  restaurantInfo: {
    flex: 1,
    padding: 15,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  address: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  cuisine: {
    fontSize: 16,
    color: '#888',
  },
  starRating: {
    width: 60,
    flexDirection: 'row',
  },
  filterContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchInput: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
  },
  gif:{
    width:'100%',
    height:200,
    resizeMode:'contain',
    marginTop:200,
  },
  nofoodtext:{
    alignSelf:'center',
    marginTop:50,
    marginBottom:120,
    fontSize:30,
    fontWeight:'800'
    
  }
});

export default Restaurants;
