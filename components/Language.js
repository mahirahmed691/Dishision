import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ModalDropdown from "react-native-modal-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

export const Language = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    {
      name: "Arabic 🇸🇦",
      value: "Arabic",
      flag: "🇸🇦",
    },
    {
      name: "Chinese 🇨🇳",
      value: "Chinese",
      flag: "🇨🇳",
    },
    {
      name: "English 🇬🇧",
      value: "English",
      flag: "🇬🇧",
    },
    {
      name: "French 🇫🇷",
      value: "French",
      flag: "🇫🇷",
    },
    {
      name: "German 🇩🇪",
      value: "German",
      flag: "🇩🇪",
    },
    {
      name: "Hindi 🇮🇳",
      value: "Hindi",
      flag: "🇮🇳",
    },
    {
      name: "Italian 🇮🇹",
      value: "Italian",
      flag: "🇮🇹",
    },
    {
      name: "Japanese 🇯🇵",
      value: "Japanese",
      flag: "🇯🇵",
    },
    {
      name: "Korean 🇰🇷",
      value: "Korean",
      flag: "🇰🇷",
    },
    {
      name: "Portuguese 🇵🇹",
      value: "Portuguese",
      flag: "🇵🇹",
    },
    {
      name: "Russian 🇷🇺",
      value: "Russian",
      flag: "🇷🇺",
    },
    {
      name: "Spanish 🇪🇸",
      value: "Spanish",
      flag: "🇪🇸",
    },
    {
      name: "Turkish 🇹🇷",
      value: "Turkish",
      flag: "🇹🇷",
    },
    {
      name: "Dutch 🇳🇱",
      value: "Dutch",
      flag: "🇳🇱",
    },
    {
      name: "Swedish 🇸🇪",
      value: "Swedish",
      flag: "🇸🇪",
    },
    {
      name: "Finnish 🇫🇮",
      value: "Finnish",
      flag: "🇫🇮",
    },
    {
      name: "Danish 🇩🇰",
      value: "Danish",
      flag: "🇩🇰",
    },
    {
      name: "Greek 🇬🇷",
      value: "Greek",
      flag: "🇬🇷",
    },
    {
      name: "Polish 🇵🇱",
      value: "Polish",
      flag: "🇵🇱",
    },
    {
      name: "Czech 🇨🇿",
      value: "Czech",
      flag: "🇨🇿",
    },
    {
      name: "Norwegian 🇳🇴",
      value: "Norwegian",
      flag: "🇳🇴",
    },
    // Add more languages as needed
  ];
  

  const changeLanguage = (index, value) => {
    setSelectedLanguage(value);
    // Implement logic to change the language in the app based on the selected language
    // For example, use a context, Redux, or another state management solution to set the selected language globally.
  };

  const sortedLanguages = languages.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      <ModalDropdown
        options={sortedLanguages.map((lang) => lang.name)}
        defaultValue={selectedLanguage}
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        dropdownStyle={styles.dropdownOptions}
        dropdownTextStyle={styles.dropdownOptionText}
        onSelect={changeLanguage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dropdown: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownOptions: {
    width: "90%",
    height: 600,
    borderRadius: 8,
    borderColor: "#ccc",
    marginTop: 12,
    marginLeft: -10,
  },
  dropdownOptionText: {
    fontSize: 16,
    padding: 10,
  },
});

export default Language;
