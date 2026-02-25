import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import Constants from "expo-constants";

export const Notification = () => {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [emailNotificationEnabled, setEmailNotificationEnabled] =
    useState(false);
  const [textAlertsEnabled, setTextAlertsEnabled] = useState(false);
  const [isNotificationsSupported, setIsNotificationsSupported] = useState(true);

  const isExpoGo = Constants.executionEnvironment === "storeClient";

  const getNotificationsModule = async () => {
    if (isExpoGo) {
      return null;
    }
    const module = await import("expo-notifications");
    return module;
  };

  useEffect(() => {
    const checkNotificationStatus = async () => {
      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        setIsNotificationsSupported(false);
        setNotificationEnabled(false);
        return;
      }
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationEnabled(status === "granted");
    };
    checkNotificationStatus();
  }, []);

  const toggleNotification = async () => {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      setIsNotificationsSupported(false);
      setNotificationEnabled(false);
      return;
    }

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
      {!isNotificationsSupported ? (
        <Text style={styles.supportNote}>
          Push notifications need a development build. Expo Go has limited support.
        </Text>
      ) : null}
      <View style={styles.notificationToggle}>
        <Text style={styles.notificationLabel}>App Notifications</Text>
        <Switch
          trackColor={{ false: "#FFF", true: "#00CDBC" }}
          thumbColor={notificationEnabled ? "#FFFFFF" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleNotification}
          value={notificationEnabled}
          disabled={!isNotificationsSupported}
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
  supportNote: {
    width: "80%",
    marginBottom: 14,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 19,
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
