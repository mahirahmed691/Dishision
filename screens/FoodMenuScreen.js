import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  IconButton,
  Button,
  Snackbar,
  Card,
  Checkbox,
} from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  withSpring,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { axiosGPT } from '../utils/request';

export const FoodMenuScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const hasSearchResults = searchText.length > 0 && !apiResponse;
  const { foodItem } = route.params;

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
    'chicken',
    'lamb',
    'pasta',
    'curry',
    'rice',
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

  // Define keyword prompts
  const startersKeywords = ['appetizers', 'starters', 'entrées'];

  const mainsKeywords = ['chicken', 'lamb', 'pasta', 'curry', 'rice'];

  const dessertsKeywords = ['cake', 'milkshake', 'ice-cream'];

  const drinksKeywords = ['soft drink', 'juice', 'fizzy-drinks', 'mocktails'];

  const spiceLevelKeywords = ['hot', 'medium', 'mild'];

  // State to track selected keywords
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  // Function to handle the selection of a keyword
  const handleSelectPrompt = (prompt) => {
    // Toggle the selected state of the prompt
    if (selectedKeywords.includes(prompt)) {
      setSelectedKeywords((prevSelectedKeywords) =>
        prevSelectedKeywords.filter((keyword) => keyword !== prompt)
      );
    } else {
      setSelectedKeywords((prevSelectedKeywords) => [
        ...prevSelectedKeywords,
        prompt,
      ]);
    }
  };

  // Function to add selected keywords to the search text
  const addSelectedKeywords = () => {
    const keywordsText = selectedKeywords.join(' ');
    setSearchText((prevSearchText) => {
      if (prevSearchText) {
        // If there is existing search text, append the keywords
        return `${prevSearchText} ${keywordsText}`;
      } else {
        return keywordsText;
      }
    });
    setSelectedKeywords([]); // Clear selected keywords
  };

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
            content: `Search for the menu of ${foodItem.name}: ${searchText}
            output the content as a list of max 5 items, don't print out a big paragraph,
            don't use bullet points, only numbers.`,
          },
        ],
      };

      try {
        setLoading(true);
        const response = await axiosGPT.post('', requestData);
        const choices = response.data.choices[0].message.content;
        setApiResponse(choices);

        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setApiResponse('');
    setError(null);
    setSelectedKeywords([]); // Clear selected keywords
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
      return (
        <ScrollView style={styles.apiResponseScrollView}>
          {responseLines.map((line, index) => (
            <Card key={index} style={{ padding: 20, elevation: 10 }}>
              <Text style={styles.apiResponseText}>{line.trim()}</Text>
            </Card>
          ))}
        </ScrollView>
      );
    }
    return null;
  };

  // Render keyword categories
  const renderKeywords = () => {
    return (
      <>
        <Text style={styles.sectionTitle}>Starters Keywords:</Text>
        <View style={styles.keywordContainer}>
          {startersKeywords.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checkboxContainer}
              onPress={() => handleSelectPrompt(prompt)}
            >
              <Checkbox
                status={selectedKeywords.includes(prompt) ? 'checked' : 'unchecked'}
                color="#007AFF"
              />
              <Text style={styles.keywordText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Mains Keywords:</Text>
        <View style={styles.keywordContainer}>
          {mainsKeywords.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checkboxContainer}
              onPress={() => handleSelectPrompt(prompt)}
            >
              <Checkbox
                status={selectedKeywords.includes(prompt) ? 'checked' : 'unchecked'}
                color="#007AFF"
              />
              <Text style={styles.keywordText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Desserts Keywords:</Text>
        <View style={styles.keywordContainer}>
          {dessertsKeywords.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checkboxContainer}
              onPress={() => handleSelectPrompt(prompt)}
            >
              <Checkbox
                status={selectedKeywords.includes(prompt) ? 'checked' : 'unchecked'}
                color="#007AFF"
              />
              <Text style={styles.keywordText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Drinks Keywords:</Text>
        <View style={styles.keywordContainer}>
          {drinksKeywords.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checkboxContainer}
              onPress={() => handleSelectPrompt(prompt)}
            >
              <Checkbox
                status={selectedKeywords.includes(prompt) ? 'checked' : 'unchecked'}
                color="#007AFF"
              />
              <Text style={styles.keywordText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Spice Level Keywords:</Text>
        <View style={styles.keywordContainer}>
          {spiceLevelKeywords.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checkboxContainer}
              onPress={() => handleSelectPrompt(prompt)}
            >
              <Checkbox
                status={selectedKeywords.includes(prompt) ? 'checked' : 'unchecked'}
                color="#007AFF"
              />
              <Text style={styles.keywordText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  };

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
      {(!apiResponse || searchText.length > 0) && ( // Show the search bar when apiResponse is not shown or when searchText is not empty
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
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#333" style={styles.loadingIndicator} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        renderApiResponse()
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
      >
        Please enter a food-related query.
      </Snackbar>
      {searchText.length > 0 && !apiResponse ? (
        renderKeywords()
      ) : null}
      {!apiResponse && searchText.length <= 0 && ( // Conditionally render the restaurant card when apiResponse is not shown and searchText is empty
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
      )}
    </ScrollView>
  </SafeAreaView>
);

}
width = Dimensions.get('window').width;

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
    fontFamily: 'Futura',
    color: '#333',
  },
  reviewText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
    fontFamily: 'Futura',
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
    fontWeight: '200',
    fontFamily: 'Futura',
    color: '#111',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  snackbar: {
    backgroundColor: '#111',
    marginTop: 20,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
    marginBottom: 0,
    alignSelf: 'center',
  },
  keywordText: {
    fontSize: 14,
    marginLeft: 0,
  },
  addKeywordsButton: {
    marginTop: 10,
    borderRadius: 0,
    width: width * 0.8,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 0,
    marginLeft: 10,
    fontFamily: 'Avenir',
  },
});

export default FoodMenuScreen;
