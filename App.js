import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';

const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const stripePublishableKey = 'pk_live_51Nyy2PBFZjGsRZ7f8mhee6As852FzBxJPfqGGQWd1OEgIb61TFSLQIjCe9dF7GHE7DIPr8QSVrssQTkBF43nVMU1002NNrUapy';

import { RootNavigator } from './navigation/RootNavigator';
import { AuthenticatedUserProvider } from './providers';

const App = () => {
  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      urlScheme="your-url-scheme" 
      merchantIdentifier="merchant.com.dishdecide" 
    >
    <AuthenticatedUserProvider>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </AuthenticatedUserProvider>
    </StripeProvider>
  );
};

export default App;
