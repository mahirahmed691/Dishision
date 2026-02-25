import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import RestaurantForm from "../components/RestaurantForm";
import { BottomNavBar } from "./BottomNavBar";
import { ui } from "../config/designSystem";
import {
  backfillRestaurantMissingData,
  getRestaurantLogoCoverage,
} from "../services/restaurantDataService";
import {
  getAdminUiSettings,
  getCurrentUserAdminAccess,
  setAdminUiSettings,
} from "../services/adminUiService";

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
  const [isRestaurantFormVisible, setIsRestaurantFormVisible] = useState(false);
  const [isCheckingLogos, setIsCheckingLogos] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showQualityBadges, setShowQualityBadges] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadAdminState = async () => {
      try {
        const [adminAccess, adminUi] = await Promise.all([
          getCurrentUserAdminAccess(),
          getAdminUiSettings(),
        ]);
        if (!isMounted) {
          return;
        }
        setIsAdminUser(adminAccess);
        setShowQualityBadges(Boolean(adminUi?.showQualityBadges));
      } catch (error) {
        console.error("Failed to load admin settings:", error);
      }
    };
    loadAdminState();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCheckLogoCoverage = async () => {
    if (isCheckingLogos) {
      return;
    }

    try {
      setIsCheckingLogos(true);
      const coverage = await getRestaurantLogoCoverage();

      console.log("Restaurants with logo:", coverage.withLogo);
      console.log("Restaurants missing logo:", coverage.missingLogo);

      Alert.alert(
        "Logo coverage",
        `Total: ${coverage.total}\nWith logo: ${coverage.withLogoCount}\nMissing logo: ${coverage.missingLogoCount}\n\nFull lists printed to console logs.`,
      );
    } catch (error) {
      console.error("Failed to check logo coverage:", error);
      Alert.alert("Logo coverage", "Could not fetch restaurants right now.");
    } finally {
      setIsCheckingLogos(false);
    }
  };

  const runBackfill = async (dryRun) => {
    if (isBackfilling) {
      return;
    }

    try {
      setIsBackfilling(true);
      const result = await backfillRestaurantMissingData({ dryRun });

      console.log("Restaurant backfill result:", result);
      console.log("Patched restaurants:", result.patchedRestaurants);

      Alert.alert(
        dryRun ? "Backfill preview" : "Backfill complete",
        `Scanned: ${result.totalScanned}\nNeeds patch: ${result.totalPatched}\nWritten: ${result.totalWritten}\n\nFull patch list logged to console.`,
      );
    } catch (error) {
      console.error("Backfill failed:", error);
      Alert.alert("Backfill", "Could not process restaurant backfill right now.");
    } finally {
      setIsBackfilling(false);
    }
  };

  const handleBackfillPress = () => {
    Alert.alert(
      "Backfill missing data",
      "Choose how you want to run the restaurant backfill utility.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Preview only",
          onPress: () => runBackfill(true),
        },
        {
          text: "Run backfill",
          style: "destructive",
          onPress: () => runBackfill(false),
        },
      ],
    );
  };

  const handleToggleQualityBadges = async (value) => {
    setShowQualityBadges(value);
    try {
      await setAdminUiSettings({ showQualityBadges: value });
    } catch (error) {
      console.error("Failed to update admin UI settings:", error);
    }
  };

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

        {isAdminUser ? (
          <View style={styles.testingCard}>
            <Text style={styles.testingTitle}>Admin tools</Text>
            <View style={styles.adminToggleRow}>
              <View>
                <Text style={styles.menuLabel}>Show quality badges</Text>
                <Text style={styles.testingSubtitle}>
                  Display data-quality diagnostics on restaurant cards
                </Text>
              </View>
              <Switch
                value={showQualityBadges}
                onValueChange={handleToggleQualityBadges}
                thumbColor={showQualityBadges ? ui.colors.primary : "#F3F4F6"}
                trackColor={{ false: "#D1D5DB", true: "#99F6EF" }}
              />
            </View>
          <TouchableOpacity
            style={styles.testingAction}
            activeOpacity={0.86}
            onPress={() => setIsRestaurantFormVisible(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconWrap}>
                <MaterialIcons name="add-business" size={18} color={ui.colors.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Add Restaurant</Text>
                <Text style={styles.testingSubtitle}>Temporary until live data is ready</Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={ui.colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testingAction}
            activeOpacity={0.86}
            onPress={handleCheckLogoCoverage}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconWrap}>
                <MaterialIcons name="image-search" size={18} color={ui.colors.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>
                  {isCheckingLogos ? "Checking logos..." : "Check logo coverage"}
                </Text>
                <Text style={styles.testingSubtitle}>Logs restaurants with/missing logos</Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={ui.colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testingAction}
            activeOpacity={0.86}
            onPress={handleBackfillPress}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconWrap}>
                <MaterialIcons name="storage" size={18} color={ui.colors.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>
                  {isBackfilling ? "Backfilling data..." : "Backfill missing data"}
                </Text>
                <Text style={styles.testingSubtitle}>
                  Fill missing logo/cuisine/menu fields
                </Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={ui.colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testingAction}
            activeOpacity={0.86}
            onPress={() => navigation.navigate("MissingDataQueue")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconWrap}>
                <MaterialIcons name="playlist-add-check" size={18} color={ui.colors.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Missing data queue</Text>
                <Text style={styles.testingSubtitle}>
                  Review and apply missing-field fixes per restaurant
                </Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={ui.colors.textMuted}
            />
          </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      <RestaurantForm
        isVisible={isRestaurantFormVisible}
        onClose={() => setIsRestaurantFormVisible(false)}
        mode="add"
      />

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
    gap: ui.spacing.md,
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
  testingCard: {
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    paddingHorizontal: ui.spacing.md,
    paddingVertical: ui.spacing.sm,
    ...ui.shadow.card,
  },
  testingTitle: {
    fontSize: ui.type.caption,
    color: ui.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: "800",
    marginBottom: ui.spacing.xs,
  },
  adminToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: ui.spacing.sm,
    paddingVertical: ui.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: ui.colors.border,
    marginBottom: ui.spacing.xs,
  },
  testingAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ui.spacing.xs,
  },
  testingSubtitle: {
    marginTop: 2,
    color: ui.colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default SettingsScreen;
