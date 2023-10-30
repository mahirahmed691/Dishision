import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { IconButton } from "react-native-paper";

const Map = ({ latitude, longitude, title }) => {
  const [expanded, setExpanded] = useState(false);
  const initialCoords = {
    latitude: latitude,
    longitude: longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <Modal visible={expanded} transparent={true}>
        <View style={styles.modalContainer}>
          <MapView
            provider="google"
            style={styles.fullScreenMap}
            initialRegion={initialCoords}
            minZoomLevel={16}
          >
            <Marker
              coordinate={{ latitude: latitude, longitude: longitude }}
              title={title}
            />
          </MapView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleExpansion}
          >
            <IconButton
              icon="close"
              mode="contained"
              backgroundColor="#f0f0f0"
              iconColor="black"
            />
          </TouchableOpacity>
        </View>
      </Modal>

      <MapView
        provider="google"
        style={styles.map}
        initialRegion={initialCoords}
        minZoomLevel={18}
        onPress={toggleExpansion}
        scrollEnabled={false}
      >
        <Marker
          coordinate={{ latitude: latitude, longitude: longitude }}
          title={title}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    height: 300,
    margin: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  fullScreenMap: {
    width: "100%",
    height: "80%",
    marginTop: "10%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },
});

export default Map;
