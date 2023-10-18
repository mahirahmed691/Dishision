import React, { useEffect, useState,  } from 'react';
import Drawer from 'react-native-drawer';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import { signOut } from 'firebase/auth';
import * as Location from 'expo-location'; 
import axios from 'axios';
import { firestore, auth } from '../config/firebase'; 
import RestaurantForm from '../components/RestaurantForm';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Platform 
} from 'react-native';
import { TextInput, Avatar, Card, Button, IconButton } from 'react-native-paper';
import FilterModal from '../components/FilterModal';
import Restaurants from '../components/Restaurants';

const EmptyResultsMessage = ({ clearFilters }) => {
  return (
    <View style={styles.emptyResultsContainer}>
      <Image
        source={require('../assets/no-food.gif')}
        style={styles.gif}
      />
      <Text style={styles.emptyResultsText}>
        No results found. Try clearing filters.
      </Text>
      <Button mode='outlined' onPress={clearFilters}>
        Clear filters
      </Button>
    </View>
  );
};

export const HomeScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhotoURL, setUserPhotoURL] = useState('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filterResultsEmpty, setFilterResultsEmpty] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedFoodType, setSelectedFoodType] = useState(null);
  const [isHalal, setIsHalal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const apiKey = '9a05000aa2177a72a4a01ddafd1bc03c';
 const [searchInput, setSearchInput] = useState('');
 const [isRestaurantFormVisible, setIsRestaurantFormVisible] = useState(false);
 const [restaurantFormMode, setRestaurantFormMode] = useState('add');
 const [searchText, setSearchText] = useState('');


  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const restaurantsCollection = firestore.collection('restaurant'); // Use your Firestore collection name.
        const snapshot = await restaurantsCollection.get();
        const restaurants = snapshot.docs.map((doc) => doc.data());

        setFilteredRestaurants(restaurants);

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
    signOut(auth).catch((error) => console.log('Error logging out: ', error));
  };

  const handleInputChange = (text) => {
    setSearchText(text);
  };

  const openRestaurantFormModal = () => {
    setRestaurantToEdit(null); // Clear any previously edited restaurant
    setIsRestaurantFormVisible(true);
  };

  const closeRestaurantForm = () => {
    setIsRestaurantFormVisible(false);
  };

  const toggleRestaurantForm = (mode) => {
    // Set the mode when toggling the form
    setRestaurantFormMode(mode);
    setIsRestaurantFormVisible(true);
  };

  const filterRestaurants = () => {
    // Filter restaurants based on searchText
    let filtered = filteredRestaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(searchText.toLowerCase())
    );
  
    // Apply other filters (rating, food type, halal)
    if (selectedRating) {
      filtered = filtered.filter((restaurant) => restaurant.rating >= selectedRating);
    }
  
    if (selectedFoodType) {
      filtered = filtered.filter((restaurant) =>
        restaurant.cuisine.toLowerCase() === selectedFoodType.toLowerCase()
      );
    }
  
    if (isHalal) {
      filtered = filtered.filter((restaurant) => restaurant.isHalal);
    }
  
    setFilteredRestaurants(filtered);
    setFilterResultsEmpty(filtered.length === 0);
  };

  useEffect(() => {
    filterRestaurants();
  }, [searchText]);

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      const activeTab = 'Home';
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

  const applyFilters = (rating, foodType, isHalal) => {
  let filtered = [...filteredRestaurants];

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

  if (inputText) {
    filtered = filtered.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(inputText.toLowerCase())
    );
  }

  if (showFavoritesOnly) {
    filtered = filtered.filter((restaurant) =>
      favorites.includes(restaurant.name)
    );
  }

  setFilteredRestaurants(filtered);
  setFilterResultsEmpty(filtered.length === 0);
  closeFilterModal();
};

  const HalalBanner = ({ isHalal }) => {
    if (isHalal) {
      return (
        <View style={styles.ribbonContainer}>
          <Text style={styles.ribbonText}>Halal</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  const clearFilters = () => {
    setSelectedRating(null);
    setSelectedFoodType(null);
    setIsHalal(false);
    setInputText('');
    filterRestaurants('');
  };

  const toggleFavorite = () => {
    if (selectedRestaurant) { 
      setFavorites((prevFavorites) => {
        if (prevFavorites.includes(selectedRestaurant)) {
          return prevFavorites.filter((name) => name !== selectedRestaurant);
        } else {
          return [...prevFavorites, selectedRestaurant];
        }
      });
    }
  };

  const filterRestaurantsByFavorites = () => {
    let filtered = showFavoritesOnly
      ? filteredRestaurants.filter((restaurant) => favorites.includes(restaurant.name))
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

useEffect(() => {
  // Request location permission and fetch the user's location
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = userLocation.coords;

      // Call reverseGeocode to get the location name
      const name = await reverseGeocode(latitude, longitude, apiKey);

      // Set the location name in the state
      setLocationName(name);
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  requestLocationPermission();
}, []);

useEffect(() => {
  filterRestaurants(searchInput);
}, [searchInput]);

const reverseGeocode = async (latitude, longitude, apiKey) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    if (response.status === 200) {
      const results = response.data.results;
      if (results.length > 0) {
        const locationName = results[0].formatted_address;
        return locationName;
      } else {
        return 'Location Not Available';
      }
    } else {
      console.error('Reverse geocoding request failed');
      return 'Location Not Available';
    }
  } catch (error) {
    return 'Location Not Available';
  }
};

  return (
    <View style={styles.container}>
      <Drawer
        ref={(ref) => (this.drawer = ref)}
        content={
          <View style={styles.drawerContent}>
            <View style={styles.userInfoContainer}>
              <Avatar.Image
                size={80}
                source={
                  userPhotoURL
                    ? { uri: userPhotoURL }
                    : require('../assets/avatar.png')
                }
              />
              <Text style={styles.menuHeaderText}>@{userName}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Payments')}>
              <Card style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  <Text style={styles.walletHeaderText}>My Wallet</Text>
                  <FontAwesomeIcon name="chevron-right" style={styles.walletHeaderIcon} />
                </View>
                <Text style={styles.walletAmountText}>$250.00</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setActiveTab('Home');
                toggleDrawer();
              }}
            >
              <FontAwesomeIcon
                name="home"
                size={20}
                color={activeTab === 'Home' ? '#00CDBC' : '#333'}
              />
              <Text
                style={[
                  styles.menuListText,
                  { color: activeTab === 'Home' ? '#00CDBC' : '#333' },
                ]}
              >
                Home
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <FontAwesomeIcon
                name="user"
                size={20}
                color={activeTab === 'Profile' ? '#00CDBC' : '#333'}
              />
              <Text
                style={[
                  styles.menuListText,
                  { color: activeTab === 'Profile' ? '#00CDBC' : '#333' },
                ]}
              >
                {""} Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <FontAwesomeIcon
                name="cog"
                size={20}
                color={activeTab === 'Settings' ? '#60BA62' : '#333'}
              />
              <Text
                style={[
                  styles.menuListText,
                  { color: activeTab === 'Settings' ? '#60BA62' : '#333' },
                ]}
              >
                Settings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <FontAwesomeIcon
                name="power-off"
                size={20}
                color={activeTab === 'Logout' ? '#60BA62' : '#333'}
              />
              <Text
                style={[
                  styles.menuListText,
                  { color: activeTab === 'Logout' ? '#60BA62' : '#333' },
                ]}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        }
        openDrawerOffset={0.3}
        panCloseMask={0.3}
        closedDrawerOffset={0}
        open={isDrawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
          
                <IconButton
                  icon="menu"
                  iconColor="#111"
                  size={40}
                  onPress={toggleDrawer}
                />
                <View style={{flexDirection:'row'}}>
                <TouchableOpacity>
                <EntypoIcon
                  name="shop"
                  size={24}
                  style={{ marginLeft: 20 }}
                  onPress={() => {
                    toggleRestaurantForm('add'); 
                    setRestaurantFormMode(''); 
                  }}
                  color="#00CDBC"
                />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleFavorite}>
                  <FontAwesomeIcon
                    style={{marginLeft:20}}
                    name={favorites.includes(selectedRestaurant) ? 'heart' : 'heart-o'}
                    size={24}
                    color={favorites.includes(selectedRestaurant) ? 'red' : 'gray'}
                  />
               </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <FontAwesomeIcon
                    style={{marginLeft:20}}
                    name="user"
                    size={24}
                    color="#00CDBC"
                  />
              </TouchableOpacity>
              </View>
          </View>
          <View>
      </View>   
            
            <RestaurantForm
            isVisible={isRestaurantFormVisible}
            onClose={() => setIsRestaurantFormVisible(false)}
            mode={restaurantFormMode} // Pass the mode
          />
          <Restaurants navigation={navigation}/>

        </View>
        
      </Drawer>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Home' && styles.activeTab]}
          onPress={() => navigation.navigate('Home')}
        >
          <FontAwesomeIcon
            name="home"
            size={24}
            color={activeTab === 'Home' ? '#00CDBC' : '#333'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Profile' && styles.activeTab]}
          onPress={() => navigation.navigate('Profile')}
        >
          <FontAwesomeIcon
            name="user"
            size={24}
            color={activeTab === 'Profile' ? '#60BA62' : '#333'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Favourites' && styles.activeTab]}
          onPress={() => {
            navigation.navigate('Favourites');
            setShowFavoritesOnly(!showFavoritesOnly);
          }}
        >
          <FontAwesomeIcon
            name="heart"
            size={24}
            color={activeTab === 'Favourites' ? '#00CDBC' : '#333'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Settings' && styles.activeTab]}
          onPress={() => navigation.navigate('Settings')}
        >
          <FontAwesomeIcon
            name="cog"
            size={24}
            color={activeTab === 'Settings' ? '#00CDBC' : '#333'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 25,
    fontWeight: '500',
    color: '#333',
  },
  filterContainer: {
    marginBottom: 10,
    flexDirection:'row'
  },
  filterDropdowns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdown: {
    flex: 1,
    marginRight: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchInput: {
    marginBottom: 10,
    backgroundColor:'#f9f9f9',
    borderRadius:20,
    width: width * .8
  },
  drawerContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 0,
    width: 300,
    marginTop: 80,
  },
  menuHeaderText: {
    marginBottom: 10,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  walletCard: {
    width: 200,
    height: 100,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletHeaderText: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: 20,
    fontWeight: '700',
  },
  walletHeaderIcon: {
    marginTop: 10,
    marginRight: 30,
  },
  walletAmountText: {
    marginTop: 5,
    marginLeft: 10,
    marginTop: 10,
    fontSize: 20,
    fontWeight: '900',
  },
  menuItem: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuListText: {
    fontSize: 20,
    fontWeight: '300',
    color: '#333',
    marginLeft: 20,
  },
  foodCard: {
    marginVertical: 10,
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
  },
  restaurantImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    marginBottom: 5,
  },
  cuisine: {
    fontSize: 18,
    color: '#111',
    fontWeight: '700',
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    color: '#444',
    marginTop: 10,
  },
  location: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopColor: 'lightgray',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {},
  scrollableContent: {
    flex: 1,
  },
  cardRightChevron: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  priceRange: {
    fontSize: 16,
    color: '#444',
  },
  viewMenuButton: {
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContent: {
    width: '50%',
    marginRight: 10,
  },
  leftContent: {
    width: '50%',
  },
  cardContent: {
    flexDirection: 'row',
  },
  ribbonContainer: {
    position: 'absolute',
    top: 0,
    left: 8,
    zIndex: 100,
    backgroundColor: 'teal',
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  ribbonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    position: 'relative',
  },
  emptyResultsText:{
    top: width,
    color:'#111',
    fontWeight:'700'
  },
  gif: {
    width: width,
    height: width,
    resizeMode: 'contain',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
  },
  
});

export default HomeScreen;