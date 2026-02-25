import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { doc, getDoc, getDocs, limit, query, where, collection } from "@firebase/firestore";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "../config/firebaseAuth";
import { BottomNavBar } from "./BottomNavBar";
import { DrawerSlider } from "./DrawerSlider";
import { ui } from "../config/designSystem";

export const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState("");
  const [user, setUser] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingGateReady, setOnboardingGateReady] = useState(false);

  const isValidPhotoUri = (value) => {
    if (typeof value !== "string") {
      return false;
    }
    const uri = value.trim();
    if (!uri) {
      return false;
    }
    return /^(https?:|file:|content:|ph:|assets-library:)/i.test(uri);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrateUserProfile = async () => {
      if (!user) {
        if (isMounted) {
          setUserName("");
          setUserPhotoURL("");
        }
        return;
      }

      const displayName = user.displayName || "";
      let resolvedPhotoURL = "";

      try {
        await user.reload();
      } catch (error) {
        console.error("Failed to refresh auth user:", error);
      }

      const refreshedUser = auth.currentUser;
      const authPhoto = refreshedUser?.photoURL || user.photoURL || "";
      if (isValidPhotoUri(authPhoto)) {
        resolvedPhotoURL = authPhoto.trim();
      } else {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const firestorePhoto = userDoc.exists() ? userDoc.data()?.photoURL : "";
          if (isValidPhotoUri(firestorePhoto)) {
            resolvedPhotoURL = firestorePhoto.trim();
          } else {
            const usersQ = query(
              collection(db, "users"),
              where("uid", "==", user.uid),
              limit(1),
            );
            const usersSnap = await getDocs(usersQ);
            const legacyPhoto = usersSnap.docs[0]?.data()?.photoURL || "";
            if (isValidPhotoUri(legacyPhoto)) {
              resolvedPhotoURL = legacyPhoto.trim();
            }
          }
        } catch (error) {
          console.error("Failed to load user photo from Firestore:", error);
        }
      }

      if (isMounted) {
        setUserName(displayName);
        setUserPhotoURL(resolvedPhotoURL);
      }
    };

    hydrateUserProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    setOnboardingChecked(false);
    setOnboardingGateReady(false);
  }, [user?.uid]);

  useEffect(() => {
    let isMounted = true;

    const checkOnboarding = async () => {
      if (!user?.uid || onboardingChecked) {
        if (user?.uid && onboardingChecked) {
          setOnboardingGateReady(true);
        }
        return;
      }

      try {
        let userData = null;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          userData = userDoc.data();
        } else {
          const usersQ = query(collection(db, "users"), where("uid", "==", user.uid), limit(1));
          const usersSnap = await getDocs(usersQ);
          userData = usersSnap.docs[0]?.data() || null;
        }

        if (!isMounted) {
          return;
        }

        const isCompleted = userData?.onboarding?.preferencesCompleted === true;
        if (!isCompleted) {
          navigation.replace("OnboardingPreferences", {
            seedPreferences: userData?.preferences || null,
          });
          return;
        }
        setOnboardingGateReady(true);
      } catch (error) {
        console.error("Failed to check onboarding state:", error);
        setOnboardingGateReady(true);
      } finally {
        if (isMounted) {
          setOnboardingChecked(true);
        }
      }
    };

    checkOnboarding();

    return () => {
      isMounted = false;
    };
  }, [navigation, onboardingChecked, user?.uid]);

  if (user?.uid && !onboardingGateReady) {
    return (
      <View style={styles.gateLoader}>
        <ActivityIndicator size="small" color={ui.colors.primary} />
      </View>
    );
  }

  const handleLogout = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      setActiveTab("Home");
    }
    setDrawerOpen(!isDrawerOpen);
  };

  return (
    <View style={styles.container}>
      <DrawerSlider
        userName={userName}
        userPhotoURL={userPhotoURL}
        isDrawerOpen={isDrawerOpen}
        setDrawerOpen={setDrawerOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favorites={favorites}
        selectedRestaurant={selectedRestaurant}
        handleLogout={handleLogout}
        toggleDrawer={toggleDrawer}
        navigation={navigation}
      />

      <BottomNavBar
        activeTab={activeTab}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        setActiveTab={setActiveTab}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  gateLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ui.colors.background,
  },
});

export default HomeScreen;
