import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";
import * as Yup from "yup";
import { addDoc, collection } from "@firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword, updateProfile } from "../config/firebaseAuth";
import defaultAvatar from "../assets/avatar.png";
import SelectCuisinesModal from "../components/SelectCuisinesModal";
import { FormErrorMessage } from "../components";
import { auth, db } from "../config/firebase";
import { useTogglePasswordVisibility } from "../hooks";
import { ui } from "../config/designSystem";

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
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.heroSection}>
        <Image
          source={require("../assets/login-burger-hq.jpg")}
          style={styles.heroImage}
        />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.body}>
            <TouchableOpacity
              onPress={handleImagePicker}
              style={styles.profileImagePicker}
              activeOpacity={0.9}
            >
              <Image source={profileImage} style={styles.profileImage} />
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>Edit</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.form}>
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
                    <TextInput
                      label="Username"
                      mode="outlined"
                      autoCapitalize="words"
                      outlineColor="#D1D5DB"
                      activeOutlineColor={ui.colors.primary}
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      left={<TextInput.Icon icon="account-outline" />}
                      style={styles.textInput}
                    />
                    <FormErrorMessage error={errors.username} visible={touched.username} />

                    <TextInput
                      label="Email"
                      mode="outlined"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      outlineColor="#D1D5DB"
                      activeOutlineColor={ui.colors.primary}
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      left={<TextInput.Icon icon="email-outline" />}
                      style={styles.textInput}
                    />
                    <FormErrorMessage error={errors.email} visible={touched.email} />

                    <TextInput
                      label="Password"
                      mode="outlined"
                      secureTextEntry={passwordVisibility}
                      outlineColor="#D1D5DB"
                      activeOutlineColor={ui.colors.primary}
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
                    <FormErrorMessage error={errors.password} visible={touched.password} />

                    <TextInput
                      label="Confirm Password"
                      mode="outlined"
                      secureTextEntry={confirmPasswordVisibility}
                      outlineColor="#D1D5DB"
                      activeOutlineColor={ui.colors.primary}
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

                    {errorState !== "" && <FormErrorMessage error={errorState} visible />}

                    <Button
                      style={styles.secondaryButton}
                      mode="outlined"
                      textColor={ui.colors.primary}
                      onPress={() => setShowCuisinesModal(true)}
                    >
                      Select Cuisines
                    </Button>

                    <Modal
                      visible={showCuisinesModal}
                      animationType="slide"
                      presentationStyle="fullScreen"
                      onRequestClose={() => setShowCuisinesModal(false)}
                    >
                      <SelectCuisinesModal onClose={() => setShowCuisinesModal(false)} />
                    </Modal>

                    <Button
                      style={styles.primaryButton}
                      mode="contained"
                      onPress={handleSubmit}
                    >
                      <Text style={styles.primaryButtonText}>Signup</Text>
                    </Button>
                  </>
                )}
              </Formik>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLinkText}>
                Already have an account?
                <Text style={styles.loginLinkAccent}> Login</Text>
              </Text>
            </TouchableOpacity>
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
    height: "78%",
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
    paddingTop: ui.spacing.xs,
  },
  profileImagePicker: {
    marginTop: ui.spacing.xs,
    marginBottom: ui.spacing.sm,
    width: 86,
    height: 86,
    borderRadius: 43,
    alignSelf: "center",
  },
  profileImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: ui.colors.primarySoft,
  },
  imageBadge: {
    position: "absolute",
    bottom: -5,
    right: -8,
    borderRadius: ui.radius.full,
    backgroundColor: ui.colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  imageBadgeText: {
    color: ui.colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  form: {
    width: "100%",
    alignSelf: "center",
    gap: 2,
  },
  textInput: {
    backgroundColor: ui.colors.surface,
  },
  secondaryButton: {
    marginTop: ui.spacing.sm,
    borderColor: ui.colors.primary,
    borderRadius: ui.radius.md,
  },
  primaryButton: {
    marginTop: ui.spacing.xs,
    backgroundColor: ui.colors.primary,
    borderRadius: ui.radius.md,
    paddingVertical: 4,
  },
  primaryButtonText: {
    color: ui.colors.white,
    fontWeight: "800",
  },
  footer: {
    marginTop: ui.spacing.xs,
    alignItems: "center",
    paddingBottom: ui.spacing.sm,
  },
  loginLinkText: {
    color: ui.colors.textMuted,
    fontWeight: "600",
  },
  loginLinkAccent: {
    color: ui.colors.primary,
    fontWeight: "900",
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
