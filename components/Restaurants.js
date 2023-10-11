import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { db } from '../config/firebase'; // Import your Firebase configuration
import { collection, getDocs } from 'firebase/firestore';
import StarRating from 'react-native-star-rating'
import Colors from '../config/colors';

export const Restaurants = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);

  // Function to fetch restaurants from Firestore
  const fetchRestaurantsFromFirestore = async () => {
    try {
      const restaurantsCollection = collection(db, 'restaurant');
      const querySnapshot = await getDocs(restaurantsCollection);

      const restaurantsData = [];

      querySnapshot.forEach((doc) => {
        const restaurant = doc.data();
        restaurantsData.push(restaurant);
      });

      console.log('Fetched restaurants data:', restaurantsData);

      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Error fetching restaurants from Firestore:', error);
    }
  };

  // Fetch restaurants when the component mounts
  useEffect(() => {
    fetchRestaurantsFromFirestore();
  }, []);

  // Function to navigate to FoodScreen when a restaurant card is pressed
  const navigateToFoodScreen = (restaurant) => {
    navigation.navigate('Menu', { restaurant });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {restaurants.map((restaurant, index) => (
          <TouchableOpacity
            key={index}
            style={styles.restaurantCard}
            onPress={() => navigation.navigate('Menu', { restaurant })}
          >
            <Image source={{ uri: restaurant.logo }} style={styles.logo} />
            <View style={styles.restaurantInfo}>
              <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={styles.restaurantName}>{restaurant.restaurantName}</Text>
            <StarRating style={styles.starRating} starSize={18} disabled fullStarColor={Colors.green} maxStars={5} rating={restaurant.rating} />
              </View>
              <Text style={styles.address}>{restaurant.address}</Text>
              <Text style={styles.cuisine}>
                {restaurant.cuisine ? restaurant.cuisine.charAt(0).toUpperCase() + restaurant.cuisine.slice(1) : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    borderRadius: 10,
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
});

export default Restaurants;
