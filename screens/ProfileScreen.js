import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Avatar } from 'react-native-paper';

import { auth } from '../config';

export const ProfileScreen = ({navigation}) => {
  const [userName, setUserName] = useState('');
  const [userPhotoURL, setUserPhotoURL] = useState('');

  useEffect(() => {
    if (auth.currentUser) {
      const user = auth.currentUser;
      setUserName(user.displayName || '');
      setUserPhotoURL(user.photoURL || '');
    }
  }, []);

  return (
    <View style={styles.container}>
  
      <Icon 
      name="chevron-left" 
      size={24} 
      style={styles.backButton} 
      onPress={() => navigation.goBack()}
      />
      
      <Avatar.Image
        size={80}
        source={
          userPhotoURL
            ? { uri: userPhotoURL }
            : require('../assets/avatar.png')
        }
        style={{ marginBottom: 30, alignSelf: 'center', borderRadius: 40 }}
      />
      <Text style={{ fontSize: 20, color: 'black', textAlign: 'center' }}>
        {userName}
      </Text>
      <View style={styles.content}>
        <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate("Payments")}>
          <View style={styles.listItemContent}>
            <View style={styles.iconContainer}>
              <Icon name="credit-card" style={styles.icon} />
            </View>
            <Text style={styles.listItemText}>Payment</Text>
            <Icon name="chevron-right" size={24} />
          </View>
        </TouchableOpacity>
                <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemContent}>
            <View style={styles.iconContainer}>
              <Icon name="edit" style={styles.icon} />
            </View>
            <Text style={styles.listItemText}>Edit Profile</Text>
            <Icon name="chevron-right" size={24} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemContent}>
            <View style={styles.iconContainer}>
              <Icon name="bell" style={styles.icon} />
            </View>
            <Text style={styles.listItemText}>Notifications</Text>
            <Icon name="chevron-right" size={24} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 100,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space evenly
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  iconContainer: {
    backgroundColor: '#00CDBC',
    borderRadius: 50, // Make the container circular
    marginRight: 20,
    padding: 10,
  },
  icon: {
    fontSize: 24,
    color: '#fff',
  },
  listItemText: {
    fontSize: 18,
    color: '#333',
    flex: 1, // Allow text to take remaining space
    marginRight: 10, // Add some space between text and chevron
  },
  backButton:{
    marginLeft:20
  }
});
