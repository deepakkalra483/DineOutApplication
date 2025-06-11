import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {Header, ImageButton} from '../HomeScreen';
import {AppImages} from '../../utils/AppImages';
import {useEffect, useState} from 'react';
import {SemiBoldText} from '../../utils/AppConstants';
import {ButtonView, InputView} from '../auth/LoginScreen';
import {AppColors} from '../../utils/AppColors';
import {
  deleteResturant,
  getMenu,
  getResturant,
  RESTURANTS,
  saveResturant,
} from '../../utils/AsynStorageHelper';
import AsyncStorage from '@react-native-community/async-storage';
import {
  AddRestaurantInDb,
  DeleteRestaurant,
} from '../../networking/FireStoreService';
import {AppScreens} from '../../utils/AppScreens';

const AddResturant = ({navigation}) => {
  const [loading, setLoading] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(null);
  const [contact, setContact] = useState(null);
  const [password, setPassword] = useState(null);
  const [resturants, setResturants] = useState([]);

  const onDelete = id => {
    DeleteRestaurant(
      id,
      res => {
        deleteResturant(id, res => {
          setResturants(prev => prev.filter(item => item.restaurantId !== id));
        });
      },
      error => {
        Alert.alert(error);
      },
    );
  };

  const addResturant = () => {
    setLoading('add');
    let resturant = {
      name: name,
      contact: contact,
      password: password,
    };
    AddRestaurantInDb(
      resturant,
      resId => {
        resturant = {...resturant, ...{restaurantId: resId}};
        saveResturant(resturant, res => {
          setResturants([resturant, ...resturants]);
          setOpen(false);
          setLoading(null);
        });
      },
      error => {
        Alert.alert(error);
        setLoading(null);
      },
    );
  };

  useEffect(() => {
    getResturant(res => {
      if (res) {
        setResturants(res);
      }
    });
  }, [open]);

  const renderResturant = ({item}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          paddingHorizontal: 15,
          paddingVertical: 7,
          borderWidth: 1,
          borderColor: AppColors.LIGHT_BORDER,
          marginHorizontal: 15,
          borderRadius: 15,
          marginBottom: 15,
          backgroundColor: '#fff',
          elevation: 2,
        }}>
        <SemiBoldText text={`Id: ${item?.restaurantId}`} />
        <SemiBoldText text={`Resturant name: ${item?.name}`} />
        <SemiBoldText text={`Contact number: ${item?.contact} `} />
        <SemiBoldText text={`Password: ${item?.password}`} />
        <ButtonView
          styles={{height: 35, marginVertical: 7}}
          click
          text={'Add Menu'}
          onPress={() =>
            navigation.navigate(AppScreens.INSERT_MENU, {data: item})
          }
        />
        <ImageButton
          styles={{position: 'absolute', right: 0}}
          src={AppImages.CLOSE_ICON}
          onPress={() => {
            Alert.alert('Are you sure you want to delete ?', '', [
              {text: 'No', style: 'cancel'},
              {
                text: 'Yes',
                style: 'default',
                onPress: () => onDelete(item?.restaurantId),
              },
            ]);
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <Modal transparent visible={open}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            // paddingHorizontal: 15,
            justifyContent: 'center',
          }}>
          <ScrollView style={{backgroundColor: '#fff', padding: 15}}>
            <View
              style={{
                height: 55,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <SemiBoldText styles={{fontSize: 20}} text={'Add Item'} />
              <ImageButton
                styles={{position: 'absolute', right: 10}}
                imgStyles={{height: 20, width: 20}}
                src={AppImages?.CLOSE_ICON}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
            <InputView
              title={'Name'}
              placeholder={'enter name'}
              defaultValue={name}
              onChangeText={i => setName(i)}
            />
            <InputView
              title={'Contact'}
              placeholder={'contact number'}
              keyboardType={'numeric'}
              defaultValue={contact}
              onChangeText={i => setContact(i)}
            />
            <InputView
              title={'Password'}
              placeholder={'enter password'}
              defaultValue={password}
              onChangeText={i => setPassword(i)}
            />
            <ButtonView
              loading={loading == 'add'}
              styles={{marginTop: 15}}
              text={'Add'}
              click={name && password && contact}
              onPress={() => {
                addResturant();
              }}
            />
          </ScrollView>
        </View>
      </Modal>
      <Header
        leftSrc={AppImages.ADD_ICON}
        loading={loading == 'update'}
        title={'Resturant'}
        right={'Update'}
        rightPress={() => {
          Alert.alert('Do you want to chnage your menu in all QR ?', '', [
            {text: 'No', style: 'cancel'},
            {text: 'Yes', style: 'default', onPress: () => UpdateMenuInDb()},
          ]);
        }}
        leftPress={() => {
          setOpen(true);
        }}
      />
      <FlatList
        data={resturants}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{marginTop: 15}}
        renderItem={renderResturant}
      />
    </View>
  );
};

export default AddResturant;
