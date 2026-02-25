import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Avatar, Card } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Restaurants from "../components/Restaurants";
import { ui } from "../config/designSystem";

const MENU_ITEMS = [
  { key: "Home", icon: "home", label: "Home", route: "Home" },
  { key: "Profile", icon: "user", label: "Profile", route: "Profile" },
  { key: "Settings", icon: "cog", label: "Settings", route: "Settings" },
];

export function DrawerSlider(props) {
  const insets = useSafeAreaInsets();
  const activeTab = props.activeTab ?? props._activeTab ?? "Home";
  const closeDrawer = () => props.setDrawerOpen(false);

  return (
    <View style={styles.screen}>
      <Modal
        transparent
        visible={props.isDrawerOpen}
        animationType="fade"
        onRequestClose={closeDrawer}
      >
        <View style={styles.overlayRoot}>
          <Pressable style={styles.backdrop} onPress={closeDrawer} />
          <View
            style={[
              styles.drawerCard,
              { paddingTop: Math.max(insets.top, ui.spacing.md) + ui.spacing.xs },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Avatar.Image
                size={64}
                source={
                  props.userPhotoURL
                    ? { uri: props.userPhotoURL }
                    : require("../assets/avatar.png")
                }
              />
              <View>
                <Text style={styles.userHandle}>@{props.userName || "guest"}</Text>
                <Text style={styles.userMeta}>Dish Decide member</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => {
                props.navigation.navigate("Payments");
                closeDrawer();
              }}
            >
              <Card style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  <Text style={styles.walletTitle}>My Wallet</Text>
                  <FontAwesome name="chevron-right" size={12} color={ui.colors.textMuted} />
                </View>
                <Text style={styles.walletAmount}>$250.00</Text>
              </Card>
            </TouchableOpacity>

            {MENU_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (item.route === "Home") {
                      props.setActiveTab("Home");
                    } else {
                      props.navigation.navigate(item.route);
                    }
                    closeDrawer();
                  }}
                >
                  <FontAwesome
                    name={item.icon}
                    size={16}
                    color={isActive ? ui.colors.primary : ui.colors.text}
                  />
                  <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.logoutItem}
              activeOpacity={0.85}
              onPress={() => {
                props.handleLogout?.();
                closeDrawer();
              }}
            >
              <FontAwesome name="power-off" size={16} color={ui.colors.danger} />
              <Text style={styles.logoutLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.content}>
        <Restaurants
          navigation={props.navigation}
          toggleDrawer={props.toggleDrawer}
          topInset={Math.max(insets.top, ui.spacing.md)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  overlayRoot: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  drawerCard: {
    width: 286,
    paddingHorizontal: ui.spacing.lg,
    paddingBottom: ui.spacing.lg,
    backgroundColor: ui.colors.surface,
    borderTopLeftRadius: ui.radius.lg,
    borderBottomLeftRadius: ui.radius.lg,
    gap: ui.spacing.md,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: ui.spacing.sm,
  },
  userHandle: {
    fontSize: ui.type.body,
    fontWeight: "800",
    color: ui.colors.text,
  },
  userMeta: {
    marginTop: 2,
    color: ui.colors.textMuted,
    fontSize: ui.type.caption,
  },
  walletCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: ui.radius.md,
    padding: ui.spacing.md,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletTitle: {
    fontWeight: "700",
    color: ui.colors.text,
    fontSize: ui.type.body,
  },
  walletAmount: {
    marginTop: ui.spacing.xs,
    fontWeight: "900",
    color: ui.colors.text,
    fontSize: ui.type.h2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: ui.spacing.sm,
    borderRadius: ui.radius.md,
    paddingHorizontal: ui.spacing.sm,
    paddingVertical: ui.spacing.sm,
  },
  menuItemActive: {
    backgroundColor: ui.colors.primarySoft,
  },
  menuLabel: {
    fontSize: ui.type.body,
    color: ui.colors.text,
    fontWeight: "600",
  },
  menuLabelActive: {
    color: ui.colors.primary,
  },
  logoutItem: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: ui.spacing.sm,
    borderRadius: ui.radius.md,
    paddingHorizontal: ui.spacing.sm,
    paddingVertical: ui.spacing.sm,
    backgroundColor: "#FEECEC",
  },
  logoutLabel: {
    color: ui.colors.danger,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
});
