import React from "react";
import { View, Button } from "react-native";
import Share from "react-native-share";

const SocialMediaShare = ({ contentToShare }) => {
  const shareContent = async () => {
    try {
      const shareOptions = {
        title: "Share via",
        message: contentToShare,
      };

      await Share.open(shareOptions);

      console.log("Shared successfully");
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View>
      <Button
        title="Share on Social Media"
        onPress={shareContent}
      />
    </View>
  );
};

export default SocialMediaShare;
