export default {
  expo: {
    owner: "mahir93",
    name: "DishDecide",
    slug: "dishdecide",
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
      url: "https://u.expo.dev/f43ab566-c910-4b69-a519-f890be3420a4",
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: "1.0.0",
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.mahir93.dishdecide",
      googleServicesFile: "./GoogleService-Info.plist",
      buildNumber:"1.1"
    },
    android: {
      package: "com.mahir93.dishdecide"
    },
    extra: {
      eas: {
        projectId: "f43ab566-c910-4b69-a519-f890be3420a4"
      }
    }
  }
};

