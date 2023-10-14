import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Input, CheckBox, Icon, Image, } from 'react-native-elements';
import { Button } from 'react-native-paper';
import Modal from 'react-native-modal';
import { addDoc, collection, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

const RestaurantForm = ({ isVisible, onClose, restaurantToEdit, setRestaurantFormMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const formTitle = isEditing ? 'Edit Restaurant' : 'Add Restaurant';

  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [hygiene, setHygiene] = useState('');
  const [halal, setHalal] = useState(false);
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);
  const [vegan, setVegan] = useState(false);
  const [cuisine, setCuisine] = useState('');
  const [logo, setLogo] = useState('');
  const [rating, setRating] = useState(0);
  const [logoPreview, setLogoPreview] = useState('');

  const [starters, setStarters] = useState([{ name: '', price: 0 }]);
  const [mains, setMains] = useState([{ name: '', price: 0 }]);
  const [desserts, setDesserts] = useState([{ name: '', price: 0 }]);
  const [drinks, setDrinks] = useState([{ name: '', price: 0 }]);

  const [starterDescriptions, setStarterDescriptions] = useState(['']);
  const [mainDescriptions, setMainDescriptions] = useState(['']);
  const [dessertDescriptions, setDessertDescriptions] = useState(['']);
  const [drinkDescriptions, setDrinkDescriptions] = useState(['']);

  useEffect(() => {
    if (restaurantToEdit) {
      setIsEditing(true);
      setEditingIndex(restaurantToEdit.index);

      setRestaurantName(restaurantToEdit.restaurantName);
      setAddress(restaurantToEdit.address);
      setHygiene(restaurantToEdit.hygiene.toString());
      setHalal(restaurantToEdit.halal);
      setLat(restaurantToEdit.lat.toString());
      setLong(restaurantToEdit.long.toString());
      setVegan(restaurantToEdit.vegan);
      setCuisine(restaurantToEdit.cuisine);
      setLogo(restaurantToEdit.logo);
      setRating(restaurantToEdit.rating.toString());
      setLogoPreview(restaurantToEdit.logo);

      // Populate menu items (starters, mains, desserts, drinks)
      setStarters(restaurantToEdit.starters);
      setMains(restaurantToEdit.mains);
      setDesserts(restaurantToEdit.desserts);
      setDrinks(restaurantToEdit.drinks);
    }
  }, [restaurantToEdit]);

  const handleAddRestaurant = async () => {
    if (!restaurantName || !address || !cuisine || !logo) {
      alert('Please fill in all required fields');
      return;
    }
  
    const newRestaurant = {
      restaurantName,
      address,
      hygiene: Number(hygiene),
      halal,
      lat: Number(lat),
      long: Number(long),
      vegan,
      cuisine,
      logo,
      rating: Number(rating),
      starters,
      mains,
      desserts,
      drinks,
    };
  
    try {
      const restaurantRef = collection(db, 'restaurant');
  
      if (isEditing) {
        const restaurantDocRef = doc(restaurantRef, restaurantToEdit.id);
        await updateDoc(restaurantDocRef, newRestaurant);
        alert('Restaurant updated successfully');
      } else {
        const restaurantDocRef = doc(restaurantRef, restaurantName); 
        await setDoc(restaurantDocRef, newRestaurant);
        alert('Restaurant added successfully');
      }
  
      clearForm();
      onClose();
    } catch (error) {
      console.error('Error adding/updating restaurant: ', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingIndex(null);
    clearForm();
    onClose();
  };

  const addStarter = () => {
    setStarters([...starters, { name: '', price: 0, descriptions: '' }]);
  };

  const removeStarter = (index) => {
    const updatedStarters = [...starters];
    updatedStarters.splice(index, 1);
    setStarters(updatedStarters);
  };

  const addMain = () => {
    setMains([...mains, { name: '', price: 0, descriptions: '' }]);
  };

  const removeMain = (index) => {
    const updatedMains = [...mains];
    updatedMains.splice(index, 1);
    setMains(updatedMains);
  };

  const addDessert = () => {
    setDesserts([...desserts, { name: '', price: 0, descriptions: '' }]);
  };

  const removeDessert = (index) => {
    const updatedDesserts = [...desserts];
    updatedDesserts.splice(index, 1);
    setDesserts(updatedDesserts);
  };

  const addDrink = () => {
    setDrinks([...drinks, { name: '', price: 0, descriptions: '' }]);
  };

  const removeDrink = (index) => {
    const updatedDrinks = [...drinks];
    updatedDrinks.splice(index, 1);
    setDrinks(updatedDrinks);
  };

  const updateItem = (category, index, field, value) => {
    const updatedCategory = [...category];
    updatedCategory[index][field] = value;
    if (field === 'price') {
      updatedCategory[index][field] = value.replace(/[^0-9.-]/g, '');
    }

    if (category === starters) {
      setStarters(updatedCategory);
    } else if (category === mains) {
      setMains(updatedCategory);
    } else if (category === desserts) {
      setDesserts(updatedCategory);
    } else if (category === drinks) {
      setDrinks(updatedCategory);
    }
  };

  const removeItem = (category, index) => {
    const updatedCategory = [...category];
    updatedCategory.splice(index, 1);

    if (category === starters) {
      setStarters(updatedCategory);
    } else if (category === mains) {
      setMains(updatedCategory);
    } else if (category === desserts) {
      setDesserts(updatedCategory);
    } else if (category === drinks) {
      setDrinks(updatedCategory);
    }
  };

  const clearForm = () => {
    setRestaurantName('');
    setAddress('');
    setHygiene('');
    setHalal(false);
    setLat(0);
    setLong(0);
    setVegan(false);
    setCuisine('');
    setLogo('');
    setRating(0);
    setLogoPreview('');
    setStarters([{ name: '', price: 0 }]);
    setMains([{ name: '', price: 0 }]);
    setDesserts([{ name: '', price: 0 }]);
    setDrinks([{ name: '', price: 0 }]);
  };

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <SafeAreaView style={styles.formContainer}>
        <Text style={styles.formTitle}>{formTitle}</Text>
          <Text style={styles.sectionTitle}>Restaurant</Text>
          <Input
            label="Restaurant Name"
            placeholder="Enter restaurant name"
            value={restaurantName}
            onChangeText={(text) => setRestaurantName(text)}
          />
          <Input
            label="Location"
            placeholder="Enter restaurant location"
            value={address}
            onChangeText={(text) => setAddress(text)}
          />
          <Input
            label="Hygiene Type (0-5)"
            placeholder="Enter hygiene type"
            value={hygiene}
            onChangeText={(text) => {
              const cleanedText = text.replace(/[^0-5]/g, '');
              setHygiene(cleanedText);
            }}
            keyboardType="numeric"
          />
          <CheckBox
            title="Is Halal?"
            checked={halal}
            onPress={() => setHalal(!halal)}
          />
          <Input
            label="Latitude"
            placeholder="Enter latitude"
            value={lat.toString()}
            onChangeText={(text) => {
              setLat(text.replace(/[^0-9.-]/g, ''));
            }}
            keyboardType="numeric"
          />
          <Input
            label="Longitude"
            placeholder="Enter longitude"
            value={long.toString()}
            onChangeText={(text) => {
              setLong(text.replace(/[^0-9.-]/g, ''));
            }}
            keyboardType="numeric"
          />
          <CheckBox
            title="Is Vegan-friendly?"
            checked={vegan}
            onPress={() => setVegan(!vegan)}
          />
          <Input
            label="Cuisine"
            placeholder="Enter cuisine type"
            value={cuisine}
            onChangeText={(text) => setCuisine(text)}
          />
          <Input
            label="Logo URL"
            placeholder="Enter logo URL"
            value={logo}
            onChangeText={(text) => setLogo(text)}
          />
          {logoPreview ? (
            <Image source={{ uri: logoPreview }} style={styles.logoPreview} />
          ) : null}
          <Button mode='outlined' onPress={() => setLogoPreview(logo)}>
            <Text>Preview Logo</Text>
            </Button>
          <Input
            label="Rating"
            placeholder="Enter restaurant rating"
            value={rating.toString()}
            onChangeText={(text) => {
              setRating(text.replace(/[^0-9.-]/g, ''));
            }}
          />

          <Text style={styles.sectionTitle}>Starters</Text>
          <Button mode='outlined' onPress={addStarter}>
              <Text>Add Starter</Text>
            </Button>
          {starters.map((starter, index) => (
            <View key={index} style={styles.itemContainer}>
              <Input
                label={`Starter Name ${index + 1}`}
                placeholder="Enter starter name"
                value={starter.name}
                onChangeText={(text) => updateItem(starters, index, 'name', text)}
              />
               <Input
                  label={`Starter Description ${index + 1}`}
                  placeholder="Enter starter description"
                  value={starterDescriptions[index]}
                  onChangeText={(text) =>
                    updateDescription(starterDescriptions, index, text)
                  }
                />
              <Input
                label={`Starter Price ${index + 1}`}
                placeholder="Enter starter price"
                value={starter.price.toString()}
                onChangeText={(text) => updateItem(starters, index, 'price', text)}
              />
              <Icon
                name="delete"
                type="material"
                size={24}
                onPress={() => removeItem(starters, index)}
                containerStyle={styles.deleteIcon}
              />
            </View>
          ))}

          <Text style={styles.sectionTitle}>Mains</Text>
          <Button  mode='outlined' onPress={addMain}>
            <Text>Add Main Course</Text>
            </Button>
          {mains.map((main, index) => (
            <View key={index} style={styles.itemContainer}>
              <Input
                label={`Main Course Name ${index + 1}`}
                placeholder="Enter main course name"
                value={main.name}
                onChangeText={(text) => updateItem(mains, index, 'name', text)}
              />

            <Input
                  label={`Main Description ${index + 1}`}
                  placeholder="Enter Main description"
                  value={mainDescriptions[index]}
                  onChangeText={(text) =>
                    updateDescription(mainDescriptions, index, text)
                  }
                />
              <Input
                label={`Main Course Price ${index + 1}`}
                placeholder="Enter main course price"
                value={main.price.toString()}
                onChangeText={(text) => updateItem(mains, index, 'price', text)}
              />
              <Icon
                name="delete"
                type="material"
                size={24}
                onPress={() => removeItem(mains, index)}
              />
            </View>
          ))}

          <Text style={styles.sectionTitle}>Desserts</Text>
          <Button mode='outlined' onPress={addDessert}>
            <Text>Add Dessert</Text>
          </Button>
          
          {desserts.map((dessert, index) => (
            <View key={index} style={styles.itemContainer}>
              <Input
                label={`Dessert Name ${index + 1}`}
                placeholder="Enter dessert name"
                value={dessert.name}
                onChangeText={(text) => updateItem(desserts, index, 'name', text)}
              />
              <Input
                  label={`Dessert Description ${index + 1}`}
                  placeholder="Enter Dessert description"
                  value={dessertDescriptions[index]}
                  onChangeText={(text) =>
                    updateDescription(dessertDescriptions, index, text)
                  }
                />
              <Input
                label={`Dessert Price ${index + 1}`}
                placeholder="Enter dessert price"
                value={dessert.price.toString()}
                onChangeText={(text) => updateItem(desserts, index, 'price', text)}
              />
              <Icon
                name="delete"
                type="material"
                size={24}
                onPress={() => removeItem(desserts, index)}
              />
            </View>
          ))}

          {/* Drinks */}
          <Text style={styles.sectionTitle}>Drinks</Text>
          <Button mode="outlined" icon="" onPress={addDrink} >
            <Text>Add Drink</Text>
            </Button>
          {drinks.map((drink, index) => (
            <View key={index} style={styles.itemContainer}>
              <Input
                label={`Drink Name ${index + 1}`}
                placeholder="Enter drink name"
                value={drink.name}
                onChangeText={(text) => updateItem(drinks, index, 'name', text)}
              />
              <Input
                  label={`Drink Description ${index + 1}`}
                  placeholder="Enter Drink description"
                  value={drinkDescriptions[index]}
                  onChangeText={(text) =>
                    updateDescription(drinkDescriptions, index, text)
                  }
                />
              <Input
                label={`Drink Price ${index + 1}`}
                placeholder="Enter drink price"
                value={drink.price.toString()}
                onChangeText={(text) => updateItem(drinks, index, 'price', text)}
              />
              <Icon
                name="delete"
                type="material"
                size={24}
                onPress={() => removeItem(drinks, index)}
              />
            </View>
          ))}

          <Button
            mode='contained'
            onPress={handleAddRestaurant}
            style={{marginBottom:20}}
          >
            <Text>{isEditing ? 'Update Restaurant' : 'Add Restaurant'}</Text>
          </Button>
          {isEditing && (
            <Button title="Cancel Edit" onPress={handleCancelEdit} />
          )}
          <Button
             mode='contained-tonal' onPress={onClose} >
            <Text>Close</Text>
            </Button>
        </SafeAreaView>
      </ScrollView>
     </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    marginTop:60,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
  },
  formTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 2,
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  itemInput: {
    flex: 1,
  },
  deleteIcon: {
    paddingLeft: 10,
  },
  logoPreview: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
    alignSelf: 'center',
  },
  button: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#aaa',
  },
});

export default RestaurantForm;
