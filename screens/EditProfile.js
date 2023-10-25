import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { auth, storage } from "../config/firebase"; // Import your Firebase setup

export const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setUsername(user.displayName || "");
          setEmail(user.email || "");
          setProfileImage(user.photoURL);
        } else {
          console.error("User not authenticated.");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfileImage(result.uri);
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated.");
        return;
      }

      if (email) {
        await user.updateEmail(email);
      }

      if (password) {
        await user.updatePassword(password);
      }

      if (username) {
        await user.updateProfile({
          displayName: username,
          photoURL: profileImage,
        });
      }

      // Handle profile picture upload here
      if (profileImage) {
        const storageRef = storage.ref(`profileImages/${user.uid}`);
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const task = storageRef.put(blob);

        task.on(
          "state_changed",
          null,
          (error) => {
            console.error("Error uploading profile image:", error);
            alert("An error occurred while updating the profile picture.");
          },
          () => {
            alert("Profile and profile picture updated successfully!");
          }
        );
      } else {
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Text style={styles.placeholderText}>
              Tap here to select a profile picture
            </Text>
          )}
        </TouchableOpacity>

        <TextInput
          mode="outlined"
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          mode="outlined"
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          mode="outlined"
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <Button mode="contained" style={styles.editButton} onPress={handleSave}>
        Save Changes
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
    width: "90%",
  },
  input: {
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
    alignSelf: "center",
  },
  placeholderText: {
    textAlign: "center",
    color: "gray",
  },
  editButton: {
    backgroundColor: "black",
    borderRadius: 0,
    width: "80%",
    alignSelf: "center",
  },
});

export default EditProfile;
