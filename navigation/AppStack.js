import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { HomeScreen } from '../screens/HomeScreen'; // Import directly, not through screens/index.js
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { FoodMenuScreen } from '../screens/FoodMenuScreen';
import { FavouritesScreen } from '../screens/FavouritesScreen';

const Stack = createStackNavigator();

export const AppStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Profile' component={ProfileScreen} />
      <Stack.Screen name='Settings' component={SettingsScreen} />
      <Stack.Screen name='Payments' component={PaymentsScreen} />
      <Stack.Screen name='Menu' component={FoodMenuScreen} />
      <Stack.Screen name='Favourites' component={FavouritesScreen} />
    </Stack.Navigator>
  );
};
