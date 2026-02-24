import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LocationServices = () => {
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [address, setAddress] = useState(null);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status === "granted") {
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const getAddressFromCoords = async () => {
    if (location) {
      try {
        const [addressData] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setAddress(addressData);
      } catch (error) {
        console.error("Error getting address:", error);
      }
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    getAddressFromCoords();
  }, [location]);

  return (
    <View style={styles.container}>
      {permissionStatus !== "granted" ? (
        <Button
          title="Grant Location Permission"
          onPress={requestLocationPermission}
        />
      ) : location ? (
        <View>
          {address ? (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color="black"
              />
              <Text style={styles.cityText}>
                {address.city}
              </Text>
            </View>
          ) : (
            <Text style={styles.metaText}>Fetching address...</Text>
          )}
        </View>
      ) : (
        <Text style={styles.metaText}>Fetching location...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cityText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
});

export default LocationServices;
