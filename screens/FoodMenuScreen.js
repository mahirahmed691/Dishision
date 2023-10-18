import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import {
  TextInput,
  IconButton,
  Button,
  Snackbar,
  Card,
  Checkbox,
} from "react-native-paper";
import { Icon } from "react-native-elements";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
} from "react-native-reanimated";
import { axiosGPT } from "../utils/request";
import { db } from "../config/firebase";
import RestaurantMenu from "../components/RestaurantMenu";
import { collection, where, query, getDocs } from "firebase/firestore";
import { BottomNavBar } from "./BottomNavBar";
import { styles } from "./styles";

export const FoodMenuScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const hasSearchResults = searchText.length > 0 && !apiResponse;
  const { restaurant } = route.params;
  const [activeTab, setActiveTab] = useState("Home");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [commentsLength, setCommentsLength] = useState(0);
  const searchButtonScale = useSharedValue(1);

  const foodKeywords = [
    "food",
    "restaurant",
    "menu",
    "cuisine",
    "dish",
    "recipe",
    "cook",
    "eating",
    "dining",
    "meal",
    "chicken",
    "lamb",
    "pasta",
    "curry",
    "rice",
  ];

  const addSelectedKeywords = () => {
    const keywordsText = selectedKeywords.join(" ");
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
      const commentsCollection = collection(db, "comments");
      const q = query(
        commentsCollection,
        where("restaurantName", "==", restaurantName)
      );
      const querySnapshot = await getDocs(q);

      const length = querySnapshot.size;
      setCommentsLength(length); // Set the length in the state

      return length;
    } catch (error) {
      console.error("Error fetching comments length:", error);
      return 0;
    }
  };

  const startersKeywords = ["appetizers", "starters", "entrées"];

  const mainsKeywords = ["chicken", "lamb", "pasta", "curry", "rice"];

  const dessertsKeywords = ["cake", "milkshake", "ice-cream"];

  const drinksKeywords = ["soft drink", "juice", "fizzy-drinks", "mocktails"];

  const spiceLevelKeywords = ["hot", "medium", "mild"];

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
    setSearchText("");
    setApiResponse("");
    setError(null);
    setSelectedKeywords([]); // Clear selected keywords
  };

  const [allRestaurantData, setAllRestaurantData] = useState([]);

  const fetchAllRestaurantData = async () => {
    try {
      const restaurantsCollection = collection(db, "restaurant");
      const querySnapshot = await getDocs(restaurantsCollection);

      const restaurantDataArray = [];
      querySnapshot.forEach((doc) => {
        const restaurantData = doc.data();
        restaurantDataArray.push(restaurantData);
      });

      // Log the retrieved restaurant data to check if it's populated
      console.log("Retrieved restaurant data:", restaurantDataArray);

      // Set the restaurant data in the state
      setAllRestaurantData(restaurantDataArray);

      // Call handleSearch with the retrieved data
      console.log(
        "Calling handleSearch with restaurantDataArray:",
        restaurantDataArray
      );
      handleSearch(restaurantDataArray); // Pass the restaurant data to handleSearch
    } catch (error) {
      console.error("Error fetching all restaurant data:", error);
    }
  };

  useEffect(() => {
    fetchAllRestaurantData();
  }, []);

  const handleSearch = async (restaurantData) => {
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
        model: "gpt-4",
        restaurantData: restaurantData,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: `Search for the menu of ${restaurant.restaurantName}: ${searchText}  
              output the content as a list of max 5 items, don't print out a big paragraph,
              don't use bullet points, only numbers. do not display any other text besides 
              the list of 5`,
          },
        ],
      };

      // Print the requestData JSON
      console.log("Request Data:", requestData);

      // Convert the requestData to a JSON string
      const requestDataJSON = JSON.stringify(requestData);

      try {
        const response = await axiosGPT.post("", requestDataJSON, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const choices = response.data.choices[0].message.content;
        setApiResponse(choices);
        animateSearchButton();
        setLoading(false);
      } catch (error) {
        console.error(error);
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

  const animateSearchButton = () => {
    searchButtonScale.value = withSequence(
      withTiming(1.1, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) })
    );
  };

  const fetchRestaurantCommentsLength = async () => {
    try {
      const restaurantNameToQuery = restaurant.restaurantName;
      const length = await fetchCommentsLengthForRestaurant(
        restaurantNameToQuery
      );
      setCommentsLength(length);
    } catch (error) {
      console.error("Error fetching restaurant comments length:", error);
    }
  };

  useEffect(() => {
    fetchRestaurantCommentsLength();
  }, []);

  const renderApiResponse = () => {
    if (apiResponse) {
      const responseLines = apiResponse.split("\n");
      return (
        <ScrollView style={styles.apiResponseScrollView}>
          {responseLines.map((line, index) => (
            <Card
              key={index}
              style={{
                padding: 20,
                borderRadius: 0,
                backgroundColor: "#00CDBC",
                backgroundColor: "#00CDBC",
                margin: 10,
                marginBottom: 0,
                marginTop: 5,
              }}
            >
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
      <ScrollView>
        <Text style={styles.sectionTitle}>Starters Keywords:</Text>
        <View style={styles.keywordContainer}>
          {startersKeywords.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checkboxContainer}
              onPress={() => handleSelectPrompt(prompt)}
            >
              <Checkbox
                status={
                  selectedKeywords.includes(prompt) ? "checked" : "unchecked"
                }
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
                status={
                  selectedKeywords.includes(prompt) ? "checked" : "unchecked"
                }
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
                status={
                  selectedKeywords.includes(prompt) ? "checked" : "unchecked"
                }
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
                status={
                  selectedKeywords.includes(prompt) ? "checked" : "unchecked"
                }
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
                status={
                  selectedKeywords.includes(prompt) ? "checked" : "unchecked"
                }
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
              colors: { primary: "white" },
            }}
            onPress={addSelectedKeywords}
          >
            Add Keywords
          </Button>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={30}
          onPress={() => navigation.goBack()}
          color="#00CDBC"
        />
      </View>
      {(!apiResponse || searchText.length > 0) && (
        <View style={styles.searchInputContainer}>
          <TextInput
            theme={{
              roundness: 30,
              colors: {
                primary: "#00CDBC",
                underlineColor: "transparent",
              },
            }}
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
          <Snackbar
            visible={snackbarVisible}
            style={styles.snackbar}
            onDismiss={() => setSnackbarVisible(false)}
          >
            Please enter a food-related query.
          </Snackbar>
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#333"
          style={styles.loadingIndicator}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        renderApiResponse()
      )}

      <ScrollView>
        {searchText.length > 0 && !apiResponse ? renderKeywords() : null}
        {!apiResponse && searchText.length <= 0 && (
          <View style={styles.restaurantCard}>
            {hasSearchResults ? null : (
              <View>
                <View
                  style={{
                    marginBottom: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ width: "50%" }}>
                    <Animated.Image
                      source={{ uri: restaurant.logo }}
                      style={styles.restaurantImage}
                      onError={(error) =>
                        console.error("Image loading error:", error)
                      }
                    />
                  </View>
                  <View style={{ width: "50%", alignItems: "center" }}>
                    <Text style={styles.restaurantName}>
                      {restaurant.restaurantName}
                    </Text>
                    <Text style={styles.restaurantLocation}>
                      {restaurant.address}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.restaurantDescription}>
                    {restaurant.description}
                  </Text>
                  <View style={{ margin: 10 }}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("Maps", { restaurant })
                      }
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <View style={{ flexDirection: "row" }}>
                          <Icon
                            name="info"
                            size={30}
                            color="#00CDBC"
                            style={{ marginRight: 10 }}
                          />
                          <Text style={{ marginTop: 8 }}>
                            Info, Maps & Hygiene Rating
                          </Text>
                        </View>
                        <Icon name="chevron-right" color="#00CDBC" />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("Reviews", { restaurant })
                      }
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "baseline",
                          justifyContent: "space-between",
                          marginTop: 10,
                        }}
                      >
                        <View style={{ flexDirection: "row" }}>
                          <Icon
                            name="star"
                            size={30}
                            color="#00CDBC"
                            style={{ marginRight: 10 }}
                          />
                          <Text>{restaurant.rating}</Text>
                          <Text style={{ marginLeft: -23 }}>
                            {"\n"} See all {commentsLength} reviews
                          </Text>
                        </View>
                        <Icon name="chevron-right" color="#00CDBC" />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <RestaurantMenu restaurantName={restaurant.restaurantName} />
      <BottomNavBar
        activeTab={activeTab}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        navigation={navigation}
      ></BottomNavBar>
    </SafeAreaView>
  );
};

export default FoodMenuScreen;