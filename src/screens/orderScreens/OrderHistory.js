import { FlatList, NativeModules, Text, View } from 'react-native';
import { AppImages } from '../../utils/AppImages';
import { Header } from '../HomeScreen';
import { BoldText, RegularText, SemiBoldText } from '../../utils/AppConstants';
import { useEffect, useState } from 'react';
import { OrderCell } from '../menuScreens/OrderScreen';
import { AppFonts } from '../../utils/AppFonts';
import { AppColors } from '../../utils/AppColors';
import { syncOrdersForDays, syncOrdersForMonth } from '../../networking/FireStoreService';

const OrderHistory = props => {
  const { OrdersModule } = NativeModules;
  const table = props?.route?.params?.table;
  const item = props?.route?.params?.item

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const getOrderTotal = (order) => {
    if (!order?.data || order.data.length === 0) return 0;

    return order.data.reduce((orderSum, dataItem) => {
      const items = dataItem.items || [];
      const itemsTotal = items.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseFloat(item.quantity) || 1; // default 1 if missing
        return sum + price * quantity;
      }, 0);

      return orderSum + itemsTotal;
    }, 0);
  };


  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await OrdersModule.getOrdersByTable(table);
      const parsedOrders = JSON.parse(response);
      setOrders(parsedOrders);
      console.log('parsed--', response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  // const startSync = async () => {
  //   const res = await syncOrdersForDays("bLTNV6P0UO7ypZeYLp7w", 7);

  //   console.log("SYNC RESULT:", res);
  // };

  useEffect(() => {
    // startSync()
    fetchOrders();
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <Header
        leftSrc={AppImages?.BACK_ICON}
        title={`Order History`}
        leftPress={() => props?.navigation?.goBack()}
      />
      <SemiBoldText
        styles={{ marginTop: 15, fontSize: 18, marginHorizontal: 15 }}
        text={`Room:  ${item?.room}`}
      />
      {loading ? (
        <RegularText text={'LOading..'} />
      ) : (
        <FlatList
          data={orders}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item, index }) => {
            const total = getOrderTotal(item);
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
                  <BoldText text={`${item?.name}  ${item?.id}`} />
                </View>
                <View>
                  {item?.data?.map((item, index) => (
                    <OrderCell
                      key={`qb_${index}`}
                      item={item}
                      index={index + 1}
                    // ready={token => props?.ready(token)}
                    />
                  ))}
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  borderTopWidth: 0.3,
                  paddingBottom: 5,
                  backgroundColor: AppColors.LIGHT_BACKGROUND,
                  borderBottomLeftRadius: 15,
                  borderBottomRightRadius: 15
                }}>
                  <Text style={{ fontSize: 15, fontFamily: AppFonts.BOLD, flex: 1 }}>Total</Text>
                  <Text style={{ fontSize: 15, fontFamily: AppFonts.BOLD }}>{`₹ ${total}`}</Text>
                </View>
              </View>
            )
          }}
        />
      )}
    </View>
  );
};

export default OrderHistory;
