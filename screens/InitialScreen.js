import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';

export const InitialScreen = ({ navigation }) => {
  return (
    <ImageBackground
    source={require('../assets/bigburger.png')}
    style={styles.backgroundImage}
    imageStyle={{resizeMode:'contain'}}
  >
    <View style={styles.container}>
      <Text style={styles.title}>Dishision</Text>
      <Text style={styles.tagline}>Decision Easier</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor:"#E6AD00",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: '100%',
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    position: 'absolute',
    top: 50,
    left: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
    position: 'absolute',
    top: 140,
    left: 23,
  },
  buttonContainer: {
    position: 'absolute',
    bottom:100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    transform: [{ translateY: 0 }],
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    margin: 10,
    elevation: 3,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default styles;

