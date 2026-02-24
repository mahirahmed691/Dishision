import "react-native-get-random-values";

import {
  initializeApp as initializeFirestoreApp,
  getApps as getFirestoreApps,
  getApp as getFirestoreApp,
} from "@firebase/app";
import {
  initializeApp as initializeAuthApp,
  getApps as getAuthApps,
  getApp as getAuthApp,
} from "./firebaseApp";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "./firebaseAuth";
import { getFirestore } from "@firebase/firestore";
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

const app = getFirestoreApps().length
  ? getFirestoreApp()
  : initializeFirestoreApp(firebaseConfig);
const authAppName = "__dishision_auth_app__";
const authApp = getAuthApps().some((existingApp) => existingApp.name === authAppName)
  ? getAuthApp(authAppName)
  : initializeAuthApp(firebaseConfig, authAppName);

let auth;

try {
  auth = initializeAuth(authApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  if (error?.code === "auth/already-initialized") {
    auth = getAuth(authApp);
  } else {
    console.error("Firebase auth initialization failed:", error);
    throw error;
  }
}

const db = getFirestore(app);

export { app, auth, db };
