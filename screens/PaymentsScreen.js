import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStripe } from "@stripe/stripe-react-native";

export const PaymentsScreen = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");

 useEffect(() => {
    const initializePaymentSheet = async () => {
      try {
        const response = await fetch('http://localhost:3001/payment-sheet-data'); // Replace with your actual server URL
        const { paymentIntentClientSecret, error } = await response.json();

        if (error) {
          setPaymentError(error);
          return;
        }

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret,
        });

        if (initError) {
          setPaymentError(initError);
        }
      } catch (error) {
        setPaymentError(error.message);
      }
    };

    initializePaymentSheet();
  }, [initPaymentSheet]);

  const handlePayment = async () => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        setPaymentError(error.message);
      } else {
        setPaymentSuccess(true);
      }
    } catch (error) {
      setPaymentError(error.message);
    }
  };

  const isPaymentButtonDisabled = () => {
    return !purchaseAmount.trim();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          {paymentSuccess ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>Payment Successful</Text>
            </View>
          ) : (
            <View>
              <TextInput
                label="Purchase Amount (£)"
                placeholder="Enter Purchase Amount"
                value={purchaseAmount}
                onChangeText={(text) => setPurchaseAmount(text)}
                style={styles.input}
                keyboardType="numeric"
                mode="outlined"
              />
              <Button
                mode="contained"
                onPress={handlePayment}
                style={styles.purchaseButton}
                disabled={isPaymentButtonDisabled()}
              >
                Pay with Stripe
              </Button>
              {paymentError && (
                <Text style={styles.errorText}>Error: {paymentError}</Text>
              )}
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
  errorText: {
    color: "red",
    marginTop: 10,
  },
});

export default PaymentsScreen;
