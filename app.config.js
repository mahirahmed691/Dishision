export default {
  expo: {
    name: 'DishDecide',
    slug: 'DishDecide',
    privacy: 'public',
    platforms: ['ios', 'android'],
    version: '0.15.0',
    orientation: 'portrait',
    icon: './assets/logo4.png',
    splash: {
      image: './assets/logo4.png',
      resizeMode: 'contain',
      backgroundColor: '#00CDBC'
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