import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { HomeScreen } from '../screens/HomeScreen'; // Import directly, not through screens/index.js
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { FoodMenuScreen } from '../screens/FoodMenuScreen';
import { FavouritesScreen } from '../screens/FavouritesScreen';
import { ReviewsScreen } from '../screens/ReviewsScreen';
import {EditProfile} from '../screens/EditProfile';
import { MapScreen } from '../screens/MapsScreen';
import {Restaurants} from '../components/Restaurants';

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
      <Stack.Screen name='Reviews' component={ReviewsScreen} />
      <Stack.Screen name='Maps' component={MapScreen} />
      <Stack.Screen name="Restaurants" component={Restaurants} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
};
