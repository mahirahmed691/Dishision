import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Share,
  RefreshControl,
  Image,
  Linking,
} from "react-native";
import {
  TextInput,
  IconButton,
  Button,
  Snackbar,
  Card,
  Checkbox,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
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
import { app, db, auth } from "../config/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";
import RestaurantMenu from "../components/RestaurantMenu";
import { collection, where, query, getDocs } from "firebase/firestore";
import { BottomNavBar } from "./BottomNavBar";
import ViewShot from "react-native-view-shot";
// import Reviews from "../components/Reviews";
import { styles } from "./styles";
import ImageRestaurants from "../components/ImageRestaurants";
import Map from "../components/Map";

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
  const [isRestaurantMenuVisible, setIsRestaurantMenuVisible] = useState(true);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [commentsLength, setCommentsLength] = useState(0);
  const searchButtonScale = useSharedValue(1);
  const [closingTimes, setClosingTimes] = useState([]);
  const currentDay = new Date().getDay();
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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

  const menuHeight = useSharedValue(0);
  const menuVisible = useSharedValue(false);

  const closeMenu = () => {
    // Close the menu if it's currently visible
    if (menuVisible.value) {
      menuHeight.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      menuVisible.value = false;
    }
  };
  const menuStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(menuHeight.value, {
        damping: 10, // Adjust damping for smoother animation
        stiffness: 60, // Adjust stiffness for smoother animation
      }),
      opacity: withTiming(menuVisible.value ? 1 : 0, {
        duration: 200,
        easing: Easing.inOut(Easing.ease), // Use easing for smoother transition
      }),
    };
  });
  const toggleRestaurantMenu = () => {
    if (menuVisible.value) {
      // Close the menu
      menuHeight.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      menuVisible.value = false;
    } else {
      // Show the menu and expand it to the whole page
      menuHeight.value = withSpring(Dimensions.get("window").height, {
        damping: 10,
        stiffness: 70,
      });
      menuVisible.value = true;
    }
  };

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

      // Set the restaurant data in the state
      setAllRestaurantData(restaurantDataArray);

      handleSearch(restaurantDataArray); // Pass the restaurant data to handleSearch
    } catch (error) {
      console.error("Error fetching all restaurant data:", error);
    }
  };

  useEffect(() => {
    fetchAllRestaurantData();
  }, []);

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
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: `Search for information about ${searchText}`,
            content: `Search for the menu of ${route.params.restaurant.restaurantName}: ${searchText}
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

  const handleShare = async () => {
    try {
      const uri = await this.viewShotRef.capture();
      Share.share({
        message: apiResponse, // The text content you want to share
        title: "Share Menu", // Title for the share dialog
        url: uri, // The captured screenshot as a local file URI
      })
        .then((result) => {
          if (result.action === Share.sharedAction) {
            // Sharing was successful
            console.log("Shared successfully");
          } else if (result.action === Share.dismissedAction) {
            // Sharing was dismissed
            console.log("Sharing dismissed");
          }
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };
  const addToFavorites = async (restaurant) => {
    try {
      const user = auth.currentUser; // Get the current user
      if (user) {
        const userEmail = user.email; // Get the user's email
        if (restaurant && restaurant.restaurantName) {
          const favoritesRef = collection(db, "favorites");
          const userFavoriteDoc = doc(favoritesRef, userEmail);

          // Check if the user already has a document in the "Favorites" collection
          // If not, create a new document; otherwise, update the existing one
          const favoriteRestaurant = {
            [restaurant.restaurantName]: [
              {
                name: restaurant.restaurantName,
                isFavorited: true,
                image: restaurant.logo, // Add the restaurant's image to the data
              },
            ],
          };

          // Set the user's favorite restaurant with a boolean value of true
          // To remove a restaurant, set its value to false
          await setDoc(userFavoriteDoc, favoriteRestaurant, { merge: true });

          console.log(
            `Added ${restaurant.restaurantName} to favorites for ${userEmail}.`
          );
        } else {
          console.error("The restaurant or restaurantName is not defined.");
        }
      } else {
        // Handle the case where the user is not authenticated
        console.error("User is not authenticated.");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const shareMenu = async () => {
    try {
      // Capture a screenshot of the current page
      const uri = await this.viewShotRef.capture();

      // Set the content you want to share (you can customize this)
      const shareContent = {
        message: "Check out this restaurant's menu:",
        title: "Share Restaurant Menu",
        url: uri, // The captured screenshot as a local file URI
      };

      // Use the Share API to share the content
      Share.share(shareContent)
        .then((result) => {
          if (result.action === Share.sharedAction) {
            // Sharing was successful
            console.log("Shared successfully");
          } else if (result.action === Share.dismissedAction) {
            // Sharing was dismissed
            console.log("Sharing dismissed");
          }
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  const removeFromFavorites = async (restaurant) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        if (restaurant && restaurant.restaurantName) {
          const restaurantName = restaurant.restaurantName;
          console.log("restaurantName:", restaurantName);
          console.log(
            `Removing ${restaurantName} from favorites for ${userEmail}`
          );

          const favoritesRef = collection(db, "favorites");
          const userFavoriteDoc = doc(favoritesRef, userEmail);

          const userFavoriteSnapshot = await getDoc(userFavoriteDoc);

          if (userFavoriteSnapshot.exists()) {
            const userFavoriteData = userFavoriteSnapshot.data();
            if (userFavoriteData[restaurantName]) {
              delete userFavoriteData[restaurantName]; // Remove the restaurant entry
              await setDoc(userFavoriteDoc, userFavoriteData); // Update the document

              console.log(
                `Removed ${restaurantName} from favorites for ${userEmail}.`
              );
            } else {
              console.error(
                `Restaurant ${restaurantName} is not in user favorites.`
              );
            }
          } else {
            console.error(`User with email ${userEmail} has no favorites.`);
          }
        } else {
          console.error("The restaurant or restaurantName is not defined.");
        }
      } else {
        console.error("User is not authenticated.");
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (isFavorite) {
      // Remove the restaurant from favorites
      await removeFromFavorites(restaurant);
    } else {
      // Add the restaurant to favorites
      await addToFavorites(restaurant);
    }
    setIsFavorite(!isFavorite); // Toggle the favorite status
  };

  const checkIfFavorited = async (restaurantName) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        const favoritesRef = collection(db, "favorites");
        const userFavoriteDoc = doc(favoritesRef, userEmail);

        const userFavoriteSnapshot = await getDoc(userFavoriteDoc);

        if (userFavoriteSnapshot.exists()) {
          const userFavoriteData = userFavoriteSnapshot.data();
          if (userFavoriteData[restaurantName]) {
            setIsFavorite(userFavoriteData[restaurantName][0].isFavorited);
          }
        }
      }
    } catch (error) {
      console.error("Error checking if restaurant is favorited:", error);
    }
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    checkIfFavorited(restaurant.restaurantName);
  }, [restaurant.restaurantName]);

  const renderApiResponse = () => {
    if (apiResponse) {
      const responseLines = apiResponse.split("\n");
      return (
        <ScrollView style={styles.apiResponseScrollView}>
          <ViewShot
            ref={(ref) => (this.viewShotRef = ref)}
            options={{ format: "jpg", quality: 1 }}
          >
            {responseLines.map((line, index) => (
              <View
                key={index}
                style={{
                  padding: 20,
                  borderRadius: 0,
                  backgroundColor: "#fff",
                  margin: 10,
                  marginBottom: 0,
                  marginTop: 5,
                  borderWidth: 1,
                }}
              >
                <Text style={styles.apiResponseText}>{line.trim()}</Text>
              </View>
            ))}
          </ViewShot>
          <Button
            mode="contained"
            onPress={handleShare}
            style={{
              backgroundColor: "black",
              width: "70%",
              borderRadius: 0,
              alignSelf: "center",
              marginTop: 30,
            }}
            labelStyle={styles.shareButtonLabel}
          >
            Share
          </Button>
        </ScrollView>
      );
    }
    return null;
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Fetch your updated data here
      const updatedData = await fetchData(); // Fetch new data

      // Update the state with the fetched data
      setRestaurantData(updatedData); // For instance, setRestaurantData might update the restaurant information
      // ... other state updates
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
    }
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

  const fetchClosingTimes = async (restaurantName) => {
    try {
      const closingTimeCollection = collection(db, "restaurant");
      const q = query(
        closingTimeCollection,
        where("restaurantName", "==", restaurantName)
      );
      const querySnapshot = await getDocs(q);

      const closingTimeData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.closingTime) {
          closingTimeData.push({ id: doc.id, closingTime: data.closingTime });
        }
      });

      setClosingTimes(closingTimeData);
    } catch (error) {
      console.error("Error fetching closing times from Firestore:", error);
    }
  };

  useEffect(() => {
    fetchClosingTimes(restaurant.restaurantName);
  }, [restaurant.restaurantName]);

  const openUrlInBrowser = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Error opening URL: ", err)
    );
  };

  return (
    <SafeAreaView style={styles.foodMenuContainer}>
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
            Please enter a food-related search term.
          </Snackbar>

          {searchText == "" ? (
            <>
              <IconButton
                icon={isFavorite ? "heart" : "heart-outline"}
                size={22}
                iconColor={isFavorite ? "red" : "black"}
                onPress={handleFavoriteToggle}
              />
              <IconButton
                icon="share"
                size={22}
                iconColor="#00CDBC"
                onPress={shareMenu}
              />
            </>
          ) : null}
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

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00CDBC"
          />
        }
      >
        {searchText.length > 0 && !apiResponse ? renderKeywords() : null}
        {!apiResponse && searchText.length <= 0 && (
          <View style={styles.restaurantCard}>
            {hasSearchResults ? null : (
              <View>
                <ImageRestaurants
                  restaurantName={restaurant.restaurantName}
                  location={restaurant.address}
                />
                <View
                  style={{
                    marginBottom: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: "50%",
                      alignItems: "flex-start",
                      marginLeft: "5%",
                    }}
                  >
                    <Image
                      src={restaurant.logo}
                      style={{
                        width: 80,
                        height: 80,
                        marginRight: 8,
                        marginBottom: 10,
                        resizeMode: "contain",
                      }}
                    />

                    <Text style={styles.restaurantName}>
                      {restaurant.restaurantName}
                    </Text>

                    <View
                      style={{
                        marginBottom: 10,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Icon
                          name="pin-outline"
                          size={20}
                          style={{ marginRight: 5, padding: 3 }}
                          backgroundColor="#f0f0f0"
                        />
                        <Text style={{ fontWeight: "700" }}>
                          {restaurant.address}
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Icon
                          name="phone"
                          size={20}
                          style={{ marginRight: 5, padding: 3 }}
                          backgroundColor="#f0f0f0"
                        />
                        <Text style={{ fontWeight: "700" }}>
                          {restaurant.phone}
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Icon
                          name="web"
                          size={20}
                          style={{ marginRight: 5, padding: 3 }}
                          backgroundColor="#f0f0f0"
                        />
                        <Text style={{ fontWeight: "700" }}>
                          {restaurant.url}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                        }}
                      >
                        <Icon
                          name="silverware-fork-knife"
                          size={20}
                          style={{ marginRight: 5, padding: 3 }}
                          backgroundColor="#f0f0f0"
                        />
                        <Text style={{ fontWeight: "700" }}>
                          {capitalizeFirstLetter(restaurant.cuisine)}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                        }}
                      >
                        <Icon
                          name="cash"
                          size={20}
                          style={{ marginRight: 5, padding: 3 }}
                          backgroundColor="#f0f0f0"
                        />
                        <Text style={{ fontWeight: "700" }}>
                          Average Price {restaurant.price}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={styles.restaurantDescription}>
                  {restaurant.description}
                </Text>
                <View style={styles.closingTimes}>
                  {closingTimes.map((restaurant, index) => (
                    <View key={index}>
                      <Text style={styles.closingTimesText}>
                        Opening Times:
                      </Text>
                      <View>
                        {daysOfWeek.map((day, dayIndex) => (
                          <Text
                            key={day}
                            style={[
                              styles.dayText,
                              currentDay === dayIndex
                                ? styles.currentDayText
                                : null,
                            ]}
                          >
                            {day}: {restaurant.closingTime[day] || "Closed"}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                <View>
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
                        <View style={styles.menuList}>
                          <Icon
                            name="information"
                            size={20}
                            color="#00CDBC"
                            style={{ marginRight: 10 }}
                          />
                          <Text>Info, Maps & Hygiene Rating</Text>
                        </View>
                        <Icon
                          name="chevron-right"
                          color="#00CDBC"
                          style={{ marginTop: 10 }}
                        />
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
                        <View style={styles.menuList}>
                          <Icon
                            name="star"
                            size={20}
                            color="#00CDBC"
                            style={{ marginRight: 10 }}
                          />
                          <Text>See all {commentsLength} reviews</Text>
                        </View>
                        <Icon
                          name="chevron-right"
                          color="#00CDBC"
                          style={{ marginTop: 10 }}
                        />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleRestaurantMenu}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "baseline",
                          justifyContent: "space-between",
                          marginTop: 10,
                        }}
                      >
                        <View style={styles.menuList}>
                          <Icon
                            name="book"
                            size={20}
                            color="#00CDBC"
                            style={{ marginRight: 10 }}
                          />
                          <Text>Show Menu</Text>
                        </View>
                        <Icon
                          name="chevron-right"
                          color="#00CDBC"
                          style={{ marginTop: 10 }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                <Map
                  latitude={restaurant.lat}
                  longitude={restaurant.long}
                  title={restaurant.restaurantName}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {menuVisible && (
        <Animated.View style={[styles.restaurantMenu, menuStyle]}>
          <View style={styles.closeMenuButton}>
            <IconButton
              icon="close"
              size={30}
              color="#00CDBC"
              onPress={closeMenu}
            />
          </View>
          <RestaurantMenu
            restaurantName={restaurant.restaurantName}
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}

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