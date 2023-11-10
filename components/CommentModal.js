import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, Dimensions } from "react-native";
import { IconButton, Button, TextInput } from "react-native-paper";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import StarRating from "react-native-star-rating-view";
import { Colors } from "../config";

export const CommentModal = ({
  isVisible,
  onClose,
  onAddComment,
  restaurantName,
}) => {
  const [userName, setUserName] = useState("");
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [comment, setComment] = useState("");

  const db = getFirestore();

  const addComment = () => {
    const commentData = {
      userName,
      restaurantRating,
      comment,
      date: new Date().toISOString(),
      restaurantName,
    };

    addDoc(collection(db, "comments"), commentData)
      .then((docRef) => {
        setUserName("");
        setRestaurantRating(0);
        setComment("");
        onClose();
        onAddComment(commentData);
      })
      .catch((error) => {
        console.error("Error adding comment to Firestore:", error);
      });
  };

  const burgerIcon = (
    <Text style={{ fontSize: 20 }}>🍔</Text> // Replace with your burger icon
  );

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.container}>
        <IconButton
          icon="close"
          style={styles.closeButton}
          mode="outlined"
          backgroundColor="#00CDBC"
          iconColor="white"
          onPress={onClose}
        >
          Close
        </IconButton>
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
          backgroundColor="white"
          placeholder="Your Name"
          value={userName}
          onChangeText={(text) => setUserName(text)}
        />
        <Text style={styles.label}>Restaurant Rating (1-5):</Text>
        <View style={{ width: 170 }}>
          <StarRating
            maxStars={5}
            rating={restaurantRating}
            fullStarColor="black"
            emptyStarColor={Colors.textSecondary}
            starSize={20}
            selectedStar={(rating) => setRestaurantRating(rating)}
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
          onChangeText={(text) => setComment(text)}
          multiline
        />
        <Button
          mode="contained"
          style={styles.addButton}
          title="Add Comment"
          onPress={addComment}
        >
          Add Comment
        </Button>
      </View>
    </Modal>
  );
};

width = Dimensions.get("window").width;
height = Dimensions.get("window").height;

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
    color: Colors.primary,
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
    height: 400,
    marginBottom: 30,
  },
  addButton: {
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#00CDBC",
  },
});
