### mobile

In this one is where we are going to implement the video chat user interface with react-native expo. First we need to install all the required packages:

```sh
# Chat Packages
npx expo install stream-chat-expo stream-chat-react-native
npx expo install @react-native-community/netinfo expo-file-system expo-image-manipulator expo-image-picker expo-media-library react-native-gesture-handler react-native-reanimated react-native-svg expo-clipboard

# Livestream
npx expo install @stream-io/video-react-native-sdk
npx expo install @stream-io/react-native-webrtc
npx expo install @config-plugins/react-native-webrtc
npx expo install react-native-incall-manager
npx expo install @notifee/react-native

# Utils
npm install react-native-loading-spinner-overlay react-native-toast-message
npx expo install expo-secure-store
npx expo install expo-sharing expo-document-picker expo-haptics expo-av

# Bottom Sheet
npm i @gorhom/bottom-sheet

# dev client
npx expo install expo-dev-client
npx expo prebuild
npx expo prebuild --clean
npx expo start --clear
```

For the installation of `@notifee/react-native` we need to follow this guide https://notifee.app/react-native/docs/installation#2-android-add-local-maven-repository. In my `app.json` in the plugin section i added the following:

```json
{
  "plugins": [
    "expo-router",
    "expo-secure-store",
    "@stream-io/video-react-native-sdk",
    [
      "@config-plugins/react-native-webrtc",
      {
        "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone"
      }
    ],
    [
      "expo-build-properties",
      {
        "android": {
          "extraMavenRepos": [
            "$rootDir/../../../node_modules/@notifee/react-native/android/libs"
          ]
        }
      }
    ]
  ]
}
```

After that we are going to create a `.env` file that will contain the following environmental variables:

```shell
EXPO_PUBLIC_STREAM_ACCESS_KEY= YOURS
EXPO_PUBLIC_SERVER_URL= https://5605-213-172-134-81.ngrok-free.app
```
