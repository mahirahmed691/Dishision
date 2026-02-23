import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Formik } from "formik";
import { signInWithEmailAndPassword } from "firebase/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput, Button, Card } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { FormErrorMessage } from "../components";
import { Colors } from "../config";
import { auth } from "../config/firebase"; // ✅ correct singleton
import { useTogglePasswordVisibility } from "../hooks";
import { loginValidationSchema } from "../utils";

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const { passwordVisibility, handlePasswordVisibility, rightIcon } =
    useTogglePasswordVisibility();

  // ✅ email/password login
  const handleLogin = useCallback((values) => {
    const { email, password } = values;

    signInWithEmailAndPassword(auth, email, password).catch((error) =>
      setErrorState(error.message),
    );
  }, []);

  // ✅ Google auth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "",
    iosClientId:
      "151956588290-p6v13tnrpi5t9e7ikrt43n9vnj1rpchp.apps.googleusercontent.com",
    webClientId: "",
  });

  // ✅ handle Google response safely
  useEffect(() => {
    if (!response) return;

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
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const getUserInfo = async (token) => {
    if (!token) return;

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
    <ImageBackground
      source={require("../assets/burgerUnsplash.png")}
      style={styles.backgroundImage}
    >
      <KeyboardAwareScrollView enableOnAndroid>
        <Card style={styles.container}>
          <Text style={styles.title}>Welcome to Dish Decide</Text>

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
              <View style={{ width: width * 0.9, alignSelf: "center" }}>
                {/* Email */}
                <TextInput
                  label="Email"
                  mode="outlined"
                  theme={{ roundness: 14 }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoFocus
                  left={<TextInput.Icon icon="email" />}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  style={styles.textInput}
                />

                <FormErrorMessage
                  error={errors.email}
                  visible={touched.email}
                  style={styles.errorText}
                />

                {/* Password */}
                <TextInput
                  label="Password"
                  mode="outlined"
                  theme={{ roundness: 14 }}
                  autoCapitalize="none"
                  secureTextEntry={passwordVisibility}
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
                  style={styles.errorText}
                />

                <TouchableOpacity
                  style={styles.touchableOpacityButton}
                  onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {errorState !== "" && (
                  <FormErrorMessage error={errorState} visible />
                )}

                <Button
                  mode="contained"
                  style={styles.loginButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>Sign in</Text>
                </Button>
              </View>
            )}
          </Formik>

          {/* Footer */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.touchableOpacityButton}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.createAccountText}>
                Don't have an account?
                <Text style={{ color: "#00CDBC", fontWeight: "800" }}>
                  {" "}
                  Signup
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={{ width: "80%", alignSelf: "center" }}>
              <Text style={{ alignSelf: "center", marginTop: 20 }}>Or</Text>

              <Button
                mode="contained"
                style={styles.googleButton}
                disabled={!request}
                onPress={promptAsync}
              >
                <Text style={{ color: "red", fontWeight: "800" }}>
                  Sign in with Google
                </Text>
              </Button>
            </View>
          </View>
        </Card>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "contain",
    height: 280,
    backgroundColor: "#00CDBC",
  },
  container: {
    flex: 1,
    width: width,
    height: height * 0.8,
    backgroundColor: "white",
    top: height * 0.3,
    borderRadius: 20,
    paddingTop: 40,
  },
  buttonText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 2,
  },
  createAccountText: {
    textAlign: "center",
    fontWeight: "500",
  },
  forgotPasswordText: {
    fontSize: 12,
    textAlign: "right",
    fontWeight: "600",
    color: "#888",
  },
  touchableOpacityButton: {
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: "#00CDBC",
    marginTop: 40,
    padding: 10,
  },
  googleButton: {
    backgroundColor: "#f0f0f0",
    marginTop: 10,
    padding: 10,
  },
  textInput: {
    width: width * 0.9,
    alignSelf: "center",
    backgroundColor: "#F7F8F9",
  },
  title: {
    marginBottom: 20,
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: "700",
    marginLeft: 20,
  },
});

export default LoginScreen;
