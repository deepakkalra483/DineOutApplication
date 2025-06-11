import {Keyboard, Platform} from 'react-native';
// import {Apis, Request_Type} from './Apis';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import DeviceInfo from 'react-native-device-info';
import {Api, Request_Type} from './Api';

// export const sendFirebaseToken = async () => {
//   let fcmToken = await AsyncStorage.getItem('fcm_token');
//   CallApi(
//     `${Apis.STORE_FIREBASE_ID}`,
//     Request_Type.post,
//     {device_type: Platform.OS, firebase_id: fcmToken},
//     async onSuccess => {
//       await AsyncStorage.setItem(
//         `isUnreadNotification`,
//         `${onSuccess?.notification_unread_count}`,
//       );
//     },
//   );

//   CallApi(
//     `${Apis.GET_SETTINGS}`,
//     Request_Type.get,
//     {device_type: Platform.OS, firebase_id: fcmToken},
//     async onSuccess => {
//       if (onSuccess?.status) {
//         await AsyncStorage.setItem(`getSetting`, JSON.stringify(onSuccess));
//       }
//     },
//   );
// };

async function postData(url, payload, onSuccess, onFailure) {
  console.log('callApi--', url + '//psarm //' + JSON.stringify(payload));
  try {
    const response = await fetch(url, {
      method: 'POST', // HTTP method for adding data
      headers: {
        'Content-Type': 'application/json', // Ensure the server knows the payload is JSON
      },
      body: JSON.stringify(payload), // Convert the data to JSON
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
      onFailure(response.status);
    }

    const data = await response.json();
    onSuccess(data); // Parse the JSON response
    console.log('Data added successfully:', data);
    return data; // Return the response data
  } catch (error) {
    onFailure(error);
    console.error('Error adding data:', error);
  }
}

async function fetchData(url, onSuccess, onFailure) {
  console.log('url--', url);
  try {
    const response = await fetch(url); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    onSuccess(data); // Parse the JSON data
    console.log('Data fetched:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
    onFailure(error);
  }
}

export const CallApi = async (url, method, params, onSuccess, onFailure) => {
  Keyboard.dismiss();
  // let fcmToken = await AsyncStorage.getItem('fcm_token');
  // let USER = await AsyncStorage.getItem('user');
  let fcmToken, USER;
  var myHeaders = new Headers();
  console.log(`url`, url);
  myHeaders =
    JSON.parse(USER)?.access_token != undefined
      ? {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(USER)?.access_token}`,
        }
      : {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        };
  console.log('parms--', myHeaders);
  params = {
    ...params,
    device_type: Platform.OS,
    firebase_id: fcmToken,
    // model_name: DeviceInfo?.getModel(),
    // device_id: await DeviceInfo?.getUniqueId(),
  };

  // url = method == Request_Type.get ? getMethodUrl(url, params) : url;
  console.log(`CHECK_URL`, url);
  if (method == Request_Type.post) {
    // console.log(`CHECK_URL`, JSON.stringify(params));
  }

  try {
    fetch(
      url,
      method == Request_Type.get
        ? {
            method: method,
            headers: myHeaders,
            params: params,
          }
        : {
            method: method,
            headers: myHeaders,
            body: JSON.stringify(params),
          },
    )
      .then(response => response.json())
      .then(json => {
        if (json?.code == 400) {
          onFailure(`Bad Request`);
        } else {
          onSuccess(json);
          console.log('result--', json);
        }
      })
      .catch(error => {
        onFailure(error);
        console.log(`CALL API ERROR: `, JSON.stringify(error));
      });
  } catch (error) {
    onFailure(error);
    console.log(`CALL API ERROR: `, JSON.stringify(error));
  }
};

export const getMethodUrl = (url, body) => {
  if (body == null || body == NaN || body == '' || body == undefined) {
    return url;
  } else {
    var getUrl = '';

    let arrayOfBody = Object.entries(body).map(
      ([key, value]) => `${key}=${value}`,
    );
    var bodyUrl = '';
    for (i in arrayOfBody) {
      if (bodyUrl == '') {
        bodyUrl = arrayOfBody[i];
      } else {
        bodyUrl = bodyUrl + '&' + arrayOfBody[i];
      }
    }
    getUrl = url + '?' + bodyUrl;

    return getUrl;
  }
};

// export const getMenu = (params, onSuccess, onFailure) => {
//   CallApi(Api.GET_MENU, Request_Type.get, params, onSuccess, onFailure);
// };

export const getMenu = (onSuccess, onFailure) => {
  fetchData(Api.GET_MENU, onSuccess, onFailure);
};

export const AddMenu = (params, onSuccess, onFailure) => {
  postData(Api.ADD_MENU, params, onSuccess, onFailure);
};

export const logIn = (params, onSuccess, onFailure) => {
  postData(Api.LOG_IN, params, onSuccess, onFailure);
};

export const AddFcmToken = (params, onSuccess, onFailure) => {
  postData(Api.POST_FCM_TOKEN, params, onSuccess, onFailure);
};

export const getTodayOrder = (params, onSuccess, onFailure) => {
  fetchData(`${Api.GET_TODAY_ORDER}?restaurantId=${params?.id}`, onSuccess, onFailure);
};

/** For approve  */
// export const postNewUser = (params, onSuccess, onFailure) => {
//   CallApi(
//     `https://fdhosting.ca/townofsedgewick/api/register`,
//     Request_Type.post,
//     params,
//     onSuccess,
//     onFailure,
//   );
// };
