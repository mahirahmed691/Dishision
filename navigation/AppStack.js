import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen"; // Import directly, not through screens/index.js
import { SettingsScreen } from "../screens/SettingsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { PaymentsScreen } from "../screens/PaymentsScreen";
import { FoodMenuScreen } from "../screens/FoodMenuScreen";
import { FavouritesScreen } from "../screens/FavouritesScreen";
import { ReviewsScreen } from "../screens/ReviewsScreen";
import { EditProfile } from "../screens/EditProfile";
import { MapScreen } from "../screens/MapsScreen";
import { Restaurants } from "../components/Restaurants";
import { InviteFriends } from "../components/InviteFriends";
import { Language } from "../components/Language.js";
import FAQ from "../components/FAQ";
import Notifcation from "../components/Notfications";
import Security from "../components/Security";
import MissingDataQueueScreen from "../screens/MissingDataQueueScreen";
import OnboardingPreferencesScreen from "../screens/OnboardingPreferencesScreen";

const Stack = createNativeStackNavigator();

export const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 230,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Menu" component={FoodMenuScreen} />
      <Stack.Screen name="Favourites" component={FavouritesScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Maps" component={MapScreen} />
      <Stack.Screen name="Restaurants" component={Restaurants} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Rewards" component={InviteFriends} />
      <Stack.Screen name="Language" component={Language} />
      <Stack.Screen name="FAQ" component={FAQ} />
      <Stack.Screen name="Security" component={Security} />
      <Stack.Screen name="Notifications" component={Notifcation} />
      <Stack.Screen name="MissingDataQueue" component={MissingDataQueueScreen} />
      <Stack.Screen
        name="OnboardingPreferences"
        component={OnboardingPreferencesScreen}
        options={{
          animation: "fade_from_bottom",
          gestureEnabled: false,
          animationDuration: 260,
        }}
      />
    </Stack.Navigator>
  );
};
