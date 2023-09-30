import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { HomeScreen } from '../screens/HomeScreen'; // Import directly, not through screens/index.js
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';

const Stack = createStackNavigator();

export const AppStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Profile' component={ProfileScreen} />
      <Stack.Screen name='Search' component={SearchScreen} />
      <Stack.Screen name='Settings' component={SettingsScreen} />
      <Stack.Screen name='Payments' component={PaymentsScreen} />
    </Stack.Navigator>
  );
};
