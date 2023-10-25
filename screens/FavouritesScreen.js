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
import { collection, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { BottomNavBar } from "./BottomNavBar";
import { styles } from "./styles";
import { restaurantData } from "../data/restuarantData";

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
              <TouchableOpacity key={index}>
                <Card style={styles.favCard}>
                  <View style={styles.cardContent}>
                    <Text style={styles.favCardText}>{restaurant.name}</Text>
                    <Image
                      source={{ uri: restaurant.image }}
                      style={styles.restaurantImage}
                    />
                    <Text style={styles.imageURLText}>
                      {restaurant.imageURL}
                    </Text>
                    <IconButton
                      icon={restaurant.isFavorited ? "heart-outlined" : "heart"}
                      iconColor={restaurant.isFavorited ? "red" : "#00CDBC"}
                      size={24}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavBar activeTab="Favorites" navigation={navigation} />
    </SafeAreaView>
  );
};
