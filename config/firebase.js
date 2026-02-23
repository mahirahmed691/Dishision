import "react-native-get-random-values";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAGFLp0R66h4I_h0RuRcyeWZll5pgs8baQ",
  authDomain: "dishdecid.firebaseapp.com",
  projectId: "dishdecid",
  storageBucket: "dishdecid.appspot.com",
  messagingSenderId: "151956588290",
  appId: "1:151956588290:web:67bc11c40f209def06e41b",
  measurementId: "G-FY5LLZ5Z5C",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
