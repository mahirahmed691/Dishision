export default {
  expo: {
    name: 'DishDecide',
    slug: 'DishDecide',
    privacy: 'public',
    platforms: ['ios', 'android'],
    version: '0.15.0',
    orientation: 'portrait',
    icon: './assets/iconApp.png',
    splash: {
      image: './assets/bigburger.png',
      resizeMode: 'cover',
      backgroundColor: '#F57C00'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      infoPlist: {
        "NSLocationWhenInUseUsageDescription": "Your location is required to provide you with the best experience."
      }
    },
    android: {
      package: "com.mahir93.expofirebase", 
      permissions: ["LOCATION"]
    },
  }
};