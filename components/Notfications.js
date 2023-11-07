import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";

export const Notification = () => {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [emailNotificationEnabled, setEmailNotificationEnabled] =
    useState(false);
  const [textAlertsEnabled, setTextAlertsEnabled] = useState(false);

  useEffect(() => {
    const checkNotificationStatus = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationEnabled(status === "granted");
    };
    checkNotificationStatus();

    // Additional checks for email and text alerts could go here
    // Fetch data or check the settings for these services to see if they're enabled
    // Example:
    // setEmailNotificationEnabled(fetchEmailNotificationSettings());
    // setTextAlertsEnabled(fetchTextAlertSettings());
  }, []);

  const toggleNotification = async () => {
    try {
      if (notificationEnabled) {
        await Notifications.requestPermissionsAsync({
          allowAlert: false,
          allowBadge: false,
          allowSound: false,
          allowAnnouncements: false,
        });
        setNotificationEnabled(false);
      } else {
        await Notifications.requestPermissionsAsync();
        setNotificationEnabled(true);
      }
    } catch (error) {
      console.log("Notification permission error:", error);
    }
  };

  useEffect(() => {
    const checkNotificationStatus = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationEnabled(status === 'granted');
    };
    checkNotificationStatus();

    // Fetch email notification settings from a database or storage
    // Example:
    // const emailNotifications = fetchEmailNotificationSettings();
    // setEmailNotificationEnabled(emailNotifications);
    
    // Additional checks for text alerts could go here
  }, []);

  const toggleTextAlerts = () => {
    const newValue = !textAlertsEnabled;
    setTextAlertsEnabled(newValue);

    // Update the text alerts settings in a database or storage
  };

  const toggleEmailNotifications = () => {
    const newValue = !emailNotificationEnabled;
    setEmailNotificationEnabled(newValue);

    // Here, you would typically update the notification settings in a database or storage
    // Example:
    // updateEmailNotificationSettings(newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>
      <View style={styles.notificationToggle}>
        <Text style={styles.notificationLabel}>App Notifications</Text>
        <Switch
          trackColor={{ false: "#FFF", true: "#00CDBC" }}
          thumbColor={notificationEnabled ? "#" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleNotification}
          value={notificationEnabled}
        />
      </View>
      <View style={styles.notificationToggle}>
        <Text style={styles.notificationLabel}>Email Notifications</Text>
        <Switch
          trackColor={{ false: "#FFF", true: "#00CDBC" }}
          thumbColor={emailNotificationEnabled ? "#FFF" : "#FFF"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleEmailNotifications}
          value={emailNotificationEnabled}
        />
      </View>
      <View style={styles.notificationToggle}>
        <Text style={styles.notificationLabel}>Text Alerts</Text>
        <Switch
          trackColor={{ false: "#FFF", true: "#00CDBC" }}
          thumbColor={textAlertsEnabled ? "#FFF" : "#FFF"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTextAlerts}
          value={textAlertsEnabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  notificationToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  notificationLabel: {
    fontSize: 18,
  },
});

export default Notification;