import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { Card, IconButton, Button, TextInput } from "react-native-paper";
import { Formik } from "formik";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";
import * as Yup from "yup";

import defaultAvatar from "../assets/avatar.png";
import SelectCuisinesModal from "../components/SelectCuisinesModal";
import { View, FormErrorMessage } from "../components";
import { Colors } from "../config";
import { auth, db } from "../config/firebase"; // ✅ IMPORTANT FIX
import { useTogglePasswordVisibility } from "../hooks";

export const SignupScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState("");
  const [profileImage, setProfileImage] = useState(defaultAvatar);
  const [showCuisinesModal, setShowCuisinesModal] = useState(false);

  const {
    passwordVisibility,
    handlePasswordVisibility,
    rightIcon,
    confirmPasswordVisibility,
    handleConfirmPasswordVisibility,
    confirmPasswordIcon,
  } = useTogglePasswordVisibility();

  // ✅ modern image picker
  const handleImagePicker = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission to access photos is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const handleSignup = async (values) => {
    const { email, password, username } = values;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username,
        photoURL: profileImage === defaultAvatar ? null : profileImage.uri,
      });

      await addDoc(collection(db, "users"), {
        uid: user.uid,
        displayName: username,
      });

      navigation.navigate("Profile");
    } catch (error) {
      setErrorState(error.message);
    }
  };

  return (
    <KeyboardAwareScrollView enableOnAndroid>
      <Card style={styles.container}>
        <TouchableOpacity
          onPress={handleImagePicker}
          style={styles.profileImagePicker}
        >
          <Image source={profileImage} style={styles.profileImage} />
        </TouchableOpacity>

        <View style={{ width: width * 0.8, alignSelf: "center" }}>
          <Formik
            initialValues={{
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={signupValidationSchema}
            onSubmit={handleSignup}
          >
            {({
              values,
              touched,
              errors,
              handleChange,
              handleSubmit,
              handleBlur,
            }) => (
              <>
                {/* Username */}
                <TextInput
                  label="Username"
                  mode="outlined"
                  autoCapitalize="words"
                  value={values.username}
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                  left={<TextInput.Icon icon="account-outline" />}
                  style={styles.textInput}
                />
                <FormErrorMessage
                  error={errors.username}
                  visible={touched.username}
                />

                {/* Email */}
                <TextInput
                  label="Email"
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  left={<TextInput.Icon icon="email-outline" />}
                  style={styles.textInput}
                />
                <FormErrorMessage
                  error={errors.email}
                  visible={touched.email}
                />

                {/* Password */}
                <TextInput
                  label="Password"
                  mode="outlined"
                  secureTextEntry={passwordVisibility}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={rightIcon}
                      onPress={handlePasswordVisibility}
                    />
                  }
                  style={styles.textInput}
                />
                <FormErrorMessage
                  error={errors.password}
                  visible={touched.password}
                />

                {/* Confirm password */}
                <TextInput
                  label="Confirm Password"
                  mode="outlined"
                  secureTextEntry={confirmPasswordVisibility}
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={confirmPasswordIcon}
                      onPress={handleConfirmPasswordVisibility}
                    />
                  }
                  style={styles.textInput}
                />
                <FormErrorMessage
                  error={errors.confirmPassword}
                  visible={touched.confirmPassword}
                />

                {errorState !== "" && (
                  <FormErrorMessage error={errorState} visible />
                )}

                <Button
                  style={styles.button}
                  mode="contained"
                  onPress={() => setShowCuisinesModal(true)}
                >
                  Select Cuisines
                </Button>

                <Modal visible={showCuisinesModal} animationType="slide">
                  <SelectCuisinesModal
                    onClose={() => setShowCuisinesModal(false)}
                  />
                </Modal>

                <Button style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Signup</Text>
                </Button>

                <TouchableOpacity
                  style={styles.touchableOpacityButton}
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text style={{ marginTop: 20, textAlign: "center" }}>
                    Already have an account?{" "}
                    <Text style={{ color: "#00CDBC", fontWeight: "800" }}>
                      Login
                    </Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </Card>
    </KeyboardAwareScrollView>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120,
    width,
    height,
    backgroundColor: "#FFF",
  },
  button: {
    width: width * 0.9,
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: "#00CDBC",
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: "900",
    textAlign: "center",
  },
  profileImagePicker: {
    alignItems: "center",
    marginBottom: 16,
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  textInput: {
    width: width * 0.9,
    alignSelf: "center",
  },
});

const signupValidationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email().required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export default SignupScreen;
