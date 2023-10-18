import React from "react";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { View, TouchableOpacity } from "react-native";
import { styles } from "./styles";

export function BottomNavBar(props) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[
          styles.tabItem,
          props._activeTab === "Home" && styles.activeTab,
        ]}
        onPress={() => props.navigation.navigate("Home")}
      >
        <FontAwesomeIcon
          name="home"
          size={24}
          color={props._activeTab === "Home" ? "#00CDBC" : "#333"} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabItem,
          props._activeTab === "Profile" && styles.activeTab,
        ]}
        onPress={() => props.navigation.navigate("Profile")}
      >
        <FontAwesomeIcon
          name="user"
          size={24}
          color={props._activeTab === "Profile" ? "#60BA62" : "#333"} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabItem,
          props._activeTab === "Favourites" && styles.activeTab,
        ]}
        onPress={() => {
          props.navigation.navigate("Favourites");
          props.setShowFavoritesOnly(!props.showFavoritesOnly);
        }}
      >
        <FontAwesomeIcon
          name="heart"
          size={24}
          color={props._activeTab === "Favourites" ? "#00CDBC" : "#333"} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabItem,
          props._activeTab === "Settings" && styles.activeTab,
        ]}
        onPress={() => props.navigation.navigate("Settings")}
      >
        <FontAwesomeIcon
          name="cog"
          size={24}
          color={props._activeTab === "Settings" ? "#00CDBC" : "#333"} />
      </TouchableOpacity>
    </View>
  );
}
