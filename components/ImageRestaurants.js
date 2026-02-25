import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, ScrollView, Animated, Text } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const ImageRestaurants = ({ restaurantName }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [failedImages, setFailedImages] = useState({});

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
        const fetchedImageUrls = Array.isArray(data?.items)
          ? data.items.map((item) => item.link).filter(Boolean)
          : [];
        setImageUrls(fetchedImageUrls.slice(0, 10)); // Limit to the first 5 images
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasVisibleImages = imageUrls.some((url, index) => url && !failedImages[index]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ScrollView horizontal contentContainerStyle={styles.container}>
      {imageUrls.length === 0 || !hasVisibleImages ? (
        <View style={styles.placeholderCard}>
          <Icon name="image-outline" size={28} color="#6B7280" />
          <Text style={styles.placeholderText}>Photos unavailable right now</Text>
        </View>
      ) : (
        imageUrls.map((imageUrl, index) => {
          if (!imageUrl || failedImages[index]) {
            return null;
          }

          return (
            <Animated.View key={index} style={{ opacity: fadeAnim }}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                onError={() =>
                  setFailedImages((prev) => ({
                    ...prev,
                    [index]: true,
                  }))
                }
              />
            </Animated.View>
          );
        })
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
  placeholderCard: {
    width: 300,
    height: 200,
    margin: 5,
    marginBottom: 0,
    borderRadius: 12,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ImageRestaurants;
