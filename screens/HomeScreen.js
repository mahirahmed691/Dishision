import React, { useEffect, useState } from 'react';
import Drawer from 'react-native-drawer';
import Icon from 'react-native-vector-icons/FontAwesome';
import { signOut } from 'firebase/auth';
import { auth } from '../config';
import { restaurantData } from '../data/restuarantData'; // Make sure the import path is correct
import StarRating from 'react-native-star-rating';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { TextInput, Avatar, IconButton, Card } from 'react-native-paper';

export const HomeScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhotoURL, setUserPhotoURL] = useState('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurantData);

  const [selectedRating, setSelectedRating] = useState(null);
const [selectedFoodType, setSelectedFoodType] = useState(null);


  useEffect(() => {
    if (auth.currentUser) {
      const user = auth.currentUser;
      setUserName(user.displayName || '');
      setUserPhotoURL(user.photoURL || '');
    }
  }, []);

  const handleLogout = () => {
    signOut(auth).catch((error) => console.log('Error logging out: ', error));
  };

  const handleInputChange = (text) => {
    setInputText(text);
    filterRestaurants(text);
  };

  const filterRestaurants = (text) => {
    const filtered = restaurantData.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  const handleItemPress = (restaurantName) => {
    navigation.navigate('Menu', { restaurantName });
  };

  const toggleFavorite = (restaurant) => {
    const updatedRestaurants = [...filteredRestaurants];
    const index = updatedRestaurants.findIndex((r) => r.id === restaurant.id);

    updatedRestaurants[index].isFavorite = !updatedRestaurants[index].isFavorite;

    setFilteredRestaurants(updatedRestaurants);
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
                color={activeTab === 'Home' ? '#60BA62' : '#333'}
              />
              <Text
                style={[
                  styles.menuListText,
                  { color: activeTab === 'Home' ? '#60BA62' : '#333' },
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
                color={activeTab === 'Profile' ? '#60BA62' : '#333'}
              />
              <Text
                style={[
                  styles.menuListText,
                  { color: activeTab === 'Profile' ? '#60BA62' : '#333' },
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
              iconColor="grey"
              size={40}
              onPress={toggleDrawer}
            />
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar.Image
                size={60}
                source={
                  userPhotoURL
                    ? { uri: userPhotoURL }
                    : require('../assets/avatar.png')
                }
              />
            </TouchableOpacity>
          </View>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <View>
              <Text style={styles.userName}>Hello, {userName}</Text>
              <Text style={styles.dateTime}>What do you want to eat today?</Text>
            </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>Filter</Text>
              <IconButton mode="contained-tonal" icon="chevron-down" color="black" />
            </View>
          </View>
          <TextInput
            mode="outlined"
            placeholder="Search for food place"
            value={inputText}
            onChangeText={handleInputChange}
            style={styles.searchInput}
          />
          <ScrollView style={styles.scrollableContent}>
            {filteredRestaurants.map((restaurant, index) => (
              <TouchableOpacity
                key={index}
                style={styles.foodCard}
                onPress={() =>
                  navigation.navigate(
                    'Menu',
                    { foodItem: restaurant },
                    toggleFavorite(restaurant)
                  )
                }
              >
                <View style={styles.cardContent}>
                  <View style={styles.rightContent}>
                    <Image
                      source={{ uri: restaurant.image }}
                      style={styles.restaurantImage}
                      onError={(error) =>
                        console.error('Image loading error:', error)
                      }
                    />
                  </View>
                  <View style={styles.leftContent}>
                    
                    <View style={styles.favoriteAndReviews}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                      <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => toggleFavorite(restaurant)}
                      >
                        <Icon
                          name={restaurant.isFavorite ? 'heart' : 'heart-o'}
                          size={20}
                          color={restaurant.isFavorite ? 'red' : 'gray'}
                        />
                      </TouchableOpacity>
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
                      <Text style={styles.rating}>
                      </Text>
                    </View>
                    <Text style={styles.location}>
                      Location: {restaurant.location}
                    </Text>
                    <Text style={styles.priceRange}>
                      Price Range: {restaurant.priceRange}
                    </Text>

                  </View>
                </View>
              </TouchableOpacity>
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
            color={activeTab === 'Home' ? '#60BA62' : '#333'}
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
          style={[styles.tabItem, activeTab === 'Settings' && styles.activeTab]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon
            name="cog"
            size={24}
            color={activeTab === 'Settings' ? '#60BA62' : '#333'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 30,
    alignSelf: 'center',
    width: Dimensions.get('window').width,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 25,
    fontWeight: '500',
    color: '#333',
  },
  dateTime: {
    fontSize: 17,
    fontWeight: '400',
    color: '#999',
    marginTop: 5,
    marginBottom:10
  },
  searchInput: {
    marginBottom: 10,
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
    backgroundColor: '#FFF',
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
    marginTop:10
  },
  location: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
    marginTop:5
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
  favoriteButton:{
    position:'absolute',
    top:0,
    right:10,
  }
});

export default HomeScreen;
