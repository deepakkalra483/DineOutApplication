import React, { useEffect, useState } from 'react';
import { Image, NativeModules, ScrollView, StyleSheet, Text, View } from 'react-native';
import OrderCard from '../../compponents/incomingOrder/OrderCard';
import { Header } from '../HomeScreen';
import { AppImages } from '../../utils/AppImages';
import { AppScreens } from '../../utils/AppScreens';
import OrderHeader from '../../compponents/incomingOrder/OrderHeader';
import RentPopup from '../../compponents/RentPopup';
import CheckInButton from '../../compponents/CheckInPopUp';
import { useDispatch } from 'react-redux';
import { SET_REFRESH } from '../../../redux/ReduxConstants';
import { AppFonts } from '../../utils/AppFonts';
import { AppColors } from '../../utils/AppColors';
import { SemiBoldText } from '../../utils/AppConstants';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { OrdersModule } = NativeModules;
  const Data = route?.params;
  const tableOrder = route?.params?.data;
  const dispatch = useDispatch();
  // const orders = tableOrder?.data || [];

  const [orders, setOrders] = useState(tableOrder?.data || [])
  const [isVisible, setIsVisible] = useState(false)

  const newOrders = orders.filter(o => o.read === '0');
  const oldOrders = orders.filter(o => o.read !== '0');

  const totalPrice = orders.reduce((orderSum, order) => {
    // sum each order’s items
    const orderTotal = order.items.reduce((itemSum, item) => {
      const price = parseFloat(item.price) || 0; // convert string price → number
      return itemSum + (item.quantity * price);
    }, 0);

    return orderSum + orderTotal;
  }, 0);

  const MarkAsread = async () => {
      try {
        const response = await OrdersModule.markRead(tableOrder?.table);
        // console.log('read', response);
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

  return (
    <View style={{ flex: 1 }}>
      <OrderHeader
        Details={Data}
        onBack={() => navigation?.goBack()}
        onHistory={() => {
          navigation.navigate(AppScreens.ORDER_HISTORY, {
            table: Data?.table,
            item: Data?.item
          })
        }}
        onAdd={() => setIsVisible(true)} />

      <RentPopup
        visible={isVisible}
        data={Data}
        onClose={() => setIsVisible(false)}
        onSave={(rent) => {
          setOrders(prev => [{
            read: '1',
            message: 'rent',
            items: [{ name: `${rent.time}`, price: rent.rent, quantity: 1, message: 'rent' }],
            orderId: 'rent',
            time: new Date().toISOString()
          }, ...prev,])
          setIsVisible(false)
          dispatch({ type: SET_REFRESH });
        }} />

      <CheckInButton
        data={Data}
        isCheckIn={Data?.data?.name}
        onSubmit={(data) => {
          navigation.goBack()
          dispatch({ type: SET_REFRESH });
          console.log("Check-in data:", data)
        }}
      />

      {!Data?.data?.name &&
        <Text style={styles.no_customer_text}>
          {`Room is available. You can proceed with guest check-in.`}
        </Text>}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 15, backgroundColor: '#ECEDED', paddingBottom: 20 }}>
        {newOrders.map(order => (
          <OrderCard
            key={order.orderId}
            order={order}
            isNew
          />
        ))}

        {Data?.data?.name &&
          <View style={styles.invoice}>
            <Text style={styles.price_text}>{`INVOICE`}</Text>
            <View>
              <Text style={styles.name_text}>{`${Data.data.name}`}</Text>
              <Text style={styles.name_text}>{`${Data.data.mobile}`}</Text>
            </View>
          </View>
        }
        {oldOrders.map(order => (
          <OrderCard
            key={order.orderId}
            order={order}
          />
        ))}

        {Data?.data?.name && <View style={styles.price_container}>
          <Text style={styles.price_text}>{`Total`}</Text>
          <Text style={styles.price_text}>{`₹ ${totalPrice}`}</Text>
        </View>}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create(({
  no_customer_text: {
    fontSize: 16,
    fontFamily: AppFonts.SEMIBOLD,
    color: AppColors.BORDER_COLOR,
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 24,
    marginVertical: 30
  },
  price_container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    borderTopWidth: 0.5
  }, price_text: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: AppFonts.BOLD,
    // backgroundColor: '#fff'
    // textAlignVertical
  },
  invoice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:'#fff8f6',
    justifyContent:'space-between',
    paddingHorizontal:10,
    marginTop:10
  },name_text:{
    fontSize:12,
    color:AppColors.BLACK,
    fontFamily:AppFonts.SEMIBOLD
  }
}))


export default OrderDetailsScreen;
