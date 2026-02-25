import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";

const PromptSystemPanel = ({
  searchText,
  dynamicRefineTags,
  dynamicPromptIdeas,
  showPromptLibrary,
  setShowPromptLibrary,
  runFlavorSearch,
  runPromptSearch,
  animateSearchButton,
  styles,
}) => {
  if (searchText.trim().length > 0) {
    return (
      <View style={styles.promptCompact}>
        <View style={styles.promptCompactHeader}>
          <View style={styles.promptCompactTitleRow}>
            <Icon name="tune-vertical" size={14} color="#0F766E" />
            <Text style={styles.promptCompactTitle}>Refine this search</Text>
          </View>
          <Text style={styles.promptCompactMeta}>One tap to narrow suggestions</Text>
        </View>
        <View style={styles.tagRow}>
          {dynamicRefineTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tagChip}
              activeOpacity={0.85}
              onPress={() => runFlavorSearch(tag, animateSearchButton)}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  const visiblePrompts = showPromptLibrary
    ? dynamicPromptIdeas
    : dynamicPromptIdeas.slice(0, 2);

  return (
    <View style={styles.promptSection}>
      <View style={styles.promptHeaderRow}>
        <View>
          <Text style={styles.promptTitle}>Start with a craving</Text>
          <Text style={styles.promptSubtitle}>Pick a prompt that matches this menu</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowPromptLibrary((prev) => !prev)}
          activeOpacity={0.7}
          style={styles.promptToggleButton}
        >
          <Text style={styles.promptToggleText}>
            {showPromptLibrary ? "Show less" : "More ideas"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.promptGrid}>
        {visiblePrompts.map((prompt) => (
          <TouchableOpacity
            key={prompt}
            style={styles.promptChip}
            activeOpacity={0.85}
            onPress={() => runPromptSearch(prompt, animateSearchButton)}
          >
            <Text style={styles.promptChipText}>{prompt}</Text>
            <Icon name="arrow-top-right" size={14} color="#0F766E" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tagRow}>
        {dynamicRefineTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={styles.tagChip}
            activeOpacity={0.85}
            onPress={() => runFlavorSearch(tag, animateSearchButton)}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default React.memo(PromptSystemPanel);
