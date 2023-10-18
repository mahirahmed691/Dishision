import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  FlatList,
} from "react-native";
import {
  Button,
  TextInput,
  Card,
  Paragraph,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStripe } from "@stripe/stripe-react-native";
import * as Animatable from "react-native-animatable";
import Modal from "react-native-modal";
import styles from "./styles";

export const PaymentsScreen = () => {
  const [userBalance, setUserBalance] = useState(100);
  const [isPaymentSuccess, setPaymentSuccess] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const { handleURLCallback } = useStripe();
  const [defaultCard, setDefaultCard] = useState("**** **** **** 1234"); // Last 4 digits of the card

  // Modal state for card management
  const [isAddCardModalVisible, setAddCardModalVisible] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");

  const handlePurchase = () => {
    const purchaseValue = parseFloat(purchaseAmount);

    if (isNaN(purchaseValue) || purchaseValue < 5) {
      alert("Invalid purchase amount. Minimum purchase amount is £5.");
      return;
    }

    if (userBalance >= purchaseValue) {
      setUserBalance(userBalance - purchaseValue);
      setPaymentSuccess(true);
    } else {
      alert("Insufficient balance");
    }
  };

  const isPaymentButtonDisabled =
    !purchaseAmount || parseFloat(purchaseAmount) <= 0;

  const [bundles] = useState([
    { amount: 5, label: "£5 Bundle", description: "500 Searches" },
    { amount: 10, label: "£10 Bundle", description: "1000 Searches" },
    { amount: 20, label: "£20 Bundle", description: "2000 Searches" },
  ]);

  const handleBundleSelection = (amount) => {
    setPurchaseAmount(amount.toString());
  };

  const [transactions, setTransactions] = useState([
    { date: "2023-09-01", description: "#498484", amount: "£50.00" },
    { date: "2023-09-02", description: "#984984", amount: "£30.00" },
  ]);

  // Modal state for transaction history
  const [isTransactionHistoryVisible, setTransactionHistoryVisible] =
    useState(false);

  const handleAddCard = () => {
    if (newCardNumber && newCardNumber.length === 16) {
      setDefaultCard(newCardNumber.slice(-4)); // Set last 4 digits as default card
      setAddCardModalVisible(false); // Close the modal
      alert("Card added successfully"); // Display a success message
    } else {
      alert("Invalid card number. Please enter a 16-digit card number.");
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
      "url",
      (event: { url: string }) => {
        handleDeepLink(event.url);
        console.log("Stripe URL callback handled:", url);
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
            <Paragraph style={styles.bundleAmount}>
              £{item.amount.toFixed(2)}
            </Paragraph>
            <Paragraph style={styles.bundleDescription}>
              {item.description}
            </Paragraph>
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
              <Text style={styles.balanceAfterPayment}>
                New Balance: £{userBalance.toFixed(2)}
              </Text>
            </Animatable.View>
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => setTransactionHistoryVisible(true)}
                  style={styles.transactionHistoryButton}
                >
                  <IconButton icon="history" size={30} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setNewCardNumber("");
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
                mode="contained"
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

              <Animatable.Text
                animation="fadeIn"
                style={styles.defaultCardText}
              >
                Default Card:
                <Text style={{ color: "#00CDBC" }}>{defaultCard}</Text>
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
              <ScrollView
                contentContainerStyle={styles.transactionHistoryContent}
              >
                <Text style={styles.transactionsTitle}>
                  Transaction History
                </Text>
                {transactions.map((transaction, index) => (
                  <Animatable.View
                    key={index}
                    animation="fadeInUp"
                    delay={300 + index * 100}
                  >
                    <Card style={styles.transactionCard}>
                      <Card.Content>
                        <Paragraph style={styles.transactionDate}>
                          {transaction.date}
                        </Paragraph>
                        <Paragraph style={styles.transactionDescription}>
                          {transaction.description}
                        </Paragraph>
                        <Paragraph style={styles.transactionAmount}>
                          {transaction.amount}
                        </Paragraph>
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
        <Animatable.View
          ref={modalRef}
          animation={fadeIn}
          style={styles.modalContainer}
        >
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
            <Button
              mode="contained"
              onPress={handleAddCard}
              style={styles.modalButton}
            >
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

export default PaymentsScreen;
