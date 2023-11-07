import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Button,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SelectCuisinesModal = ({ onClose }) => {
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const maxSelections = 5; // Maximum selections allowed
  const cuisinesRef = useRef({});

  const allCuisines = [
    { id: 1, name: "Italian" },
    { id: 2, name: "Mexican" },
    { id: 3, name: "Chinese" },
    { id: 4, name: "Indian" },
    { id: 5, name: "Japanese" },
    { id: 6, name: "Thai" },
    { id: 7, name: "Mediterranean" },
    { id: 8, name: "French" },
    { id: 9, name: "Greek" },
    { id: 10, name: "Korean" },
    { id: 11, name: "Spanish" },
    { id: 12, name: "Vietnamese" },
    { id: 13, name: "Lebanese" },
    { id: 14, name: "Turkish" },
    { id: 15, name: "Brazilian" },
    { id: 16, name: "Ethiopian" },
    { id: 17, name: "Caribbean" },
    { id: 18, name: "American" },
    { id: 19, name: "Peruvian" },
    { id: 20, name: "Moroccan" },
    { id: 21, name: "African" },
    { id: 22, name: "Portuguese" },
    { id: 23, name: "Swedish" },
    { id: 24, name: "Russian" },
    { id: 25, name: "German" },
    { id: 26, name: "Irish" },
    { id: 27, name: "British" },
    { id: 28, name: "Scottish" },
    { id: 29, name: "Australian" },
    { id: 30, name: "New Zealand" },
    { id: 31, name: "Dutch" },
    { id: 32, name: "Belgian" },
    { id: 33, name: "Cuban" },
    { id: 34, name: "Jamaican" },
    { id: 35, name: "Hawaiian" },
    { id: 36, name: "Polish" },
    { id: 37, name: "Ukrainian" },
    { id: 38, name: "Norwegian" },
    { id: 39, name: "Finnish" },
    { id: 40, name: "Argentinian" },
    { id: 41, name: "Chilean" },
    { id: 42, name: "Bulgarian" },
    { id: 43, name: "Romanian" },
    { id: 44, name: "Hungarian" },
    { id: 45, name: "Malaysian" },
    { id: 46, name: "Singaporean" },
    { id: 47, name: "Indonesian" },
    { id: 48, name: "Israeli" },
    { id: 49, name: "Egyptian" },
    { id: 50, name: "South African" },
  ];

  const animatedValues = useRef(allCuisines.map(() => new Animated.Value(0)));

  useEffect(() => {
    animateOptions();
  }, []);

  const animateOptions = () => {
    const animations = allCuisines.map((_, index) => {
      return Animated.timing(animatedValues.current[index], {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      });
    });

    Animated.stagger(100, animations).start();
  };

  const handleCuisineSelection = (cuisineId) => {
    let updatedCuisines = [...selectedCuisines];

    if (updatedCuisines.includes(cuisineId)) {
      updatedCuisines = updatedCuisines.filter((cuisine) => cuisine !== cuisineId);
    } else if (updatedCuisines.length < maxSelections) {
      updatedCuisines.push(cuisineId);
      animateCuisine(cuisineId);
    } else {
      return;
    }

    setSelectedCuisines(updatedCuisines);
  };

  const animateCuisine = (cuisineId) => {
    cuisinesRef.current[cuisineId] = new Animated.Value(0);

    Animated.sequence([
      Animated.timing(cuisinesRef.current[cuisineId], {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(cuisinesRef.current[cuisineId], {
        toValue: 2,
        duration: 1000,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      }),
    ]).start(() => {
      cuisinesRef.current[cuisineId] = new Animated.Value(2);
    });
  };

  const renderCuisine = (cuisine) => {
    const isSelected = selectedCuisines.includes(cuisine.id);

    return (
      <TouchableOpacity
        key={cuisine.id}
        style={{
          padding: 10,
          margin: 5,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: isSelected ? "red" : "#00CDBC",
          backgroundColor: isSelected ? "red" : "#00CDBC",
          transform: [
            { scale: isSelected ? 1.1 : 1 },
          ],
        }}
        onPress={() => handleCuisineSelection(cuisine.id)}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: isSelected ? "bold" : "normal",
          }}
        >
          {cuisine.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSubmit = () => {
    console.log("Selected Cuisines:", selectedCuisines);
    onClose();
  };

  return (
    <SafeAreaView style={{flex:'1', backgroundColor:'white', marginTop:40}} >
      <ScrollView contentContainerStyle={{ alignItems: "center" }}>
        <Text style={{ textAlign: "center", fontSize: 20, marginTop: 10 }}>
          Select up to 5 Cuisines
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {allCuisines.map((cuisine) => renderCuisine(cuisine))}
        </View>
        <Button title="Submit" onPress={handleSubmit} />
        <Button title="Close Modal" onPress={onClose} />

        {selectedCuisines.map((cuisineId) => (
          <Animated.View
            key={cuisineId}
            style={{
              position: "absolute",
              transform: [
                {
                  translateY: cuisinesRef.current[cuisineId].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -200],
                  }),
                },
                {
                  scale: cuisinesRef.current[cuisineId].interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {allCuisines.find((cuisine) => cuisine.id === cuisineId)?.name}
            </Text>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectCuisinesModal;
