import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { ScrollView } from "react-native-gesture-handler";
import { List, useTheme } from "react-native-paper";

const RestaurantMenu = ({ restaurantName }) => {
  const [restaurantData, setRestaurantData] = useState([]);
  const [expandedList, setExpandedList] = useState(null); // Track the currently expanded list
  const theme = useTheme(); // Access the theme object

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const restaurantRef = collection(db, "restaurant");
        const q = query(
          restaurantRef,
          where("restaurantName", "==", restaurantName)
        );
        const querySnapshot = await getDocs(q);

        const data = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });

        setRestaurantData(data);
      } catch (error) {
        console.error("Error retrieving restaurant data:", error);
      }
    };

    if (restaurantName) {
      fetchRestaurantData();
    }
  }, [restaurantName]);

  const toggleList = (listName) => {
    if (expandedList === listName) {
      // If the clicked list is already expanded, close it
      setExpandedList(null);
    } else {
      setExpandedList(listName); // Expand the clicked list
    }
  };

  return (
    <SafeAreaView>
      <ScrollView style={{ margin: 10, height: "80%" }}>
        <Text style={{ fontSize: 30, fontWeight: "700", marginBottom: 10, letterSpacing:1, marginLeft:5 }}>
          {restaurantName} Menu
        </Text>
        {restaurantData.map((item, index) => (
          <List.Accordion
            key={index}
            title="STARTERS"
            expanded={expandedList === "Starters"}
            style={{ backgroundColor: "#00CBDC", marginBottom: 10, width:"98%", alignSelf:"center" }}
            titleStyle={{ color: "#fff", fontWeight: "900", fontSize:18, letterSpacing:2 }}
            onPress={() => toggleList("Starters")}
          >
            {item.starters.map((starter, starterIndex) => (
              <List.Item
                key={starterIndex}
                title={
                  <View>
                    <Text
                      style={{
                        fontSize: 18,
                        color: "#00CBDC",
                        fontWeight: "900",
                      }}
                    >
                      {starter.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        marginTop: 5,
                        color: "black",
                        fontWeight: "600",
                      }}
                    >
                      {starter.price}
                    </Text>
                  </View>
                }
                description={`${starter.description}`}
                style={{
                  backgroundColor: "#fff",
                  margin: 2,
                  borderWidth: 1,
                  borderColor: "#00CBDC",
                }}
                titleStyle={{ color: "white", fontSize: 20, marginBottom: 10 }}
                descriptionNumberOfLines={4}
                descriptionStyle={{ color: "teal" }}
              />
            ))}
          </List.Accordion>
        ))}
        {restaurantData.map((item, index) => (
          <List.Accordion
            key={index}
            title="MAINS"
            expanded={expandedList === "Mains"}
            style={{ backgroundColor: "#00CBDC", marginBottom: 10, width:"98%", alignSelf:"center" }}
            titleStyle={{ color: "#fff", fontWeight: "900", fontSize:18, letterSpacing:2 }}
            onPress={() => toggleList("Mains")}
          >
            {item.mains.map((mains, starterIndex) => (
              <List.Item
                key={starterIndex}
                title={
                  <View>
                    <Text
                      style={{
                        fontSize: 18,
                        color: "#00CBDC",
                        fontWeight: "900",
                      }}
                    >
                      {mains.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        marginTop: 5,
                        color: "black",
                        fontWeight: "600",
                      }}
                    >
                      {mains.price}
                    </Text>
                  </View>
                }
                description={`${mains.description}`}
                descriptionNumberOfLines={4}
                style={{
                  backgroundColor: "#fff",
                  margin: 2,
                  borderWidth: 1,
                  borderColor: "#00CBDC",
                }}
                titleStyle={{ color: "white", fontSize: 20, marginBottom: 10 }}
                descriptionStyle={{ color: "teal" }}
              />
            ))}
          </List.Accordion>
        ))}
        {restaurantData.map((item, index) => (
          <List.Accordion
            key={index}
            title="DESSERTS"
            expanded={expandedList === "Desserts"}
            style={{ backgroundColor: "#00CBDC", marginBottom: 10, width:"98%", alignSelf:"center" }}
            titleStyle={{ color: "#fff", fontWeight: "900", fontSize:18, letterSpacing:2 }}
            onPress={() => toggleList("Desserts")}
          >
            {item.desserts.map((desserts, starterIndex) => (
              <List.Item
                key={starterIndex}
                title={
                  <View>
                    <Text
                      style={{
                        fontSize: 18,
                        color: "#00CBDC",
                        fontWeight: "900",
                      }}
                    >
                      {desserts.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        marginTop: 5,
                        color: "black",
                        fontWeight: "600",
                      }}
                    >
                      {desserts.price}
                    </Text>
                  </View>
                }
                description={`${desserts.description}`}
                descriptionNumberOfLines={4}
                style={{
                  backgroundColor: "#fff",
                  margin: 2,
                  borderWidth: 1,
                  borderColor: "#00CBDC",
                }}
                titleStyle={{ color: "white", fontSize: 20, marginBottom: 10 }}
                descriptionStyle={{ color: "teal" }}
              />
            ))}
          </List.Accordion>
        ))}
        {restaurantData.map((item, index) => (
          <List.Accordion
            key={index}
            title="DRINKS"
            expanded={expandedList === "Drinks"}
            style={{ backgroundColor: "#00CBDC", marginBottom: 10, width:"98%", alignSelf:"center" }}
            titleStyle={{ color: "#fff", fontWeight: "900", fontSize:18, letterSpacing:2 }}
            onPress={() => toggleList("Drinks")}
          >
            {item.drinks.map((drink, starterIndex) => (
              <List.Item
                key={starterIndex}
                title={
                  <View>
                    <Text
                      style={{
                        fontSize: 18,
                        color: "#00CBDC",
                        fontWeight: "900",
                      }}
                    >
                      {drink.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        marginTop: 5,
                        color: "black",
                        fontWeight: "600",
                      }}
                    >
                      £{drink.price}
                    </Text>
                  </View>
                }
                description={`${drink.description}`}
                descriptionNumberOfLines={4}
                style={{
                  backgroundColor: "#fff",
                  margin: 2,
                  borderWidth: 1,
                  borderColor: "#00CBDC",
                }}
                titleStyle={{ color: "white", fontSize: 20, marginBottom: 10 }}
                descriptionStyle={{ color: "teal" }}
              />
            ))}
          </List.Accordion>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RestaurantMenu;
