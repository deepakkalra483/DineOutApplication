import {
  Alert,
  Button,
  FlatList,
  PermissionsAndroid,
  Platform,
  Text,
  View,
} from 'react-native';
import {
  BoldText,
  RegularText,
  SemiBoldText,
  styles,
} from '../../utils/AppConstants';
import {Header, ImageButton} from '../HomeScreen';
import {AppColors} from '../../utils/AppColors';
import {useEffect, useState} from 'react';
import Tts from 'react-native-tts';
import {getUser} from '../../utils/AsynStorageHelper';
import {useDispatch, useSelector} from 'react-redux';
import {getTodayOrders} from '../../../redux/Action';
import {
  SET_NEW_ORDER,
  TODAY_ORDER_LOADING,
} from '../../../redux/ReduxConstants';
import {AppFonts} from '../../utils/AppFonts';

const orders = [
  {
    tableNumber: '01',
    time: '1737005520114',
    id: 1,
    items: [
      {
        quantity: 3,
        name: 'Chees Burger',
      },
      {
        quantity: 1,
        name: 'Veg Burger',
      },
      {
        quantity: 3,
        name: 'Pepsi',
      },
    ],
    total: 6,
  },
  {
    tableNumber: '02',
    time: '1737005520115',
    id: 2,
    items: [
      {
        quantity: 1,
        name: 'Corn Pizza',
      },
      {
        quantity: 2,
        name: 'Masala Dhosa',
      },
      {
        quantity: 3,
        name: 'Oreo Shake',
      },
    ],
    total: 6,
  },
];
const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const dispatch = useDispatch();
  const {orders: ordersData, loading} = useSelector(
    state => state.todayOrderReducer,
  );

  const sortedUsers = ordersData?.sort(
    (a, b) => b.orders[0]?.time - a.orders[0]?.time,
  );
  // const res = useSelector(state => state.navReducer);
  // setOrders(ordersData);
  console.log('load--', loading);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.log('Refreshing List...');
  //     refreshList();
  //   }, 60000); // Refresh every 60 seconds

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, []);

  const sendToken = async token => {
    console.log('loading');
    const url =
      'https://notificationapi-zwf4.onrender.com/api/orders/orderReady';

    const payload = {
      token: token,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('dat--', data);
        Alert.alert('Success', 'Token sent successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to send token');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong, please try again');
    }
  };

  const getCurrentOrder = () => {
    getUser(res => {
      console.log('res', res?.userId);
      dispatch(getTodayOrders({id: res?.id}));
    });
  };

  useEffect(() => {
    if (ordersData && ordersData?.length == 0) {
      getCurrentOrder();
    }
  }, []);

  const newOrder = {
    id: '8141d1a4-4ca9-470b-9a01-aff92d2e9f67',
    orderId: '-OHnPEOgMM8FxW8Ok6ht',
    table: 'table1',
    time: 1738176787482,
    items: [{qty: 1, name: 'test Order'}],
  };

  const AddNewOrder = () => {
    dispatch({type: SET_NEW_ORDER, data: newOrder});
  };
  return (
    <View style={{flex: 1, backgroundColor: AppColors.LIGHT_BACKGROUND}}>
      <Header title={'My Orders'} />
      {loading ? (
        <RegularText text={'Loading'} />
      ) : (
        <FlatList
          data={sortedUsers || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 55, overflow: 'hidden'}}
          renderItem={({item}) => (
            // <UserOrderBox list={item?.orders} />
            <TableCell
              // tbale={item?.}
              ready={token => sendToken(token)}
              list={item?.orders}
            />
            // <OrderBox
            //   id={item?.id}
            //   item={item}
            //   play={() => {
            //     const textToSpeak = item?.items
            //       .map(item => `${item?.qty}${item?.name} `) // Concatenate name and qty
            //       .join(', '); // Join items with a comma and space
            //     speak(textToSpeak);
            //   }}
            //   // play={() => speak('एक पेप्सी बर्गर')}
            // />
          )}
        />
      )}
    </View>
  );
};

export default OrderScreen;

export const UserOrderBox = props => {
  useEffect(() => {
    Tts.setDefaultLanguage('hin-IND');
    Tts.setDefaultVoice('hi-in-x-hia-local"');
    Tts.setDefaultRate(0.5);
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
  }, []);
  const speak = text => {
    Tts.stop();
    Tts.speak(text);
  };
  const ordersList = props?.list;
  return (
    <View
      style={{
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        margin: 15,
        borderRadius: 15,
        elevation: 2,
        paddingVertical: 10,
      }}>
      {/* <SemiBoldText text={'Table'} /> */}
      <View>
        {ordersList?.map((item, index) => (
          <OrderBox
            orderNumber={index + 1}
            item={item}
            play={() => {
              const textToSpeak = item?.items
                .map(item => `${item?.qty}${item?.name} `) // Concatenate name and qty
                .join(', '); // Join items with a comma and space
              speak(textToSpeak);
            }}
          />
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
        {/* <ButtonView
          click
          styles={{
            width: '35%',
            height: 35,
            marginTop: 10,
            backgroundColor: '#fff',
            borderColor: 'rgba(0,0,0,0.5)',
            borderWidth: 1,
          }}
          textStyles={{color: '#000'}}
          text={`Total items: ${item?.items.reduce(
            (total, current) => total + current.qty,
            0,
          )}`}
        /> */}
        {/* <ButtonView
          click
          styles={{width: '45%', height: 35}}
          text={'Order Ready'}
        /> */}
      </View>
    </View>
  );
};

export const TableCell = props => {
  const ordersList = props?.list;
  return (
    <View
      style={{
        borderRadius: 15,
        backgroundColor: '#fff',
        margin: 15,
        elevation: 3,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 10,
        }}>
        <BoldText text={`Table Number- ${ordersList[0]?.table}`} />
      </View>
      <View>
        {ordersList?.map((item, index) => (
          <OrderCell
            item={item}
            index={index + 1}
            ready={token => props?.ready(token)}
          />
        ))}
      </View>
      {/* <ButtonView
        click
        styles={{
          width: '35%',
          height: 25,
          alignSelf: 'flex-end',
          marginRight: 10,
          marginBottom: 10,
        }}
        text={'Order Ready'}
      /> */}
      {/* <OrderCell /> */}
    </View>
  );
};

export const OrderCell = props => {
  const item = props?.item;
  const orderNumber = props?.index;
  console.log('item--', item);
  return (
    <View
      style={{
        paddingVertical: 5,
        borderColor: '#4A5568',
        borderStyle: 'dashed',
        borderTopWidth: 0.5,
      }}>
      <View
        style={{
          flexDirection: 'row',
          // justifyContent:'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}>
        <SemiBoldText text={`Order No- ${orderNumber}`} />
        <View
          style={{
            backgroundColor: '#4A5568',
            width: 1,
            height: 18,
            marginHorizontal: 5,
          }}></View>
        <SemiBoldText
          text={`${new Date(item?.time_stamp).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}`}
        />
        <SemiBoldText
          styles={{marginLeft: 10, color: 'green'}}
          text={item?.message}
        />
        {item?.token && (
          <Text
            style={{
              backgroundColor: AppColors?.LIGHT_GREEN_TEXT,
              paddingHorizontal: 8,
              paddingVertical: 3,
              fontSize: 11,
              borderRadius: 3,
              fontFamily: AppFonts?.REGULAR,
              color: 'white',
              position: 'absolute',
              right: 15,
              top: 3,
            }}
            onPress={() => props?.ready(item?.token)}>
            Ready
          </Text>
        )}
      </View>
      <View style={{paddingHorizontal: 10, paddingVertical: 5}}>
        {item?.items.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              // paddingVertical: 2.5,
            }}>
            <RegularText styles={{fontSize: 7, marginRight: 8}} text={'⏺️'} />
            <SemiBoldText text={` ${item?.quantity} × `} />
            <SemiBoldText text={` ${item?.name}`} />
          </View>
        ))}
      </View>
    </View>
  );
};

export const OrderBox = props => {
  const item = props?.item;
  const orderNumber = props?.orderNumber;
  return (
    <View
      key={props?.id}
      style={{
        borderColor: AppColors?.LIGHT_BORDER,
        borderBottomWidth: 0.5,
        marginBottom: 5,
        paddingBottom: 3,
      }}>
      {/* <View style={{backgroundColor:'#f5f5f5',height:20,
          width:'30%',
          // borderBottomRightRadius:15,
          borderTopRightRadius:8
        }}>
         <RegularText
        // styles={{color:'green'}}
        text={` New Order.: ${orderNumber} `}/>
        </View> */}
      {orderNumber == 1 && (
        <SemiBoldText
          styles={{
            fontSize: 22,
            borderBottomWidth: 0.5,
            borderBottomColor: AppColors?.LIGHT_BORDER,
            marginBottom: 5,
          }}
          text={`Table: ${item?.table}`}
        />
      )}
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <RegularText
            styles={{
              backgroundColor:
                orderNumber == 1
                  ? AppColors.LIGHT_GREEN_TEXT
                  : AppColors?.LIGHT_BORDER,
              borderRadius: 5,
              color: orderNumber == 1 ? '#fff' : 'gray',
              padding: 2,
              fontSize: 11,
            }}
            text={
              orderNumber == 1
                ? ` New Order.: ${orderNumber} `
                : ` Previous Order `
            }
          />
          <RegularText
            styles={{color: 'red', fontSize: 12}}
            text={calculateTime(item?.time)}
          />
          <ImageButton
            styles={{height: 35, width: 35}}
            src={require('../../assets/images/icons/play_icon.png')}
            onPress={props?.play}
          />
          {/* <RegularText
        styles={{
          fontSize: 12,
          color: AppColors.LIGHT_GRAY_TEXT,
          // marginBottom: 5,
        }}
        text={`Order.: ${orderNumber}    |     ${calculateTime(item?.time)}`}
      /> */}
        </View>
        {item?.items.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              // paddingVertical: 2.5,
            }}>
            <SemiBoldText text={` ${item?.qty} × `} />
            <SemiBoldText text={` ${item?.name}`} />
          </View>
        ))}
      </View>
    </View>
  );
};

export const calculateTime = dateString => {
  const now = new Date();
  const createdAt = new Date(dateString);
  const diffInMilliseconds = now - createdAt;
  console.log('diff--', createdAt.getTime());

  const diffInMinutes = Math.floor(diffInMilliseconds / 1000 / 60);
  const diffInHours = Math.floor(diffInMilliseconds / 1000 / 60 / 60);

  if (diffInHours > 0) {
    return `${diffInHours} Hr${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};
