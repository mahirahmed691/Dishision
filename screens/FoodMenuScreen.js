import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  TextInput,
  IconButton,
  Button,
  Snackbar,
  Card
} from 'react-native-paper';
import axios from 'axios';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  withSpring,
  withRepeat,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useDerivedValue,
} from 'react-native-reanimated';
import { axiosGPT } from '../utils/request';

export const FoodMenuScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  const { foodItem } = route.params;

  const apiKey = '';

  // An extended list of food-related keywords
  const foodKeywords = [
    'food',
    'restaurant',
    'menu',
    'cuisine',
    'dish',
    'recipe',
    'cook',
    'eating',
    'dining',
    'meal',
    // ... (other keywords)
  ];

  // Animated values
  const searchButtonScale = useSharedValue(1);

  // Animation styles
  const searchButtonStyle = useAnimatedStyle(() => {
    const scale = withSpring(searchButtonScale.value, {
      damping: 2,
      stiffness: 80,
      mass: 0.1,
    });
    return {
      transform: [{ scale }],
    };
  });



  const handleSearch = async () => {
    if (searchText) {
      // Check if the query contains food-related keywords
      const containsFoodKeyword = foodKeywords.some((keyword) =>
        searchText.toLowerCase().includes(keyword)
      );

      if (!containsFoodKeyword) {
        setSnackbarVisible(true);
        return;
      }

      setLoading(true);
      const requestData = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: `Search for information about ${searchText}`,
            content: `Search for the menu of ${foodItem.name}: ${searchText}
             output the content as list of max 5 items don't print out big paragraph,
             dont not bullet point list only number.
             `,
          },
        ],
      };

      try {
        setLoading(true);
        const response = await axiosGPT.post("", requestData);
        const choices = response.data.choices[0].message.content;
        setApiResponse(choices)

        setLoading(false);
      } catch (error) {
        console.log(error)
        setLoading(false);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setApiResponse('');
    setError(null);
  };

  const toggleReviewExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const capitalizeFirstWord = (sentence) => {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
  };

  // Render API response as list items
  const renderApiResponse = () => {
    if (apiResponse) {
      const responseLines = apiResponse.split('\t');
      let lineNumber = 1;
      return (
        <ScrollView style={styles.apiResponseScrollView}>
          {responseLines.map((line, index) => (
            <Card style={{padding:20, elevation:10}}>
            <Text key={index} style={styles.apiResponseText}>
             {line.trim()}
            </Text>
            </Card>
          ))}
        </ScrollView>
      );
    }
    return null;
  };

  // Determine if there are search results
  const hasSearchResults = searchResults.length > 0 || apiResponse;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => navigation.goBack()}
            color="#333"
          />
        </View>
        <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              mode="contained"
              placeholder="Search the menu"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
            {searchText.length > 0 ? (
              <IconButton
                icon="close"
                color="#555"
                size={20}
                onPress={handleClearSearch}
                style={styles.clearButton}
              />
            ) : null}
            {searchText.length > 0 ? (
              <TouchableOpacity
                onPress={handleSearch}
                activeOpacity={0.7}
                style={styles.searchButtonTouchable}
              >
                <Animated.View style={[styles.searchButton, searchButtonStyle]}>
                  <IconButton icon="magnify" name="search" />
                </Animated.View>
              </TouchableOpacity>
            ) : null}
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#333" style={styles.loadingIndicator} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : renderApiResponse()}
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
          >
            Please enter a food-related query.
          </Snackbar>
        <View style={styles.restaurantCard}>
          {hasSearchResults ? null : (
            <>
              <Animated.Image
                source={{ uri: foodItem.image }}
                style={[styles.restaurantImage, searchButtonStyle]}
                onError={(error) => console.error('Image loading error:', error)}
              />
              <Text style={styles.restaurantName}>{foodItem.name}</Text>
              <Text style={styles.restaurantLocation}>{foodItem.location}</Text>
              <Text style={styles.restaurantDescription}>
                {foodItem.description}
              </Text>
              {foodItem.reviews.length > 0 && (
                <>
                  <Text style={styles.reviewTitle}>
                    Reviews ({foodItem.reviews.length})
                  </Text>
                  <ScrollView
                    style={styles.reviewScrollView}
                    contentContainerStyle={styles.reviewScrollViewContent}
                  >
                    {isExpanded
                      ? foodItem.reviews.map((review, index) => {
                          if (review.name && review.review) {
                            return (
                              <View key={index} style={styles.review}>
                                <Text style={styles.reviewName}>
                                  {review.name}
                                </Text>
                                <Text style={styles.reviewText}>
                                  {capitalizeFirstWord(review.review)}
                                </Text>
                              </View>
                            );
                          }
                          return null;
                        })
                      : foodItem.reviews.slice(0, 3).map((review, index) => {
                          if (review.name && review.review) {
                            return (
                              <View key={index} style={styles.review}>
                                <Text style={styles.reviewName}>
                                  {review.name}
                                </Text>
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
            </>
          )}
        </View>
      </ScrollView>
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
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
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
    fontFamily:'Futura',
    color: '#333',
  },
  reviewText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
    fontFamily:'Futura',
    marginTop: 5,
  },
  reviewScrollView: {
    maxHeight: 400,
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
  apiResponseScrollView: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FCF7F6',
    borderRadius: 8,
  },
  apiResponseText: {
    fontSize: 15,
    fontWeight:'200',
    fontFamily:'Futura',
    color: '#111',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  snackbar: {
    backgroundColor: '#111',
    marginTop:20,
  },
});

export default FoodMenuScreen;
