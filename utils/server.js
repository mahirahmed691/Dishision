const stripe = require('stripe')('pk_live_51Nyy2PBFZjGsRZ7f8mhee6As852FzBxJPfqGGQWd1OEgIb61TFSLQIjCe9dF7GHE7DIPr8QSVrssQTkBF43nVMU1002NNrUapy');

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2023-08-16'}
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: 'pk_live_51Nyy2PBFZjGsRZ7f8mhee6As852FzBxJPfqGGQWd1OEgIb61TFSLQIjCe9dF7GHE7DIPr8QSVrssQTkBF43nVMU1002NNrUapy'
  });
});