import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';

const TripAdvisor = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const apiKey = 'YOUR_TRIPADVISOR_API_KEY';
      const response = await fetch(`https://api.tripadvisor.com/partner-api/v2/restaurant/${restaurantId}/reviews?key=${apiKey}`);
      const data = await response.json();

      setReviews(data.reviews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>TripAdvisor Reviews</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.reviewId}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>Rating: {item.rating}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default TripAdvisor;
