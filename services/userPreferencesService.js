import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from "@firebase/firestore";
import { auth, db } from "../config/firebase";

export const DEFAULT_USER_PREFERENCES = {
  favoriteCuisines: [],
  dietary: {
    halalOnly: false,
    vegetarianFriendly: false,
    veganFriendly: false,
    glutenFree: false,
  },
  tasteTags: [],
  discovery: {
    autoMenuSuggestions: true,
    prioritizeTopRated: true,
    notifyNewPlaces: false,
  },
};

export const normalizeUserPreferences = (raw) => {
  const prefs = raw && typeof raw === "object" ? raw : {};
  return {
    favoriteCuisines: Array.isArray(prefs.favoriteCuisines)
      ? prefs.favoriteCuisines.filter((item) => typeof item === "string" && item.trim().length > 0)
      : [],
    dietary: {
      ...DEFAULT_USER_PREFERENCES.dietary,
      ...(prefs.dietary || {}),
    },
    tasteTags: Array.isArray(prefs.tasteTags)
      ? prefs.tasteTags.filter((item) => typeof item === "string" && item.trim().length > 0)
      : [],
    discovery: {
      ...DEFAULT_USER_PREFERENCES.discovery,
      ...(prefs.discovery || {}),
    },
  };
};

export const fetchUserPreferencesByUid = async (uid) => {
  const safeUid = `${uid || ""}`.trim();
  if (!safeUid) {
    return DEFAULT_USER_PREFERENCES;
  }

  const byIdDoc = await getDoc(doc(db, "users", safeUid));
  if (byIdDoc.exists()) {
    return normalizeUserPreferences(byIdDoc.data()?.preferences);
  }

  const usersQuery = query(collection(db, "users"), where("uid", "==", safeUid), limit(1));
  const usersSnapshot = await getDocs(usersQuery);
  const legacyData = usersSnapshot.docs[0]?.data();
  return normalizeUserPreferences(legacyData?.preferences);
};

export const fetchCurrentUserPreferences = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return DEFAULT_USER_PREFERENCES;
  }
  return fetchUserPreferencesByUid(uid);
};

const defaultOnboardingState = {
  preferencesCompleted: false,
  preferencesSkipped: false,
  tourCompleted: false,
};

export const fetchCurrentUserOnboardingState = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return defaultOnboardingState;
  }

  const byIdDoc = await getDoc(doc(db, "users", uid));
  if (byIdDoc.exists()) {
    return {
      ...defaultOnboardingState,
      ...(byIdDoc.data()?.onboarding || {}),
    };
  }

  const usersQuery = query(collection(db, "users"), where("uid", "==", uid), limit(1));
  const usersSnapshot = await getDocs(usersQuery);
  const legacyData = usersSnapshot.docs[0]?.data();
  return {
    ...defaultOnboardingState,
    ...(legacyData?.onboarding || {}),
  };
};

export const setCurrentUserOnboardingState = async (patch) => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return;
  }

  const byIdRef = doc(db, "users", uid);
  await setDoc(
    byIdRef,
    {
      uid,
      onboarding: {
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    },
    { merge: true },
  );
};
