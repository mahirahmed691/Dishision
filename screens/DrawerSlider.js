import React from "react";
import Drawer from "react-native-drawer";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import EntypoIcon from "react-native-vector-icons/Entypo";
import RestaurantForm from "../components/RestaurantForm";
import {
  View, Text,
  TouchableOpacity
} from "react-native";
import {
  Avatar,
  Card, IconButton
} from "react-native-paper";
import Restaurants from "../components/Restaurants";
import { styles } from "./styles";



export function DrawerSlider(props) {
  return (
    <Drawer
      ref={(ref) => (this.drawer = ref)}
      content={<View style={styles.drawerContent}>
        <View style={styles.userInfoContainer}>
          <Avatar.Image
            size={80}
            source={props.userPhotoURL
              ? {
                uri: props.userPhotoURL,
              }
              : require("../assets/avatar.png")} />
          <Text style={styles.menuHeaderText}>@{props.userName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => props.navigation.navigate("Payments")}
        >
          <Card style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletHeaderText}>My Wallet</Text>
              <FontAwesomeIcon
                name="chevron-right"
                style={styles.walletHeaderIcon} />
            </View>
            <Text style={styles.walletAmountText}>$250.00</Text>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            props.setActiveTab("Home");
            props.toggleDrawer();
          }}
        >
          <FontAwesomeIcon
            name="home"
            size={20}
            color={props._activeTab === "Home" ? "#00CDBC" : "#333"} />
          <Text
            style={[
              styles.menuListText,
              {
                color: props._activeTab === "Home" ? "#00CDBC" : "#333",
              },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate("Profile")}
        >
          <FontAwesomeIcon
            name="user"
            size={20}
            color={props._activeTab === "Profile" ? "#00CDBC" : "#333"} />
          <Text
            style={[
              styles.menuListText,
              {
                color: props._activeTab === "Profile" ? "#00CDBC" : "#333",
              },
            ]}
          >
            {""} Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate("Settings")}
        >
          <FontAwesomeIcon
            name="cog"
            size={20}
            color={props._activeTab === "Settings" ? "#60BA62" : "#333"} />
          <Text
            style={[
              styles.menuListText,
              {
                color: props._activeTab === "Settings" ? "#60BA62" : "#333",
              },
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={props.handleLogout}
        >
          <FontAwesomeIcon
            name="power-off"
            size={20}
            color={props._activeTab === "Logout" ? "#60BA62" : "#333"} />
          <Text
            style={[
              styles.menuListText,
              {
                color: props._activeTab === "Logout" ? "#60BA62" : "#333",
              },
            ]}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>}
      openDrawerOffset={0.3}
      panCloseMask={0.3}
      closedDrawerOffset={0}
      open={props.isDrawerOpen}
      onOpen={() => props.setDrawerOpen(true)}
      onClose={() => props.setDrawerOpen(false)}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <View style={styles.header}>
          <IconButton
            icon="menu"
            iconColor="#111"
            size={40}
            onPress={props.toggleDrawer} />
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <TouchableOpacity>
              <EntypoIcon
                name="shop"
                size={24}
                style={{
                  marginLeft: 20,
                }}
                onPress={() => {
                  props.toggleRestaurantForm("add");
                  props.setRestaurantFormMode("");
                }}
                color="#00CDBC" />
            </TouchableOpacity>
            <TouchableOpacity onPress={props.toggleFavorite}>
              <FontAwesomeIcon
                style={{
                  marginLeft: 20,
                }}
                name={props.favorites.includes(props.selectedRestaurant)
                  ? "heart"
                  : "heart-o"}
                size={24}
                color={props.favorites.includes(props.selectedRestaurant)
                  ? "red"
                  : "gray"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => props.navigation.navigate("Profile")}
            >
              <FontAwesomeIcon
                style={{
                  marginLeft: 20,
                }}
                name="user"
                size={24}
                color="#00CDBC" />
            </TouchableOpacity>
          </View>
        </View>
        <View></View>

        <RestaurantForm
          isVisible={props.isRestaurantFormVisible}
          onClose={() => props.setIsRestaurantFormVisible(false)}
          mode={props.restaurantFormMode} // Pass the mode
        />
        <Restaurants navigation={props.navigation} />
      </View>
    </Drawer>
  );
}
