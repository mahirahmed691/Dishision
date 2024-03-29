import React from 'react';
import { View, StyleSheet, Dimensions, Linking , TouchableOpacity, Text, Platform, Image,} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Button } from 'react-native-paper';
import { Icon } from 'react-native-elements';
import { openMap, createOpenLink, createMapLink } from 'react-native-open-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import HygieneRating from '../components/HygieneRating';
import styles from './styles';

export const MapScreen = ({route}) => {
  const {restaurant} = route.params;
  const {width, height} = Dimensions.get('window');
  
  const map = { latitude: restaurant.lat, longitude: restaurant.long };
  console.log(restaurant.hygieneRating)
  const openMapZoomedOut = createOpenLink({ ...map, zoom: 18, provider:'apple' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={{margin:20}}>
        <Text style={{fontSize:20, fontWeight:'700'}}>Hygiene rating</Text>
        <Text style={{marginTop:10}}>The Food Standards Agency updates food hygiene ratings regularly. 
         Visit the FSA's website to see the recent for this partner. {"\n"}
        </Text>

        <HygieneRating hygieneRating={restaurant.hygiene} />
        <View style={{flexDirection:'row', alignItems:'baseline'}}>
          <Icon name="language"/>
          <Text style={{
            fontSize:15, color:'#00CDBC', 
            paddingVertical:6, marginLeft:10,
             textDecorationLine: "underline", 
             textDecorationStyle: "solid", }}
          onPress={() => Linking.openURL(restaurant.link)}
          >
            View hygiene rating
          </Text>
        </View>
      </View>
      <View style={{alignSelf:'center', marginTop:10}}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          pitchEnabled={false}
          zoomEnabled={false}
          scrollEnabled={false}
          rotateEnabled={false}
          initialRegion={{
            latitude: restaurant.lat, 
            longitude: restaurant.long, 
            latitudeDelta: 0.00358723958820065,
            longitudeDelta: 0.00250270688370961
            
          }}
        >
          <Marker
            title={restaurant.name}
            description={restaurant.description}
          />
        </MapView>
      </View>
      <View style={{margin:10,}}>
        <Text>{restaurant.location}</Text>
      <TouchableOpacity>
        <Button 
        onPress={openMapZoomedOut}
        icon="map"
          style={{width:width/3, backgroundColor:'#00CDBC', marginTop:10}}       
          theme={{
            roundness:0,
            
          }}
          mode='contained'
        >
          
          <Text>Open Map</Text>
        </Button>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


