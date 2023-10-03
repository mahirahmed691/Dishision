import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Checkbox, IconButton } from 'react-native-paper';
import Modal from 'react-native-modal';
import StarRating from 'react-native-star-rating';

const FilterModal = ({ visible, onClose, onApplyFilters }) => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedFoodType, setSelectedFoodType] = useState(null);
  const [isHalal, setIsHalal] = useState(false);

  const foodTypeOptions = [
    'Italian',
    'Mexican',
    'Indian',
    'American',
    'Grill',
    'Turkish',
    'Chinese',
    'Thai',
    'Korean',
    'British',
    'Lebanese',
    'French',
    'Spanish',
  ];

  const clearFilters = () => {
    setSelectedRating(null);
    setSelectedFoodType(null);
    setIsHalal(false);
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationOutTiming={300}
      backdropTransitionOutTiming={300}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Options</Text>
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Select Rating:</Text>
            <StarRating
              maxStars={5}
              rating={selectedRating}
              selectedStar={(rating) => setSelectedRating(rating)}
              fullStarColor="#60BA62"
              starSize={30}
            />
          </View>
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Select Food Type:</Text>
            <ScrollView>
              <View style={styles.column}>
                {foodTypeOptions.map((foodType, index) => (
                  <View
                    key={foodType}
                    style={[
                      styles.checkboxOption,
                      { marginRight: (index + 1) % 2 === 0 ? 0 : 10 },
                    ]}
                  >
                    <Checkbox.Android
                      status={
                        selectedFoodType === foodType ? 'checked' : 'unchecked'
                      }
                      onPress={() => setSelectedFoodType(foodType)}
                      color="#60BA62"
                    />
                    <Text>{foodType}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Dietary:</Text>
            <View style={styles.checkboxOption}>
              <Checkbox.Android
                status={isHalal ? 'checked' : 'unchecked'}
                onPress={() => setIsHalal(!isHalal)}
                color="#60BA62"
              />
              <Text>Halal</Text>
            </View>
          </View>
          <View style={styles.modalButtonContainer}>
            <IconButton
              icon="close-circle"
              color="#60BA62"
              size={30}
              onPress={onClose}
              style={styles.iconButton}
            />
            <IconButton
              icon="filter-remove-outline"
              color="red"
              size={30}
              onPress={clearFilters}
              style={styles.iconButton}
            />
            <IconButton
              icon="filter"
              color="#60BA62"
              size={30}
              onPress={() =>
                onApplyFilters(selectedRating, selectedFoodType, isHalal)
              }
              style={styles.iconButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filtersContainer: {
    marginBottom: 10,
  },
  filtersTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: {
    flex: 1,
  },
  column: {
    flexDirection: 'row', // Display items in two columns
    flexWrap: 'wrap', // Allow items to wrap to the next row
    justifyContent: 'space-between',
  },
});

export default FilterModal;
