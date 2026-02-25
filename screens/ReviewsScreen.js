import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { IconButton, Button, Icon } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../config/firebase";
import { collection, getDocs, where, query } from "@firebase/firestore";
import { ui } from "../config/designSystem";
import styles from "./styles";
import { CommentModal } from "../components/CommentModal";

const StarRow = ({ rating = 0, size = 18, color = "#00CDBC" }) => {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          source={i <= rounded ? "star" : "star-outline"}
          size={size}
          color={color}
        />
      ))}
    </View>
  );
};

export const ReviewsScreen = ({ route }) => {
  const { restaurant } = route.params;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = async (restaurantName) => {
    try {
      const commentsCollection = collection(db, "comments");
      const q = query(
        commentsCollection,
        where("restaurantName", "==", restaurantName),
      );
      const querySnapshot = await getDocs(q);

      const commentsData = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });

      setTotalComments(commentsData.length);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments from Firestore:", error);
    }
  };

  useEffect(() => {
    fetchComments(restaurant.restaurantName);
  }, [restaurant.restaurantName]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const capitalizeFirstWord = (sentence) => {
    if (!sentence) return "";
    return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
  };

  const toggleReviewExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{restaurant.restaurantName}</Text>

      {/* ⭐ Restaurant Rating */}
      <View style={styles.ratingContainer}>
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingValue}>{restaurant.rating}</Text>
          <View style={styles.rating}>
            <StarRow rating={restaurant.rating} size={18} />
          </View>
        </View>
        <Text style={styles.reviewCount}>{totalComments} reviews</Text>
      </View>

      {comments.length > 0 && (
        <View>
          <ScrollView style={{ height: "80%", marginTop: 20 }}>
            {(isExpanded ? comments : comments.slice(0, 4)).map(
              (comment, index) => (
                <View key={index} style={styles.review}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.reviewName}>{comment.userName}</Text>

                    {/* ⭐ Comment Rating */}
                    <StarRow rating={comment.restaurantRating} size={15} />
                  </View>

                  <Text style={styles.reviewText}>
                    {capitalizeFirstWord(comment.comment)}
                  </Text>

                  <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                    <IconButton icon="thumb-up" size={20} color="#00CDBC" />
                    <IconButton icon="thumb-down" size={20} color="#00CDBC" />
                  </View>
                </View>
              ),
            )}

            {comments.length > 4 && (
              <IconButton
                style={styles.toggleButton}
                icon={isExpanded ? "chevron-up" : "chevron-down"}
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
          style={{ backgroundColor: ui.colors.black, marginTop: 20 }}
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
