import React, { useState, useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ScrollView } from 'react-native-gesture-handler';
import { List, useTheme } from 'react-native-paper';

const RestaurantMenu = ({ restaurantName }) => {
  const [restaurantData, setRestaurantData] = useState([]);
  const theme = useTheme(); // Access the theme object

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const restaurantRef = collection(db, 'restaurant');
        const q = query(restaurantRef, where('restaurantName', '==', restaurantName));
        const querySnapshot = await getDocs(q);

        const data = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });

        setRestaurantData(data);
      } catch (error) {
        console.error('Error retrieving restaurant data:', error);
      }
    };

    if (restaurantName) {
      fetchRestaurantData();
    }
  }, [restaurantName]);

  return (
    <ScrollView style={{ margin: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        {restaurantName} Menu
      </Text>
      {restaurantData.map((item, index) => (
        <List.Accordion key={index} title="Starter" style={{backgroundColor: "#111", marginBottom:3}} titleStyle={{color:'#fff'}}>
          {item.starters.map((starter, starterIndex) => (
            <List.Item
              key={starterIndex}
              title={
              <View>
                <Text style={{ fontSize: 18, color: 'white', fontWeight:'900'}}>{starter.name}</Text>
                  <Text style={{ fontSize: 18, color: 'white', fontWeight:'800' }}>{starter.price}</Text>
              </View>}
              description={`${starter.description}`}
              style={{ backgroundColor: "#00CDBC", margin:2 }}
              titleStyle={{color:'white', fontSize:20, marginBottom:10}}
              descriptionNumberOfLines={4}
              descriptionStyle={{color:'teal'}}
            />
          ))}
        </List.Accordion>
      ))}
      {restaurantData.map((item, index) => (
        <List.Accordion key={index} title="Mains" style={{backgroundColor: "#111", marginBottom:3}} titleStyle={{color:'#fff'}}>
          {item.mains.map((mains, starterIndex) => (
            <List.Item
              key={starterIndex}
              title={
              <View>
                <Text style={{ fontSize: 18, color: 'white', fontWeight:'900' }}>{mains.name}</Text> 
                <Text style={{ fontSize: 18, color: 'white', fontWeight:'800' }}>{mains.price}</Text>
              </View>}
              description={`${mains.description}`}
              style={{ backgroundColor: "#00CDBC", margin:2 }}
              descriptionNumberOfLines={4}
              titleStyle={{color:'white', fontSize:20, marginBottom:10}}
              descriptionStyle={{color:'teal'}}
            />
          ))}
        </List.Accordion>
      ))}
      {restaurantData.map((item, index) => (
        <List.Accordion key={index} title="Desserts" style={{backgroundColor: "#111", marginBottom:3}} titleStyle={{color:'#fff'}}>
          {item.desserts.map((desserts, starterIndex) => (
            <List.Item
              key={starterIndex}
              title={
                <View>
                  <Text style={{ fontSize: 18, color: 'white', fontWeight:'900' }}>{desserts.name}</Text> 
                  <Text style={{ fontSize: 18, color: 'white', fontWeight:'800' }}>{desserts.price}</Text>
                </View>}
              description={`${desserts.description}`}
              descriptionNumberOfLines={4}
              style={{ backgroundColor: "#00CDBC", margin:2 }}
              titleStyle={{color:'white', fontSize:20, marginBottom:10}}
              descriptionStyle={{color:'teal'}}
              
            />
          ))}
        </List.Accordion>
      ))}
      {restaurantData.map((item, index) => (
        <List.Accordion key={index} title="Drinks" style={{backgroundColor: "#111", marginBottom:3}} titleStyle={{color:'#fff'}}>
          {item.drinks.map((drink, starterIndex) => (
            <List.Item
              key={starterIndex}
              title={
                <View>
                  <Text style={{ fontSize: 18, color: 'white', fontWeight:'900' }}>{drink.name}</Text> 
                  <Text style={{ fontSize: 18, color: 'white', fontWeight:'800' }}>{drink.price}</Text>
                </View>}
              description={`${drink.description}`}
              descriptionNumberOfLines={4}
              style={{ backgroundColor: "#00CDBC", margin:2 }}
              titleStyle={{color:'white', fontSize:20, marginBottom:10}}
              descriptionStyle={{color:'teal'}}
              
            />
          ))}
        </List.Accordion>
      ))}
    </ScrollView>
  );
};

export default RestaurantMenu;
