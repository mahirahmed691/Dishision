import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Colors } from '../config';

export const FormErrorMessage = ({ error, visible }) => {
  if (!error || !visible) {
    return null;
  }

  return <Text style={styles.errorText}>{error}</Text>;
};

const styles = StyleSheet.create({
  errorText: {
    marginLeft: 5,
    color: "#F52B1C",
    fontSize: 12,
    marginVertical: 5,
    fontWeight: '900',
  }
});
