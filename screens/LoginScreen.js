import React, { useState, useEffect } from "react";
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
import { TextInput, Button, Card, Icon } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { FormErrorMessage } from "../components";
import { Colors, auth } from "../config";
import { useTogglePasswordVisibility } from "../hooks";
import { loginValidationSchema } from "../utils";

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState("");
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const { passwordVisibility, handlePasswordVisibility, rightIcon } =
    useTogglePasswordVisibility();

  const handleLogin = (values) => {
    const { email, password } = values;
    signInWithEmailAndPassword(auth, email, password).catch((error) =>
      setErrorState(error.message)
    );
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "",
    iosClientId:
      "151956588290-p6v13tnrpi5t9e7ikrt43n9vnj1rpchp.apps.googleusercontent.com",
    webClientId: "",
  });

  useEffect(() => {
    handleEffect();
  }, [response, token]);

  async function handleEffect() {
    const user = await getLocalUser();
    console.log("user", user);
    if (!user) {
      if (response?.type === "success") {
        // setToken(response.authentication.accessToken);
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(user);
      console.log("loaded locally");
    }
  }

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      // Add your own error handler here
    }
  };

  return (
    <ImageBackground
      source={require("../assets/burgerUnsplash.png")}
      style={styles.backgroundImage}
    >
      <KeyboardAwareScrollView enableOnAndroid={true}>
        <Card style={styles.container}>
          <Text style={styles.title}> Welcome to Dish Decide </Text>
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={loginValidationSchema}
            onSubmit={(values) => handleLogin(values)}
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
                <TextInput
                  label="Email"
                  mode="outlined"
                  theme={{ roundness: 14 }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoFocus={true}
                  left={<Icon name="email" />} 
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
                <TextInput
                  label="Password"
                  placeholder="Password"
                  mode="outlined"
                  theme={{
                    roundness: 14,
                    colors: {
                      placeholder: "white",
                      backgroundColor: "transparent",
                    },
                  }}
                  autoCapitalize="none"
                  secureTextEntry
                  left={<Icon name="lock" />} 
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
                {errorState !== "" ? (
                  <FormErrorMessage error={errorState} visible={true} />
                ) : null}
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

            <View style={{ width: "80%", alignSelf: 'center' }}>
              <Text style={{ alignSelf: 'center', marginTop: 20 }}>Or</Text>
              <Button
                mode="contained"
                style={styles.googleButton}
                disabled={!request}
                onPress={() => {
                  promptAsync();
                }}
              >
                <Text style={{ color: 'red', fontWeight: '800' }}>Sign in with Google</Text>
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
