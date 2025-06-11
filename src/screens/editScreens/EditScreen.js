import {FlatList, Modal, TextInput, TouchableOpacity, View} from 'react-native';
import {RegularText, SemiBoldText, styles} from '../../utils/AppConstants';
import {Header} from '../HomeScreen';
import {ButtonView, InputView} from '../auth/LoginScreen';
import {AppColors} from '../../utils/AppColors';
import {useEffect, useState} from 'react';
import {AddMenu} from '../../networking/CallApi';
import {
  CATEGORY,
  GetCategory,
  getUser,
  SetCategory,
} from '../../utils/AsynStorageHelper';
import AsyncStorage from '@react-native-community/async-storage';

const categories = [
  {
    id: 1,
    name: 'Burgers',
  },
  {
    id: 2,
    name: 'Pizzas',
  },
  {
    id: 3,
    name: 'South Indian Food',
  },
];
const EditScreen = () => {
  const [category, setCategory] = useState(null);
  const [name, setName] = useState(null);
  const [price, setPrice] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [userData, setData] = useState(null);
  const [id, setId] = useState(0);
  const [menu, setMenu] = useState([]);
  const [itemDetail, setItemDetail] = useState(null);

  const AddItem = () => {
    // AsyncStorage.removeItem(CATEGORY)
    if ((price, category, name)) {
      SetCategory(
        category,
        {
          name: name,
          price: price,
          src: imageUrl,
          id: id + 1,
        },
        res => {
          setId(id + 1);
        },
      );
      setName(null);
      setPrice(null);
      setImageUrl(null);
    }
  };
  useEffect(() => {
    // getUser(response => {
    //   console.log('data--', response);
    //   setData(response);
    // });
    GetCategory(res => {
      setItemDetail(res);
      setId;
      console.log('category--', res);
    });
  }, [id]);
  const storeMenu = () => {
    AddMenu(
      {
        restaurantId: userData?.userId,
        category: category,
        name: name,
        price: price,
        src: imageUrl,
        imageUrl:
          'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fcheeseburger%2F&psig=AOvVaw0g1JfCwry59k5b932-6nkS&ust=1737115677782000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCODRw6ia-ooDFQAAAAAdAAAAABAE',
      },
      reponse => {
        console.log('res---', JSON.stringify(reponse));
      },
      error => {
        console.log('erro--', error);
      },
    );
  };
  return (
    <View style={styles.container}>
      <Header title={'Add Items'} />
      <View
        style={{
          // flex: 1,
          paddingHorizontal: 15,
          backgroundColor: '#fff',
          paddingTop: 5,
        }}>
        {/* <SemiBoldText
          styles={{fontSize: 20, marginVertical: 15}}
          text={userData?.name}
        /> */}
        <InputView
          title={'Category'}
          placeholder={'eg: Burgers'}
          defaultValue={category}
          onChangeText={i => setCategory(i)}
        />
        <InputView
          title={'Name of Item'}
          defaultValue={name}
          placeholder={'eg: Chees Burger'}
          onChangeText={i => setName(i)}
        />
        <InputView
          title={'Image'}
          defaultValue={imageUrl}
          placeholder={'eg: Image Url'}
          onChangeText={i => setImageUrl(i)}
        />
        <InputView
          defaultValue={price}
          title={'Price'}
          placeholder={'eg: 75'}
          keyboardType={'numeric'}
          onChangeText={i => setPrice(i)}
        />
        <ButtonView
          styles={{marginTop: 15}}
          text={'Add'}
          click={category && name && price}
          onPress={AddItem}
        />
      </View>
      <View style={{paddingHorizontal: 15, paddingTop: 10}}>
        <SemiBoldText text={itemDetail?.category} />
        <View>
          {itemDetail?.items?.map(item => (
            // setId(item?.id);
            <RegularText text={`${item?.name}     ₹ ${item?.price}`} />
          ))}
        </View>
      </View>
    </View>
  );
};
export default EditScreen;

export const SelectInut = props => {
  const list = props?.list;
  const [open, setOpen] = useState(false);
  return (
    <View
      style={{
        width: '100%',
        paddingVertical: 5,
      }}>
      <Modal visible={open} transparent>
        <View
          style={{
            flex: 1,
            paddingTop: 100,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              elevation: 3,
            }}></View>
        </View>
      </Modal>
      <RegularText styles={{marginBottom: 10}} text={props?.title} />
      <TextInput
        style={{
          borderColor: AppColors.LIGHT_BORDER,
          borderWidth: 1,
          borderRadius: 10,
          color: '#000',
          paddingLeft: 10,
        }}
        keyboardType={props?.keyboardType}
        onChangeText={props?.onChangeText}
        placeholderTextColor={'rgba(0,0,0,0.5)'}
        placeholder={props?.placeholder}
      />
      <View
        style={{
          maxHeight: 250,
          backgroundColor: '#fff',
          borderColor: AppColors.LIGHT_BORDER,
          borderWidth: 1,
        }}>
        <FlatList
          data={list}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{
                paddingVertical: 5,
                borderBottomWidth: 0.5,
                borderBottomColor: AppColors.LIGHT_BORDER,
                paddingLeft: 15,
              }}>
              <RegularText text={item?.name} />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};
