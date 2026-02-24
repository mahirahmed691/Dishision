import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "../config/firebaseAuth";
import { auth } from "../config/firebase";
import { FormErrorMessage } from "../components";
import { useTogglePasswordVisibility } from "../hooks";
import { loginValidationSchema } from "../utils";
import { ui } from "../config/designSystem";

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const { passwordVisibility, handlePasswordVisibility, rightIcon } =
    useTogglePasswordVisibility();

  const handleLogin = useCallback((values) => {
    const { email, password } = values;

    signInWithEmailAndPassword(auth, email, password).catch((error) =>
      setErrorState(error.message),
    );
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "",
    iosClientId:
      "151956588290-p6v13tnrpi5t9e7ikrt43n9vnj1rpchp.apps.googleusercontent.com",
    webClientId: "",
  });

  useEffect(() => {
    if (!response) {
      return;
    }

    const run = async () => {
      const localUser = await getLocalUser();

      if (!localUser && response?.type === "success") {
        await getUserInfo(response.authentication?.accessToken);
      } else if (localUser) {
        setUserInfo(localUser);
      }
    };

    run();
  }, [response]);

  const getLocalUser = async () => {
    try {
      const data = await AsyncStorage.getItem("@user");
      if (!data) {
        return null;
      }
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const getUserInfo = async (token) => {
    if (!token) {
      return;
    }

    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = await res.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      console.log("Google user fetch failed:", error);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.heroSection}>
        <Image
          source={require("../assets/login-burger-hq.jpg")}
          style={styles.heroImage}
        />
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.body}>
            <Text style={styles.eyebrow}>Welcome Back</Text>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={loginValidationSchema}
              onSubmit={handleLogin}
            >
              {({
                values,
                touched,
                errors,
                handleChange,
                handleSubmit,
                handleBlur,
              }) => (
                <View style={styles.form}>
                  <TextInput
                    label="Email"
                    mode="outlined"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    outlineColor="#D1D5DB"
                    activeOutlineColor={ui.colors.primary}
                    left={<TextInput.Icon icon="email" />}
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    style={styles.textInput}
                  />
                  <FormErrorMessage error={errors.email} visible={touched.email} />

                  <TextInput
                    label="Password"
                    mode="outlined"
                    autoCapitalize="none"
                    secureTextEntry={passwordVisibility}
                    outlineColor="#D1D5DB"
                    activeOutlineColor={ui.colors.primary}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={rightIcon}
                        onPress={handlePasswordVisibility}
                      />
                    }
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    style={styles.textInput}
                  />
                  <FormErrorMessage
                    error={errors.password}
                    visible={touched.password}
                  />

                  <TouchableOpacity
                    style={styles.inlineLinkWrap}
                    onPress={() => navigation.navigate("ForgotPassword")}
                  >
                    <Text style={styles.inlineLink}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {errorState !== "" && <FormErrorMessage error={errorState} visible />}

                  <Button
                    mode="contained"
                    style={styles.primaryButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.primaryButtonText}>Sign in</Text>
                  </Button>
                </View>
              )}
            </Formik>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.footerText}>
                Don't have an account?
                <Text style={styles.footerLink}> Signup</Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Or</Text>
            <Button
              mode="contained"
              style={styles.googleButton}
              disabled={!request}
              onPress={promptAsync}
            >
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </Button>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ui.colors.primary,
  },
  heroSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "46%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ui.colors.primary,
    overflow: "hidden",
  },
  heroImage: {
    width: "122%",
    height: "122%",
    resizeMode: "cover",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  container: {
    width,
    alignSelf: "center",
    height: "70%",
    backgroundColor: ui.colors.surface,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: ui.spacing.md,
    paddingHorizontal: ui.spacing.lg,
    paddingBottom: ui.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  body: {
    flex: 1,
    justifyContent: "flex-start",
  },
  eyebrow: {
    color: ui.colors.primary,
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.4,
    marginBottom: ui.spacing.sm,
  },
  form: {
    gap: 2,
  },
  textInput: {
    backgroundColor: ui.colors.surface,
  },
  inlineLinkWrap: {
    marginTop: ui.spacing.xs,
    alignSelf: "flex-end",
  },
  inlineLink: {
    color: ui.colors.textMuted,
    fontWeight: "600",
    fontSize: ui.type.caption,
  },
  primaryButton: {
    marginTop: ui.spacing.md,
    paddingVertical: 5,
    borderRadius: ui.radius.md,
    backgroundColor: ui.colors.primary,
  },
  primaryButtonText: {
    fontWeight: "900",
    color: ui.colors.white,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: ui.spacing.xs,
    alignItems: "center",
    gap: ui.spacing.sm,
    paddingBottom: ui.spacing.sm,
  },
  footerText: {
    color: ui.colors.textMuted,
    fontWeight: "600",
  },
  footerLink: {
    color: ui.colors.primary,
    fontWeight: "900",
  },
  orText: {
    color: ui.colors.textMuted,
    fontWeight: "700",
  },
  googleButton: {
    width: Math.min(width * 0.8, 340),
    backgroundColor: "#F1F5F9",
    borderRadius: ui.radius.md,
  },
  googleButtonText: {
    color: "#D12E2E",
    fontWeight: "800",
  },
});

export default LoginScreen;
