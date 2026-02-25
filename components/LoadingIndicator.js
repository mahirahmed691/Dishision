import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ui } from "../config/designSystem";

export const LoadingIndicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={ui.colors.white} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ui.colors.primary,
  },
});
