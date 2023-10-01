import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { TextInput, Card, IconButton } from 'react-native-paper';

export const FoodMenuScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const { foodItem } = route.params;

  const handleItemPress = (foodItem) => {
    navigation.navigate('FoodItemDetail', { foodItem });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={30}
          onPress={() => navigation.goBack()}
          color="#333"
        />
        <Text style={styles.pageTitle}>{foodItem.name}</Text>
      </View>
      <View style={styles.restaurantCard}>
        <Image
          source={{ uri: foodItem.image }}
          style={styles.restaurantImage}
          onError={(error) => console.error('Image loading error:', error)}
        />
        <Text style={styles.restaurantName}>{foodItem.name}</Text>
        <Text style={styles.restaurantLocation}>{foodItem.location}</Text>
        <Text style={styles.restaurantDescription}>{foodItem.description}</Text>
        <TextInput
          style={styles.searchInput}
          mode="outlined"
          placeholder="Search the menu"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  restaurantCard: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  restaurantLocation: {
    fontSize: 18,
    color: '#777',
    marginBottom: 10,
  },
  restaurantDescription: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 1,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
    borderRadius: 8,
  },
});

export default FoodMenuScreen;
