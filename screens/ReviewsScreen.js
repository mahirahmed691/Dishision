import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from 'react-native-star-rating';
import { getFirestore, collection, getDocs, where, query } from 'firebase/firestore';
import { Colors } from '../config';
import styles from './styles';
import { CommentModal } from '../components/CommentModal';

export const ReviewsScreen = ({ route }) => {
  const { restaurant } = route.params;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);

  const db = getFirestore();

  const fetchComments = async (restaurantName) => {
    try {
      const commentsCollection = collection(db, 'comments'); // Use your actual collection name
      const q = query(commentsCollection, where('restaurantName', '==', restaurantName));
      const querySnapshot = await getDocs(q);
      
      const commentsData = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });
  
      setTotalComments(commentsData.length);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments from Firestore:', error);
    }
  };

  useEffect(() => {
    fetchComments(restaurant.restaurantName);
  }, [restaurant.restaurantName]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const capitalizeFirstWord = (sentence) => {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
  };

  const toggleReviewExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{restaurant.restaurantName}</Text>
      <View style={styles.ratingContainer}>
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingValue}></Text>
          <StarRating
            disabled={true}
            maxStars={5}
            rating={restaurant.rating}
            fullStarColor="#00CDBC"
            starSize={18}
          />
        </View>
        <Text style={styles.reviewCount}>{totalComments} reviews</Text>
      </View>

      {comments.length > 0 && (
        <View>
          <Text style={styles.reviewTitle}>All Reviews</Text>
        <ScrollView style={{ height:540}}>
            {isExpanded
              ? comments.map((comment, index) => {
                  return (
                    <View key={index} style={styles.review}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.reviewName}>{comment.userName}</Text>
                        <StarRating
                          disabled
                          starSize={15}
                          maxStars={5}
                          rating={comment.restaurantRating}
                          fullStarColor="#00CDBC"
                        />
                      </View>
                      <Text style={styles.reviewText}>{capitalizeFirstWord(comment.comment)}</Text>
                      <View style={{ flexDirection: 'row', alignSelf:'flex-end' }}>
                        <IconButton icon="thumb-up" size={20} color="#00CDBC" />
                        <IconButton icon="thumb-down" size={20} color="#00CDBC" />
                      </View>
                    </View>
                  );
                })
              : comments.slice(0, 4).map((comment, index) => {
                  return (
                    <View key={index} style={styles.review}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.reviewName}>{comment.userName}</Text>
                        <StarRating
                          disabled
                          starSize={15}
                          maxStars={5}
                          rating={comment.restaurantRating}
                          fullStarColor="#00CDBC"
                        />
                      </View>
                      <Text style={styles.reviewText}>{capitalizeFirstWord(comment.comment)}</Text>
                      <View style={{ flexDirection: 'row', alignSelf:'flex-end' }}>
                        <IconButton icon="thumb-up" size={20} color="#00CDBC" />
                        <IconButton icon="thumb-down" size={20} color="#00CDBC" />
                      </View>
                    </View>
                  );
                })}
                   {comments.length > 4 && (
                    <IconButton
                      style={styles.toggleButton}
                      icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={30}
                      onPress={toggleReviewExpansion}
                    />
                  )}
          </ScrollView>
        </View>
      )}
      <View>
        <Button
          mode="contained"
      style={{ backgroundColor: Colors.black, marginTop: 20,}}
          title="Add Comment"
          onPress={toggleModal}
        >
          Add Comment
        </Button>
      </View>
      <CommentModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        restaurantName={restaurant.restaurantName}
      />
    </SafeAreaView>
  );
};


