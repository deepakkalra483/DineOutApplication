import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StatusBar,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppScreens,
  EDIT_SCREEN,
  HOME_SCREEN,
  LOGIN_SCREEN,
  NEW_ORDER_SCREEN,
  NEW_SPLASH_SCREEN,
  SPLASH_SCREEN,
  TABLE_SCREEN,
} from './AppScreens';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import store from '../../redux/store/Store';
import { SetRoute } from '../../redux/Action';
import EditScreen from '../screens/editScreens/EditScreen';
import NewSplashScreen from '../screens/auth/NewSplashScreen';
import NewOrderScreen from '../screens/menuScreens/NewOrderScreen';
import TableScreen from '../screens/menuScreens/TableScreen';
import { useEffect, useRef } from 'react';
import messaging from '@react-native-firebase/messaging';
import { ADD_NEW_PARAMS, SET_NEW_ORDER } from '../../redux/ReduxConstants';
import Tts from 'react-native-tts';
import AsyncStorage from '@react-native-community/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import UserScreen from '../screens/task/UserScreen';
import ChatScreen from '../screens/task/ChatScreen';
import AddItems from '../screens/menuScreens/AddItems';
import OrderHistory from '../screens/orderScreens/OrderHistory';
import AddResturant from '../screens/menuScreens/AddResturant';
import InsertMenu from '../screens/menuScreens/InsertMenu';
import OfferScreen from '../screens/offers/OfferScreen';
import Location from '../screens/locationDemo/CustomerScreen';
import CustomerScreen from '../screens/locationDemo/CustomerScreen';
import OrderDetailsScreen from '../screens/menuScreens/OrderDetailScreen';
import UpdateMenuScreen from '../screens/menuScreens/UpdateMenuScreen';

const RootNavigation = props => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const currentRoute = useSelector(state => state.navReducer.currentRoot);
  const navigationRef = useRef(null);

  useEffect(() => {
    Tts.setDefaultLanguage('hin-IND');
    Tts.setDefaultVoice('hi-in-x-hia-local"');
    Tts.setDefaultRate(0.4);
    Tts.setDefaultPitch(1.0);
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
      }
    };

    // Tts.getInitStatus().then(() => {
    //   Tts.voices().then(voices => console.log(voices));
    // });
    requestPermissions();
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message handled:', remoteMessage);
      // navigationRef.current.navigate(HOME_SCREEN);
      // handleNewOrder(remoteMessage?.data, currentRoute);
      // displayIncomingCall('qwvffq', 'cvbeU', 'CVHVCEWC');
      // speak(
      //   JSON.parse(remoteMessage?.data?.items)
      //     ?.map(order => `${order?.qty} ${order?.name}`)
      //     .join(', '),
      // );
    });

    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      // navigationRef.current.navigate(HOME_SCREEN);
      // const data = remoteMessage?.data;
      // handleNewOrder(data, currentRoute);
      // speak('New order Receive');
    });
  }, []);
  const speak = text => {
    Tts.stop();
    Tts.speak(text);
  };
  console.log(currentRoute);
  return (
    // <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        // initialRouteName={AppScreens.NEW_SPLASH_SCREEN}
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name={NEW_SPLASH_SCREEN} component={NewSplashScreen} />
        <Stack.Screen name={LOGIN_SCREEN} component={LoginScreen} />
        <Stack.Screen name={HOME_SCREEN} component={HomeScreen} />
        <Stack.Screen name={TABLE_SCREEN} component={TableScreen} />
        <Stack.Screen
          name={AppScreens.ORDER_HISTORY}
          component={OrderHistory}
        />
        <Stack.Screen name={AppScreens.USER_SCREEN} component={UserScreen} />
        <Stack.Screen name={AppScreens.CHAT_SCREEN} component={ChatScreen} />
        <Stack.Screen name={AppScreens.ADD_ITEMS_SCREEN} component={AddItems} />
        <Stack.Screen name={NEW_ORDER_SCREEN} component={NewOrderScreen} />
        <Stack.Screen
          name={AppScreens.ADD_RESTURANT}
          component={AddResturant}
        />
        <Stack.Screen
          name={AppScreens.INSERT_MENU}
          component={InsertMenu}
        />
        <Stack.Screen
          name={AppScreens.OFFER_SCREEN}
          component={OfferScreen}
        />
        <Stack.Screen
          name={'CustomerScreen'}
          component={CustomerScreen}
        />
        <Stack.Screen
          name={AppScreens.ORDER_DETAIL_SCREEN}
          component={OrderDetailsScreen}
        />
        <Stack.Screen
          name={AppScreens.UPDATE_MENU_SCREEN}
          component={UpdateMenuScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;

export const navigateTo = (name, params) => {
  store?.dispatch(SetRoute({ name: name, params: params }));
};

export const handleNewOrder = (data, screen) => {
  console.log('handleorserd---', JSON.stringify(data));
  const parsedItem = JSON.parse(data?.items);
  const newOrderData = {
    id: data?.id,
    orderId: data?.orderId,
    items: parsedItem,
    time: data?.time,
    message: data?.message,
    table: data?.tableNumber,
    read: '0',
  };
  const tableOrder = {
    userId: data?.id,
    table: data?.tableNumber,
    orders: [
      {
        id: data?.orderId,
        items: parsedItem,
        time: data?.time,
        message: data?.message,
        table: data?.tableNumber,
        read: '0',
      },
    ],
  };
  console.log('newOrder--', newOrderData);
  if (screen == NEW_ORDER_SCREEN) {
    // navigateTo(NEW_ORDER_SCREEN, {table: data?.tableNumber, data: tableOrder});
    // store?.dispatch(
    //   SetRoute({
    //     name: screen,
    //    {table: data?.tableNumber, data: tableOrder},
    //   }),
    // );
    store?.dispatch({ type: ADD_NEW_PARAMS, data: { params: tableOrder } });
    store?.dispatch({ type: SET_NEW_ORDER, data: { ...newOrderData, read: 1 } });
  } else {
    store?.dispatch({ type: SET_NEW_ORDER, data: newOrderData });
  }
  AsyncStorage.setItem('order', data?.orderId);
};
