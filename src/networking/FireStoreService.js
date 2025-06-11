import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import {Alert} from 'react-native';
import {
  CATEGORY_LIST,
  MENU,
  RESTURANT_MENU,
  SetMenu,
} from '../utils/AsynStorageHelper';
import AsyncStorage from '@react-native-community/async-storage';

// export const handleLogin = async params => {
//   const {contact, password} = params;
//   if (!contact || !password) {
//     Alert.alert('Error', 'Please fill in both fields.');
//     return;
//   }

//   try {
//     // Query Firestore for the restaurant with the matching contact and password
//     const snapshot = await firestore()
//       .collection('restaurants')
//     //   .where('contact', '==', contact)
//     //   .where('password', '==', password)
//       .get();

//     if (snapshot.empty) {
//       Alert.alert('Login Failed', 'Invalid contact or password.');
//       return;
//     }

//     // Get the matching document (assuming only one match)
//     const restaurantDoc = snapshot.docs[0];
//     const restaurantId = restaurantDoc.id;

//     // Generate a token (replace with a secure method)
//     const token = `token-${restaurantId}-${Date.now()}`;

//     // Update the Firestore document with the token
//     await firestore()
//       .collection('restaurants')
//       .doc(restaurantId)
//       .update({token});

//     Alert.alert('Login Successful', `Welcome! Token: ${token}`);
//   } catch (error) {
//     console.error('Error during login:', error);
//     Alert.alert('Error', 'Something went wrong. Please try again.');
//   }
// };
export const getData = () => {
  database()
    .ref('/resturants')
    .once('value')
    .then(snapshot => {
      console.log('User data: ', snapshot.val());
    });
};

export const handleLogin = (params, onSuccess, onFailure) => {
  console.log('call');
  firestore()
    .collection('restaurants')
    .where('contact', '==', params?.mobile)
    .where('password', '==', params?.password)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        Alert.alert('Login Failed', 'Invalid contact or password.');
        onFailure();
        return;
      }
      const restaurantDoc = snapshot.docs[0];
      const restaurantId = restaurantDoc.id;
      console.log('user--', restaurantId);
      const restaurantData = restaurantDoc.data();
      const existingTokens = restaurantData.tokens || [];

      // Check if deviceId already exists in tokens
      const deviceTokenIndex = existingTokens.findIndex(
        t => t.deviceId === params?.deviceId,
      );
      const tokendata = {
        deviceId: params?.deviceId,
        type: params?.userType,
        token: params?.token,
      };
      if (deviceTokenIndex > -1) {
        // Update the existing token
        existingTokens[deviceTokenIndex] = tokendata;
      } else {
        // Add a new token entry
        existingTokens.push(tokendata);
      }
      firestore()
        .collection('restaurants')
        .doc(restaurantId)
        .update({
          tokens: existingTokens,
        })
        .then(res => {
          onSuccess(restaurantId);
          console.log('updateSucees');
        })
        .catch(error => {
          onFailure();
          console.log('updateerror---', error);
        });
    })
    .catch(error => {
      onFailure();
      console.log('error--', error);
    });
};

export const getMenuData = (restaurantId, onSuccess, onFailure) => {
  console.log('id---', restaurantId);
  firestore()
    .collection('restaurants')
    .doc(restaurantId)
    .get()
    .then(snapshot => {
      if (snapshot.exists) {
        const restaurantData = snapshot.data();
        const menuList = restaurantData?.menu || [];
        const stringfyMenu = JSON.stringify(menuList);
        AsyncStorage.setItem(MENU, stringfyMenu)
          .then(() => {
            const categories = menuList.map(item => item?.category);
            const uniqueCategories = [...new Set(categories)];
            const stringfyList = JSON.stringify(uniqueCategories);
            AsyncStorage.setItem(CATEGORY_LIST, stringfyList).then(() => {
              onSuccess(menuList);
            });
          })
          .catch(() => {
            onFailure();
          })
          .catch(() => {
            onFailure();
          });
        return;
        const restaurantDoc = snapshot.data();
        console.log('menu--', restaurantDoc?.menu);
        return restaurantDoc?.menu;
        const restaurantId = restaurantDoc.id;
      }
    })
    .catch(e => {
      console.log('menuerr--', e);
    });
};

export const getTodayOrderData = (id, onSuccess, onFailure) => {
  const currentTimeStamp = new Date();
  const date = currentTimeStamp?.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  database()
    .ref(`/orders/${id}/${date}`)
    .once('value')
    .then(snapshot => {
      const orders = snapshot.val();
      const ordersArray = Object.entries(orders).map(([id, details]) => ({
        id,
        ...details,
      }));
      console.log('Order data: ', ordersArray);
      onSuccess(ordersArray);
    })
    .catch(error => {
      onFailure(error);
    });
};

export const UpdateMenu = (id, menu, onSuccess, onFailure) => {
  firestore()
    .collection('restaurants')
    .doc(id)
    .update({menu: menu})
    .then(() => {
      onSuccess();
    })
    .catch(() => {
      onFailure;
    });
};

export const AddRestaurantInDb = (data, onSuccess, onFailure) => {
  const restaurantRef = firestore().collection('restaurants').doc();
  const restaurantId = restaurantRef.id;

  restaurantRef
    .set({
      restaurantId: restaurantId,
      name: data.name,
      password: data.password,
      contact: data.contact,
    })
    .then(() => {
      onSuccess(restaurantId);
    })
    .catch(error => {
      onFailure(error);
    });
};

export const DeleteRestaurant = (id, onSuccess, onFailure) => {
  firestore()
    .collection('restaurants')
    .doc(id)
    .delete()
    .then(() => {
      onSuccess();
    })
    .catch(error => {
      onFailure(error);
    });
};

export const updateRead = (restaurantId, tableId, userId, data) => {
  console.log('call');
  const currentTimeStamp = new Date();
  const date = currentTimeStamp?.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  database()
    .ref(`/latestOrders/${restaurantId}/${date}/${tableId}/${userId}/`)
    .update(data)
    .then(() => {
      console.log('updateSucces');
    })
    .catch(error => {
      console.log('updaterror-', error);
    });
};
