import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Header } from "../HomeScreen"
import AsyncStorage from "@react-native-community/async-storage"
import { useEffect, useState } from "react"
import { getOffers, getUser, OFFERS } from "../../utils/AsynStorageHelper"
import { BoldText, RegularText } from "../../utils/AppConstants"
import { AppColors } from "../../utils/AppColors"
import { AppFonts } from "../../utils/AppFonts"
import { AppImages } from "../../utils/AppImages"
import OfferPopup from "../../compponents/OfferPopup"
import { UpdateOffer } from "../../networking/FireStoreService"

const OfferScreen = () => {
  const [offersList, setOfferList] = useState([])
  const [open, setOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false)
  const [SelectItem, setSelectedItem] = useState(null);

  const renderItem = ({ item }) => {
    return (
      <OfferCell
        item={item}
        onEdit={(slectOffer) => {
          setSelectedItem(slectOffer)
          setOpen(true)
        }}
        onDelete={(o) => {
          Alert.alert(`Are you sure you want to delete?`, '', [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', style: 'default', onPress: () => deleteOffer(o?.id) },
          ])
        }} />
    )
  }

  const SaveNewOffer = (data) => {
    if (data) {
      const newOffer = { ...data };

      // Check if offer exists
      const existingIndex = offersList.findIndex(o => o.id === data.id);

      let updatedList;

      if (existingIndex !== -1) {
        // 🔄 Update existing offer
        updatedList = [...offersList];
        updatedList[existingIndex] = newOffer;
      } else {
        // ➕ Add new offer
        updatedList = [newOffer, ...offersList];
      }

      setOfferList(updatedList);
      AsyncStorage.setItem(OFFERS, JSON.stringify(updatedList));

      setOpen(false);
    }
  };

  const deleteOffer = (id) => {
    // Filter out the offer with the matching id
    const updatedList = offersList.filter(item => item.id !== id);

    // Update state
    setOfferList(updatedList);

    // Update AsyncStorage
    AsyncStorage.setItem(OFFERS, JSON.stringify(updatedList));
  };

  const updateOfferInDb = () => {
    setUpdateLoading(true);
    getUser(res => {
      UpdateOffer(
        res?.id,
        offersList,
        response => {
          // console.log('updated');
          Alert.alert(
            'Successfully Updated!',
            `your offer has been added in all QR`,
          );
          setUpdateLoading(false);
        },
        error => {
          console.log('notUpdet--', error);
          setUpdateLoading(false);
        },
      );
    });
  }

  useEffect(() => {
    getOffers(res => {
      console.log('offer---', res)
      setOfferList(res)
    })
  }, [])
  return (
    <View style={styles.container}>
      <Header
        title={'Offers'}
        right={'Update'}
        loading={updateLoading}
        leftSrc={AppImages.ADD_ICON}
        leftPress={() => {
          setSelectedItem(null);
          setOpen(true);
        }}
        rightPress={() => {
          Alert.alert('Do you want to update your offer in all QR ?', '', [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', style: 'default', onPress: () => updateOfferInDb() },
          ]);
        }} />
      <OfferPopup
        SelectItem={SelectItem}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(data) => SaveNewOffer(data)} />

      <FlatList
        data={offersList}
        renderItem={renderItem} />
    </View>
  )
}

export default OfferScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  ofeer_cell: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    borderWidth: 0.3,
    padding: 2,
    borderColor: AppColors.BORDER_COLOR,
    borderRadius: 12
  },
  offer_img: {
    height: 90,
    width: 90,
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  detail_container: {
    flex: 1,
    marginLeft: 10
  },
  disscount: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 15,
    backgroundColor: 'red',
    marginHorizontal: 3
  },
  btn_text: {
    fontSize: 12,
    fontFamily: AppFonts.SEMIBOLD,
    color: AppColors.WHITE
  }
})

const OfferCell = ({ item, onEdit, onDelete, updateStatus }) => {
  return (
    <View style={styles.ofeer_cell}>
      <Image
        resizeMode="cover"
        style={styles.offer_img}
        source={{ uri: item?.src }} />

      <View style={styles.detail_container}>
        <BoldText text={item?.name} />
        <RegularText styles={{ fontSize: 12 }} text={item?.description} />
        <View>
          <BulletPoint
            title={`Days`}
            value={item?.days_active.join(", ")} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <BulletPoint
              title={`End Time`}
              value={item?.end_time} />
            <BulletPoint
              title={`Start Time`}
              value={item?.start_time} />
            <BulletPoint
              title={`Valid From`}
              value={item?.valid_from} />
            <BulletPoint
              title={`Valid To`}
              value={item?.valid_to} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
          <ActionButton
            text={'Edit'}
            color={'#C8E6C9'}
            textColor={'#0A7E30'}
            onPress={() => onEdit?.(item)} />
          <ActionButton
            text={'Delete'}
            color={'#FFCDD2'}
            textColor={'#B71C1C'}
            onPress={() => onDelete?.(item)} />
          <ActionButton
            text={item?.is_active ? 'Active' : "InActive"}
            color={'#BBDEFB'}
            textColor={'#0D47A1'}
            onPress={() => updateStatus?.(item)} />
        </View>
      </View>
    </View>
  )
}

const BulletPoint = ({ title, value }) => {
  return (
    <Text style={{ fontSize: 10, minWidth: '50%' }}>
      {title}: <Text style={{ fontFamily: AppFonts.BOLD }}>{value}</Text>
    </Text>
  )
}

const ActionButton = ({ text, onPress, color, textColor }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.btn, { backgroundColor: color }]}
      onPress={onPress}>
      <Text style={[styles.btn_text, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  )
}