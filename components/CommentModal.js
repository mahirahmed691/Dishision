import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import { IconButton, Button, TextInput } from 'react-native-paper';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import StarRating from 'react-native-star-rating';
import { Colors } from '../config';

export const CommentModal = ({ isVisible, onClose, onAddComment, restaurantName }) => {
  const [userName, setUserName] = useState('');
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [comment, setComment] = useState('');

  const db = getFirestore();
  
  const addComment = () => {
    const commentData = {
      userName,
      restaurantRating,
      comment,
      date: new Date().toISOString(),
      restaurantName, 
    };
  
    addDoc(collection(db, 'comments'), commentData)
      .then((docRef) => {
        setUserName('');
        setRestaurantRating(0);
        setComment('');
        onClose();
        // Call the callback function to update the parent component's state
        onAddComment(commentData);
      })
      .catch((error) => {
        // Handle error
        console.error('Error adding comment to Firestore:', error);
      });
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.container}>
        <IconButton
          icon="close"
          style={styles.closeButton}
          mode='contained'
          onPress={onClose}>
          Close
        </IconButton>
        <Text style={styles.title}>Add a Comment</Text>
        <TextInput
          style={styles.input}
          mode='outlined'
          placeholder="Your Name"
          placeholderTextColor={Colors.textSecondary}
          value={userName}
          onChangeText={(text) => setUserName(text)}
        />
        <Text style={styles.label}>Restaurant Rating (1-5):</Text>
        <StarRating
          maxStars={5}
          rating={restaurantRating}
          fullStarColor={Colors.primary}
          emptyStarColor={Colors.textSecondary}
          starSize={32}
          selectedStar={(rating) => setRestaurantRating(rating)}
        />
        <TextInput
          style={styles.commentInput}
          mode='outlined'
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
          color={Colors.primary}
        >
          Add Comment
        </Button>
      </View>
    </Modal>
  );
};

width = Dimensions.get('window').width;
height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'transparent',
    color: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.primary,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '700',
    color: Colors.primary,
  },
  commentInput: {
    marginTop: 20,
    height: 200,
    marginBottom: 30,
  },
  addButton: {
    paddingVertical: 10,
    borderRadius: 8,
  },
});
