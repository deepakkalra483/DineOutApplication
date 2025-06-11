import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  ScrollView,
  Alert,
} from 'react-native';
import {Header} from '../HomeScreen';
import {AppColors} from '../../utils/AppColors';
import {AppImages} from '../../utils/AppImages';
import {RegularText, SemiBoldText} from '../../utils/AppConstants';
import {navigateTo} from '../../utils/RootNavigation';
import {AppScreens, NEW_ORDER_SCREEN} from '../../utils/AppScreens';
import {getUser} from '../../utils/AsynStorageHelper';
import {getTodayOrders} from '../../../redux/Action';
import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-community/async-storage';

const TableScreen = ({navigation}) => {
  const {OrdersModule} = NativeModules;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const refresh = useSelector(state => state?.refreshReducer?.read);
  useEffect(() => {
    getUser(res => {
      console.log('tables--', res);
      setDetails(res);
    });
    fetchOrders();
  }, [refresh]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await OrdersModule.getOrders();
      const parsedOrders = JSON.parse(response);
      setOrders(parsedOrders);
      console.log('parsed--', response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', error);
      setLoading(false);
    }
  };
  const dispatch = useDispatch();
  const numColumns = 4;
  const boxSize = Dimensions.get('window').width / numColumns - 20;
  // const {orders: ordersData, loading} = useSelector(
  //   state => state.todayOrderReducer,
  // );
  const getCurrentOrder = () => {
    getUser(res => {
      // console.log('res', res?.userId);
      dispatch(getTodayOrders({id: res?.id}));
    });
  };
  // console.log('order--', JSON.stringify(ordersData));
  // useEffect(() => {
  //   // getCurrentOrder();
  //   AsyncStorage.getItem('order--').then(data => {
  //     console.log('orderdata---', data);
  //   });
  //   if (ordersData && ordersData?.length == 0) {
  //     getCurrentOrder();
  //   }
  // }, []);

  const tableOrders = orders.reduce((acc, order) => {
    acc[order.table] = acc[order.table] || [];
    acc[order.table].push(order);
    return acc;
  }, {});
  // const renderItem = ({item, index}) => {
  //   const tableNumber = `T${index + 1}`;
  //   const tableOrder = orders.find(order => order?.table == tableNumber);
  //   // const tableNumber = `T${index + 1}`;
  //   // const tableOrder = orders.find(data => data.table_number == tableNumber);
  //   // console.log('tableOrder---', JSON.stringify(tableOrder));
  //   const hasUnreadOrders = tableOrder?.data?.some(order => order.read == '0');
  //   return (
  //     <TableCell
  //       newOrder={hasUnreadOrders}
  //       status={!!tableOrder}
  //       index={tableNumber}
  //       tableStyles={{width: boxSize, height: boxSize}}
  //       onPress={() => {
  //         navigation.navigate(NEW_ORDER_SCREEN, {
  //           table: tableNumber,
  //           data: tableOrder,
  //           id:details?.id
  //         });
  //       }}
  //     />
  //   );
  // };
  const renderItem = ({item, index}) => {
    const tableNumber = `T${index + 1}`;

    // Filter only valid orders
    const tableOrder = orders.find(
      order =>
        typeof order?.table === 'string' &&
        order.table.toLowerCase() === tableNumber.toLowerCase(),
    );

    // Ensure tableOrder exists before checking its properties
    const hasUnreadOrders = tableOrder?.data?.some(order => order.read === '0');

    return (
      <TableCell
        newOrder={hasUnreadOrders}
        status={!!tableOrder}
        index={tableNumber}
        tableStyles={{width: boxSize, height: boxSize}}
        onPress={() => {
          navigation.navigate(NEW_ORDER_SCREEN, {
            table: tableNumber,
            data: tableOrder,
            id: details?.id,
          });
        }}
      />
    );
  };
  return (
    <View style={{flex: 1, backgroundColor: AppColors.LIGHT_BACKGROUND}}>
      <Header
        title={'Table List'}
        right={details?.mobile == '8685015189' ? 'Add' : null}
        rightPress={() => navigation.navigate(AppScreens.ADD_RESTURANT)}
      />
      {loading ? (
        <ScrollView>
          <SemiBoldText text={'loading'} />
          {orders?.length == 0 && <SemiBoldText text={'no data'} />}
          {orders.map((order, index) => (
            <View style={{marginTop: 5, backgroundColor: 'red'}} key={index}>
              <Text style={{color: '#000'}}>Table: {order.table_number}</Text>
              <Text>Items: {order.items}</Text>
              <Text>read: {order.read}</Text>
              <Text>token: {order.token}</Text>
              <Text>time: {order.time_stamp}</Text>
              <Text>user: {order.user_id}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={Array.from({length: details?.tables})}
          renderItem={renderItem}
          // keyExtractor={item => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.container}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  box: {
    margin: 5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: AppColors?.LIGHT_GREEN_TEXT,
    borderWidth: 1,
    marginTop: 15,
  },
});
export default TableScreen;

export const TableCell = props => {
  const index = props?.index;
  const status = props?.status;
  const newOrder = props?.newOrder;
  console.log(index);
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.box, {borderWidth: status ? 1 : 0, ...props?.tableStyles}]}
      onPress={props?.onPress}>
      <Image
        style={{
          height: '85%',
          width: '85%',
        }}
        source={status ? AppImages?.ACTIVE_TABLE : AppImages?.TABLE_IMAGE}
      />
      <RegularText
        styles={{position: 'absolute', color: status ? '#000' : 'gray'}}
        text={index}
      />
      {newOrder && status && (
        <Text
          style={{
            backgroundColor: AppColors?.LIGHT_GREEN_TEXT,
            color: AppColors?.WHITE_TEXT,
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderBottomLeftRadius: 9,
            borderBottomRightRadius: 9,
            height: 18,
            textAlign: 'center',
            textAlignVertical: 'center',
            fontSize: 10,
          }}>
          New Order
        </Text>
      )}
    </TouchableOpacity>
  );
};
