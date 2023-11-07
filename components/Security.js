import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export const Security = () => {
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false);
  const [biometricAuthEnabled, setBiometricAuthEnabled] = useState(false);

  const toggleTwoFactorAuth = () => {
    setTwoFactorAuthEnabled(!twoFactorAuthEnabled);
    // Implement logic to enable/disable two-factor authentication
    // For instance, update settings in a database or make API calls
  };

  const toggleBiometricAuth = () => {
    setBiometricAuthEnabled(!biometricAuthEnabled);
    // Implement logic to enable/disable biometric authentication
    // For example, utilize device biometric APIs for enabling or disabling biometric security
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Settings</Text>
      <View style={styles.toggle}>
        <Text>Two-Factor Authentication</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={twoFactorAuthEnabled ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={toggleTwoFactorAuth}
          value={twoFactorAuthEnabled}
        />
      </View>
      <View style={styles.toggle}>
        <Text>Biometric Security</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={biometricAuthEnabled ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={toggleBiometricAuth}
          value={biometricAuthEnabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
});

export default Security;
