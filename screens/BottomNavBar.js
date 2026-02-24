import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ui } from "../config/designSystem";

const TABS = [
  { key: "Home", icon: "home", route: "Home" },
  { key: "Profile", icon: "user", route: "Profile" },
  { key: "Favourites", icon: "heart", route: "Favourites" },
  { key: "Settings", icon: "cog", route: "Settings" },
];

export function BottomNavBar(props) {
  const insets = useSafeAreaInsets();
  const activeTab = props.activeTab ?? props._activeTab ?? "Home";

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom + 4, 12) }]}>
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.85}
              onPress={() => {
                props.setActiveTab?.(tab.key);
                props.navigation.navigate(tab.route);
                if (tab.key === "Favourites" && props.setShowFavoritesOnly) {
                  props.setShowFavoritesOnly(!props.showFavoritesOnly);
                }
              }}
            >
              <FontAwesome
                name={tab.icon}
                size={18}
                color={isActive ? ui.colors.primary : ui.colors.textMuted}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "transparent",
    paddingHorizontal: ui.spacing.md,
    paddingTop: 0,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: ui.spacing.xs,
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    borderColor: ui.colors.border,
    paddingHorizontal: ui.spacing.xs,
    paddingVertical: ui.spacing.xs,
    ...ui.shadow.card,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ui.spacing.sm,
    borderRadius: ui.radius.md,
    gap: 4,
  },
  tabActive: {
    backgroundColor: ui.colors.primarySoft,
  },
  label: {
    fontSize: ui.type.caption,
    color: ui.colors.textMuted,
    fontWeight: "600",
  },
  labelActive: {
    color: ui.colors.primary,
  },
});
