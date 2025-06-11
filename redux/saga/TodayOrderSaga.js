import {call, put, takeEvery} from 'redux-saga/effects';
import {Api} from '../../src/networking/Api';
import {
  SET_TODAY_ORDER_DATA,
  SET_TODAY_ORDER_LIST,
  TODAY_ORDER_LOADING,
} from '../ReduxConstants';
import {getUser, USER} from '../../src/utils/AsynStorageHelper';
import {getTodayOrderData} from '../../src/networking/FireStoreService';
import AsyncStorage from '@react-native-community/async-storage';
import {
  get,
  getDatabase,
  limitToLast,
  orderByChild,
  query,
  ref,
} from '@react-native-firebase/database';

function* todayOrderList(action) {
  // try {
  //   // Dispatch loading state
  //   yield put({type: TODAY_ORDER_LOADING, loading: true});
  //   getUser(res=>{
  //     const id=res?.id
  //     getTodayOrderData(id,response=>{
  //       const data=response
  //       yield put({type: SET_TODAY_ORDER_DATA, data});
  //     },error=>{
  //       console.error("Error fetching today's orders:", error);
  //       yield put({type: TODAY_ORDER_LOADING, loading: false});
  //     })
  //   })
  //   // const {params} = action; // Extract params from the action
  //   // const url = `${Api.GET_TODAY_ORDER}?restaurantId=${1}`;
  //   // let data = yield fetch(url);
  //   // data = yield data.json();
  //   // // Dispatch the fetched data
  //   // yield put({type: SET_TODAY_ORDER_DATA, data});
  // } catch (error) {
  //   console.error("Error fetching today's orders:", error);
  //   yield put({type: TODAY_ORDER_LOADING, loading: false});
  //   // Handle error if necessary
  // } finally {
  //   // Set loading to false regardless of success or failure
  //   yield put({type: TODAY_ORDER_LOADING, loading: false});
  // }

  try {
    const id = action?.params?.id;
    console.log('id--', id);
    const currentTimeStamp = new Date();
    const date = currentTimeStamp?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const db = getDatabase();
    const snapshot = yield call(() =>
      db.ref(`/latestOrders/${id}/${date}`).once('value'),
    );
    console.log('snap--', JSON.stringify(snapshot.val()));
    const data = snapshot.val();
    const ordersArray = Object.entries(data).flatMap(([table, tableData]) =>
      Object.entries(tableData)
        .filter(
          ([id, data]) => data.orders && Object.keys(data.orders).length > 0,
        ) // Filter out empty orders
        .map(([id, data]) => ({
          userId: id,
          table,
          token: data.token,
          orders: Object.entries(data.orders).map(
            ([orderId, orderDetails]) => ({
              orderId,
              ...orderDetails,
            }),
          ),
          timeStamp: data.latestTimestamp,
        })),
    );
    yield put({type: SET_TODAY_ORDER_DATA, data: ordersArray});
  } catch (error) {
    console.error('Error fetching orders:', error);
    yield put({type: TODAY_ORDER_LOADING, loading: false});
  } finally {
    yield put({type: TODAY_ORDER_LOADING, loading: false});
  }
}

function* TodayOrderSaga() {
  yield takeEvery(SET_TODAY_ORDER_LIST, todayOrderList);
}

export default TodayOrderSaga;

const fetchLatestUsers = async (restaurantId, date) => {
  const db = getDatabase();
  const latestUsersRef = ref(
    db,
    `latestOrdersIndex/${restaurantId}/latestUsers`,
  );

  try {
    // Query latest user from each table
    const snapshot = await get(
      query(latestUsersRef, orderByChild('timestamp')),
    );

    if (!snapshot.exists()) {
      console.log('No recent orders found.');
      return [];
    }

    const latestUsers = [];
    snapshot.forEach(tableSnapshot => {
      latestUsers.push({
        tableId: tableSnapshot.key, // Table ID
        ...tableSnapshot.val(), // User ID and timestamp
      });
    });

    console.log('Latest Users from All Tables:', latestUsers);
    return latestUsers;
  } catch (error) {
    console.error('Error fetching latest users:', error);
    return [];
  }
};
