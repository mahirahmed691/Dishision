import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { restaurantData } from '../data/restuarantData'; // Assuming your JSON data is in 'restaurantData'
import { IconButton } from 'react-native-paper';

const { width } = Dimensions.get('window');

export const FavouritesScreen = ({ navigation }) => {
  // Filter the data to include only items with "favourite" set to true
  const favoriteData = restaurantData.filter((item) => item.favourite === true);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Your Favorites</Text>
      {favoriteData.length === 0 ? (
        <Text style={styles.noFavoritesText}>
          You haven't added any favorites yet.
        </Text>
      ) : (
        <FlatList
          data={favoriteData}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
            >
              <View style={styles.cardContent}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
                <View style={styles.textContainer}>
                  <Text style={styles.favoriteItemName}>{item.name}</Text>
                  <Text style={styles.cuisine}>{item.cuisine}</Text>
                  <Text style={styles.cuisine}>
                    {item.favourite !== undefined ? item.favourite.toString() : 'Not Specified'}
                  </Text>
                </View>
                <IconButton icon="chevron-right" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Background color
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 20,
    color: '#333', // Header text color
  },
  noFavoritesText: {
    fontSize: 18,
    color: '#666', // Text color
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  cardImage: {
    width: 100, // Adjust the width to your preference
    height: 100,
    alignSelf: 'center',
    borderRadius: 10,
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 20, // Adjust the spacing between image and text
  },
  favoriteItemName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  cuisine: {
    fontSize: 18,
    color: '#666', // Text color
    marginTop: 5,
    fontWeight: '700',
  },
});

export default FavouritesScreen;
