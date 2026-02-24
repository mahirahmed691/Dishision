import React, { useState, useContext, useEffect } from "react";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "../config/firebaseAuth";

import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";
import { AuthenticatedUserContext } from "../providers";
import { LoadingIndicator } from "../components";
import { auth } from "../config/firebase";
import { ui } from "../config/designSystem";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: ui.colors.background,
    card: ui.colors.surface,
    text: ui.colors.text,
    primary: ui.colors.primary,
    border: ui.colors.border,
  },
};

export const RootNavigator = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ subscribe ONCE
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser ?? null);
      setIsLoading(false); // ✅ stop loader when auth resolves
    });

    return unsubscribe;
  }, []); // ✅ CRITICAL — empty deps

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
