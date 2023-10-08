import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// add firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAGFLp0R66h4I_h0RuRcyeWZll5pgs8baQ",
  authDomain: "dishdecid.firebaseapp.com",
  projectId: "dishdecid",
  storageBucket: "dishdecid.appspot.com",
  messagingSenderId: "151956588290",
  appId: "1:151956588290:web:67bc11c40f209def06e41b",
  measurementId: "G-FY5LLZ5Z5C"
};

const app = initializeApp(firebaseConfig);

export { app };

// initialize auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };

