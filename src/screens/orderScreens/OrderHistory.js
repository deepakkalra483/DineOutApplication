import {FlatList, NativeModules, View} from 'react-native';
import {AppImages} from '../../utils/AppImages';
import {Header} from '../HomeScreen';
import {BoldText, RegularText, SemiBoldText} from '../../utils/AppConstants';
import {useEffect, useState} from 'react';
import {OrderCell} from '../menuScreens/OrderScreen';

const OrderHistory = props => {
  const {OrdersModule} = NativeModules;
  const table = props?.route?.params?.table;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchOrders();
  }, []);
  return (
    <View style={{flex: 1}}>
      <Header
        leftSrc={AppImages?.BACK_ICON}
        title={`Order History`}
        leftPress={() => props?.navigation?.goBack()}
      />
      <SemiBoldText
        styles={{marginTop: 15, fontSize: 18,marginHorizontal:15}}
        text={`Table:  ${table}`}
      />
      {loading ? (
        <RegularText text={'LOading..'} />
      ) : (
        <FlatList
          data={orders}
          contentContainerStyle={{flexGrow: 1}}
          renderItem={({item, index}) => (
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
                <BoldText text={`Guest ${index+1}`} />
              </View>
              <View>
                {item?.data?.map((item, index) => (
                  <OrderCell
                    item={item}
                    index={index + 1}
                    // ready={token => props?.ready(token)}
                  />
                ))}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default OrderHistory;
