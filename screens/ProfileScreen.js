import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Avatar, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavBar } from "./BottomNavBar";
import { auth } from "../config/firebase";
import { ui } from "../config/designSystem";

const PROFILE_ITEMS = [
  { key: "Payments", icon: "credit-card", text: "Payment", route: "Payments" },
  { key: "EditProfile", icon: "edit", text: "Edit Profile", route: "EditProfile" },
  { key: "Rewards", icon: "gift", text: "Rewards", route: "Rewards" },
  { key: "Notifications", icon: "bell", text: "Notifications", route: "Notifications" },
];

export const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || "Dish Decide User");
      setUserPhotoURL(user.photoURL || "");
    }
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.headerRow}>
        <IconButton
          icon="chevron-left"
          size={24}
          iconColor={ui.colors.text}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.pageTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <Avatar.Image
            size={82}
            source={
              userPhotoURL
                ? { uri: userPhotoURL }
                : require("../assets/avatar.png")
            }
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Maestro</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>453 / 1000 XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuCard}>
          {PROFILE_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrap}>
                  <FontAwesome name={item.icon} size={16} color={ui.colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.text}</Text>
              </View>
              <FontAwesome name="chevron-right" size={14} color={ui.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNavBar
        activeTab="Profile"
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ui.spacing.sm,
    paddingTop: ui.spacing.xs,
  },
  pageTitle: {
    fontSize: ui.type.h2,
    fontWeight: "800",
    color: ui.colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: ui.spacing.lg,
    paddingTop: ui.spacing.sm,
    paddingBottom: ui.spacing.lg,
    gap: ui.spacing.md,
  },
  profileCard: {
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    padding: ui.spacing.lg,
    alignItems: "center",
    ...ui.shadow.card,
  },
  avatar: {
    backgroundColor: ui.colors.primarySoft,
  },
  userName: {
    marginTop: ui.spacing.sm,
    fontSize: ui.type.h2,
    fontWeight: "800",
    color: ui.colors.text,
  },
  badgeRow: {
    marginTop: ui.spacing.sm,
    flexDirection: "row",
    gap: ui.spacing.xs,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badge: {
    borderRadius: ui.radius.full,
    backgroundColor: ui.colors.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: ui.colors.white,
    fontSize: ui.type.caption,
    fontWeight: "700",
  },
  menuCard: {
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    paddingHorizontal: ui.spacing.md,
    ...ui.shadow.card,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ui.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ui.colors.border,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: ui.spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ui.colors.primarySoft,
  },
  menuLabel: {
    fontSize: ui.type.body,
    color: ui.colors.text,
    fontWeight: "600",
  },
});

export default ProfileScreen;
