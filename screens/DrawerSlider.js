import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { Avatar, Card, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RestaurantForm from "../components/RestaurantForm";
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
        <View
          style={[
            styles.header,
            { paddingTop: Math.max(insets.top, ui.spacing.md), minHeight: 62 + insets.top },
          ]}
        >
          <IconButton
            icon="menu"
            iconColor={ui.colors.white}
            size={26}
            onPress={props.toggleDrawer}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              props.toggleRestaurantForm("add");
              props.setRestaurantFormMode("");
            }}
          >
            <Entypo name="shop" size={20} color={ui.colors.white} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <RestaurantForm
          isVisible={props.isRestaurantFormVisible}
          onClose={() => props.setIsRestaurantFormVisible(false)}
          mode={props.restaurantFormMode}
        />
        <Restaurants navigation={props.navigation} />
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
  header: {
    backgroundColor: ui.colors.primary,
    paddingBottom: ui.spacing.sm,
    paddingHorizontal: ui.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: ui.spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: ui.radius.full,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  addButtonText: {
    color: ui.colors.white,
    fontWeight: "700",
    fontSize: ui.type.caption,
  },
});
