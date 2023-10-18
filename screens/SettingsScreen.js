import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BottomNavBar } from "./BottomNavBar";
import styles from "./styles";
import { auth } from "../config";
import { SafeAreaView } from "react-native-safe-area-context";

export const SettingsScreen = ({ navigation }) => {
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

  const settingsItems = [
    { icon: "language", text: "Language" },
    { icon: "notifications", text: "Notifications" },
    { icon: "lock", text: "Security" },
    { icon: "question-answer", text: "Ask a Question" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Icon
        name="chevron-left"
        size={24}
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.content}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity style={styles.listItem} key={index}>
            <View style={styles.listItemContent}>
              <View style={styles.iconContainer}>
                <Icon name={item.icon} style={styles.icon} />
              </View>
              <Text style={styles.listItemText}>{item.text}</Text>
              <Icon name="chevron-right" size={24} />
            </View>
          </TouchableOpacity>
        ))}
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
