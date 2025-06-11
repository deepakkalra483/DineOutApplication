import {ActivityIndicator, Image, TouchableOpacity, View} from 'react-native';
import {RegularText, SemiBoldText, styles} from '../utils/AppConstants';
import {AppImages} from '../utils/AppImages';
import {navigateTo} from '../utils/RootNavigation';
import {AppScreens, LOGIN_SCREEN, TABLE_SCREEN} from '../utils/AppScreens';
import {AppColors} from '../utils/AppColors';
import {useEffect, useState} from 'react';
import OrderScreen from './menuScreens/OrderScreen';
import History from './menuScreens/History';
import AddMenu from './menuScreens/AddMenu';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useSelector} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import TableScreen from './menuScreens/TableScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import InsertMenu from './menuScreens/InsertMenu';

const HomeScreen = () => {
  const Tab = createBottomTabNavigator();
  const [pos, setPos] = useState(1);
  useEffect(() => {
    messaging().onNotificationOpenedApp(() => {
      if (pos != 1) {
        setPos(1);
      }
    });
  }, []);

  const renderTab = () => {
    switch (pos) {
      case 1:
        return <TableScreen />;
      case 2:
        return <AddMenu />;
      case 3:
        return <History />;
      default:
        break;
    }
  };
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        headerPressColor: 'red',
      }}>
      <Tab.Screen
        options={{
          tabBarIcon: props => (
            <View style={{width: 70, alignItems: 'center'}}>
              <Image
                style={{
                  height: 25,
                  width: 25,
                  resizeMode: 'contain',
                  tintColor: props?.focused
                    ? AppColors.LIGHT_GREEN_TEXT
                    : AppColors.GRAY,
                }}
                source={AppImages?.ORDER_ICON}
              />
              <RegularText
                styles={{
                  fontSize: 10,
                  color: props?.focused
                    ? AppColors.LIGHT_GREEN_TEXT
                    : AppColors.GRAY,
                }}
                text={'Orders'}
              />
            </View>
          ),
        }}
        name={TABLE_SCREEN}
        component={TableScreen}
      />
      <Tab.Screen
        options={{
          tabBarIcon: props => (
            <View style={{width: 70, alignItems: 'center'}}>
              <Image
                style={{
                  height: 25,
                  width: 25,
                  resizeMode: 'contain',
                  tintColor: props?.focused
                    ? AppColors.LIGHT_GREEN_TEXT
                    : AppColors.GRAY,
                }}
                source={AppImages?.MENU_ICON}
              />
              <RegularText
                styles={{
                  fontSize: 10,
                  color: props?.focused
                    ? AppColors.LIGHT_GREEN_TEXT
                    : AppColors.GRAY,
                }}
                text={'Menu'}
              />
            </View>
          ),
        }}
        name={AppScreens.INSERT_MENU}
        component={InsertMenu}
      />
    </Tab.Navigator>
    // <View style={styles?.container}>
    //   {renderTab()}
    //   <BottomTab
    //     firstPress={() => setPos(1)}
    //     secondPress={() => setPos(2)}
    //     thirdPress={() => setPos(3)}
    //     click={pos}
    //   />
    // </View>
  );
};

export default HomeScreen;

export const Header = props => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 55,
        backgroundColor: '#fff',
        elevation: 2,
      }}>
      <ImageButton
        onPress={props?.leftPress}
        styles={{position: 'absolute', left: 15}}
        src={props?.leftSrc}
      />
      <SemiBoldText styles={{fontSize: 18}} text={props?.title} />
      {props?.loading ? (
        <ActivityIndicator
          style={{position: 'absolute', right: 15}}
          size={20}
          color={'#000'}
        />
      ) : (
        <SemiBoldText
          styles={{position: 'absolute', right: 15}}
          text={props?.right}
          onPress={props?.rightPress}
        />
      )}
    </View>
  );
};

export const ImageButton = props => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        height: 45,
        width: 45,
        justifyContent: 'center',
        alignItems: 'center',
        ...props?.styles,
      }}
      onPress={props?.onPress}>
      <Image
        style={{
          height: 20,
          width: 20,
          resizeMode: 'contain',
          ...props?.imgStyles,
        }}
        source={props?.src}
      />
    </TouchableOpacity>
  );
};

export const BottomTab = props => {
  const click = props?.click;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 55,
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#fff',
        width: '100%',
        elevation: 5,
      }}>
      <BottomTabIcon
        click={click == 1}
        src={AppImages?.ORDER_ICON}
        onPress={props?.firstPress}
        label={'Orders'}
      />
      <BottomTabIcon
        click={click == 2}
        src={AppImages?.MENU_ICON}
        onPress={props?.secondPress}
        label={'Menu'}
      />
      <BottomTabIcon
        click={click == 3}
        src={AppImages.HISTORY_ICON}
        onPress={props?.thirdPress}
        label={'History'}
      />
    </View>
  );
};

export const BottomTabIcon = props => {
  const click = props?.click;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        height: 45,
        width: 70,
        // backgroundColor:'red'
      }}
      onPress={props?.onPress}>
      <Image
        style={{
          height: 25,
          width: 25,
          resizeMode: 'contain',
          tintColor: click ? AppColors.LIGHT_GREEN_TEXT : 'rgba(0,0,0,0.5)',
        }}
        source={props?.src}
      />
      <RegularText
        styles={{
          fontSize: 12,
          marginTop: 2,
          color: click ? AppColors.LIGHT_GREEN_TEXT : 'rgba(0,0,0,0.5)',
        }}
        text={props?.label}
      />
    </TouchableOpacity>
  );
};
