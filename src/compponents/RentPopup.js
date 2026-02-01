import { Modal, NativeModules, SafeAreaView, StyleSheet, View } from "react-native"
import { AppColors } from "../utils/AppColors"
import { BoldText, SemiBoldText } from "../utils/AppConstants"
import { ImageButton } from "../screens/HomeScreen"
import { AppImages } from "../utils/AppImages"
import { ButtonView, InputView } from "../screens/auth/LoginScreen"
import { useState } from "react"
import { addOrderToDatabase } from "../networking/FireStoreService"
import { getUser } from "../utils/AsynStorageHelper"

const RentPopup = ({ visible, onClose, data, onSave }) => {
  console.log('renrdata----', data)
  const { OrdersModule } = NativeModules;
  const [inputs, setInputs] = useState({
    time: '',
    rent: ''
  })

  const handleOnChnage = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const AddRent = async () => {
    const rentData = [{ quantity: 1, name: `${inputs?.time}`, price: inputs?.rent, message: 'rent' }]
    const customerData = { name: data?.data?.name, mobile: data?.data?.mobile }
    const items = JSON.stringify(rentData);
    OrdersModule.insertRoomRent(data?.table, items, data?.data?.mobile, data?.data?.name, data?.data?.mobile).
      then((text) => {
        onSave(inputs)
        console.log('text---', text)
      }).
      catch((error) => {
        console.log('erorr--', error)
      })
    getUser(userDetail => {
      addOrderToDatabase(userDetail?.id, data?.table, data?.data?.mobile, { items: rentData }, customerData)
    })

  }
  return (
    <Modal
      transparent
      visible={visible}>
      <SafeAreaView style={styles.container}>
        <View style={styles.box}>
          <ImageButton
            styles={{ position: 'absolute', right: 0, }}
            imgStyles={{ height: 15, width: 15 }}
            src={AppImages?.CLOSE_ICON}
            onPress={onClose}
          />
          <BoldText text={'Add Room Rent'} />

          <InputView
            title={'Time'}
            placeholder={'eg: 2Hr'}
            defaultValue={inputs?.time}
            onChangeText={i => handleOnChnage('time', i)}
          />
          <InputView
            keyboardType={'numeric'}
            title={'Rent'}
            placeholder={'eg: 500'}
            defaultValue={inputs?.rent}
            onChangeText={i => handleOnChnage('rent', i)}
          />

          <ButtonView
            click={true}
            styles={{ marginTop: 15, }}
            text={'Add'}
            onPress={AddRent} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default RentPopup

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 15
  },
  box: {
    padding: 15,
    backgroundColor: AppColors.WHITE,
    borderRadius: 15
  }
})