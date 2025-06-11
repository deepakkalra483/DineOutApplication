import {
  Alert,
  FlatList,
  Linking,
  NativeModules,
  ScrollView,
  View,
} from 'react-native';
import {AppColors} from '../../utils/AppColors';
import {Header} from '../HomeScreen';
import {AppImages} from '../../utils/AppImages';
import {navigateTo} from '../../utils/RootNavigation';
import {AppScreens, TABLE_SCREEN} from '../../utils/AppScreens';
import {RegularText, SemiBoldText} from '../../utils/AppConstants';
import {useDispatch, useSelector} from 'react-redux';
import {calculateTime} from './OrderScreen';
import {useEffect, useState} from 'react';
import {updateRead} from '../../networking/FireStoreService';
import {getUser} from '../../utils/AsynStorageHelper';
import {
  ADD_NEW_PARAMS,
  SET_READ,
  SET_REFRESH,
  SET_UNREAD,
  UPDATE_READ,
} from '../../../redux/ReduxConstants';
import store from '../../../redux/store/Store';
import {ButtonView} from '../auth/LoginScreen';

const list = [
  {
    name: 'Cheese Burger',
    qty: 2,
  },
  {
    name: 'White Sauce Pasta',
    qty: 1,
  },
];
const NewOrderScreen = props => {
  const {OrdersModule} = NativeModules;
  const Data = props?.route?.params;
  // const Data = useSelector(state => state?.navReducer);
  const OrdersData = Data?.data;
  console.log('data---', OrdersData);
  const orders = Data?.data?.data || [];
  const newOrders = orders.filter(order => order.read == '0');
  const [time, setTime] = useState(calculateTime(OrdersData?.timeStamp));
  const [notLoading, setNotLoad] = useState(false);
  const dispatch = useDispatch();

  const OrderReady = async (token, data) => {
    setNotLoad(true);
    let phoneUrl = `tel:${`${token}`}`;
    setNotLoad(false);
    Linking.openURL(phoneUrl);
    return;
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Phone call not supported on this device');
          setNotLoad(false);
        } else {
          setNotLoad(false);
          return Linking.openURL(phoneUrl);
        }
      })
      .catch(err => {
        setNotLoad(false);
        console.error('An error occurred', err);
      });
    return;
    console.log('loading');
    const url =
      'https://notificationapi-zwf4.onrender.com/api/orders/orderReady';
    // `http://localhost:3001/api/orders/orderReady`

    const payload = {
      token: token,
      data: data,
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
        setNotLoad(false);
        Alert.alert('Success', 'Token sent successfully');
      } else {
        console.log('error--', JSON.stringify(data));
        Alert.alert('Error', 'Failed to send token');
        setNotLoad(false);
      }
    } catch (error) {
      console.log('noteree--', error);
      setNotLoad(false);
      Alert.alert('Error', 'Something went wrong, please try again');
    }
  };

  console.log('list--', newOrders);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setTime(calculateTime(OrdersData?.timeStamp));
  //   }, 60000); // Update every 60 seconds

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, []);

  // const oldOrders = orders
  //   .filter(order => order.read == '1')
  //   .flatMap(order => order.items || []);

  const convertOrdersToFirebaseFormat = ordersArray => {
    let ordersObject = {};

    ordersArray.forEach(order => {
      ordersObject[order.orderId] = {
        read: 1, // Updating read status to 1
        time: order.time,
        message: order.message,
        items: order.items,
      };
    });

    return {orders: ordersObject};
  };

  const MarkAsread = async () => {
    console.log('table--', OrdersData?.table);
    try {
      const response = await OrdersModule.markRead(OrdersData?.table);
      console.log('read', response);
    } catch (error) {
      console.log('er', error);
    }
  };

  useEffect(() => {
    // console.log('modules--', OrdersModule);
    if (newOrders?.length > 0) {
      console.log('neworder exssit');
      MarkAsread();
      dispatch({type: SET_REFRESH});
    }
  }, []);

  const timestamp = new Date(orders[0]?.time_stamp);
  timestamp.setMinutes(timestamp.getMinutes() + 330);

  // useEffect(() => {
  //   if (newOrders?.length > 0) {
  //     getUser(res => {
  //       console.log('item', JSON.stringify(Data?.params?.data));
  //       const OrderObject = convertOrdersToFirebaseFormat(OrdersData?.orders);
  //       updateRead(res?.id, OrdersData?.table, OrdersData?.userId, OrderObject);
  //       dispatch({type: UPDATE_READ, userId: OrdersData?.userId});
  //     });
  //   } else {
  //     console.log('item', JSON.stringify(Data?.params?.data));
  //     console.log('no new order');
  //   }
  // }, []);
  // const mergedItems = orders.flatMap(order => order.items || []);
  // console.log('data--', mergedItems);
  return (
    <View style={{flex: 1, backgroundColor: AppColors?.LIGHT_BACKGROUND}}>
      <Header
        leftSrc={AppImages?.BACK_ICON}
        title={'Orders'}
        leftPress={() => props?.navigation?.goBack()}
        right={`History`}
        rightPress={() =>
          props?.navigation.navigate(AppScreens.ORDER_HISTORY, {
            table: Data?.table,
          })
        }
      />
      <View
        style={{
          paddingHorizontal: 15,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: AppColors.LIGHT_BORDER,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <SemiBoldText
            styles={{fontSize: 20}}
            text={`Table: ${Data?.table}`}
            onPress={() => {
              const tableorder = {
                userId: '64735754-3370-4919-8807-2000076e74c6',
                table: 'T1',
                orders: [
                  {
                    orderId: 'nnsdknojDN',
                    time: '2025-02-18T16:20:28.417Z',
                    read: '0',
                    message: 'Spicy',
                    items: [{size: '', qty: 1, name: 'Mix Sauce Pasta'}],
                  },
                ],
              };
              store?.dispatch({
                type: ADD_NEW_PARAMS,
                data: {table: 'T1', params: tableorder},
              });
            }}
          />
          {Data?.data?.mobile && (
            <ButtonView
              loading={notLoading}
              click
              styles={{width: '30%', height: 30}}
              text={`Ready`}
              onPress={() =>
                OrderReady(Data?.data?.mobile, {
                  id: Data?.id,
                  table: Data?.table,
                })
              }
            />
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 10,
          }}>
          <SemiBoldText text={`Total Orders: ${orders?.length}`} />
          <RegularText
            // text={formatter.format(new Date(orders[0]?.time_stamp))}
            text={`${timestamp.toLocaleTimeString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
            })}`}
          />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{paddingBottom: 20, overflow: 'hidden'}}>
        {newOrders.map(item => (
          <View
            style={{
              marginHorizontal: 15,
              marginTop: 10,
              backgroundColor: '#ECEDED',
              overflow: 'hidden',
              borderRadius: 15,
              borderColor: '#8BB5BE',
              borderWidth: 1,
              marginBottom: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#EAF0F0',
                // justifyContent: 'space-between',
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}>
              <SemiBoldText text={`${timeAgo(item?.time_stamp)}`} />
              <SemiBoldText text={`     ${item?.message}`} />
            </View>
            <NewOrder status list={item?.items} />
          </View>
        ))}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#EAF0F0',
            paddingHorizontal: 15,
            paddingVertical: 3,
            marginBottom: 10,
            justifyContent: 'center',
          }}>
          <SemiBoldText
            styles={{}}
            text={`Last orders from ${Data?.data?.name}`}
          />
          {/* <SemiBoldText
          styles={{width: '25%', textAlign: 'center'}}
          text={'Quantity'}
        /> */}
        </View>
        {orders.map(
          item =>
            item?.read != 0 && (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      backgroundColor: AppColors.LIGHT_BORDER,
                      height: 1,
                      flex: 1,
                    }}></View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <SemiBoldText
                      styles={{
                        marginHorizontal: 15,
                        fontSize: 12,
                        color: AppColors.LIGHT_GRAY_TEXT,
                      }}
                      text={`${timeAgo(item?.time_stamp)}`}
                    />
                    <SemiBoldText
                      styles={{
                        marginRight: 15,
                        fontSize: 12,
                        color: 'green',
                      }}
                      text={`${item?.message}`}
                    />
                  </View>
                  <View
                    style={{
                      backgroundColor: AppColors.LIGHT_BORDER,
                      height: 1,
                      flex: 1,
                    }}></View>
                </View>
                <OldOrderCell list={item?.items} />
              </View>
            ),
        )}
        {/* <View
          style={{
            flex: 1,
            borderTopColor: '#A9A9A9',
            borderTopWidth: newOrders?.lenght > 0 ? 1 : 0,
            borderStyle: 'dashed',
            marginTop: newOrders?.lenght > 0 ? 15 : 0,
          }}>
          <OldOrderCell list={orders} />
        </View> */}
      </ScrollView>

      {/* <FlatList
        data={orders}
        contentContainerStyle={{paddingHorizontal: 15,paddingBottom:20}}
        renderItem={({item, index}) =>
          item?.read == 0 ? (
            <View
              style={{
                marginHorizontal: 15,
                marginTop: 10,
                backgroundColor: '#ECEDED',
                overflow: 'hidden',
                borderRadius: 15,
                borderColor: '#8BB5BE',
                borderWidth: 1,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#EAF0F0',
                  // justifyContent: 'space-between',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}>
                <SemiBoldText text={`${calculateTime(item?.time)}`} />
                <SemiBoldText text={`  ${item?.message}`} />
              </View>
              <NewOrder status list={item?.items} />
            </View>
          ) : (
            <OldOrderCell list={item?.items} />
          )
          // <View
          //   style={{
          //     marginHorizontal: 15,
          //     marginTop: 10,
          //     backgroundColor: '#ECEDED',
          //     overflow: 'hidden',
          //     borderRadius: 15,
          //     borderColor: '#8BB5BE',
          //     borderWidth: 1,
          //   }}>
          //   <View
          //     style={{
          //       flexDirection: 'row',
          //       alignItems: 'center',
          //       backgroundColor: '#EAF0F0',
          //       // justifyContent: 'space-between',
          //       paddingHorizontal: 10,
          //       paddingVertical: 5,
          //     }}>
          //     <SemiBoldText text={`${calculateTime(item?.time)}`} />
          //     <SemiBoldText text={`  ${item?.message}`} />
          //   </View>
          //   <NewOrder status list={item?.items} />
          // </View>
        }
      /> */}

      {/* <View
        style={{
          flex: 1,
          borderTopColor: '#A9A9A9',
          borderTopWidth: newOrders?.lenght > 0 ? 1 : 0,
          borderStyle: 'dashed',
          marginTop: newOrders?.lenght > 0 ? 15 : 0,
        }}>
        <OldOrderCell list={oldOrders} />
      </View> */}
    </View>
  );
};

export default NewOrderScreen;

const NewOrder = props => {
  const items = props?.list;
  const status = props?.status;
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#EAF0F0',
        }}></View>
      {items?.map(item => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <RegularText
            styles={{paddingVertical: 3, paddingLeft: 15}}
            text={`${item?.quantity} × ${item?.size || ''} ${item?.name}`}
          />
          {/* <SemiBoldText
            styles={{width: '30%', padding: 10, textAlign: 'center'}}
            text={'× ' + item?.qty}
          /> */}
        </View>
      ))}
      {status && (
        <SemiBoldText
          styles={{
            backgroundColor: '#8BB5BE',
            textAlign: 'center',
            fontSize: 12,
            marginTop: 5,
          }}
          text={'New order'}
        />
      )}
    </View>
  );
};

export const OldOrderCell = props => {
  const list = props?.list;
  return (
    <View>
      {/* <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#EAF0F0',
          paddingHorizontal: 15,
          paddingVertical: 3,
        }}>
        <SemiBoldText styles={{flex: 1}} text={'Items'} />
        <SemiBoldText
          styles={{width: '25%', textAlign: 'center'}}
          text={'Quantity'}
        />
      </View> */}
      <View>
        {list.map(item => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 15,
              paddingVertical: 3,
            }}>
            <SemiBoldText
              styles={{textAlign: 'center'}}
              text={item?.quantity + ' × '}
            />
            <SemiBoldText styles={{flex: 1}} text={item?.name} />
          </View>
        ))}
      </View>
    </View>
  );
};

export const timeAgo = timestamp => {
  // Convert SQLite timestamp (which is in UTC) to a Date object
  const utcDate = new Date(timestamp);

  // Convert UTC to IST (Indian Standard Time, UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istDate = new Date(utcDate.getTime() + istOffset);

  // Get the current time in IST
  const now = new Date();
  const timeDiff = now - istDate; // Difference in milliseconds

  // Convert time difference to seconds, minutes, hours, days
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(timeDiff / (1000 * 60));
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  // Format output
  if (seconds < 60) {
    return `${seconds} sec ago`;
  } else if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hr ago`;
  } else {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};
