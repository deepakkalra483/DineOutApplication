import {
  Button,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useCallback, useEffect, useRef, useState} from 'react';
import {AppFonts} from '../../utils/AppFonts';
import {AppColors} from '../../utils/AppColors';
import {RegularText, SemiBoldText} from '../../utils/AppConstants';
import {AppImages} from '../../utils/AppImages';
import Tts from 'react-native-tts';

const orders = [
  {
    name: 'Burger',
    src: require('../../assets/images/backgroud/burger_photo.png'),
    qty: 1,
    description: 'Allo tiki',
    price: 89,
  },
  {
    name: 'Corn Pizza',
    src: require('../../assets/images/backgroud/pizza_photo.png'),
    qty: 2,
    description: 'Extra cheese',
    price: 165,
  },
];

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    Tts.setDefaultLanguage('hi-IN');
    Tts.setDefaultVoice('hi-in-x-hia-network');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);

    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
      }
    };
    requestPermissions();
  }, []);

  const speak = text => {
    Tts.speak(text);
  };
  const renderOrder = ({item}) => (
    <ItemCell
      src={item?.src}
      name={item?.name}
      qty={item?.qty}
      description={item?.description}
      price={item?.price}
    />
  );
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      <Image
        style={[
          {
            opacity: 0.2,
            height: Dimensions.get('window').height,
            width: Dimensions.get('window').width,
            position: 'absolute',
          },
        ]}
        source={require('../../assets/images/backgroud/art_bg.png')}
      />
      <Header
        firstText={'Big'}
        secondText={'Bistro'}
        rightSrc={require('../../assets/images/icons/waiter_icon.png')}
        leftSrc={require('../../assets/images/icons/menu_icon.png')}
      />
      <Text
        style={{
          fontSize: 20,
          color: 'black',
          fontFamily: AppFonts.SEMIBOLD,
          backgroundColor: AppColors.LIGHT_BACKGROUND,
          width: '50%',
          paddingHorizontal: 15,
          paddingTop: 10,
        }}>
        Order Details
      </Text>
      <FlatList data={orders} renderItem={renderOrder} />
      <InputBox
        placeOrder={() =>
          speak('नमस्ते! आपका स्वागत है। मैं आपकी क्या मदद कर सकता हूँ?')
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.LIGHT_BACKGROUND,
  },
});

export default SplashScreen;

const Header = props => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
        justifyContent: 'space-between',
        backgroundColor: 'white',
        elevation: 2,
      }}>
      <ImageButton src={props?.leftSrc} />
      <MultiClrText
        firstText={props?.firstText}
        SecondText={props?.secondText}
      />
      <ImageButton src={props?.rightSrc} />
    </View>
  );
};

const ImageButton = props => {
  return (
    <TouchableOpacity activeOpacity={1} style={{}}>
      <Image
        style={{height: 25, width: 35, resizeMode: 'contain'}}
        source={props?.src}
      />
    </TouchableOpacity>
  );
};

const MultiClrText = props => {
  return (
    <Text
      style={{
        fontSize: 18,
        color: AppColors.LIGHT_GREEN_TEXT,
        fontFamily: AppFonts.BOLD,
      }}>
      {props?.firstText}
      {
        <Text
          style={{
            fontSize: 18,
            color: AppColors.DARK_GREEN_TEXT,
            fontFamily: AppFonts.BOLD,
          }}>
          {props?.SecondText}
        </Text>
      }
    </Text>
  );
};

const InputBox = props => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AppColors.LIGHT_BACKGROUND,
        paddingHorizontal: 15,
        paddingVertical: 15,
      }}>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          backgroundColor: 'white',
          marginRight: 10,
          borderRadius: 10,
          elevation: 1,
          alignItems: 'center',
          padding: 2,
        }}>
        <TextInput
          style={{
            backgroundColor: 'white',
            flex: 1,
            color: 'black',
          }}
          multiline
          placeholderTextColor={'gray'}
          placeholder="Write or speak order.."
        />
        <ImageButton src={AppImages.MIC_ICON} />
      </View>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          backgroundColor: AppColors.DARK_GREEN_TEXT,
          paddingHorizontal: 10,
          borderRadius: 15,
          paddingVertical: 8,
        }}
        onPress={props.placeOrder}>
        <Text
          style={{
            fontSize: 14,
            color: AppColors.WHITE_TEXT,
            fontFamily: AppFonts.REGULAR,
          }}>
          Place Order
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ItemCell = props => {
  return (
    <View
      style={{
        backgroundColor: AppColors.LIGHT_BACKGROUND,
        paddingHorizontal: 15,
        paddingVertical: 8,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          backgroundColor: 'white',
          height: Dimensions.get('window').height / 9,
          justifyContent: 'space-between',
          borderRadius: 15,
          elevation: 3,
        }}>
        <Image
          style={{
            height: '100%',
            width: '15%',
            resizeMode: 'cover',
            borderRadius: 10,
          }}
          source={props?.src}
        />
        <View
          style={{
            flex: 1,
            marginHorizontal: 15,
            height: '100%',
          }}>
          <RegularText
            styles={{color: 'black', fontSize: 14}}
            text={props?.name}
          />
          {/* <RegularText
            styles={{color: AppColors?.LIGHT_GRAY_TEXT, fontSize: 12}}
            text={props?.description}
          /> */}

          <SemiBoldText styles={{}} text={`RS ${props?.price}`} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TextButton
            text={'--'}
            styles={{fontSize: 18, backgroundColor: '#d3d3d3'}}
          />
          <TextButton
            styles={{
              marginHorizontal: 3,
              backgroundColor: 'white',
            }}
            text={props?.qty}
          />
          <TextButton
            styles={{
              backgroundColor: AppColors.DARK_GREEN_TEXT,
            }}
            textStyle={{color: 'white'}}
            text={'+'}
          />
        </View>

        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: AppColors.LIGHT_BACKGROUND,
            height: 45,
            width: 25,
            marginRight: -15,
            borderTopLeftRadius: 30,
            borderBottomLeftRadius: 30,
            marginLeft: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            style={{height: 18, width: 18, resizeMode: 'contain'}}
            source={AppImages.DELETE_ICON}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TextButton = props => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        backgroundColor: AppColors.LIGHT_BACKGROUND,
        paddingHorizontal: 8,
        borderRadius: 5,
        paddingVertical: 3,
        ...props?.styles,
      }}>
      <SemiBoldText
        styles={{fontSize: 14, ...props?.textStyle}}
        text={props?.text}
      />
    </TouchableOpacity>
  );
};

const PopModal = () => {
  return (
    <Modal transparent visible>
      <View style={{flex: 1}}>
        <View
          style={{
            backgroundColor: 'white',
            flex: 0.4,
            marginTop: 55,
            width: Dimensions.get('window').width / 2,
            alignSelf: 'flex-end',
            elevation: 3,
            marginRight: 15,
          }}></View>
      </View>
    </Modal>
  );
};
