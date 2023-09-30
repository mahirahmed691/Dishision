import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// add firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB1hdbHENRL-JR4slWJDfUgTmLouCZSBe0",
  authDomain: "dishdecid.firebaseapp.com",
  projectId: "dishdecid",
  storageBucket: "dishdecid.appspot.com",
  messagingSenderId: "151956588290",
  appId: "1:151956588290:web:d75e0d471aece36d06e41b",
  measurementId: "G-6DHJ1VMBXY"
};

const app = initializeApp(firebaseConfig);

export { app };

// initialize auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };

