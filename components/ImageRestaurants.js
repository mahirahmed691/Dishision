import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, ScrollView, Animated } from "react-native";

const ImageRestaurants = ({ restaurantName }) => {
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const apiKey = "AIzaSyAM7mYlJBVmD2Uka5PdsNDwHqAXOwPDyZs";
        const searchEngineId = "956eb687154d24fde";
        const searchTerm = restaurantName + " Restaurant";

        const response = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image&q=${searchTerm}`
        );

        const data = await response.json();
        const fetchedImageUrls = data.items.map((item) => item.link);
        setImageUrls(fetchedImageUrls.slice(0, 6)); // Limit to the first 5 images
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ScrollView horizontal contentContainerStyle={styles.container}>
      {imageUrls.map((imageUrl, index) =>
        imageUrl ? (
          <Animated.View key={index} style={{ opacity: fadeAnim }}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              key={index}
            />
          </Animated.View>
        ) : null
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  image: {
    width: 300,
    height: 200,
    margin: 5,
    marginBottom: 0,
  },
});

export default ImageRestaurants;