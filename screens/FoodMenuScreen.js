import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import {
  TextInput,
  IconButton,
  Button,
  Snackbar,
  Card,
  Checkbox,
} from 'react-native-paper';
import { Icon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  withSpring,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { axiosGPT } from '../utils/request';
import { db } from '../config/firebase'; // Import your Firebase configuration
import {
  collection,
  where,
  query,
  getDocs,
} from 'firebase/firestore';

export const FoodMenuScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const hasSearchResults = searchText.length > 0 && !apiResponse;
  const { restaurant } = route.params;

  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [commentsLength, setCommentsLength] = useState(0);
  const searchButtonScale = useSharedValue(1);

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

  const fetchCommentsLengthForRestaurant = async (restaurantName) => {
    try {
      const commentsCollection = collection(db, 'comments');
      const q = query(commentsCollection, where('restaurantName', '==', restaurantName));
      const querySnapshot = await getDocs(q);
  
      const length = querySnapshot.size;
      setCommentsLength(length); // Set the length in the state
  
      return length;
    } catch (error) {
      console.error('Error fetching comments length:', error);
      return 0;
    }
  };

  const startersKeywords = ['appetizers', 'starters', 'entrées'];

  const mainsKeywords = ['chicken', 'lamb', 'pasta', 'curry', 'rice'];

  const dessertsKeywords = ['cake', 'milkshake', 'ice-cream'];

  const drinksKeywords = ['soft drink', 'juice', 'fizzy-drinks', 'mocktails'];

  const spiceLevelKeywords = ['hot', 'medium', 'mild'];

  // State to track selected keywords

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

  const handleClearSearch = () => {
    setSearchText('');
    setApiResponse('');
    setError(null);
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
            content: `Search for the menu of ${restaurant.restaurantName}: ${searchText}
            output the content as a list of max 5 items, don't print out a big paragraph,
            don't use bullet points, only numbers. do not display any other text besides the list of 5`,
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

  const searchButtonStyle = useAnimatedStyle(() => {
    const scale = withSpring(searchButtonScale.value, {
      damping: 2,
      stiffness: 80,
      mass: 0.1,
      stiffness: 120,
      damping: 8,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      overshootClamping: false,
      toValue: 1,
    });
    return {
      transform: [{ scale }],
    };
  });

  const fetchRestaurantCommentsLength = async () => {
    try {
      const restaurantNameToQuery = restaurant.restaurantName;
      const length = await fetchCommentsLengthForRestaurant(restaurantNameToQuery);
      setCommentsLength(length);
    } catch (error) {
      console.error('Error fetching restaurant comments length:', error);
    }
  };

  useEffect(() => {
    fetchRestaurantCommentsLength();
  }, []);


  const renderApiResponse = () => {
    if (apiResponse) {
      const responseLines = apiResponse.split('\n');
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
                color="#00CDBC"
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
                color="#00CDBC"
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
                color="#00CDBC"
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
                color="#00CDBC"
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
                color="#00CDBC"
                
              />
              <Text style={styles.keywordText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
        onPress={addSelectedKeywords}
        activeOpacity={0.7}
        style={styles.addKeywordsButton}
      >
        <Button 
        theme={{
          colors:{primary:'white'}
        }} 
        onPress={addSelectedKeywords}>
          Add Keywords
        </Button>
      </TouchableOpacity>
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
        {(!apiResponse || searchText.length > 0) && (
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
          style={styles.snackbar}
          onDismiss={() => setSnackbarVisible(false)}
        >
          Please enter a food-related query.
        </Snackbar>
        {searchText.length > 0 && !apiResponse ? (
          renderKeywords()
        ) : null}
        {!apiResponse && searchText.length <= 0 && (
          <View style={styles.restaurantCard}>
            {hasSearchResults ? null : (
              <>
                <Animated.Image
                  source={{ uri: restaurant.logo }}
                  style={[styles.restaurantImage, searchButtonStyle]}
                  onError={(error) => console.error('Image loading error:', error)}
                />
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantLocation}>{restaurant.location}</Text>
                <Text style={styles.commentsLength}>Comments Length: {commentsLength}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Maps', { restaurant })}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, marginTop: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon name="info" size={20} color="#00CDBC" style={{ marginRight: 10 }} />
                      <Text>Info</Text>
                      <Text style={{ marginLeft: -30, marginTop: 20 }}> Maps, allergens and hygiene rating</Text>
                    </View>
                    <Icon name='chevron-right' color="#00CDBC" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Reviews', { restaurant })}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, marginTop: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon name="star" size={20} color="#00CDBC" style={{ marginRight: 10 }} />
                      <Text>{restaurant.rating}</Text>
                      <Text style={{ marginLeft: -20, }}> {"\n"} See all {commentsLength} reviews</Text>
                    </View>
                    <Icon name='chevron-right' color="#00CDBC" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
              </>
            )}
          </View>
        )}
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
    color: '#333',
  },
  reviewText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
    marginTop: 5,
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
  },
  apiResponseText: {
    fontSize: 20,
    fontWeight: '200',
    color: '#111',
    fontWeight: '900',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  snackbar: {
    backgroundColor: '#111',
    marginTop: 20,
    position: 'absolute',
    bottom: -80,
    width: width * 0.9,
    alignSelf: 'center',
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
    backgroundColor: '#00CDBC',
    padding: 8,
    margin: 5,
    color: 'white',
    fontWeight: '900',
  },
  addKeywordsButton: {
    marginTop: 20,
    borderRadius: 20,
    width: width * 0.8,
    alignSelf: 'center',
    backgroundColor: 'black',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 0,
    marginLeft: 10,
  },
  commentsLength: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
});

export default FoodMenuScreen;
