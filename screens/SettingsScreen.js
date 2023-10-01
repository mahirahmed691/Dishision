import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from 'react-native-paper';

import { auth } from '../config';

export const SettingsScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userPhotoURL, setUserPhotoURL] = useState('');

  useEffect(() => {
    if (auth.currentUser) {
      const user = auth.currentUser;
      setUserName(user.displayName || '');
      setUserPhotoURL(user.photoURL || '');
    }
  }, []);

  const settingsItems = [
    { icon: 'language', text: 'Language' },
    { icon: 'notifications',     text: 'Notifications' },
    { icon: 'lock',     text: 'Security' },
    { icon: 'question-answer',     text: 'Ask a Question' },
  ];

  return (
    <View style={styles.container}>
      <Icon
        name="chevron-left"
        size={24}
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.content}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity style={styles.listItem} key={index}>
            <View style={styles.listItemContent}>
              <View style={styles.iconContainer}>
                <Icon name={item.icon} style={styles.icon} />
              </View>
              <Text style={styles.listItemText}>{item.text}</Text>
              <Icon name="chevron-right" size={24} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    backgroundColor: '#60BA62',
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
  backButton: {
    marginLeft: 20,
  },
});
