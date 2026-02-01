import {
  Alert,
  FlatList,
  Image,
  Linking,
  NativeModules,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppColors } from '../../utils/AppColors';
import { Header } from '../HomeScreen';
import { AppImages } from '../../utils/AppImages';
import { navigateTo } from '../../utils/RootNavigation';
import { AppScreens, TABLE_SCREEN } from '../../utils/AppScreens';
import { RegularText, SemiBoldText } from '../../utils/AppConstants';
import { useDispatch, useSelector } from 'react-redux';
import { calculateTime } from './OrderScreen';
import { useEffect, useState } from 'react';
import { updateRead } from '../../networking/FireStoreService';
import { getUser } from '../../utils/AsynStorageHelper';
import {
  ADD_NEW_PARAMS,
  SET_READ,
  SET_REFRESH,
  SET_UNREAD,
  UPDATE_READ,
} from '../../../redux/ReduxConstants';
import store from '../../../redux/store/Store';
import { ButtonView } from '../auth/LoginScreen';
import { AppFonts } from '../../utils/AppFonts';
import RentPopup from '../../compponents/RentPopup';
import CheckInButton from '../../compponents/CheckInPopUp';
import { playAudio, stopAudio, toggleAudio } from '../../compponents/AudioPlayer';

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
  const { OrdersModule } = NativeModules;
  const Data = props?.route?.params;
  // const Data = useSelector(state => state?.navReducer);
  const OrdersData = Data?.data;
  console.log('data---', OrdersData);
  const [orders, setOrders] = useState(Data?.data?.data || [])
  // let orders = [...(Data?.data?.data || [])];
  const newOrders = orders.filter(order => order.read == '0');
  const [time, setTime] = useState(calculateTime(OrdersData?.timeStamp));
  const [notLoading, setNotLoad] = useState(false);
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false)

  const totalPrice = orders.reduce((orderSum, order) => {
    // sum each order’s items
    const orderTotal = order.items.reduce((itemSum, item) => {
      const price = parseFloat(item.price) || 0; // convert string price → number
      return itemSum + (item.quantity * price);
    }, 0);

    return orderSum + orderTotal;
  }, 0);


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
      dispatch({ type: SET_REFRESH });
    }
  }, []);

  let timestamp = orders[0]?.time_stamp ? new Date(orders[0]?.time_stamp) : new Date();
  if (orders[0]?.time_stamp) {
    timestamp.setMinutes(timestamp.getMinutes() + 330);
  }

  return (
    <View style={{ flex: 1, backgroundColor: AppColors?.WHITE, }}>
      <Header
        leftSrc={AppImages?.BACK_ICON}
        title={'Orders'}
        leftPress={() => props?.navigation?.goBack()}
        right={`History`}
        rightPress={() =>
          props?.navigation.navigate(AppScreens.ORDER_HISTORY, {
            table: Data?.table,
            item: Data?.item
          })
        }
      />
      <RentPopup
        visible={isVisible}
        data={Data}
        onClose={() => setIsVisible(false)}
        onSave={(rent) => {
          setOrders(prev => [{
            read: '1',
            message: 'rent',
            items: [{ name: `${rent.time} rent`, price: rent.rent, quantity: 1 }],
            orderId: 'rent',
            time: new Date().toISOString()
          }, ...prev,])
          setIsVisible(false)
          dispatch({ type: SET_REFRESH });
        }} />
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
            styles={{ fontSize: 20 }}
            text={`Room: ${Data?.item?.room}`}
            onPress={() => {
              // const tableorder = {
              //   userId: '64735754-3370-4919-8807-2000076e74c6',
              //   table: 'T1',
              //   orders: [
              //     {
              //       orderId: 'nnsdknojDN',
              //       time: '2025-02-18T16:20:28.417Z',
              //       read: '0',
              //       message: 'Spicy',
              //       items: [{ size: '', qty: 1, name: 'Mix Sauce Pasta' }],
              //     },
              //   ],
              // };
              // store?.dispatch({
              //   type: ADD_NEW_PARAMS,
              //   data: { table: 'T1', params: tableorder },
              // });
            }}
          />
          {Data?.data?.mobile && (
            <ButtonView
              loading={notLoading}
              click
              styles={{ width: '30%', height: 30 }}
              text={`Add Rent`}
              onPress={() =>
                setIsVisible(true)

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

      {/* <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.8 }}> */}
      {!Data?.data?.name && <Image
        style={{ height: 300, width: 300, alignSelf: 'center' }}
        resizeMode='cover'
        source={AppImages.CHECK_IN} />}
      <CheckInButton
        data={Data}
        isCheckIn={Data?.data?.name}
        onSubmit={(data) => {
          props?.navigation.goBack()
          dispatch({ type: SET_REFRESH });
          console.log("Check-in data:", data)
        }}
      />
      {/* // </View> */}

      {Data?.data?.name && <ScrollView
        contentContainerStyle={{ paddingBottom: 20, overflow: 'hidden' }}>
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
            text={Data?.data?.name ? `Last orders from ${Data?.data?.name}` : `No order from ${Data?.item?.room}`}
          />
          {/* <SemiBoldText
          styles={{width: '25%', textAlign: 'center'}}
          text={'Quantity'}
        /> */}
        </View>
        {orders.map(
          item => {
            console.log('orderItem---', item)
            const total = item?.items?.reduce((sum, item) => sum + (item?.quantity * parseFloat(item?.price) || 0), 0)
            return (
              item?.read != 0 && (
                <TouchableOpacity
                  activeOpacity={0.9}>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                </TouchableOpacity>
              ))
          }
        )}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          backgroundColor: '#EAF0F0',
          paddingHorizontal: 15,
          marginTop: 10,
          justifyContent: 'space-between'
        }}>
          <SemiBoldText text={'Total'} />
          <Text style={{
            textAlign: 'right',
            fontSize: 16,
            fontFamily: AppFonts.BOLD,
          }}>{`₹ ${totalPrice}`}</Text>
        </View>
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
      </ScrollView>}

    </View>
  );
};

export default NewOrderScreen;

const NewOrder = props => {
  const items = props?.list;
  const status = props?.status;
  const [playingUrl, setPlayingUrl] = useState(null);

  useEffect(() => {
    // Stop audio when component unmounts
    return () => stopAudio(setPlayingUrl);
  }, []);

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
          key={item.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* 🎙 AUDIO ITEM */}
          {item?.id === 'audio' ? (
            item?.type === 'audio' ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 6,
                  paddingHorizontal: 15,
                  backgroundColor: '#ffefea',
                  flex: 1,
                  justifyContent: 'center',
                  borderRadius: 6,
                }}
                onPress={() => toggleAudio(item.audioUrl, setPlayingUrl)}
              >
                <Text style={{ marginRight: 6 }}>
                  🎙 Voice Message / Instruction
                </Text>

                <Image
                  style={{ height: 18, width: 18, resizeMode: 'contain' }}
                  source={
                    playingUrl
                      ? require('../../assets/images/icons/pause.png')
                      : require('../../assets/images/icons/play_icon.png')
                  }
                />
              </TouchableOpacity>
            ) : (
              // 📝 TEXT INSTRUCTION
              <View
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  paddingHorizontal: 15,
                  backgroundColor: '#ffefea',
                  borderRadius: 6,
                }}
              >
                <Text style={{ textAlign: 'center' }}>
                  Message / Instruction
                </Text>

                <SemiBoldText
                  styles={{ textAlign: 'center' }}
                  text={item?.audioUrl}
                />
              </View>
            )
          ) : (
            // 🍔 NORMAL FOOD ITEM
            <RegularText
              styles={{ paddingVertical: 3, paddingLeft: 15, flex: 1 }}
              text={`${item?.quantity} × ${item?.size || ''} ${item?.name}`}
            />
          )}
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
  const [playingUrl, setPlayingUrl] = useState(null);

  useEffect(() => {
    return () => stopAudio(setPlayingUrl);
  }, []);

  return (
    <View>
      {list.map((item, index) => (
        <View
          key={`item-${item.audioUrl || index}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 3,
          }}
        >
          <SemiBoldText
            styles={{ textAlign: 'center' }}
            text={item?.id === 'audio' ? '' : item?.quantity + ' × '}
          />

          {item?.id === 'audio' ? (
            item?.type === 'audio' ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  flex: 1,
                  justifyContent: 'center',
                  paddingBottom: 3,
                  backgroundColor: '#ffefea',
                  borderRadius: 6,
                }}
                onPress={() => toggleAudio(item.audioUrl, setPlayingUrl)}
              >
                <Text style={{ marginRight: 6 }}>Voice Message/Instruction</Text>
                <Image
                  style={{ height: 20, width: 20, resizeMode: 'contain' }}
                  source={
                    playingUrl === item.audioUrl
                      ? require('../../assets/images/icons/pause.png')
                      : require('../../assets/images/icons/play_icon.png')
                  }
                />
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  flex: 1,
                  paddingBottom: 3,
                  backgroundColor: '#ffefea',
                  borderRadius: 6,
                }}
              >
                <Text style={{ textAlign: 'center' }}>Message / Instruction:</Text>
                <SemiBoldText
                  text={item?.audioUrl}
                  styles={{ textAlign: 'center' }}
                />
              </View>
            )
          ) : (
            <SemiBoldText styles={{ flex: 1 }} text={item?.name} />
          )}

          {item?.id !== 'audio' && <SemiBoldText text={`₹ ${item?.price}`} />}
        </View>
      ))}
    </View>
  );
};


export const timeAgo = timestamp => {
  if (!timestamp) {
    return ``
  }
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
