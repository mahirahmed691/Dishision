import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ui } from "../config/designSystem";

export const InitialScreen = ({ navigation }) => {
  const goToLogin = () => navigation.navigate("Login");
  const goToSignup = () => navigation.navigate("Signup");

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Image source={require("../assets/logo4.png")} style={styles.logo} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={goToLogin}
            style={styles.primaryButton}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToSignup}
            style={styles.secondaryButton}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryButtonText}>Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ui.colors.primary,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: ui.spacing.lg,
  },
  logo: {
    width: "84%",
    maxWidth: 420,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 36,
    width: "100%",
    flexDirection: "row",
    gap: ui.spacing.sm,
  },
  primaryButton: {
    flex: 1,
    borderRadius: ui.radius.full,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ui.colors.white,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: ui.radius.full,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: ui.colors.white,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  primaryButtonText: {
    color: ui.colors.text,
    fontWeight: "800",
    fontSize: ui.type.body,
  },
  secondaryButtonText: {
    color: ui.colors.white,
    fontWeight: "800",
    fontSize: ui.type.body,
  },
});

export default InitialScreen;
