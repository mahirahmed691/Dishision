import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import {
  BallIndicator,
  BarIndicator,
  DotIndicator,
  MaterialIndicator,
  PacmanIndicator,
  PulseIndicator,
  SkypeIndicator,
  UIActivityIndicator,
  WaveIndicator,
} from "react-native-indicators";

import { Colors } from "../config";
import { View } from "./View";

export const LoadingIndicator = () => {
  return (
    <View style={styles.container}>
      <BarIndicator animationDuration={2000} color={Colors.white} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.green,
  },
});
