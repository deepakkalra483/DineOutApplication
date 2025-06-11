import {Image, View} from 'react-native';
import {styles} from '../../utils/AppConstants';
import {AppImages} from '../../utils/AppImages';
import AsyncStorage from '@react-native-community/async-storage';
import {navigateTo} from '../../utils/RootNavigation';
import {HOME_SCREEN, LOGIN_SCREEN} from '../../utils/AppScreens';
import {useEffect} from 'react';

const NewSplashScreen = ({navigation}) => {
  const verifyUser = () => {
    AsyncStorage.getItem('user').then(res => {
      console.log('res', res);
      if (res) {
        const parsedData = JSON.parse(res);
        setTimeout(() => {
          navigation.push(HOME_SCREEN, {params: parsedData});
          // navigateTo(HOME_SCREEN, parsedData);
        }, 500);
      } else {
        setTimeout(() => {
          navigation.push(LOGIN_SCREEN);
          // navigateTo(LOGIN_SCREEN);
        }, 1000);
      }
    });
  };

  useEffect(() => {
    verifyUser();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {justifyContent: 'center', alignItems: 'center'},
      ]}>
      <Image
        style={{height: 100, width: 100, resizeMode: 'contain'}}
        source={require('../../assets/images/icons/qr_logo.png')}
      />
    </View>
  );
};
export default NewSplashScreen;
