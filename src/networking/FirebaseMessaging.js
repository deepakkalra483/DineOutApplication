import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import { DEVICE_ID, FCM_TOKEN, USER } from '../utils/AsynStorageHelper';
import { PermissionsAndroid, Platform } from 'react-native';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { updateTokenInDB } from './FireStoreService';

export async function requestPostNotificationPermission() {
  if (Platform.OS === 'android') {
    // Check if API level is 33 or higher
    if (Platform.Version < 33) {
      console.log(
        'POST_NOTIFICATIONS permission is not required for this Android version.',
      );
      AsyncStorage.getItem(FCM_TOKEN).then(res => {
        if (res) {
          console.log('oldToken-', res);
          return true;
        } else {
          console.log('notFound');
          getFcmToken();
          return true;
        }
      });
      return true;
      // getFcmToken();
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'This app needs access to send you notifications.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted');
        AsyncStorage.getItem(FCM_TOKEN).then(res => {
          if (res) {
            console.log('oldToken-', res);
            return true;
          } else {
            console.log('notFound');
            getFcmToken();
            return true;
          }
        });
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (err) {
      console.warn('Error while requesting notification permission:', err);
      return false;
    }
  } else {
    console.log(
      'POST_NOTIFICATIONS permission is not required on this platform.',
    );
    return true;
  }
}

// export const requestUserPermission = async () => {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     console.log('Authorization status:', authStatus);
//     AsyncStorage.getItem(FCM_TOKEN).then(res => {
//       if (res) {
//         console.log('oldToken-', res);
//       } else {
//         console.log('notFound');
//         getFcmToken();
//       }
//     });
//   }
// };

export const getFcmToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      AsyncStorage.setItem(FCM_TOKEN, fcmToken);
      // Save the token to your server or local storage
    } else {
      console.log('Failed to get FCM token');
    }
  } catch (error) {
    console.error('Error fetching FCM token:', error);
  }
};

export const getNewToken = async () => {
  try {
    const newToken = await messaging().getToken();
    if (!newToken) return console.log("Failed to get FCM token");

    const storedToken = await AsyncStorage.getItem(FCM_TOKEN);


    // Compare local storage token
    if (storedToken === newToken) {
      console.log("Token unchanged. No Firestore update needed.");
      return;
    }
    const DeviceId = await AsyncStorage.getItem(DEVICE_ID);
    const userDetails = await AsyncStorage.getItem(USER);
    const parsedUser = JSON.parse(userDetails)

    console.log("New token detected. Updating Firestore...");
    await AsyncStorage.setItem(FCM_TOKEN, newToken);
    updateTokenInDB(parsedUser?.id, newToken, DeviceId)
  } catch (error) {
    console.error("Error fetching/updating FCM token:", error);
  }
}

export const notificationListener = () => {
  // Foreground notification listener
  messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', remoteMessage);
  });

  // Background/quit state notification listener
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
};
