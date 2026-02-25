import React, { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const RestaurantLogo = ({
  uri,
  name,
  style,
  fallbackStyle,
  fallbackTextStyle,
  fit = "contain",
  surface = "none",
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const hasUri = useMemo(() => {
    return typeof uri === "string" && uri.trim().length > 0;
  }, [uri]);

  const initial = useMemo(() => {
    if (typeof name !== "string" || name.trim().length === 0) {
      return "R";
    }
    return name.trim().charAt(0).toUpperCase();
  }, [name]);

  useEffect(() => {
    setImageFailed(false);
  }, [uri]);

  const useNeutralSurface = surface === "neutral";

  if (!hasUri || imageFailed) {
    return (
      <View
        style={[
          style,
          useNeutralSurface ? defaultStyles.surface : null,
          defaultStyles.fallback,
          fallbackStyle,
        ]}
      >
        <Text style={[defaultStyles.fallbackText, fallbackTextStyle]}>{initial}</Text>
      </View>
    );
  }

  if (!useNeutralSurface) {
    return (
      <Image
        source={{ uri }}
        style={[style, defaultStyles.image]}
        resizeMode={fit}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <View style={[style, defaultStyles.surface]}>
      <Image
        source={{ uri }}
        style={defaultStyles.imageFill}
        resizeMode={fit}
        onError={() => setImageFailed(true)}
      />
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  surface: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    padding: 8,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    color: "#6B7280",
    fontSize: 22,
    fontWeight: "800",
  },
  image: {
    backgroundColor: "transparent",
  },
  imageFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
});

export default RestaurantLogo;
