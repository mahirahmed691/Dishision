import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

export const SearchScreen = () => {
  const [inputText, setInputText] = useState('');

  const handleInputChange = (text) => {
    setInputText(text);
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>
      <TextInput
                style={styles.input}
                mode="outlined"
                theme={{
                  roundness: 15,
                  colors: {
                    onSurfaceVariant: '#999',
                  },
                }}
                placeholder="Search for food"
                value={inputText}
                onChangeText={handleInputChange}
                left={<TextInput.Icon icon="magnify" color="#999" />}
              />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 18,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#333',
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
  },
  input: {
    marginTop: 20,
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#f7f8f9',
  },
});

export default SearchScreen;
