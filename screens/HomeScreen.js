import React, { useEffect, useState } from 'react';
import Drawer from 'react-native-drawer';
import Icon from 'react-native-vector-icons/FontAwesome';
import { signOut } from 'firebase/auth';
import { auth } from '../config';
import { restaurantData } from '../data/restuarantData';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  Image,
} from 'react-native';
import { TextInput, Avatar, IconButton, Card } from 'react-native-paper';

export const HomeScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhotoURL, setUserPhotoURL] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [darkMode, setDarkMode] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurantData);

  const animatedValue = new Animated.Value(0);

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
    filterRestaurants(text); // Call the filtering function when the input changes
  };

  const filterRestaurants = (text) => {
    const filtered = restaurantData.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      this.drawer.close();
    } else {
      this.drawer.open();
    }
  };

  const slideIn = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDrawerOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDrawerOpen]);

  return (
    <View style={styles.container}>
      <Drawer
        ref={(ref) => (this.drawer = ref)}
        content={
          <Animated.View style={[styles.drawerContent, { marginLeft: slideIn }]}>
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
              onPress={() => navigation.navigate('Search')}
            >
              <Icon
                name="search"
                size={20}
                color={activeTab === 'Search' ? '#60BA62' : '#333'}
              />
              <Text
                style={[
                  styles.menuListText,
                  { color: activeTab === 'Search' ? '#60BA62' : '#333' },
                ]}
              >
                Search
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
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
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
          </Animated.View>
        }
        openDrawerOffset={0.3}
        panCloseMask={0.3}
        closedDrawerOffset={0}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <IconButton
              icon="menu"
              iconColor="#E6AD00"
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

          <Text style={styles.userName}>Hello, {userName}</Text>
          <Text style={styles.dateTime}>What do you want to eat today?</Text>
          <TextInput
            mode="outlined"
            placeholder="Search for food place"
            value={inputText}
            onChangeText={handleInputChange}
            style={styles.searchInput}
          />
          <ScrollView style={styles.scrollableContent}>
            {filteredRestaurants.map((restaurant, index) => (
              <Card key={index} style={styles.foodCard}>
                <Image
                  source={{ uri: restaurant.image }}
                  style={styles.restaurantImage}
                  onError={(error) => console.error('Image loading error:', error)}
                />
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
                <Text style={styles.rating}>Rating: {restaurant.rating}</Text>
                <Text style={styles.location}>Location: {restaurant.location}</Text>
              </Card>
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
          style={[styles.tabItem, activeTab === 'Search' && styles.activeTab]}
          onPress={() => navigation.navigate('Search')}
        >
          <Icon
            name="search"
            size={24}
            color={activeTab === 'Search' ? '#60BA62' : '#333'}
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
  userInfoContainer: {
    alignItems: 'center',
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
    fontWeight: '700',
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
    height: 300,
    marginBottom: 10,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cuisine: {
    fontSize: 18,
    color: '#777',
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    color: '#444',
  },
  location: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
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
});

export default HomeScreen;
