import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ui } from "../../config/designSystem";

const AIPicksStrip = ({ topPickNames, onPressMenu, onPressPick, styles }) => {
  if (topPickNames.length === 0) {
    return null;
  }

  return (
    <View style={styles.aiPicksStrip}>
      <View style={styles.aiPicksHeader}>
        <View style={styles.aiPicksTitleRow}>
          <Icon name="auto-fix" size={16} color={ui.colors.primary} />
          <Text style={styles.aiPicksTitle}>AI picks for this craving</Text>
        </View>
        <TouchableOpacity onPress={onPressMenu} activeOpacity={0.75}>
          <Text style={styles.aiPicksAction}>Menu</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.aiPillsWrap}>
        {topPickNames.map((item) => (
          <TouchableOpacity
            key={item}
            activeOpacity={0.8}
            style={styles.aiSuggestionPill}
            onPress={() => onPressPick(item)}
          >
            <Text style={styles.aiSuggestionPillText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default React.memo(AIPicksStrip);
