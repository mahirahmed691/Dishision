import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, setDoc } from "@firebase/firestore";
import { auth, db } from "../config/firebase";
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

const PRESET_PROFILES = [
  {
    id: "comfort",
    label: "Comfort Hunter",
    hint: "Cheesy, crispy and rich picks",
    cuisines: ["American", "Italian"],
    tastes: ["Cheesy", "Crispy", "Comfort food"],
    dietary: {},
  },
  {
    id: "clean",
    label: "Clean and Fresh",
    hint: "Lighter options and balanced mains",
    cuisines: ["Mediterranean", "Middle Eastern", "Japanese"],
    tastes: ["Light"],
    dietary: { vegetarianFriendly: true },
  },
  {
    id: "heat",
    label: "Heat Seeker",
    hint: "Spice-forward dishes and bold flavor",
    cuisines: ["Indian", "Mexican", "Thai"],
    tastes: ["Spicy", "Crispy"],
    dietary: {},
  },
];

const toggleTag = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const mergeUnique = (base, incoming) =>
  Array.from(new Set([...(base || []), ...(incoming || [])]));

export const OnboardingPreferencesScreen = ({ navigation, route }) => {
  const seed = normalizeUserPreferences(route?.params?.seedPreferences || {});
  const [preferences, setPreferences] = useState({
    ...DEFAULT_USER_PREFERENCES,
    ...seed,
  });
  const [isSaving, setIsSaving] = useState(false);
  const introOpacity = useRef(new Animated.Value(0)).current;
  const introTranslate = useRef(new Animated.Value(14)).current;

  const canContinue = useMemo(() => {
    return (
      preferences.favoriteCuisines.length > 0 ||
      preferences.tasteTags.length > 0 ||
      Object.values(preferences.dietary).some(Boolean)
    );
  }, [preferences]);

  const onboardingScore = useMemo(() => {
    let score = 0;
    score += Math.min(preferences.favoriteCuisines.length, 4) * 20;
    score += Math.min(preferences.tasteTags.length, 3) * 15;
    score += Object.values(preferences.dietary).filter(Boolean).length * 10;
    return Math.min(score, 100);
  }, [preferences]);

  const applyPreset = (preset) => {
    triggerSelectionHaptic();
    setPreferences((prev) => ({
      ...prev,
      favoriteCuisines: mergeUnique(prev.favoriteCuisines, preset.cuisines),
      tasteTags: mergeUnique(prev.tasteTags, preset.tastes),
      dietary: {
        ...prev.dietary,
        ...(preset.dietary || {}),
      },
    }));
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(introTranslate, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [introOpacity, introTranslate]);

  const completeOnboarding = async (skipped) => {
    if (isSaving) {
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      triggerSelectionHaptic();
      navigation.replace("Home");
      return;
    }

    try {
      setIsSaving(true);
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          preferences: skipped ? DEFAULT_USER_PREFERENCES : preferences,
          onboarding: {
            preferencesSkipped: skipped,
            preferencesCompleted: true,
            preferencesSetAt: new Date().toISOString(),
          },
        },
        { merge: true },
      );
      if (skipped) {
        triggerSelectionHaptic();
      } else {
        triggerSuccessHaptic();
      }
      navigation.replace("Home");
    } catch (error) {
      console.error("Failed to complete onboarding preferences:", error);
      triggerErrorHaptic();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: introOpacity,
            transform: [{ translateY: introTranslate }],
          },
        ]}
      >
        <Text style={styles.eyebrow}>Step 2 of 2</Text>
        <Text style={styles.title}>Set your taste profile</Text>
        <Text style={styles.subtitle}>
          This personalizes your home feed and menu suggestions.
        </Text>
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${onboardingScore}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{onboardingScore}% tuned</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View
          style={[
            styles.presetCard,
            {
              opacity: introOpacity,
              transform: [{ translateY: introTranslate }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Pick a starter vibe</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.presetRow}>
              {PRESET_PROFILES.map((preset) => (
                <Pressable
                  key={preset.id}
                  style={({ pressed }) => [styles.presetItem, pressed && styles.chipPressed]}
                  onPress={() => applyPreset(preset)}
                >
                  <Text style={styles.presetTitle}>{preset.label}</Text>
                  <Text style={styles.presetHint}>{preset.hint}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: introOpacity,
              transform: [{ translateY: introTranslate }],
            },
          ]}
        >
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
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: introOpacity,
              transform: [{ translateY: introTranslate.interpolate({
                inputRange: [0, 14],
                outputRange: [0, 7],
              }) }],
            },
          ]}
        >
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
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: introOpacity,
              transform: [{ translateY: introTranslate.interpolate({
                inputRange: [0, 14],
                outputRange: [0, 4],
              }) }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Dietary settings</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Halal only</Text>
            <Switch
              value={preferences.dietary.halalOnly}
              onValueChange={(value) =>
                {
                  triggerSelectionHaptic();
                  setPreferences((prev) => ({
                    ...prev,
                    dietary: { ...prev.dietary, halalOnly: value },
                  }));
                }
              }
            />
          </View>
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingLabel}>Vegetarian-friendly</Text>
            <Switch
              value={preferences.dietary.vegetarianFriendly}
              onValueChange={(value) =>
                {
                  triggerSelectionHaptic();
                  setPreferences((prev) => ({
                    ...prev,
                    dietary: { ...prev.dietary, vegetarianFriendly: value },
                  }));
                }
              }
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: introOpacity,
            },
          ]}
        >
          <Text style={styles.summaryTitle}>Your taste blueprint</Text>
          <Text style={styles.summaryText}>
            {preferences.favoriteCuisines.length > 0
              ? `Cuisines: ${preferences.favoriteCuisines.slice(0, 3).join(", ")}`
              : "No cuisines selected yet."}
          </Text>
          <Text style={styles.summaryText}>
            {preferences.tasteTags.length > 0
              ? `Vibe: ${preferences.tasteTags.slice(0, 3).join(", ")}`
              : "Add taste tags to sharpen recommendations."}
          </Text>
          <Text style={styles.summaryText}>
            {Object.values(preferences.dietary).some(Boolean)
              ? "Dietary settings enabled."
              : "No dietary restrictions applied."}
          </Text>
        </Animated.View>
      </ScrollView>

      <Animated.View
        style={[
          styles.footer,
          {
            opacity: introOpacity,
          },
        ]}
      >
        <Pressable
          style={styles.skipButton}
          onPress={() => completeOnboarding(true)}
          disabled={isSaving}
          android_ripple={{ color: "rgba(15,23,42,0.08)" }}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
            pressed && canContinue && styles.continueButtonPressed,
          ]}
          onPress={() => completeOnboarding(false)}
          disabled={!canContinue || isSaving}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <Text style={styles.continueText}>
            {isSaving ? "Saving..." : "Start discovering"}
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  header: {
    paddingHorizontal: ui.spacing.lg,
    paddingTop: ui.spacing.md,
  },
  eyebrow: {
    color: ui.colors.textMuted,
    fontSize: ui.type.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "900",
    color: ui.colors.text,
  },
  subtitle: {
    marginTop: 4,
    color: ui.colors.textMuted,
    fontSize: ui.type.body,
    fontWeight: "500",
  },
  progressWrap: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#DCE8E7",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: ui.colors.primary,
  },
  progressLabel: {
    color: ui.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  content: {
    padding: ui.spacing.lg,
    gap: ui.spacing.sm,
    paddingBottom: 140,
  },
  presetCard: {
    backgroundColor: "#EAF9F6",
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    borderColor: "#CDEFEA",
    padding: ui.spacing.md,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetItem: {
    width: 180,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    borderColor: "#BEEDEA",
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  presetTitle: {
    color: ui.colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  presetHint: {
    marginTop: 3,
    color: ui.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  card: {
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    borderColor: ui.colors.border,
    padding: ui.spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: ui.colors.text,
    marginBottom: 8,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    borderRadius: ui.radius.full,
    borderWidth: 1,
    borderColor: ui.colors.border,
    backgroundColor: ui.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipActive: {
    borderColor: ui.colors.primary,
    backgroundColor: ui.colors.primarySoft,
  },
  chipText: {
    color: ui.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextActive: {
    color: ui.colors.primary,
  },
  chipPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  summaryCard: {
    backgroundColor: "#0F172A",
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: ui.spacing.md,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  summaryText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 3,
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
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: ui.spacing.lg,
    paddingTop: ui.spacing.sm,
    paddingBottom: 22,
    backgroundColor: ui.colors.surface,
    borderTopWidth: 1,
    borderTopColor: ui.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: ui.spacing.sm,
  },
  skipButton: {
    flex: 1,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    borderColor: ui.colors.border,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    color: ui.colors.textMuted,
    fontWeight: "700",
  },
  continueButton: {
    flex: 1.4,
    borderRadius: ui.radius.md,
    backgroundColor: ui.colors.primary,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  continueButtonDisabled: {
    backgroundColor: ui.colors.border,
  },
  continueText: {
    color: ui.colors.white,
    fontWeight: "800",
  },
});

export default OnboardingPreferencesScreen;
