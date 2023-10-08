import React, { useEffect, useState,  } from 'react';
import Drawer from 'react-native-drawer';
import Icon from 'react-native-vector-icons/FontAwesome';
import { signOut } from 'firebase/auth';
import { auth } from '../config';
import { restaurantData } from '../data/restuarantData';
import StarRating from 'react-native-star-rating';
import * as Location from 'expo-location'; 
import axios from 'axios';

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
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurantData);
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


  useEffect(() => {
    if (auth.currentUser) {
      const user = auth.currentUser;
      setUserName(user.displayName || '');
      setUserPhotoURL(user.photoURL || '');
    }
  }, []);


  useEffect(() => {
    filterRestaurantsByFavorites();
  }, [favorites, showFavoritesOnly]);

  const handleLogout = () => {
    signOut(auth).catch((error) => console.log('Error logging out: ', error));
  };

  const handleInputChange = (text) => {
    setInputText(text);
    filterRestaurants(text);
  };

  const filterRestaurants = (text) => {
    let filtered = restaurantData.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(text.toLowerCase())
    );

    if (selectedRating) {
      filtered = filtered.filter((restaurant) => restaurant.rating >= selectedRating);
    }

    if (selectedFoodType) {
      filtered = filtered.filter((restaurant) =>
        restaurant.cuisine.toLowerCase() === selectedFoodType.toLowerCase()
      );
    }

    setFilteredRestaurants(filtered);
    setFilterResultsEmpty(filtered.length === 0);
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      const activeTab = 'Home';
      setActiveTab(activeTab);
    }
    setDrawerOpen(!isDrawerOpen);
  };

  const openFilterModal = () => {
    console.log('Opening filter modal');
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const applyFilters = (rating, foodType, isHalal) => {
  let filtered = [...restaurantData];

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
      ? restaurantData.filter((restaurant) => favorites.includes(restaurant.name))
      : [...restaurantData];

    if (inputText) {
      filtered = filtered.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(inputText.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
    setFilterResultsEmpty(filtered.length === 0);
  };

  const favoriteRestaurants = restaurantData.filter((restaurant) =>
  favorites.includes(restaurant.name)
);

useEffect(() => {
  // Request location permission and fetch the user's location
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = userLocation.coords;

      // Call reverseGeocode to get the location name
      const name = await reverseGeocode(latitude, longitude, apiKey);
      console.log('Location Name:', name);

      // Set the location name in the state
      setLocationName(name);
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  requestLocationPermission();
}, []);

const reverseGeocode = async (latitude, longitude, apiKey) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    if (response.status === 200) {
      const results = response.data.results;
      if (results.length > 0) {
        const locationName = results[0].formatted_address;
        console.log('Reverse geocoding response:', locationName);
        return locationName;
      } else {
        console.log('No results found for reverse geocoding');
        return 'Location Not Available';
      }
    } else {
      console.error('Reverse geocoding request failed');
      return 'Location Not Available';
    }
  } catch (error) {
    console.error('Error during reverse geocoding:', error);
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
                  <Icon name="chevron-right" style={styles.walletHeaderIcon} />
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
              <Icon
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
              <Icon
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
                Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <Icon
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
              <Icon
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
              <TouchableOpacity onPress={toggleFavorite}>
                  <Icon
                    style={{marginLeft:10}}
                    name={favorites.includes(selectedRestaurant) ? 'heart' : 'heart-o'}
                    size={24}
                    color={favorites.includes(selectedRestaurant) ? 'red' : 'gray'}
                  />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Icon
                    style={{marginLeft:10}}
                    name="user"
                    size={24}
                    color="#00CDBC"
                  />
              </TouchableOpacity>
          </View>
          </View>
          <View>
        {locationName ? (
          <Text>Location: {locationName}</Text>
        ) : (
          <Text>Loading location...</Text>
        )}
      </View>
            
          <View style={styles.filterContainer}>
            <TextInput
              theme={{
                roundness:30,
                colors: {
                  primary: '#00CDBC', underlineColor: 'transparent'
                }         
              }}
              mode="outlined"
              label="Search for food place"
              value={inputText}
              onChangeText={handleInputChange}
              style={styles.searchInput}
              clearButtonMode="always"
              clearButtonModeStyle={{backgroundColor:'red'}}
            />
              <IconButton
                icon="tune"
                onPress={openFilterModal}
                style={{ marginBottom: 10, marginLeft: 10 }}
                iconColor='#00CDBC'
                size={30}
                collapsable={true}
              >
                Filter
              </IconButton>
              <FilterModal
              visible={isFilterModalVisible}
              onClose={closeFilterModal}
              isHalal={isHalal}
              setIsHalal={setIsHalal}
              onApplyFilters={applyFilters}
            />
            </View>
          <ScrollView style={styles.scrollableContent}>
            {filteredRestaurants.map((restaurant, index) => (
              <TouchableOpacity
                key={index}
                style={styles.foodCard}
                onPress={() =>
                  navigation.navigate(
                    'Menu',
                    { foodItem: restaurant },
                    () => setSelectedRestaurant(restaurant.name) 
                  )
                }
              >
                <View style={styles.cardContent}>
                  <View style={styles.rightContent}>
                    <View>
                      <HalalBanner isHalal={restaurant.isHalal} />
                      <Image
                        source={{ uri: restaurant.image }}
                        style={styles.restaurantImage}
                        onError={(error) =>
                          console.error('Image loading error:', error)
                        }
                      />
                    </View>
                  </View>
                  <View style={styles.leftContent}>
                    <View style={styles.favoriteAndReviews}>
                      <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    </View>
                    <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
                    <View style={styles.ratingContainer}>
                      <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={restaurant.rating}
                        fullStarColor="#111"
                        starSize={18}
                      />
                    </View>
                    <Text style={styles.location}>
                      Location: {restaurant.location}
                    </Text>
                    <Text>
                      Price: £{restaurant.price}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(restaurant.name)}
                  >
                    <Icon
                      name={favorites.includes(restaurant.name) ? 'heart' : 'heart-o'}
                      size={20}
                      color={favorites.includes(restaurant.name) ? 'red' : 'gray'}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            {filteredRestaurants.length < restaurantData.length && (
              <>
                {filteredRestaurants.length === 0 ? (
                  <EmptyResultsMessage clearFilters={clearFilters} />
                ) : (
                  <Button mode='contained' onPress={clearFilters}>
                    Show all restaurants
                  </Button>
                )}
              </>
            )}
            {favoriteRestaurants.map((restaurant, index) => (
              <TouchableOpacity key={index} />
            ))}            
          </ScrollView>
        </View>
        
      </Drawer>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Home' && styles.activeTab]}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon
            name="home"
            size={24}
            color={activeTab === 'Home' ? '#00CDBC' : '#333'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Profile' && styles.activeTab]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon
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
          <Icon
            name="heart"
            size={24}
            color={activeTab === 'Favourites' ? '#00CDBC' : '#333'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Settings' && styles.activeTab]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon
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
