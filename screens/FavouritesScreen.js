import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { styles } from "./styles";
import { restaurantData } from "../data/restuarantData";
import { IconButton } from "react-native-paper";
import { BottomNavBar } from "./BottomNavBar";
import { ScrollView } from "react-native-gesture-handler";

export const FavouritesScreen = ({ navigation }) => {
  const favoriteData = restaurantData.filter((item) => item.favourite === true);
  const [activeTab, setActiveTab] = useState("Home");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Favorites</Text>
      <ScrollView>
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
                onPress={() =>
                  navigation.navigate("RestaurantDetail", { restaurant: item })
                }
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
                      {item.favourite !== undefined
                        ? item.favourite.toString()
                        : "Not Specified"}
                    </Text>
                  </View>
                  <IconButton icon="chevron-right" />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
      <BottomNavBar
        style={styles.BottomNavBar}
        activeTab={activeTab}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        navigation={navigation}
      ></BottomNavBar>
    </SafeAreaView>
  );
};
