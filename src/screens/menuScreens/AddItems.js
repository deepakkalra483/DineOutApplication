import {NativeModules, TouchableOpacity, View} from 'react-native';
import {Header} from '../HomeScreen';
import {InputView} from '../auth/LoginScreen';
import {SemiBoldText} from '../../utils/AppConstants';
import {AppColors} from '../../utils/AppColors';
import {useEffect, useState} from 'react';

const AddItems = () => {
  const {OrdersModule} = NativeModules;
  const [category, setCategory] = useState(null);
  const [categoryList, setCategoryList] = useState(null);

  const saveCategory = async () => {
    if (category) {
      try {
        const response = await OrdersModule.insertCategoryItem(category);
        console.log('read', response);
      } catch (error) {
        console.log('er', error);
      }
    }
  };

  const saveItem=async()=>{
    try {
      const response = await OrdersModule.insertMenuItem(category);
      console.log('read', response);
    } catch (error) {
      console.log('er', error);
    }
  }

  const getCategory = async () => {
    try {
      const response = await OrdersModule.getCategory();
      const parsedOrders = JSON.parse(response);
      setCategoryList(parsedOrders);
      // setOrders(parsedOrders);
      console.log('parsed--', response);
      // setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // setLoading(false);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <View style={{flex: 1, paddingHorizontal: 15}}>
      <Header title={'Add Items'} />
      <InputView
        title={'Category'}
        placeholder={'eg: Burgers'}
        // defaultValue={SelectItem?.category || category}
        onChangeText={i => setCategory(i)}
      />
      <SaveButton onPress={saveCategory} />
    </View>
  );
};

export default AddItems;

export const SaveButton = props => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.LIGHT_GREEN_TEXT,
        marginTop: 15,
        borderRadius: 15,
      }}
      onPress={props?.onPress}>
      <SemiBoldText
        styles={{color: AppColors.WHITE, fontSize: 14}}
        text={'Save'}
      />
    </TouchableOpacity>
  );
};
