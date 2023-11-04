import React from "react";
import { View, Image } from "react-native";

export const HygieneRating = ({ hygieneRating }) => {
  const getHygieneImage = (rating) => {
    switch (rating) {
      case 0:
        return require("../assets/hygiene/0.png");
      case 1:
        return require("../assets/hygiene/1.png");
      case 2:
        return require("../assets/hygiene/2.png");
      case 3:
        return require("../assets/hygiene/3.png");
      case 4:
        return require("../assets/hygiene/4.png");
      case 5:
        return require("../assets/hygiene/5.png");
      default:
        return require("../assets/burger.jpeg");
    }
  };

  return (
    <View>
      <Image
        source={getHygieneImage(hygieneRating)}
        style={{ width: 300, height: 300, resizeMode: "contain" }}
      />
    </View>
  );
};

export default HygieneRating;
