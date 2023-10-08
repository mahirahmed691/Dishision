import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, FlatList } from 'react-native';
import { Button, TextInput, Card, Paragraph, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStripe } from '@stripe/stripe-react-native';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';

export const PaymentsScreen = () => {
  const [userBalance, setUserBalance] = useState(100);
  const [isPaymentSuccess, setPaymentSuccess] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const { handleURLCallback } = useStripe();
  const [defaultCard, setDefaultCard] = useState('**** **** **** 1234'); // Last 4 digits of the card

  // Modal state for card management
  const [isAddCardModalVisible, setAddCardModalVisible] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');

  const handlePurchase = () => {
    const purchaseValue = parseFloat(purchaseAmount);

    if (isNaN(purchaseValue) || purchaseValue < 5) {
      alert('Invalid purchase amount. Minimum purchase amount is £5.');
      return;
    }

    if (userBalance >= purchaseValue) {
      setUserBalance(userBalance - purchaseValue);
      setPaymentSuccess(true);
    } else {
      alert('Insufficient balance');
    }
  };

  const isPaymentButtonDisabled = !purchaseAmount || parseFloat(purchaseAmount) <= 0;

  const [bundles] = useState([
    { amount: 5, label: '£5 Bundle', description:'500 Searches' },
    { amount: 10, label: '£10 Bundle', description:'1000 Searches' },
    { amount: 20, label: '£20 Bundle', description:'2000 Searches' },
  ]);

  const handleBundleSelection = (amount) => {
    setPurchaseAmount(amount.toString());
  };

  const [transactions, setTransactions] = useState([
    { date: '2023-09-01', description: '#498484', amount: '£50.00' },
    { date: '2023-09-02', description: '#984984', amount: '£30.00' },
  ]);

  // Modal state for transaction history
  const [isTransactionHistoryVisible, setTransactionHistoryVisible] = useState(false);

  const handleAddCard = () => {
    if (newCardNumber && newCardNumber.length === 16) {
      setDefaultCard(newCardNumber.slice(-4)); // Set last 4 digits as default card
      setAddCardModalVisible(false); // Close the modal
      alert('Card added successfully'); // Display a success message
    } else {
      alert('Invalid card number. Please enter a 16-digit card number.');
    }
  };

  const modalRef = useRef();
  const transactionCardRef = useRef(null); // Create a ref for the transaction card

  const fadeIn = {
    from: { opacity: 0 },
    to: { opacity: 1 },
  };

  const slideIn = {
    from: { translateY: 300 },
    to: { translateY: 0 },
  };

  const slideOut = {
    from: { translateY: 0 },
    to: { translateY: 300 },
  };

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
        }
      }
    },
    [handleURLCallback]
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };
  
    getUrlAsync();
  
    const deepLinkListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        handleDeepLink(event.url);
        console.log('Stripe URL callback handled:', url);
      }
    );
      
    return () => deepLinkListener.remove();
  }, []);

  // Function to render each payment bundle card with animation
  const renderPaymentBundle = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleBundleSelection(item.amount)}>
        <Card style={styles.bundleCard}>
          <Card.Content>
            <Paragraph style={styles.bundleAmount}>£{item.amount.toFixed(2)}</Paragraph>
            <Paragraph style={styles.bundleDescription}>{item.description}</Paragraph>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          {isPaymentSuccess ? (
            <Animatable.View animation="fadeIn" style={styles.paymentSuccess}>
              <Text style={styles.success}>Payment Successful!</Text>
              <Text style={styles.balanceAfterPayment}>New Balance: £{userBalance.toFixed(2)}</Text>
            </Animatable.View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setTransactionHistoryVisible(true)}
                  style={styles.transactionHistoryButton}
                >
                  <IconButton icon="history" size={30} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setNewCardNumber('');
                    setAddCardModalVisible(true);
                  }}
                  style={styles.addCardButtonTopRight}
                >
                  <IconButton icon="card-plus" size={30} />
                </TouchableOpacity>
              </View>

              <TextInput
                label="Amount (£)"
                placeholder="Enter Purchase Amount"
                value={purchaseAmount}
                onChangeText={(text) => setPurchaseAmount(text)}
                style={styles.input}
                keyboardType="numeric"
                mode='contained'
              />

              <Text style={styles.bundlesTitle}>Payment Bundles</Text>
              <View style={styles.bundlesContainer}>
                <FlatList
                  data={bundles}
                  horizontal
                  renderItem={renderPaymentBundle}
                  keyExtractor={(item) => item.amount.toString()}
                />
              </View>

              <Animatable.Text animation="fadeIn" style={styles.defaultCardText}>
                Default Card: 
                <Text style={{color:"#00CDBC"}}>{defaultCard}</Text>
              </Animatable.Text>

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleDeepLink}
                  style={styles.purchaseButton}
                  disabled={isPaymentButtonDisabled}
                >
                  Confirm Payment
                </Button>
              </View>
            </>
          )}

          <Modal
            isVisible={isTransactionHistoryVisible}
            onSwipeComplete={() => setTransactionHistoryVisible(false)}
            swipeDirection="down"
            style={styles.transactionHistoryModal}
          >
            <View style={styles.transactionHistoryContainer}>
              <ScrollView contentContainerStyle={styles.transactionHistoryContent}>
                <Text style={styles.transactionsTitle}>Transaction History</Text>
                {transactions.map((transaction, index) => (
                  <Animatable.View
                    key={index}
                    animation="fadeInUp"
                    delay={300 + index * 100}
                  >
                    <Card style={styles.transactionCard}>
                      <Card.Content>
                        <Paragraph style={styles.transactionDate}>{transaction.date}</Paragraph>
                        <Paragraph style={styles.transactionDescription}>
                          {transaction.description}
                        </Paragraph>
                        <Paragraph style={styles.transactionAmount}>{transaction.amount}</Paragraph>
                      </Card.Content>
                    </Card>
                  </Animatable.View>
                ))}
              </ScrollView>
            </View>
          </Modal>
        </View>
      </ScrollView>
      <Modal
        visible={isAddCardModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddCardModalVisible(false)}
      >
        <Animatable.View ref={modalRef} animation={fadeIn} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add/Replace Card</Text>
            <TextInput
              label="New Card Number"
              placeholder="Enter 16-digit Card Number"
              value={newCardNumber}
              onChangeText={(text) => setNewCardNumber(text)}
              style={styles.input}
              keyboardType="numeric"
            />
            <Button mode="contained" onPress={handleAddCard} style={styles.modalButton}>
              Save Card
            </Button>
            <Button
              mode="outlined"
              onPress={() => setAddCardModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
          </View>
        </Animatable.View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  paymentSuccess: {
    alignItems: 'center',
  },
  success: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C853', // Green color for success
    marginBottom: 10,
  },
  balanceAfterPayment: {
    fontSize: 18,
    color: '#333',
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333', // Dark text color
  },
  input: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#F5F5F5', // Light gray background for input
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD', // Light gray border
    paddingHorizontal: 10,
  },
  bundlesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#333', // Dark text color
  },
  bundlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    height:100
  },
  bundleCard: {
    flex: 1,
    marginHorizontal: 5,
    height: 100,
    margin:10,
    padding:10,
    elevation: 2,
    backgroundColor: '#FFFFFF', 
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    alignItems:'center'
  },
  bundleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333', // Dark text color
  },
  bundleAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111', 
  },
  bundleDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111', 
  },
  defaultCardText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333', // Dark text color
  },
  buttonContainer: {
    alignItems: 'center',
  },
  purchaseButton: {
    backgroundColor: '#00CDBC', 
    width: '100%',
    paddingVertical: 14,
  },
  transactionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111', // Dark text color
  },
  transactionCardContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  transactionCard: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 2,
    elevation: 10,
  },
  transactionDate: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  transactionDescription: {
    fontSize: 20,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    backgroundColor: 'rgba(0, 245, 245, 0.1)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF', // White background for modal
    borderRadius: 8,
    padding: 20,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111', 
    
  },
  modalButton: {
    marginVertical: 10,
  },
  transactionHistoryButtonText: {
    color: '#FFFFFF', // White text color
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionHistoryModal: {
    justifyContent: 'flex-end',
    margin: 0,
    width:'100%',
  },
  transactionHistoryContent: {
    flexGrow: 1,
    width:'100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light gray background
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  paymentSuccess: {
    alignItems: 'center',
    marginTop: 20,
  },
  success: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00C853', // Green color for success
    marginBottom: 10,
  },

  purchaseButton: {
    backgroundColor: '#00CDBC', // Green button
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
  },
});


export default PaymentsScreen;
