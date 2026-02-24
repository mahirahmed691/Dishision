import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ui } from "../config/designSystem";

const ALL_CUISINES = [
  { id: 1, name: "Mexican" },
  { id: 2, name: "Italian" },
  { id: 3, name: "Chinese" },
  { id: 4, name: "Japanese" },
  { id: 5, name: "American" },
  { id: 6, name: "Indian" },
  { id: 7, name: "Thai" },
  { id: 8, name: "Korean" },
  { id: 9, name: "Mediterranean" },
  { id: 10, name: "Vietnamese" },
  { id: 11, name: "Lebanese" },
  { id: 12, name: "Brazilian" },
  { id: 13, name: "Greek" },
  { id: 14, name: "Spanish" },
  { id: 15, name: "Turkish" },
  { id: 16, name: "French" },
  { id: 17, name: "Caribbean" },
  { id: 18, name: "Moroccan" },
];

const MAX_SELECTIONS = 5;
const BASE_BUBBLE = "#FF2D55";
const HAPTIC_DURATION = 10;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const triggerHaptic = (type = "selection") => {
  if (Platform.OS === "ios") {
    Vibration.vibrate();
    return;
  }

  if (type === "limit") {
    Vibration.vibrate([0, 25, 35, 25]);
    return;
  }

  Vibration.vibrate(HAPTIC_DURATION);
};

const getBubbleSize = (label) => {
  const size = 44 + label.length * 4;
  return clamp(size, 64, 112);
};

const getBubbleFontSize = (label) => {
  if (label.length <= 7) return 13;
  if (label.length <= 10) return 12;
  if (label.length <= 13) return 11;
  return 10;
};

const SelectCuisinesModal = ({ onClose = () => {} }) => {
  const insets = useSafeAreaInsets();
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const floatValues = useRef(
    ALL_CUISINES.map(() => new Animated.Value(0)),
  ).current;

  const canSelectMore = selectedCuisines.length < MAX_SELECTIONS;

  const selectedCuisineNames = useMemo(
    () =>
      ALL_CUISINES.filter((cuisine) => selectedCuisines.includes(cuisine.id)).map(
        (cuisine) => cuisine.name,
      ),
    [selectedCuisines],
  );

  const handleCuisineSelection = (cuisineId) => {
    let hapticType = "selection";

    setSelectedCuisines((prev) => {
      if (prev.includes(cuisineId)) {
        hapticType = "selection";
        return prev.filter((id) => id !== cuisineId);
      }

      if (prev.length >= MAX_SELECTIONS) {
        hapticType = "limit";
        return prev;
      }

      hapticType = "selection";
      return [...prev, cuisineId];
    });

    triggerHaptic(hapticType);
  };

  const handleSubmit = () => {
    onClose();
  };

  const handleReset = () => {
    setSelectedCuisines([]);
  };

  useEffect(() => {
    const loops = floatValues.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 80),
          Animated.timing(value, {
            toValue: 1,
            duration: 2200 + (index % 4) * 220,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: -1,
            duration: 2200 + (index % 3) * 180,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [floatValues]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top, 12), paddingLeft: 18, paddingRight: 18 },
        ]}
      >
        <Pressable onPress={onClose} hitSlop={12} style={styles.topBarButton}>
          <Text style={styles.topBarAction}>Close</Text>
        </Pressable>
        <Pressable onPress={handleSubmit} hitSlop={12} style={styles.topBarButton}>
          <Text style={styles.topBarActionPrimary}>Done</Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Tell us what you're into.</Text>
        <Text style={styles.subtitle}>
          Tap once to select, tap again to remove. Pick up to {MAX_SELECTIONS}.
        </Text>
      </View>

      <ScrollView
        style={styles.bubbleScroll}
        contentContainerStyle={styles.bubbleGrid}
        showsVerticalScrollIndicator={false}
      >
        {ALL_CUISINES.map((cuisine, index) => {
          const isSelected = selectedCuisines.includes(cuisine.id);
          const isDisabled = !isSelected && !canSelectMore;
          const bubbleSize = getBubbleSize(cuisine.name);
          const bubbleFontSize = getBubbleFontSize(cuisine.name);

          return (
            <Animated.View
              key={cuisine.id}
              style={{
                transform: [
                  {
                    translateY: floatValues[index].interpolate({
                      inputRange: [-1, 1],
                      outputRange: [2, -2],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.bubble,
                  {
                    width: bubbleSize,
                    height: bubbleSize,
                    borderRadius: bubbleSize / 2,
                  },
                  isSelected && styles.bubbleSelected,
                  isDisabled && styles.bubbleDisabled,
                ]}
                activeOpacity={0.88}
                disabled={isDisabled}
                onPress={() => handleCuisineSelection(cuisine.id)}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  style={[styles.bubbleText, { fontSize: bubbleFontSize }]}
                >
                  {cuisine.name}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{selectedCuisines.length}/{MAX_SELECTIONS}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    position: "relative",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: ui.spacing.xs,
  },
  topBarButton: {
    minHeight: 40,
    minWidth: 64,
    justifyContent: "center",
  },
  topBarAction: {
    fontSize: ui.type.body,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  topBarActionPrimary: {
    fontSize: ui.type.body,
    color: BASE_BUBBLE,
    fontWeight: "800",
  },
  header: {
    paddingHorizontal: ui.spacing.md,
    alignItems: "center",
    marginTop: ui.spacing.md,
    marginBottom: ui.spacing.md,
  },
  title: {
    color: "#202430",
    fontWeight: "400",
    fontSize: 34,
    lineHeight: 38,
    textAlign: "center",
  },
  subtitle: {
    marginTop: ui.spacing.xs,
    color: "#9097A6",
    fontWeight: "500",
    fontSize: 13,
    textAlign: "center",
  },
  bubbleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
    paddingHorizontal: 10,
    paddingBottom: ui.spacing.lg,
  },
  bubbleScroll: {
    zIndex: 1,
  },
  bubble: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: BASE_BUBBLE,
  },
  bubbleSelected: {
    transform: [{ scale: 1.08 }],
    borderWidth: 3,
    borderColor: "#FF8FA8",
    shadowColor: BASE_BUBBLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 6,
  },
  bubbleDisabled: {
    opacity: 0.32,
  },
  bubbleText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: ui.spacing.lg,
    paddingBottom: ui.spacing.md,
    paddingTop: ui.spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resetText: {
    color: "#C0C5D2",
    fontSize: ui.type.body,
    fontWeight: "700",
  },
  countPill: {
    minWidth: 74,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FF9BB2",
    backgroundColor: "#FFF1F5",
  },
  countPillText: {
    color: BASE_BUBBLE,
    fontWeight: "900",
    fontSize: ui.type.body,
  },
});

export default SelectCuisinesModal;
