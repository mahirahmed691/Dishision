import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
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
    <View style={{ flex: 1, justifyContent: "center" }}>
      {permissionStatus !== "granted" ? (
        <Button
          title="Grant Location Permission"
          onPress={requestLocationPermission}
        />
      ) : location ? (
        <View style={{}}>
          {address ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="map-marker"
                size={15}
                color="black"
              />
              <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 5 }}>
                {address.city}
              </Text>
            </View>
          ) : (
            <Text>Fetching address...</Text>
          )}
        </View>
      ) : (
        <Text>Fetching location...</Text>
      )}
    </View>
  );
};

export default LocationServices;
