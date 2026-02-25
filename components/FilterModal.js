import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RATING_OPTIONS = [
  { label: "Any", value: null },
  { label: "3.0+", value: 3 },
  { label: "4.0+", value: 4 },
  { label: "4.5+", value: 4.5 },
];

const FOOD_TYPE_OPTIONS = [
  "Italian",
  "Mexican",
  "Indian",
  "American",
  "Grill",
  "Turkish",
  "Chinese",
  "Thai",
  "Korean",
  "British",
  "Lebanese",
  "French",
  "Spanish",
];

const DISTANCE_OPTIONS = [
  { label: "Any", value: null },
  { label: "2 km", value: 2 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "20 km", value: 20 },
];

const FilterModal = ({
  visible,
  onClose,
  onApplyFilters,
  selectedRating = null,
  selectedFoodType = null,
  isHalal = false,
  selectedRadiusKm = null,
}) => {
  const [draftRating, setDraftRating] = useState(selectedRating);
  const [draftFoodType, setDraftFoodType] = useState(selectedFoodType);
  const [draftHalal, setDraftHalal] = useState(isHalal);
  const [draftRadiusKm, setDraftRadiusKm] = useState(selectedRadiusKm);

  useEffect(() => {
    if (visible) {
      setDraftRating(selectedRating);
      setDraftFoodType(selectedFoodType);
      setDraftHalal(isHalal);
      setDraftRadiusKm(selectedRadiusKm);
    }
  }, [visible, selectedRating, selectedFoodType, isHalal, selectedRadiusKm]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (draftRating !== null) {
      count += 1;
    }
    if (draftFoodType) {
      count += 1;
    }
    if (draftHalal) {
      count += 1;
    }
    if (draftRadiusKm !== null) {
      count += 1;
    }
    return count;
  }, [draftRating, draftFoodType, draftHalal, draftRadiusKm]);

  const clearFilters = () => {
    setDraftRating(null);
    setDraftFoodType(null);
    setDraftHalal(false);
    setDraftRadiusKm(null);
  };

  const applyFilters = () => {
    onApplyFilters?.(draftRating, draftFoodType, draftHalal, draftRadiusKm);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Filter restaurants</Text>
              <Text style={styles.subtitle}>{activeCount} active filter{activeCount === 1 ? "" : "s"}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.75}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Rating</Text>
            <View style={styles.chipWrap}>
              {RATING_OPTIONS.map((option) => {
                const isActive = draftRating === option.value;
                return (
                  <TouchableOpacity
                    key={option.label}
                    activeOpacity={0.85}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setDraftRating(option.value)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Cuisine</Text>
            <ScrollView style={styles.cuisineScroll} contentContainerStyle={styles.chipWrap}>
              {FOOD_TYPE_OPTIONS.map((foodType) => {
                const isActive = draftFoodType === foodType;
                return (
                  <TouchableOpacity
                    key={foodType}
                    activeOpacity={0.85}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setDraftFoodType(isActive ? null : foodType)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{foodType}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Dietary</Text>
            <TouchableOpacity
              style={[styles.chip, draftHalal && styles.chipActive]}
              onPress={() => setDraftHalal((prev) => !prev)}
              activeOpacity={0.85}
            >
              <Text style={[styles.chipText, draftHalal && styles.chipTextActive]}>Halal</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Distance</Text>
            <View style={styles.chipWrap}>
              {DISTANCE_OPTIONS.map((option) => {
                const isActive = draftRadiusKm === option.value;
                return (
                  <TouchableOpacity
                    key={option.label}
                    activeOpacity={0.85}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setDraftRadiusKm(option.value)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={clearFilters} activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={applyFilters} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Apply filters</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.32)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "82%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  closeButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  closeButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  block: {
    marginTop: 10,
  },
  blockTitle: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.35,
    marginBottom: 8,
  },
  cuisineScroll: {
    maxHeight: 200,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: "#D8F7F4",
    borderColor: "#8FE7DF",
  },
  chipText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#0F766E",
  },
  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "800",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    backgroundColor: "#00CDBC",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default FilterModal;
