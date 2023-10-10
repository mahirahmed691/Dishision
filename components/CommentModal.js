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
      restaurantName, // Pass restaurantName from props
    };
  
    // Use Firestore to add the comment to the "comments" collection
    addDoc(collection(db, 'comments'), commentData)
      .then((docRef) => {
        // Comment added successfully
        console.log('Comment added to Firestore with ID: ', docRef.id);
        // Clear input fields after adding a comment
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
          <IconButton Button icon="close" style={{position:'absolute', top:50, left:20}} mode='contained' onPress={onClose}>
            Close
          </IconButton>
        <Text style={styles.title}>Add a Comment</Text>
        <TextInput
          style={styles.input}
          mode='outlined'
          placeholder="Your Name"
          placeholderTextColor="black"
          value={userName}
          onChangeText={(text) => setUserName(text)}
          theme={{colors: {primary: Colors.green, underlineColor: 'transparent'}}}
        />
        <Text style={styles.label}>Restaurant Rating (1-5):</Text>
        <StarRating
          maxStars={5}
          rating={restaurantRating}
          fullStarColor={Colors.green}
          starSize={25}
          selectedStar={(rating) => setRestaurantRating(rating)}
        />
        <TextInput
          style={styles.commentInput}
          mode='outlined'
          placeholder="Your Comment"
          placeholderTextColor="black"
          value={comment}
          onChangeText={(text) => setComment(text)}
          multiline
          theme={{colors: {primary: Colors.green, underlineColor: 'transparent'}}}
        />
        <View style={{flexDirection:'row', justifyContent:'space-around'}}>
          <Button
            mode="contained"
            style={{ backgroundColor: Colors.black }}
            title="Add Comment"
            onPress={addComment}
          >
            Add Comment
          </Button>
        </View>
      </View>
    </Modal>
  );
};

width = Dimensions.get('window').width;
height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    margin: 20,
    flex: 1,
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center', // Center content vertically
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight:'700'
  },
  commentInput: {
    marginTop:20,
    height:300,
    marginBottom: 30,
  },
});
