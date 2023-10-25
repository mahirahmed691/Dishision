export default {
  expo: {
    name: "DishDecide",
    slug: "DishDecide",
    privacy: "public",
    platforms: ["ios", "android"],
    version: "0.15.0",
    orientation: "portrait",
    icon: "./assets/logo4.png",
    splash: {
      image: "./assets/logo4.png",
      resizeMode: "contain",
      backgroundColor: "#00CDBC",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      googleServicesFile: "./GoogleService-Info.plist"
    },
    android: {
      googleServicesFile: "./google-services.json"
    },
    extra: {
      eas: {
        projectId: "e1b4edc7-7ba6-4043-937f-59a255e21f75"
      }
    }
  }
};

