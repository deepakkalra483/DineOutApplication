import database, { ref, update } from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import { Alert, NativeModules } from 'react-native';
import {
  CATEGORY_LIST,
  getUser,
  MENU,
  OFFERS,
  RESTURANT_MENU,
  SetMenu,
  storeRooms,
} from '../utils/AsynStorageHelper';
import AsyncStorage from '@react-native-community/async-storage';

const { OrdersModule } = NativeModules;

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
  const { OrdersModule } = NativeModules;
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
      const rooms = restaurantData?.rooms || []

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
          storeRooms(rooms)
          OrdersModule.storeRooms(rooms)
            .then(() => console.log('Rooms stored successfully in native side!'))
            .catch(err => console.log('Error storing rooms:', err));
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

export const updateTokenInDB = (restaurantId, newToken, deviceId) => {
  const restaurantRef = firestore()
    .collection('restaurants')
    .doc(restaurantId);

  firestore().runTransaction(async transaction => {
    const doc = await transaction.get(restaurantRef);

    if (!doc.exists) throw 'Restaurant not found';

    const tokens = doc.data().tokens || [];

    // update or insert token
    const updatedTokens = tokens.map(t =>
      t.deviceId === deviceId
        ? { ...t, token: newToken }   // update existing token
        : t
    );

    // If device doesn't exist, push new entry
    if (!updatedTokens.some(t => t.deviceId === deviceId)) {
      updatedTokens.push({ deviceId, token: newToken, type });
    }

    transaction.update(restaurantRef, { tokens: updatedTokens });
  });
}

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
        const offersData = restaurantData.offers || []
        const stringfyOffer = JSON.stringify(offersData)
        AsyncStorage.setItem(OFFERS, stringfyOffer)
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
    .update({ menu: menu })
    .then(() => {
      onSuccess();
    })
    .catch(() => {
      onFailure;
    });
};

export const AddOrUpdateUser = (newUser, onSuccess, onFailure) => {
  getUser(res => {
    const restaurantId = res?.id
    const restaurantRef = firestore()
      .collection('restaurants')
      .doc(restaurantId);

    restaurantRef.get()
      .then(doc => {
        if (!doc.exists) {
          onFailure("Document not found");
          return;
        }

        const users = doc.data().users || [];

        // 🔍 Find if room already exists
        const existingIndex = users.findIndex(u => u.room === newUser.room);

        let updatedUsers;

        if (existingIndex !== -1) {
          // 🔄 Replace existing user
          updatedUsers = [...users];
          updatedUsers[existingIndex] = newUser;
        } else {
          // ➕ Add new user
          updatedUsers = [...users, newUser];
        }

        // Update back to Firestore
        restaurantRef.update({ users: updatedUsers })
          .then(() => onSuccess())
          .catch(err => onFailure(err));
      })
      .catch(err => onFailure(err));
  });
};


export const UpdateOffer = (id, offer, onSuccess, onFailure) => {
  firestore()
    .collection('restaurants')
    .doc(id)
    .update({ offers: offer })
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

export const addCustomerInRoom = (id, rooms, onSuccess, onFailure) => {
  firestore()
    .collection('restaurants')
    .doc(id)
    .update({ rooms: rooms })
    .then(() => {
      onSuccess();
    })
    .catch(() => {
      onFailure;
    });
};

const getDatesForDays = (days) => {
  const result = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    result.push({
      year: String(d.getFullYear()),
      month: String(d.getMonth() + 1).padStart(2, "0"),
      day: String(d.getDate()).padStart(2, "0"),
    });
  }

  return result;
};

// export const syncOrdersForDays = async (restaurantId, days = 7) => {
//   try {
//     const dates = getDatesForDays(days);
//     let totalInserted = 0;

//     for (const d of dates) {
//       const path = `/Allorders/${restaurantId}/${d.year}/${d.month}/${d.day}/`;

//       const snapshot = await database().ref(path).once("value");

//       if (!snapshot.exists()) continue;

//       const customerGroups = snapshot.val(); // parent uuid → customer + orders

//       for (const parentId in customerGroups) {
//         const group = customerGroups[parentId];

//         // Extract customer details
//         const customer = group.customer || {
//           name: "",
//           mobile: "",
//         };

//         // Loop all orders inside customer group
//         for (const orderId in group) {
//           if (orderId === "customer") continue; // skip customer section

//           const order = group[orderId];

//           const items = order.items || [];
//           const tableId = order.tableId || "";
//           const msg = "";
//           const name = customer.name;
//           const mobile = customer.mobile;

//           console.log('data---',tableId+' / '+JSON.stringify(items)+" / "+orderId+' / '+msg+' / '+name+ ' / '+mobile)

//           // Insert into SQLite using your Native Module
//           await OrdersModule.insertOrderinDb(
//             tableId,
//             JSON.stringify(items),
//             orderId,
//             msg,
//             name,
//             mobile
//           );

//           totalInserted++;
//         }
//       }
//     }

//     return {
//       success: true,
//       message: `${totalInserted} orders synced`,
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: error?.message || "Sync failed",
//     };
//   }
// };

export const syncOrdersForMonth = async (restaurantId, year, month) => {
  try {
    const monthStr = String(month).padStart(2, "0");
    const yearStr = String(year);

    const path = `/Allorders/${restaurantId}/${yearStr}/${monthStr}/`;

    const monthSnap = await database().ref(path).once("value");

    if (!monthSnap.exists()) {
      return { success: true, message: "No data for this month", total: 0 };
    }

    const monthData = monthSnap.val(); // all days inside the month
    let totalInserted = 0;

    // Loop all days
    for (const day in monthData) {
      const dayData = monthData[day];

      // Loop all user groups (userId)
      for (const userId in dayData) {
        const group = dayData[userId];

        const customer = group.customer || {
          name: "",
          mobile: "",
        };

        const name = customer.name;
        const mobile = customer.mobile;

        // Loop each order inside the user group
        for (const key in group) {
          if (key === "customer") continue;

          const order = group[key];

          const items = order.items || [];
          const tableId = order.tableId || "";
          const msg = "";

          console.log(
            "INSERT →",
            tableId,
            JSON.stringify(items),
            userId,
            msg,
            name,
            mobile
          );

          // Insert into SQLite using Native Module
          await OrdersModule.insertOrderinDb(
            tableId,
            JSON.stringify(items),
            userId, // USE USERID (requested)
            msg,
            name,
            mobile
          );

          totalInserted++;
        }
      }
    }

    return {
      success: true,
      message: `${totalInserted} orders synced for ${monthStr}-${yearStr}`,
      total: totalInserted,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Month sync failed",
    };
  }
};

export const addOrderToDatabase = (
  restaurantId,
  tableId,
  userId,
  orderData,
  customerData,
  onSuccess,
  onFailure
) => {
  try {
    const db = database()

    // Date parts
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    // New auto orderId (uuid)
    const orderId = `${Date.now()}`


    const basePath = `Allorders/${restaurantId}/${yyyy}/${mm}/${dd}/${userId}`;

    const updates = {};

    // Create/Update customer node (safe)
    updates[`${basePath}/customer`] = customerData;

    // Add new order under userId with unique ID
    updates[`${basePath}/${orderId}`] = {
      tableId,
      timestamp: Date.now(),
      ...orderData    // items, totalAmount
    };

    update(ref(db, "/"), updates)
      .then(() => onSuccess?.(orderId))
      .catch((err) => onFailure?.(err));

  } catch (error) {
    console.log('error in rb--', error)
    onFailure?.(error);
  }
};

