import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Avatar, IconButton } from "react-native-paper";
import { BottomNavBar } from "./BottomNavBar";
import styles from "./styles";

import { auth } from "../config";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";

export const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      const user = auth.currentUser;
      setUserName(user.displayName || "");
      setUserPhotoURL(user.photoURL || "");
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <IconButton
        icon="chevron-left"
        size={24}
        onPress={() => navigation.goBack()}
      />

      <Avatar.Image
        size={100}
        source={
          userPhotoURL ? { uri: userPhotoURL } : require("../assets/avatar.png")
        }
        style={{ marginBottom: 30, alignSelf: "center", borderRadius: 75 }}
      />
      <Text style={{ fontSize: 20, color: "black", textAlign: "center" }}>
        {userName}
      </Text>
      <ScrollView>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate("Payments")}
          >
            <View style={styles.listItemContent}>
              <View style={styles.iconContainer}>
                <Icon name="credit-card" style={styles.icon} />
              </View>
              <Text style={styles.listItemText}>Payment</Text>
              <Icon name="chevron-right" size={24} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.listItem}
          >
            <View style={styles.listItemContent}>
              <View style={styles.iconContainer}>
                <Icon name="edit" style={styles.icon} />
              </View>
              <Text style={styles.listItemText}>Edit Profile</Text>
              <Icon name="chevron-right" size={24} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.listItem}>
            <View style={styles.listItemContent}>
              <View style={styles.iconContainer}>
                <Icon name="bell" style={styles.icon} />
              </View>
              <Text style={styles.listItemText}>Notifications</Text>
              <Icon name="chevron-right" size={24} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavBar
        activeTab={activeTab}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        navigation={navigation}
      ></BottomNavBar>
    </SafeAreaView>
  );
};
