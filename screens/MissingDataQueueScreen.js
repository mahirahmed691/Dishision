import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { IconButton } from "react-native-paper";
import { ui } from "../config/designSystem";
import {
  applyRestaurantBackfillById,
  fetchRestaurantMissingDataQueue,
} from "../services/restaurantDataService";

const MissingDataQueueScreen = ({ navigation }) => {
  const [queueData, setQueueData] = useState({
    totalScanned: 0,
    totalMissing: 0,
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState("");

  const loadQueue = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchRestaurantMissingDataQueue();
      setQueueData(result);
    } catch (error) {
      console.error("Failed to fetch missing-data queue:", error);
      Alert.alert("Missing data queue", "Could not load queue right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const summaryText = useMemo(() => {
    return `Scanned ${queueData.totalScanned} • Missing ${queueData.totalMissing}`;
  }, [queueData.totalMissing, queueData.totalScanned]);

  const handleApply = async (item) => {
    if (!item?.id || activeId) {
      return;
    }

    try {
      setActiveId(item.id);
      const result = await applyRestaurantBackfillById(item.id);
      if (!result.updated) {
        Alert.alert("No update", "This restaurant no longer needs backfill.");
      }
      await loadQueue();
    } catch (error) {
      console.error("Failed to apply restaurant backfill:", error);
      Alert.alert("Backfill", "Could not apply update for this restaurant.");
    } finally {
      setActiveId("");
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
        <Text style={styles.pageTitle}>Missing Data Queue</Text>
        <IconButton
          icon="refresh"
          size={22}
          iconColor={ui.colors.textMuted}
          onPress={loadQueue}
        />
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>{summaryText}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={ui.colors.primary} />
          <Text style={styles.loaderText}>Loading queue...</Text>
        </View>
      ) : queueData.items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="task-alt" size={28} color={ui.colors.primary} />
          <Text style={styles.emptyTitle}>No missing fields found</Text>
          <Text style={styles.emptyCaption}>Everything is populated for current data.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {queueData.items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.name}>{item.restaurantName}</Text>
              <Text style={styles.id}>{item.id}</Text>
              <View style={styles.chipsWrap}>
                {item.patchedFields.map((field) => (
                  <View key={`${item.id}_${field}`} style={styles.chip}>
                    <Text style={styles.chipText}>{field}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.applyButton}
                activeOpacity={0.85}
                onPress={() => handleApply(item)}
                disabled={Boolean(activeId)}
              >
                <Text style={styles.applyText}>
                  {activeId === item.id ? "Applying..." : "Apply backfill"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
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
    fontSize: 18,
    fontWeight: "800",
    color: ui.colors.text,
  },
  summaryRow: {
    paddingHorizontal: ui.spacing.lg,
    paddingBottom: ui.spacing.sm,
  },
  summaryText: {
    fontSize: ui.type.caption,
    color: ui.colors.textMuted,
    fontWeight: "700",
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: ui.spacing.sm,
  },
  loaderText: {
    color: ui.colors.textMuted,
    fontWeight: "600",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: ui.spacing.xl,
    gap: ui.spacing.sm,
  },
  emptyTitle: {
    fontSize: ui.type.h2,
    fontWeight: "800",
    color: ui.colors.text,
  },
  emptyCaption: {
    fontSize: ui.type.body,
    color: ui.colors.textMuted,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: ui.spacing.lg,
    paddingBottom: ui.spacing.xl,
    gap: ui.spacing.sm,
  },
  card: {
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    borderColor: ui.colors.border,
    padding: ui.spacing.md,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: ui.colors.text,
  },
  id: {
    marginTop: 2,
    fontSize: 12,
    color: ui.colors.textMuted,
    fontWeight: "500",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: ui.spacing.sm,
    marginBottom: ui.spacing.sm,
  },
  chip: {
    backgroundColor: ui.colors.primarySoft,
    borderRadius: ui.radius.full,
    paddingHorizontal: ui.spacing.sm,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 11,
    color: ui.colors.primary,
    fontWeight: "700",
  },
  applyButton: {
    alignSelf: "flex-start",
    backgroundColor: ui.colors.text,
    borderRadius: ui.radius.full,
    paddingHorizontal: ui.spacing.md,
    paddingVertical: 8,
  },
  applyText: {
    color: ui.colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
});

export default MissingDataQueueScreen;
