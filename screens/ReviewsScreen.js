import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from 'react-native-star-rating';
import { getFirestore, collection, getDocs, where, query } from 'firebase/firestore';
import { Colors } from '../config';
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
          <Text style={styles.ratingValue}>{restaurant.rating}</Text>
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
          <ScrollView style={{ height: 'auto' }}>
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
                    </View>
                  );
                })}
          </ScrollView>
        </View>
      )}
      <View>
        <Button
          mode="contained"
          style={{ backgroundColor: Colors.black }}
          title="Add Comment"
          onPress={toggleModal}
        >
          Add Comment
        </Button>
        {comments.length > 0 && (
          <IconButton
            style={styles.toggleButton}
            icon={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={30}
            onPress={toggleReviewExpansion}
          />
        )}
      </View>
      <CommentModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        restaurantName={restaurant.restaurantName}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 30,
    fontWeight: '800',
    marginRight: 10,
  },
  reviewCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: 'black',
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  reviewText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#111',
  },
  reviewName: {
    fontSize: 18,
    color: '#111',
  },
  review: {
    marginBottom: 20,
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 8,
  },
});
