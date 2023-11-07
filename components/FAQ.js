import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const FAQ = () => {
  const faqData = [
    {
      question: "What does the food menu searching app offer?",
      answer:
        "Our food menu searching app uses AI and location services to help users discover nearby restaurants, view menus, and assist in food choices.",
    },
    {
      question: "How does the app use AI in the food search process?",
      answer:
        "The app employs AI to provide personalized menu suggestions based on user preferences, previous orders, and current location.",
    },
    {
      question: "What type of location services does the app use?",
      answer:
        "The app uses GPS and geolocation services to determine your current location and provide restaurant recommendations in your vicinity.",
    },
    {
      question: "What APIs does the app use?",
      answer:
        "We use Google Search API for location-based restaurant searches and ChatGPT 3.5 for enhancing user experience through chat-based interactions.",
    },
    {
      question: "How much does the app cost?",
      answer:
        "The app offers a subscription plan at £2 per month, giving you access to premium features and enhanced food recommendations.",
    },
    {
      question: "Is the subscription renewed automatically?",
      answer:
        "Yes, the subscription is set for auto-renewal every month until you cancel it. You can manage your subscription in the app settings.",
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer:
        "Absolutely! You have the freedom to cancel your subscription at any time, and you will have access to the premium features until the end of the billing cycle.",
    },
    {
      question: "How accurate are the menu recommendations?",
      answer:
        "The app uses a combination of AI algorithms and user preferences to generate menu suggestions, striving for a high level of accuracy based on individual tastes and location.",
    },
    {
      question: "Are there any limitations on API usage?",
      answer:
        "We encourage users to utilize the app responsibly. There are fair usage policies in place to ensure optimal performance and access to the services.",
    },
    {
      question: "How can I get support for the app?",
      answer:
        "For any app-related queries or support, please reach out to our customer support team via the app settings or our website.",
    },
    // Add more FAQs if needed
  ];

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpansion = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {faqData.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity onPress={() => toggleExpansion(index)}>
              <Text style={styles.question}>{faq.question}</Text>
            </TouchableOpacity>
            {expandedIndex === index && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  faqItem: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  answer: {
    marginTop: 10,
    color: "#666",
  },
});

export default FAQ;
