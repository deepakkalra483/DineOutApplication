import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RegularText, SemiBoldText} from '../../utils/AppConstants';
import {AppColors} from '../../utils/AppColors';
import {useEffect, useState} from 'react';
import {SetRoute} from '../../../redux/Action';
import {HOME_SCREEN} from '../../utils/AppScreens';
import {navigateTo} from '../../utils/RootNavigation';
import {AddFcmToken, logIn} from '../../networking/CallApi';
import {DEVICE_ID, FCM_TOKEN, storeUser} from '../../utils/AsynStorageHelper';
import {
  requestPostNotificationPermission,
  requestUserPermission,
} from '../../networking/FirebaseMessaging';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';
import {
  getData,
  getResturants,
  handleLogin,
} from '../../networking/FireStoreService';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';

const charcters = ['chef', 'reception', 'waiter', 'owner'];
const LoginScreen = ({navigation}) => {
  const [mobile, setMobile] = useState(null);
  const [password, setPassword] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [tables, setTables] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const requestOverlayPermission = () => {
    if (Platform.OS === 'android') {
      Linking.sendIntent('android.settings.action.MANAGE_OVERLAY_PERMISSION', [
        {
          key: 'android.provider.extra.APP_PACKAGE',
          value: 'com.dineout',
        },
      ]).catch(err => console.error('Error opening settings:', err));
    }
  };

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await DeviceInfo.getUniqueId();
      setDeviceId(id);
      AsyncStorage.setItem(DEVICE_ID, id);
      console.log('deviceid--', id);
    };
    const checkPermission = async () => {
      const hasPermission = await requestPostNotificationPermission();
      if (hasPermission) {
        console.log('App is ready to send notifications', hasPermission);
      } else {
        console.log('App cannot send notifications');
      }
    };
    checkPermission();
    fetchDeviceId();
    setTimeout(() => {
      setShowModal(true);
    }, 1000);
  }, []);

  const SigIn = () => {
    if (mobile && password && userType) {
      setLoading(true);
      AsyncStorage.getItem(FCM_TOKEN).then(res => {
        if (res) {
          console.log('oldToken-', res);
          let params = {
            mobile: mobile,
            password: password,
            deviceId: deviceId,
            token: res,
            userType: userType,
          };
          handleLogin(
            params,
            success => {
              console.log('key--', success);
              let updatedParams = {
                ...params,
                id: success,
                tables: tables,
              };
              navigation.navigate(HOME_SCREEN);
              storeUser(updatedParams, response => {
                // navigateTo(HOME_SCREEN);
                setLoading(false);
              });
            },
            error => {
              console.log('error--', error);
              setLoading(false);
            },
          );
        }
      });
    } else {
      Alert.alert('select all field');
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: 'white', justifyContent: 'center'}}>
      <Modal transparent visible={showModal}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 15,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              flex: 0.3,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
              paddingHorizontal: 20,
              borderRadius: 15,
            }}>
            <SemiBoldText text={'Permission for Incoming order'} />
            <RegularText
              styles={{marginVertical: 15}}
              text={
                'Allow permission for getting incoming orders by ring so allow permission for "Display Over the Other Apps" '
              }
            />
            <ButtonView
              click
              text={'Enable Permission'}
              onPress={() => {
                setShowModal(false);
                requestOverlayPermission();
              }}
            />
          </View>
        </View>
      </Modal>
      <View
        style={{
          flex: 0.55,
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingHorizontal: 15,
        }}>
        <Image source={require('../../assets/images/icons/qr_logo.png')} />
        <SemiBoldText styles={{fontSize: 20}} text={'Log in'} />
        <InputView
          keyboardType={'numeric'}
          placeholder={'Enter your mobile number'}
          title={'Mobile Number'}
          onChangeText={i => setMobile(i)}
        />
        <InputView
          placeholder={'Password'}
          title={'Password'}
          onChangeText={i => setPassword(i)}
        />
        <InputView
          placeholder={'eg: 10'}
          title={'Number of tables'}
          onChangeText={i => setTables(i)}
        />
        <View style={{width: '100%', marginBottom: 20, marginTop: 15}}>
          <RegularText
            styles={{marginBottom: 10, color: AppColors.LIGHT_GRAY_TEXT}}
            text={'Login as'}
          />
          <FlatList
            data={charcters}
            horizontal
            renderItem={({item}) => (
              <Text
                style={{
                  backgroundColor:
                    userType == item ? AppColors.LIGHT_GREEN_TEXT : '#d3d3d3',
                  marginHorizontal: 3,
                  paddingHorizontal: 15,
                  paddingVertical: 5,
                  borderRadius: 20,
                  color: userType == item ? '#fff' : 'gray',
                }}
                onPress={() => setUserType(item)}>
                {item}
              </Text>
            )}
          />
        </View>
        <ButtonView
          styles={{marginTop: 15}}
          text={'Log in'}
          click={password && mobile && userType && tables}
          loading={loading}
          // onPress={() => navigateTo(HOME_SCREEN)}
          onPress={SigIn}
        />
      </View>
    </View>
  );
};
export default LoginScreen;

export const InputView = props => {
  return (
    <View
      style={{
        width: '100%',
        paddingVertical: 5,
        ...props?.styles,
      }}>
      {props?.title && (
        <RegularText
          styles={{marginBottom: 10, color: AppColors.LIGHT_GRAY_TEXT}}
          text={props?.title}
        />
      )}
      <TextInput
        style={{
          borderColor: AppColors.LIGHT_BORDER,
          borderWidth: 1,
          borderRadius: 10,
          color: '#000',
          backgroundColor: '#fff',
          paddingLeft: 10,
        }}
        editable={props?.editable}
        defaultValue={props?.defaultValue}
        keyboardType={props?.keyboardType}
        onChangeText={props?.onChangeText}
        onEndEditing={props?.onEndEditing}
        placeholderTextColor={'rgba(0,0,0,0.5)'}
        placeholder={props?.placeholder}
      />
    </View>
  );
};

export const InputSelection = props => {
  // const list = props?.list || [];
  const [open, setOpen] = useState(false);
  const backupList = props?.list || [];
  const [list, setList] = useState(props?.list || []);

  const onChnage = text => {
    if (text) {
      const filteredList = backupList.filter(name =>
        name?.toLowerCase().includes(text.trim().toLowerCase()),
      );
      if (filteredList?.length > 0) {
        setList(filteredList);
      } else {
        setList([text]);
      }
    } else {
      setList(backupList);
    }
  };
  return (
    <View
      style={{
        width: '100%',
        paddingVertical: 5,
        ...props?.styles,
      }}>
      <RegularText
        styles={{marginBottom: 10, color: AppColors.LIGHT_GRAY_TEXT}}
        text={props?.title}
      />
      <TextInput
        style={{
          borderColor: AppColors.LIGHT_BORDER,
          borderWidth: 1,
          borderRadius: 10,
          color: '#000',
          backgroundColor: '#fff',
          paddingLeft: 10,
        }}
        editable={props?.editable}
        onTouchStart={() => setOpen(true)}
        defaultValue={props?.defaultValue}
        keyboardType={props?.keyboardType}
        onChangeText={i => onChnage(i)}
        placeholderTextColor={'rgba(0,0,0,0.5)'}
        placeholder={props?.placeholder}
      />
      {open && (
        <FlatList
          data={list}
          renderItem={({item, index}) => (
            <TouchableOpacity
              activeOpacity={0.9}
              style={{paddingHorizontal: 10, paddingVertical: 5}}
              onPress={() => {
                props?.onPress(item);
                setOpen(false);
              }}>
              <SemiBoldText text={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export const ButtonView = props => {
  const click = props?.click;
  const loading = props?.loading;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        backgroundColor: click ? AppColors.LIGHT_GREEN_TEXT : '#d3d3d3',
        borderRadius: 10,
        width: '100%',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        ...props?.styles,
      }}
      onPress={click ? props?.onPress : null}>
      {loading ? (
        <ActivityIndicator size={30} color={'#fff'} />
      ) : (
        <RegularText
          styles={{color: '#fff', textAlign: 'center', ...props?.textStyles}}
          text={props?.text}
        />
      )}
    </TouchableOpacity>
  );
};
