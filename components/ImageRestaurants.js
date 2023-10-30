import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Animated } from 'react-native';

// Dummy data for restaurant food images
const restaurantImages = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Qcm5pB_YUlyrtqkNWVhyLX_82ROqQXGyX0I35mZRKnOysdx133oAbUIoYXLnu_cEKDI&usqp=CAU',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Qcm5pB_YUlyrtqkNWVhyLX_82ROqQXGyX0I35mZRKnOysdx133oAbUIoYXLnu_cEKDI&usqp=CAU',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Qcm5pB_YUlyrtqkNWVhyLX_82ROqQXGyX0I35mZRKnOysdx133oAbUIoYXLnu_cEKDI&usqp=CAU',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Qcm5pB_YUlyrtqkNWVhyLX_82ROqQXGyX0I35mZRKnOysdx133oAbUIoYXLnu_cEKDI&usqp=CAU',
  // Add more image URLs here or replace these with actual image URLs
];

const ImageRestaurants = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000, // Adjust duration as needed
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ScrollView horizontal contentContainerStyle={styles.container}>
      {restaurantImages.map((image, index) => (
        <Animated.View key={index} style={{ opacity: fadeAnim }}>
          <Image source={{ uri: image }} style={styles.image} key={index} />
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  image: {
    width: 300,
    height: 200,
    margin: 2,
  },
});

export default ImageRestaurants;
