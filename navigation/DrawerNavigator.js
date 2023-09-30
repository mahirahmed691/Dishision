// navigation/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Text, TouchableOpacity, ScrollView } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { signOut } from 'firebase/auth';
import { auth } from '../config';
import { SettingsScreen } from '../screens/SettingsScreen';

import { HomeScreen } from '../screens';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
  const handleLogout = () => {
    signOut(auth).catch((error) => console.log('Error logging out: ', error));
  };

  return (
    <ScrollView>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.menuListText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.menuListText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.menuListText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Text style={styles.menuListText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = {
  menuItem: {
    marginBottom: 10,
    fontSize: 30,
  },
  menuListText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
