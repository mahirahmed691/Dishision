import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, getDocs, limit, query, where } from "@firebase/firestore";
import { auth, db } from "../config/firebase";

const ADMIN_UI_SETTINGS_KEY = "@dishision_admin_ui_v1";
const ADMIN_EMAIL_ALLOWLIST = new Set(["mahirahmed691@gmail.com"]);

const DEFAULT_ADMIN_UI_SETTINGS = {
  showQualityBadges: false,
};

const normalizeRole = (value) => `${value || ""}`.toLowerCase().trim();

const parseSettings = (raw) => {
  if (!raw) {
    return DEFAULT_ADMIN_UI_SETTINGS;
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ADMIN_UI_SETTINGS,
      ...(parsed || {}),
    };
  } catch (error) {
    return DEFAULT_ADMIN_UI_SETTINGS;
  }
};

export const getAdminUiSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(ADMIN_UI_SETTINGS_KEY);
    return parseSettings(raw);
  } catch (error) {
    console.error("Failed to read admin UI settings:", error);
    return DEFAULT_ADMIN_UI_SETTINGS;
  }
};

export const setAdminUiSettings = async (partialSettings) => {
  const current = await getAdminUiSettings();
  const next = {
    ...current,
    ...(partialSettings || {}),
  };
  try {
    await AsyncStorage.setItem(ADMIN_UI_SETTINGS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Failed to write admin UI settings:", error);
  }
  return next;
};

const isAdminPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  const role = normalizeRole(payload.role);
  const roles = Array.isArray(payload.roles)
    ? payload.roles.map(normalizeRole)
    : [];
  return (
    payload.isAdmin === true ||
    role === "admin" ||
    role === "owner" ||
    roles.includes("admin") ||
    roles.includes("owner")
  );
};

export const getCurrentUserAdminAccess = async () => {
  const uid = auth.currentUser?.uid;
  const email = `${auth.currentUser?.email || ""}`.toLowerCase().trim();

  if (ADMIN_EMAIL_ALLOWLIST.has(email)) {
    return true;
  }

  if (!uid) {
    return false;
  }

  try {
    const byIdSnap = await getDoc(doc(db, "users", uid));
    if (byIdSnap.exists() && isAdminPayload(byIdSnap.data())) {
      return true;
    }
  } catch (error) {
    console.error("Failed to read admin access (users/{uid}):", error);
  }

  try {
    const usersQuery = query(collection(db, "users"), where("uid", "==", uid), limit(1));
    const usersSnapshot = await getDocs(usersQuery);
    if (!usersSnapshot.empty) {
      return isAdminPayload(usersSnapshot.docs[0].data());
    }
  } catch (error) {
    console.error("Failed to read admin access (users query):", error);
  }

  return false;
};

export { DEFAULT_ADMIN_UI_SETTINGS };
