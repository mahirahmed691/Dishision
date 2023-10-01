import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { TextInput, IconButton, Button } from 'react-native-paper';
import axios from 'axios';
import { axiosInstance } from '../utils/request';

export const FoodMenuScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState('');
  const { foodItem } = route.params;


  const handdlePrompt = async () => {

    const requestData = {
      "model": "gpt-4",
      "messages": [{ "role": "user", "content": `Based on this prompt:  ${searchText} 
      give me a menu in 20 word` }],
      "temperature": 0.7
    }

    try {
      setLoading(true)
      const response = await axiosInstance.post("", requestData);
      console.log(response.data.choices[0].message)
      // setApiResponse(response.data);
      setLoading(false)


    } catch (error) {
      setLoading(false)
      console.log(error)
    }

  }


  const toggleReviewExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const capitalizeFirstWord = (sentence) => {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
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
        {foodItem.reviews.length > 0 && (
          <>
            <Text style={styles.restaurantDescription}>
              Reviews ({foodItem.reviews.length})
            </Text>
            <ScrollView style={styles.reviewScrollView}>
              {isExpanded
                ? foodItem.reviews.map((review, index) => {
                    if (review.name && review.review) {
                      return (
                        <View key={index} style={styles.review}>
                          <Text style={styles.reviewName}>{review.name}</Text>
                          <Text style={styles.reviewText}>
                            {capitalizeFirstWord(review.review)}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })
                : foodItem.reviews.slice(0, 1).map((review, index) => {
                  if (review.name && review.review) {
                      return (
                        <View key={index} style={styles.review}>
                          <Text style={styles.reviewName}>{review.name}</Text>
                          <Text style={styles.reviewText}>
                            {capitalizeFirstWord(review.review)}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })}
            </ScrollView>
            <IconButton
              style={styles.toggleButton}
              icon={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={30}
              onPress={toggleReviewExpansion}
            />
          </>
        )}
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            mode="outlined"
            placeholder="Search the menu"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          {searchText.length > 0 ? (
            <IconButton
              icon="close"
              color="#555"
              size={20}
              onPress={() => setSearchText('')}
              style={styles.clearButton}
            />
          ) : null}
          {searchText.length > 0 ? (
            <IconButton
              icon="magnify"
              color="#555"
              size={20}
              onPress={handdlePrompt}
              style={styles.searchButton}
            />
          ) : null}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#333" style={styles.loadingIndicator} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : apiResponse ? (
          <View style={styles.apiResponseContainer}>
            <Text style={styles.apiResponseText}>{apiResponse}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 1,
  },
  restaurantImage: {
    width: '100%',
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  review: {
    marginBottom: 20,
    backgroundColor: '#F2F2F2',
    padding: 10,
    borderRadius: 8,
  },
  reviewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#555',
    marginTop: 5,
  },
  reviewScrollView: {
    maxHeight: 200,
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  searchButton: {
    marginLeft: 10,
  },
  clearButton: {
    marginLeft: 10,
  },
  searchResults: {
    marginTop: 10,
    maxHeight: 150,
  },
  searchResultItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginTop: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  apiResponseContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
  },
  apiResponseText: {
    fontSize: 16,
    color: '#555',
  },
});

export default FoodMenuScreen;
