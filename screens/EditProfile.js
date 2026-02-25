import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { doc, setDoc } from "@firebase/firestore";
import { updateEmail, updatePassword } from "firebase/auth";
import { updateProfile } from "../config/firebaseAuth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../config/firebase"; // Import your Firebase setup

export const EditProfile = ({ navigation }) => {
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated.");
        return;
      }

      const normalizedEmail = email.trim();
      const normalizedPassword = password.trim();
      const normalizedUsername = username.trim();
      const profileUpdates = {};

      if (normalizedUsername && normalizedUsername !== user.displayName) {
        profileUpdates.displayName = normalizedUsername;
      }

      if (profileImage && profileImage !== user.photoURL) {
        if (/^https?:\/\//i.test(profileImage)) {
          profileUpdates.photoURL = profileImage;
        } else {
          const imageRef = ref(storage, `profileImages/${user.uid}/${Date.now()}.jpg`);
          const response = await fetch(profileImage);
          const blob = await response.blob();
          await uploadBytes(imageRef, blob);
          profileUpdates.photoURL = await getDownloadURL(imageRef);
        }
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(user, profileUpdates);
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          displayName: normalizedUsername || user.displayName || "",
          photoURL: profileUpdates.photoURL ?? user.photoURL ?? "",
        },
        { merge: true },
      );

      if (normalizedEmail && normalizedEmail !== user.email) {
        await updateEmail(user, normalizedEmail);
      }

      if (normalizedPassword) {
        await updatePassword(user, normalizedPassword);
      }

      Alert.alert("Saved", "Profile updated successfully.");
      if (typeof navigation?.goBack === "function") {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Update failed",
        error?.message || "An error occurred while updating the profile.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
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
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "700",
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
