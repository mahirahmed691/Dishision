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
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Initial" component={InitialScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
