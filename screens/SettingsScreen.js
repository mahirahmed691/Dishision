import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavBar } from "./BottomNavBar";
import { ui } from "../config/designSystem";

const SETTINGS_ITEMS = [
  { key: "Language", icon: "language", text: "Language", route: "Language" },
  {
    key: "Notifications",
    icon: "notifications",
    text: "Notifications",
    route: "Notifications",
  },
  { key: "Security", icon: "lock", text: "Security", route: "Security" },
  { key: "FAQ", icon: "chat", text: "FAQ", route: "FAQ" },
];

export const SettingsScreen = ({ navigation }) => {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.headerRow}>
        <IconButton
          icon="chevron-left"
          size={24}
          iconColor={ui.colors.text}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.pageTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.menuCard}>
          {SETTINGS_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrap}>
                  <MaterialIcons name={item.icon} size={18} color={ui.colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.text}</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={ui.colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNavBar
        activeTab="Settings"
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

export default SettingsScreen;
