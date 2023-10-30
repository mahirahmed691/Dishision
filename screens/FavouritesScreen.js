import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { IconButton, Card } from "react-native-paper";
import { auth } from "../config/firebase";
import { collection, getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { BottomNavBar } from "./BottomNavBar";
import { Swipeable } from 'react-native-gesture-handler';
import { styles } from "./styles";

export const FavouritesScreen = ({ navigation }) => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [userFavorites, setUserFavorites] = useState({});

  const checkIfFavorited = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        const favoritesRef = collection(db, "favorites");
        const userFavoriteDoc = doc(favoritesRef, userEmail);

        const userFavoriteSnapshot = await getDoc(userFavoriteDoc);

        if (userFavoriteSnapshot.exists()) {
          const userFavoriteData = userFavoriteSnapshot.data();
          setUserFavorites(userFavoriteData);

          // Fetch restaurant images based on user's favorites
          const favoriteRestaurantList = [];

          for (const restaurantName in userFavoriteData) {
            const restaurantData = userFavoriteData[restaurantName];
            if (restaurantData.isFavorited) {
              // Assuming you have a field "imageURL" that stores the image URL in each favorite
              const imageURL = restaurantData.image;
              console.log(imageURL);

              favoriteRestaurantList.push({
                name: restaurantName,
                image: imageURL,
                isFavorited: restaurantData.isFavorited,
              });
            }
          }

          setFavoriteRestaurants(favoriteRestaurantList);

          // Log all the data
          console.log("Favorite Restaurants:", favoriteRestaurantList);
        }
      }
    } catch (error) {
      console.error("Error checking favorites:", error);
    }
  };

  const cleanDocumentId = (name) => {
    // Remove spaces and other disallowed characters
    return name.replace(/[ /#$[\]@&]/g, ''); // You can add more disallowed characters to the regex if needed
  };
  
  const handleDelete = async (restaurantName) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        const favoritesRef = collection(db, "favorites");
        const userFavoriteDoc = doc(favoritesRef, userEmail);
  
        // Clean the restaurant name for use as a document ID
        const cleanedRestaurantName = cleanDocumentId(restaurantName);
  
        // Update the favorite status of the restaurant to false
        const updatedUserFavorites = { ...userFavorites };
        updatedUserFavorites[cleanedRestaurantName].isFavorited = false;
  
        // Update the Firestore document with the updated user favorites
        await updateDoc(userFavoriteDoc, updatedUserFavorites);
  
        // Fetch updated data after unfavoriting
        checkIfFavorited();
      }
    } catch (error) {
      console.error("Error unfavoriting restaurant:", error);
    }
  };
  
  
  useEffect(() => {
    const favoriteRestaurantList = [];
    for (const restaurantName in userFavorites) {
      if (userFavorites[restaurantName][0].isFavorited) {
        favoriteRestaurantList.push({
          name: restaurantName,
        });
      }
    }
    setFavoriteRestaurants(favoriteRestaurantList);
  }, [userFavorites]);

  useEffect(() => {
    checkIfFavorited();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Favorites</Text>
      <ScrollView style={styles.scrollView}>
        {favoriteRestaurants.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.noFavoritesText}>
              You haven't added any favorites yet.
            </Text>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            {favoriteRestaurants.map((restaurant, index) => (
              <Swipeable
                key={index}
                renderRightActions={() => (
                  <TouchableOpacity
                    onPress={() => handleDelete(restaurant.name)}
                    style={styles.deleteAction}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                )}
              >
                <Card style={styles.favCard}>
                  <View style={styles.cardContent}>
                    <Text style={styles.favCardText}>{restaurant.name}</Text>
                    <Image
                      source={{ uri: restaurant.image }}
                      style={styles.restaurantImage}
                    />
                    <IconButton
                      icon={restaurant.isFavorited ? "heart-outlined" : "heart"}
                      iconColor={restaurant.isFavorited ? "red" : "#00CDBC"}
                      size={24}
                    />
                  </View>
                </Card>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavBar activeTab="Favorites" navigation={navigation} />
    </SafeAreaView>
  );
};
