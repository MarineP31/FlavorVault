import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FlavorVault',
  slug: 'flavorvault-jjbtzslcjkgvlg44c7zdw',
  version: '1.0.3',
  orientation: 'portrait',
  icon: './assets/images/ui/ios-light.png',
  scheme: 'flavorvault',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    icon: {
      light: './assets/images/ui/ios-light.png',
      dark: './assets/images/ui/ios-dark.png',
      tinted: './assets/images/ui/ios-tinted.png',
    },
    infoPlist: {
      NSCameraUsageDescription:
        'This app requires camera access to take photos of your recipes.',
      NSPhotoLibraryUsageDescription:
        'This app requires photo library access to select recipe images.',
    },
    bundleIdentifier: 'com.marinepetit.flavorvault',
    appleTeamId: '2XK9VHSB9S',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/ui/adaptive-icon.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
    ],
    package: 'com.marinepetit.flavorvault',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/ui/splash-icon-light.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          image: './assets/images/ui/splash-icon-dark.png',
          backgroundColor: '#000000',
        },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'The app requires access to your photo library to select recipe images.',
        cameraPermission:
          'The app requires camera access to take photos of your recipes.',
      },
    ],
    'expo-sqlite',
    'expo-web-browser',
    'expo-font',
    [
      'expo-share-intent',
      {
        iosActivationRules: {
          NSExtensionActivationSupportsWebURLWithMaxCount: 1,
          NSExtensionActivationSupportsWebPageWithMaxCount: 1,
        },
        androidIntentFilters: ['text/*'],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    revenueCatIosApiKey: process.env.REVENUECAT_IOS_API_KEY,
    revenueCatAndroidApiKey: process.env.REVENUECAT_ANDROID_API_KEY,
    router: {},
    eas: {
      projectId: '726a4e52-47dc-4d5d-80f2-6271522b00aa',
    },
  },
  owner: 'marinepetit',
});
