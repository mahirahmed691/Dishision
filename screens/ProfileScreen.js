import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { IconButton, Snackbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from "@firebase/firestore";
import { auth, db } from "../config/firebase";
import { BottomNavBar } from "./BottomNavBar";
import { ui } from "../config/designSystem";
import {
  DEFAULT_USER_PREFERENCES,
  normalizeUserPreferences,
} from "../services/userPreferencesService";
import {
  triggerErrorHaptic,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "../utils/haptics";

const PROFILE_ITEMS = [
  { key: "Payments", icon: "credit-card", text: "Payment", route: "Payments" },
  { key: "EditProfile", icon: "edit", text: "Edit profile", route: "EditProfile" },
  { key: "Rewards", icon: "gift", text: "Rewards", route: "Rewards" },
  { key: "Notifications", icon: "bell", text: "Notifications", route: "Notifications" },
];

const CUISINE_OPTIONS = [
  "American",
  "Italian",
  "Indian",
  "Chinese",
  "Japanese",
  "Korean",
  "Mexican",
  "French",
  "Turkish",
  "Middle Eastern",
  "Thai",
  "Mediterranean",
];

const TASTE_OPTIONS = ["Spicy", "Cheesy", "Crispy", "Creamy", "Light", "Comfort food"];

const toggleTag = (list, value) => {
  if (list.includes(value)) {
    return list.filter((item) => item !== value);
  }
  return [...list, value];
};

export const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_USER_PREFERENCES);
  const [savedPreferences, setSavedPreferences] = useState(DEFAULT_USER_PREFERENCES);
  const [saveNotice, setSaveNotice] = useState("");
  const introOpacity = React.useRef(new Animated.Value(0)).current;
  const introTranslate = React.useRef(new Animated.Value(14)).current;

  const isValidPhotoUri = (value) => {
    if (typeof value !== "string") {
      return false;
    }
    const uri = value.trim();
    if (!uri) {
      return false;
    }
    return /^(https?:|file:|content:|ph:|assets-library:)/i.test(uri);
  };

  const refreshUser = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setUserName("Dish Decide User");
      setUserPhotoURL("");
      setPreferences(DEFAULT_USER_PREFERENCES);
      setSavedPreferences(DEFAULT_USER_PREFERENCES);
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    setUserName(user.displayName || "Dish Decide User");
    setAvatarLoadFailed(false);

    let fallbackPhoto = isValidPhotoUri(user.photoURL) ? user.photoURL.trim() : "";
    let userDocData = null;

    try {
      const userDocSnap = await getDoc(doc(db, "users", user.uid));
      if (userDocSnap.exists()) {
        userDocData = userDocSnap.data();
      } else {
        const usersQuery = query(collection(db, "users"), where("uid", "==", user.uid), limit(1));
        const usersSnapshot = await getDocs(usersQuery);
        userDocData = usersSnapshot.docs[0]?.data() || null;
      }
    } catch (error) {
      console.error("Error fetching profile document:", error);
    }

    if (!fallbackPhoto) {
      const userDocPhoto = userDocData?.photoURL;
      if (isValidPhotoUri(userDocPhoto)) {
        fallbackPhoto = userDocPhoto.trim();
      }
    }

    const normalized = normalizeUserPreferences(userDocData?.preferences);
    setUserPhotoURL(fallbackPhoto);
    setPreferences(normalized);
    setSavedPreferences(normalized);
    setIsLoadingProfile(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [refreshUser]),
  );

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(introTranslate, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [introOpacity, introTranslate]);

  const userInitials = useMemo(() => {
    const cleaned = userName.trim();
    if (!cleaned) {
      return "D";
    }
    const segments = cleaned.split(/\s+/).filter(Boolean);
    if (segments.length === 1) {
      return segments[0].slice(0, 1).toUpperCase();
    }
    return `${segments[0][0] ?? ""}${segments[1][0] ?? ""}`.toUpperCase();
  }, [userName]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(preferences) !== JSON.stringify(savedPreferences);
  }, [preferences, savedPreferences]);

  const savePreferences = async () => {
    const user = auth.currentUser;
    if (!user || isSaving) {
      return;
    }
    try {
      setIsSaving(true);
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          displayName: userName || user.displayName || "",
          photoURL: userPhotoURL || user.photoURL || "",
          preferences,
          preferencesUpdatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSavedPreferences(preferences);
      setSaveNotice("Preferences saved");
      triggerSuccessHaptic();
    } catch (error) {
      console.error("Error saving preferences:", error);
      setSaveNotice("Could not save preferences");
      triggerErrorHaptic();
    } finally {
      setIsSaving(false);
    }
  };

  const setDietary = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      dietary: {
        ...prev.dietary,
        [key]: value,
      },
    }));
  };

  const setDiscovery = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      discovery: {
        ...prev.discovery,
        [key]: value,
      },
    }));
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
        <Text style={styles.pageTitle}>Profile</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasUnsavedChanges || isSaving) && styles.saveButtonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={savePreferences}
          disabled={!hasUnsavedChanges || isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      {isLoadingProfile ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={ui.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <Animated.View
          style={{
            flex: 1,
            opacity: introOpacity,
            transform: [{ translateY: introTranslate }],
          }}
        >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            {userPhotoURL && !avatarLoadFailed ? (
              <Image
                source={{ uri: userPhotoURL }}
                style={styles.avatarImage}
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{userInitials}</Text>
              </View>
            )}
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userHint}>Personalize your menu discovery experience</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Favorite cuisines</Text>
            <View style={styles.chipWrap}>
              {CUISINE_OPTIONS.map((item) => {
                const active = preferences.favoriteCuisines.includes(item);
                return (
                  <Pressable
                    key={item}
                    style={({ pressed }) => [
                      styles.chip,
                      active && styles.chipActive,
                      pressed && styles.chipPressed,
                    ]}
                    onPress={() =>
                      {
                        triggerSelectionHaptic();
                        setPreferences((prev) => ({
                          ...prev,
                          favoriteCuisines: toggleTag(prev.favoriteCuisines, item),
                        }));
                      }
                    }
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Dietary requirements</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Halal only</Text>
              <Switch
                value={preferences.dietary.halalOnly}
                onValueChange={(value) => setDietary("halalOnly", value)}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vegetarian-friendly</Text>
              <Switch
                value={preferences.dietary.vegetarianFriendly}
                onValueChange={(value) => setDietary("vegetarianFriendly", value)}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vegan-friendly</Text>
              <Switch
                value={preferences.dietary.veganFriendly}
                onValueChange={(value) => setDietary("veganFriendly", value)}
              />
            </View>
            <View style={[styles.settingRow, styles.settingRowLast]}>
              <Text style={styles.settingLabel}>Gluten-free options</Text>
              <Switch
                value={preferences.dietary.glutenFree}
                onValueChange={(value) => setDietary("glutenFree", value)}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Taste profile</Text>
            <View style={styles.chipWrap}>
              {TASTE_OPTIONS.map((item) => {
                const active = preferences.tasteTags.includes(item);
                return (
                  <Pressable
                    key={item}
                    style={({ pressed }) => [
                      styles.chip,
                      active && styles.chipActive,
                      pressed && styles.chipPressed,
                    ]}
                    onPress={() =>
                      {
                        triggerSelectionHaptic();
                        setPreferences((prev) => ({
                          ...prev,
                          tasteTags: toggleTag(prev.tasteTags, item),
                        }));
                      }
                    }
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Discovery settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto menu suggestions</Text>
              <Switch
                value={preferences.discovery.autoMenuSuggestions}
                onValueChange={(value) => setDiscovery("autoMenuSuggestions", value)}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Prioritize top-rated spots</Text>
              <Switch
                value={preferences.discovery.prioritizeTopRated}
                onValueChange={(value) => setDiscovery("prioritizeTopRated", value)}
              />
            </View>
            <View style={[styles.settingRow, styles.settingRowLast]}>
              <Text style={styles.settingLabel}>Notify when new places match</Text>
              <Switch
                value={preferences.discovery.notifyNewPlaces}
                onValueChange={(value) => setDiscovery("notifyNewPlaces", value)}
              />
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
        </Animated.View>
      )}

      <BottomNavBar
        activeTab="Profile"
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        navigation={navigation}
      />
      <Snackbar
        visible={Boolean(saveNotice)}
        onDismiss={() => setSaveNotice("")}
        duration={1700}
        style={styles.snackbar}
      >
        {saveNotice}
      </Snackbar>
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
  saveButton: {
    minWidth: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: ui.radius.full,
    backgroundColor: ui.colors.text,
    paddingHorizontal: ui.spacing.md,
    paddingVertical: 8,
  },
  saveButtonDisabled: {
    backgroundColor: ui.colors.border,
  },
  saveButtonText: {
    color: ui.colors.white,
    fontSize: ui.type.caption,
    fontWeight: "800",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: ui.spacing.sm,
  },
  loadingText: {
    color: ui.colors.textMuted,
    fontWeight: "600",
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
    borderWidth: 1,
    borderColor: ui.colors.border,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ui.colors.primarySoft,
  },
  avatarFallbackText: {
    fontSize: 26,
    fontWeight: "900",
    color: ui.colors.primary,
  },
  userName: {
    marginTop: ui.spacing.sm,
    fontSize: 28,
    fontWeight: "900",
    color: ui.colors.text,
  },
  userHint: {
    marginTop: 4,
    fontSize: ui.type.body,
    color: ui.colors.textMuted,
    fontWeight: "500",
  },
  card: {
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    borderColor: ui.colors.border,
    padding: ui.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: ui.colors.text,
    marginBottom: ui.spacing.sm,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ui.spacing.xs,
  },
  chip: {
    borderRadius: ui.radius.full,
    borderWidth: 1,
    borderColor: ui.colors.border,
    backgroundColor: ui.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: {
    borderColor: ui.colors.primary,
    backgroundColor: ui.colors.primarySoft,
  },
  chipText: {
    color: ui.colors.textMuted,
    fontSize: ui.type.caption,
    fontWeight: "700",
  },
  chipTextActive: {
    color: ui.colors.primary,
  },
  chipPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ui.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ui.colors.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  settingLabel: {
    color: ui.colors.text,
    fontSize: ui.type.body,
    fontWeight: "600",
  },
  menuCard: {
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    paddingHorizontal: ui.spacing.md,
    borderWidth: 1,
    borderColor: ui.colors.border,
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
  snackbar: {
    marginHorizontal: ui.spacing.md,
    marginBottom: ui.spacing.sm,
    borderRadius: ui.radius.md,
    backgroundColor: "#0F172A",
  },
});

export default ProfileScreen;
