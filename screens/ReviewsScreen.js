import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from 'react-native-star-rating';
import { ProgressChart } from 'react-native-chart-kit';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Colors } from '../config';
import { CommentModal } from '../components/CommentModal';

export const ReviewsScreen = ({ route }) => {
  const { foodItem } = route.params;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);

  const db = getFirestore();

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
  
    // Get the day, month, and year
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
  
    // Combine them into a formatted string
    return `${day} ${month} ${year}`;
  };

  const fetchComments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'comments'));
      const commentsData = [];
      querySnapshot.forEach((doc) => {
        const commentData = { id: doc.id, ...doc.data() };
        if (commentData.restaurantName && commentData.restaurantName.toLowerCase() === foodItem.name.toLowerCase()) {
          commentsData.push(commentData);
        }
        console.log(commentData.restaurantName);
        console.log(commentData.userName);
        console.log(commentData.restaurantRating);
      });
      setTotalComments(commentsData.length);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments from Firestore:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const addComment = (commentData) => {
    setComments([...comments, commentData]);
  };

  const starCounts = [0, 0, 0, 0, 0];
  foodItem.reviews.forEach((review) => {
    if (review.starRating >= 1 && review.starRating <= 5) {
      starCounts[5 - review.starRating]++;
    }
  });

  const data = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    data: starCounts.map((count) => count / foodItem.reviews.length),
  };

  const capitalizeFirstWord = (sentence) => {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
  };

  const toggleReviewExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{foodItem.name}</Text>
      <View style={styles.ratingContainer}>
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingValue}>{foodItem.rating}</Text>
          <StarRating
            disabled={true}
            maxStars={5}
            rating={foodItem.rating}
            fullStarColor="#00CDBC"
            starSize={18}
          />
        </View>
        <Text style={styles.reviewCount}>{totalComments} reviews</Text>
      </View>
      <View style={styles.chartContainer}>
        <ProgressChart
          data={data}
          width={Dimensions.get('window').width}
          height={180}
          strokeWidth={5}
          radius={25}
          chartConfig={{
            backgroundColor: '#111',
            backgroundGradientFrom: '#111',
            backgroundGradientTo: '#111',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 240, 255, ${opacity})`,
            style: {
              borderRadius: 0,
            },
          }}
          hideLegend={false}
        />
      </View>

      {comments.length > 0 && (
        <View>
          <Text style={styles.reviewTitle}>All Reviews</Text>
          <ScrollView style={{ height: 320 }}>
            {isExpanded
              ? comments.map((comment, index) => {
                  return (
                    <View key={index} style={styles.review}>
                      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                         <Text style={styles.reviewName}>{comment.userName}</Text>
                         <StarRating disabled starSize={15} maxStars={5} rating={comment.restaurantRating} fullStarColor="#00CDBC"/>
                      </View>
                      <Text style={styles.reviewText}>{capitalizeFirstWord(comment.comment)}</Text>
                      <Text style={{marginTop:20}}>{formatDate(comment.date)}</Text>
                    </View>
                    
                  );
                })
              : comments.slice(0, 2).map((comment, index) => {
                  return (
                    <View key={index} style={styles.review}>
                      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                         <Text style={styles.reviewName}>{comment.userName}</Text>
                         <StarRating disabled starSize={15} maxStars={5} rating={comment.restaurantRating} fullStarColor="#00CDBC"/>
                      </View>
                      <Text style={styles.reviewText}>{capitalizeFirstWord(comment.comment)}</Text>
                      <Text style={{marginTop:20}}>{formatDate(comment.date)}</Text>
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
              <CommentModal isVisible={isModalVisible} 
                onClose={toggleModal} onAddComment={addComment} 
                restaurantName={foodItem.name}/>
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
  reviewsContainer: {
    marginTop: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: 'black',
  },
  addButton: {
    backgroundColor: 'black',
    marginTop: 10,
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  reviewText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#111',
    marginTop: 10,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  reviewName: {
    fontSize:18,
    color: '#111',
  },
  review: {
    marginBottom: 20,
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});
