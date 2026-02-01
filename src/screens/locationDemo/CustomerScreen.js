import { Alert, FlatList, Image, NativeModules, StyleSheet, Text, View } from "react-native"
import { Header } from "../HomeScreen"
import Geolocation from 'react-native-geolocation-service';
import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from 'react-native';
import { SemiBoldText } from "../../utils/AppConstants";
import { AppColors } from "../../utils/AppColors";
import { AppImages } from "../../utils/AppImages";

const CustomerScreen = () => {
  const { OrdersModule } = NativeModules;

  const [userList, setUserList] = useState([])

  const getAllUsersFromDb = async () => {
    try {
      const users = await OrdersModule.getAllUsers();
      console.log('userss---', users)
      setUserList(users)
    } catch (err) {
      console.log("User fetch error: ", err);
      setUserList([]);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.user}>
        <Image
          style={styles.icon}
          source={AppImages.USER_ICON} />
        <View>
          <SemiBoldText
            styles={{ fontSize: 14 }}
            text={item?.name} />
          <SemiBoldText text={item?.mobile} />
        </View>
      </View>
    )
  }

  useEffect(() => {
    getAllUsersFromDb()
  }, [])

  return (
    <View>
      <Header
        title={'All Customers'}
      />
      <FlatList
        data={userList}
        renderItem={renderItem} />
    </View>
  )
}

export default CustomerScreen

const styles = StyleSheet.create({
  user: {
    borderRadius: 12,
    borderWidth: 0.3,
    backgroundColor: AppColors.WHITE,
    marginTop: 12,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6
  },
  icon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
    marginRight: 10
  }
})