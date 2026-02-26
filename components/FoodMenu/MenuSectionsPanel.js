import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ui } from "../../config/designSystem";
import { foodMenuCopy } from "../../constants/foodMenuCopy";

const MenuSectionsPanel = ({
  onLayout,
  searchText,
  hasAnyMenuItems,
  queryTokens,
  hasQueryMatches,
  handleClearSearch,
  dynamicRefineTags,
  runFlavorSearch,
  fallbackSuggestions,
  onPressFallbackSuggestion,
  menuSections,
  filteredSectionItems,
  expandedSection,
  toggleSection,
  styles,
}) => {
  return (
    <View onLayout={onLayout} style={styles.menuSection}>
      <View style={styles.menuSectionHeader}>
        <Text style={styles.menuSectionTitle}>Menu</Text>
        <Text style={styles.menuSectionHint}>
          {searchText.trim().length > 0
            ? foodMenuCopy.filteredHint
            : foodMenuCopy.browseHint}
        </Text>
      </View>

      {hasAnyMenuItems ? (
        queryTokens.length > 0 && !hasQueryMatches ? (
          <View style={styles.emptySearchWrap}>
            <Text style={styles.emptySearchTitle}>{foodMenuCopy.emptySearchTitle}</Text>
            <Text style={styles.emptySearchText}>
              {foodMenuCopy.emptySearchBody}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.emptySearchButton}
              onPress={handleClearSearch}
            >
              <Text style={styles.emptySearchButtonText}>{foodMenuCopy.emptySearchAction}</Text>
            </TouchableOpacity>

            {dynamicRefineTags.length > 0 ? (
              <View style={styles.emptySearchTags}>
                {dynamicRefineTags.slice(0, 4).map((tag) => (
                  <TouchableOpacity
                    key={`empty-${tag}`}
                    style={styles.tagChip}
                    activeOpacity={0.85}
                    onPress={() => runFlavorSearch(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {(fallbackSuggestions || []).length > 0 ? (
              <View style={styles.emptySearchRecoveryWrap}>
                <Text style={styles.emptySearchRecoveryTitle}>Try these picks</Text>
                <View style={styles.emptySearchTags}>
                  {fallbackSuggestions
                    .filter((item) => item?.name)
                    .slice(0, 4)
                    .map((item, index) => (
                    <TouchableOpacity
                      key={`fallback-${item?.name || index}`}
                      style={styles.tagChip}
                      activeOpacity={0.85}
                      onPress={() => onPressFallbackSuggestion?.(item?.name)}
                    >
                      <Text style={styles.tagText}>{item?.name}</Text>
                    </TouchableOpacity>
                    ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          menuSections.map((section) => {
            const sectionItems = filteredSectionItems[section.key] || [];

            if (queryTokens.length > 0 && sectionItems.length === 0) {
              return null;
            }

            return (
              <View key={section.key} style={styles.menuBlock}>
                <TouchableOpacity
                  style={styles.menuBlockHeader}
                  activeOpacity={0.8}
                  onPress={() => toggleSection(section.key)}
                >
                  <Text style={styles.menuBlockTitle}>
                    {section.label} ({sectionItems.length})
                  </Text>
                  <Icon
                    name={expandedSection === section.key ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={ui.colors.primary}
                  />
                </TouchableOpacity>

                {expandedSection === section.key &&
                  sectionItems.map((item, index) => (
                    <View
                      key={`${section.key}-${item?.name ?? "item"}-${index}`}
                      style={styles.menuItemCard}
                    >
                      <View style={styles.menuItemTop}>
                        <Text style={styles.menuItemName}>{item?.name}</Text>
                        <Text style={styles.menuItemPrice}>{item?.price}</Text>
                      </View>
                      {!!(item?.description ?? item?.descriptions) && (
                        <Text style={styles.menuItemDesc}>
                          {item?.description ?? item?.descriptions}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            );
          })
        )
      ) : (
        <View style={styles.emptyMenuWrap}>
          <Text style={styles.emptyMenuText}>
            {foodMenuCopy.emptyMenuBody}
          </Text>
        </View>
      )}
    </View>
  );
};

export default React.memo(MenuSectionsPanel);
