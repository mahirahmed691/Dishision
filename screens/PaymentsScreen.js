import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Button, TextInput, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export const PaymentsScreen = () => {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvc, setCVC] = useState("");
  const [expiry, setExpiry] = useState("");

  const [isPaymentSuccess, setPaymentSuccess] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState("");

  const handlePurchase = async () => {
    // Implement the payment processing logic here
    try {
      // Use a payment gateway (e.g., Stripe, PayPal) to process the payment
      // This is where you would send the card details, amount, and make the payment request

      // If the payment is successful, setPaymentSuccess(true)
      setPaymentSuccess(true);
    } catch (error) {
      // Handle errors and show an error message
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    }
  };

  const handleApplePay = () => {
    // Implement Apple Pay handling
    if (Platform.OS === "ios") {
      // Show Apple Pay options and process payment
    } else {
      alert("Apple Pay is not available on this platform.");
    }
  };

  const handleGooglePay = () => {
    // Implement Google Pay handling
    if (Platform.OS === "android") {
      // Show Google Pay options and process payment
    } else {
      alert("Google Pay is not available on this platform.");
    }
  };

  const isPaymentButtonDisabled = () => {
    return !(
      isCardNameValid(cardName) &&
      isCardNumberValid(cardNumber) &&
      isCVCValid(cvc) &&
      isExpiryValid(expiry) &&
      purchaseAmount.trim()
    );
  };

  const isCardNameValid = (name) => /^[A-Za-z\s]+$/.test(name);
  const isCardNumberValid = (number) => /^[0-9]{16}$/.test(number);
  const isCVCValid = (cvc) => /^[0-9]{3}$/.test(cvc);
  const isExpiryValid = (expiry) => /^[0-9]{2}\/[0-9]{2}$/.test(expiry);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          {isPaymentSuccess ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>Payment Successful</Text>
            </View>
          ) : (
            <View>
              <TextInput
                label="Card Name"
                mode="outlined"
                placeholder="Enter Card Name"
                value={cardName}
                onChangeText={(text) => setCardName(text)}
                style={styles.input}
                error={!isCardNameValid(cardName)}
              />
              <TextInput
                label="Card Number"
                placeholder="Enter Card Number"
                mode="outlined"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(text)}
                style={styles.input}
                error={!isCardNumberValid(cardNumber)}
              />
              <View style={styles.cardDetailsRow}>
                <TextInput
                  label="CVC"
                  placeholder="CVC"
                  mode="outlined"
                  value={cvc}
                  onChangeText={(text) => setCVC(text)}
                  style={styles.cvcInput}
                  error={!isCVCValid(cvc)}
                />
                <TextInput
                  label="Expiry (MM/YY)"
                  placeholder="MM/YY"
                  mode="outlined"
                  value={expiry}
                  onChangeText={(text) => setExpiry(text)}
                  style={styles.expiryInput}
                  error={!isExpiryValid(expiry)}
                />
              </View>
              <TextInput
                label="Purchase Amount (£)"
                placeholder="Enter Purchase Amount"
                value={purchaseAmount}
                onChangeText={(text) => setPurchaseAmount(text)}
                style={styles.input}
                keyboardType="numeric"
                mode="outlined"
              />
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handlePurchase}
                  style={styles.purchaseButton}
                  disabled={isPaymentButtonDisabled()}
                >
                 <Text style={{color:'white'}}>Confirm Payment</Text> 
                </Button>
              </View>
              <View style={styles.paymentOptions}>
          {Platform.OS === "ios" && (
            <IconButton
              icon="apple"
              iconColor="black"
              mode="contained"
              onPress={handleApplePay}
              style={styles.paymentButton}
            >
              Apple Pay
            </IconButton>
          )}
          {Platform.OS === "android" && (
            <IconButton
              icon="google"
              mode="outlined"
              onPress={handleGooglePay}
              style={styles.paymentButton}
            >
              Google Pay
            </IconButton>
          )}
        </View>
            </View>
          )}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#F0F0F0",
  },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cvcInput: {
    flex: 1,
    marginRight: 8,
  },
  expiryInput: {
    flex: 2,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  purchaseButton: {
    width: "100%",
    backgroundColor: "#111",
  },
  successContainer: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  successText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  paymentButton: {
    marginHorizontal: 8,
    borderColor: "#111",
  },
});

export default PaymentsScreen;
