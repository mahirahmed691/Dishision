import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, Dimensions } from "react-native";
import { IconButton, Button, TextInput, Icon } from "react-native-paper";
import { db } from "../config/firebase";
import { collection, addDoc } from "@firebase/firestore";
import { Colors } from "../config";

const StarSelector = ({
  rating = 0,
  onChange,
  size = 22,
  color = "#00CDBC",
}) => {
  const current = Number(rating) || 0;

  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          source={i <= current ? "star" : "star-outline"}
          size={size}
          color={color}
          onPress={() => onChange?.(i)}
        />
      ))}
    </View>
  );
};

export const CommentModal = ({
  isVisible,
  onClose,
  onAddComment,
  restaurantName,
}) => {
  const [userName, setUserName] = useState("");
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [comment, setComment] = useState("");

  const addComment = () => {
    const commentData = {
      userName,
      restaurantRating,
      comment,
      date: new Date().toISOString(),
      restaurantName,
    };

    addDoc(collection(db, "comments"), commentData)
      .then(() => {
        setUserName("");
        setRestaurantRating(0);
        setComment("");
        onClose();
        onAddComment?.(commentData);
      })
      .catch((error) => {
        console.error("Error adding comment to Firestore:", error);
      });
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.container}>
        <IconButton
          icon="close"
          style={styles.closeButton}
          mode="outlined"
          containerColor="#00CDBC"
          iconColor="white"
          onPress={onClose}
        />

        <Text style={styles.title}>Add a Comment</Text>

        <TextInput
          theme={{
            colors: {
              primary: "#444",
              placeholder: "white",
              text: "black",
              background: "white",
            },
          }}
          style={styles.input}
          mode="contained"
          placeholder="Your Name"
          value={userName}
          onChangeText={setUserName}
        />

        <Text style={styles.label}>Restaurant Rating (1–5):</Text>

        {/* ⭐ Interactive rating */}
        <View style={{ width: 180 }}>
          <StarSelector
            rating={restaurantRating}
            onChange={setRestaurantRating}
            size={24}
          />
        </View>

        <TextInput
          theme={{
            colors: {
              primary: "#00CDBC",
              placeholder: "white",
              text: "black",
              background: "white",
            },
          }}
          style={styles.commentInput}
          mode="outlined"
          placeholder="Your Comment"
          placeholderTextColor={Colors.textSecondary}
          value={comment}
          onChangeText={setComment}
          multiline
        />

        <Button mode="contained" style={styles.addButton} onPress={addComment}>
          Add Comment
        </Button>
      </View>
    </Modal>
  );
};

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "black",
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "700",
    color: "black",
  },
  commentInput: {
    marginTop: 20,
    height: 220,
    marginBottom: 30,
  },
  addButton: {
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#00CDBC",
  },
});
