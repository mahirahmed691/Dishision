import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, IconButton, TextInput } from "react-native-paper";
import { Formik } from "formik";
import { sendPasswordResetEmail } from "../config/firebaseAuth";
import { auth } from "../config/firebase";
import { FormErrorMessage } from "../components";
import { passwordResetSchema } from "../utils";
import { ui } from "../config/designSystem";

export const ForgotPasswordScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState("");

  const handleSendPasswordResetEmail = (values) => {
    const { email } = values;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        navigation.navigate("Login");
      })
      .catch((error) => setErrorState(error.message));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <IconButton
          style={styles.backButton}
          icon="keyboard-backspace"
          iconColor={ui.colors.text}
          onPress={() => navigation.goBack()}
        />

        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          Enter the email linked to your account and we'll send reset instructions.
        </Text>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={passwordResetSchema}
          onSubmit={handleSendPasswordResetEmail}
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
                label="Email"
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                style={styles.input}
              />

              <FormErrorMessage error={errors.email} visible={touched.email} />
              {errorState !== "" && <FormErrorMessage error={errorState} visible />}

              <Button
                style={styles.button}
                mode="contained"
                onPress={handleSubmit}
                labelStyle={styles.buttonLabel}
              >
                Send Reset Email
              </Button>
            </>
          )}
        </Formik>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Go back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ui.colors.background,
    justifyContent: "center",
    padding: ui.spacing.lg,
  },
  card: {
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    padding: ui.spacing.lg,
    ...ui.shadow.card,
  },
  backButton: {
    alignSelf: "flex-start",
    margin: 0,
    borderWidth: 1,
    borderColor: ui.colors.border,
  },
  title: {
    marginTop: ui.spacing.sm,
    fontSize: ui.type.h1,
    fontWeight: "900",
    color: ui.colors.text,
  },
  subtitle: {
    marginTop: ui.spacing.xs,
    marginBottom: ui.spacing.md,
    color: ui.colors.textMuted,
    fontSize: ui.type.body,
    lineHeight: 20,
  },
  input: {
    backgroundColor: ui.colors.surface,
  },
  button: {
    marginTop: ui.spacing.sm,
    borderRadius: ui.radius.md,
    backgroundColor: ui.colors.primary,
  },
  buttonLabel: {
    color: ui.colors.white,
    fontWeight: "800",
  },
  loginLink: {
    marginTop: ui.spacing.md,
    textAlign: "center",
    color: ui.colors.primary,
    fontWeight: "700",
  },
});

export default ForgotPasswordScreen;
