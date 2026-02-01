import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { AppColors } from "../../utils/AppColors"
import { AppFonts } from "../../utils/AppFonts"
import { AppImages } from "../../utils/AppImages"

const OrderHeader = ({ onBack, onHistory, Details, onAdd }) => {
  console.log('data---', Details)

  const makeCall = () => {
    const phoneNumber = `tel:+91${Details?.data?.mobile}`; // add country code
    Linking.openURL(phoneNumber);
  };
  return (
    <View style={styles.contaner}>
      <View style={styles.deatils_cell}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.icon_btn}
          onPress={onBack}>
          <Image
            style={[styles.icon, { height: 18, width: 18 }]}
            source={AppImages.BACK_ICON} />
        </TouchableOpacity>
        <View style={styles.name_cell}>
          <Text style={styles.room_no}>{`Room No: ${Details?.item?.room}`}</Text>
          <Text style={styles.details}>{`Order Details`}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={makeCall}
          style={styles.icon_btn}>
          <Image
            style={[styles.icon, { height: 18, width: 18 }]}
            source={AppImages.CALL_ICON} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onAdd}
          style={styles.icon_btn}>
          <Image
            style={styles.icon}
            source={AppImages.ADD_ICON} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onHistory}
          style={styles.icon_btn}>
          <Image
            style={styles.icon}
            source={AppImages.HISTORY_ICON} />
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default OrderHeader

const styles = StyleSheet.create(({
  contaner: {
    backgroundColor: '#FFF',
    padding: 10
  },
  deatils_cell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name_cell: {
    flex: 1,
    paddingLeft: 10
  },
  room_no: {
    fontSize: 14,
    color: AppColors.BLACK,
    fontFamily: AppFonts.BOLD
  },
  details: {
    fontSize: 12,
    color: AppColors.LIGHT_GRAY_TEXT,
    fontFamily: AppFonts.REGULAR
  },
  icon_btn: {
    height: 40,
    width: 40,
    backgroundColor: AppColors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginHorizontal: 3
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
    tintColor: AppColors.BLACK
  }
}))