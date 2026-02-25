import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
  InitialScreen,
} from "../screens";

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Initial"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 220,
      }}
    >
      <Stack.Screen name="Initial" component={InitialScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ animation: "fade_from_bottom" }}
      />
    </Stack.Navigator>
  );
};
