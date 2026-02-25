import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const SearchHeader = ({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
  onPressClear,
  onPressSearch,
  showSearchAction = false,
  searchActionContent = null,
  leftAccessory = null,
  rightAccessory = null,
  trailingInShell = null,
  containerStyle,
  shellStyle,
  inputStyle,
}) => {
  const hasInlineAction = Boolean(trailingInShell || (showSearchAction && onPressSearch));

  return (
    <View style={[styles.row, containerStyle]}>
      {leftAccessory ? <View style={styles.slot}>{leftAccessory}</View> : null}
      <View style={[styles.shell, shellStyle]}>
        <View style={styles.iconWrap}>
          <Icon name="magnify" size={22} color="#6B7280" />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          style={[styles.input, inputStyle]}
        />
        {!!value && onPressClear ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.inlineAction}
            onPress={onPressClear}
          >
            <Icon name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        ) : null}
        {hasInlineAction ? <View style={styles.actionDivider} /> : null}
        {showSearchAction && onPressSearch ? (
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.inlineAction}
            onPress={onPressSearch}
          >
            {searchActionContent || <Icon name="magnify" size={20} color="#111827" />}
          </TouchableOpacity>
        ) : null}
        {trailingInShell ? <View style={styles.trailingWrap}>{trailingInShell}</View> : null}
      </View>
      {rightAccessory ? <View style={styles.slot}>{rightAccessory}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slot: {
    justifyContent: "center",
    alignItems: "center",
  },
  shell: {
    flex: 1,
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconWrap: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    minHeight: 46,
    paddingVertical: 0,
  },
  inlineAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 2,
  },
  trailingWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchHeader;
