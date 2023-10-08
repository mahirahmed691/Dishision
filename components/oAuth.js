import React from "react";
import { View, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Text, TouchableOpacity } from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useWamUpBrowser } from "../hooks/userWarmUpBrowser";
import {SocialIcon} from 'react-native-elements'

WebBrowser.maybeCompleteAuthSession();

export function OAuthButtons() {
  // Warm up the android browser to improve UX
  // https://docs.expo.dev/guides/authentication/#improving-user-experience
  useWamUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
  
      <View>
        <SocialIcon
        style={{width:'100%', alignSelf:'center'}}
        title="Sign in with Google"
        type="google"
        button
        light
        onPress={onPress}
      />
      </View>
      

  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
    paddingTop: 50, // Adjust the top padding to create space at the top
  },  
  signInContainer: {
    flex: 1,
    backgroundColor: "#FBD3E4",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  signInFormContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  searchBar: {
    // Your styles here
  },
  searchBarDark: {
    // Your styles here
  },
  hotelSearchBar: {
    width: 300,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    fontSize: 16,
    paddingHorizontal: 16,
  },
  autocompleteList: {
    borderRadius: 5,
    maxHeight: 150,
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  autocompleteContainer: {
    position: 'relative',
  },
  input: {
    marginBottom: 20,
  },
  generateItineraryButton: {
    marginBottom: 20,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  itineraryItem: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 20,
    marginBottom: 20,
  },
  itineraryText: {
    fontSize: 25,
    color: '#333',
    marginBottom: 20,
  },
  inputView: {
    width: "100%",
    height: 50,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  primaryButton: {
    width: "90%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#ff5a5f",
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
  },
  logo: {
    width: 200,
    height: 200,
  },
  button: {
    width: "100%",
    backgroundColor: "#FF5A5F",
    marginTop: 16,
    borderRadius: 10,
  },
  footer: {
    justifyContent: "center",
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    paddingTop: 20,
    textAlign: "center",
  },
  signInLink: {
    color: "#FF5A5F",
    justifyContent: "center",
  },
  oauthButtons: {
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    fontWeight: 'bold',
  },
  header2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    fontWeight: 'bold',
  },
  currencyButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#CCC",
    marginRight: 8,
  },
  selectedCurrencyButton: {
    backgroundColor: "#FF5A5F",
  },
  currencyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  hotelCard: {
    marginBottom: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  hotelLocation: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  hotelRatingChip: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 8,
  },
  hotelPriceChip: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 0,
  },
  hotelAmenities: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  unauthorizedText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: "50%",
    color: "red",
  },
  greeting: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111",
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    padding: 5,
    backgroundColor: "#111",
    borderRadius: 10,
    marginRight: 20,
  },
  weatherContainerDark: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    padding: 5,
    backgroundColor: "#333",
    borderRadius: 10,
    marginRight: 20,
  },
  temp: {
    fontSize: 12,
    marginLeft: 10,
    color: "#FFF",
  },
  suggestionItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  suggestionsList: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    elevation: 3,
  },
  listItem: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  flightTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize:22,
    fontWeight:'bold'
  },
  foodListContainer: {
    marginTop: 24,
  },
  foodListHeader: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  foodListHeaderDark: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
  },
  foodCard: {
    marginBottom: 16,
    elevation: 2,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  foodCuisine: {
    fontSize: 16,
    color: '#666',
  },
  foodAddress: {
    fontSize: 16,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hotelCardContent: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profileView: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  profileText: {
    fontSize: 18,
    marginVertical: 10,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollContainer: {
    justifyContent: 'center',
  },
  autocompleteItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
  },
  autocompleteText: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  itineraryContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 0,
    marginTop: 20,
    flexGrow:1,
    marginBottom:200,
  },
  itineraryHeader: {
    fontSize: 33,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf:'center'
  },
  suggestionImage:{
    width: '100%', // Set the image width to 100%
    height: 150, // Set the image height as needed
    resizeMode:'cover',
    borderRadius: 8, // Apply a border radius for a modern look
    marginBottom: 8,
    flexDirection:'row',
    alignItems:'center'
  },
});




