import { Alert, Modal, ScrollView, View } from "react-native"
import { SemiBoldText } from "../utils/AppConstants"
import { ImageButton } from "../screens/HomeScreen"
import { AppImages } from "../utils/AppImages"
import { ButtonView, InputView } from "../screens/auth/LoginScreen"
import DateTimeField from "./DateTimeField"
import MultiSelectInput from "./MultiSelectInput"
import { AppColors } from "../utils/AppColors"
import ImagePickerInput from "./ImageSelector"
import { useEffect, useState } from "react"

const OfferPopup = ({ open, SelectItem, onClose, onSubmit }) => {

  const [selectImage, setSelectImage] = useState(SelectItem ? { uri: SelectItem?.src } : null)
  const [imageLoading, setImageLoading] = useState(false)
  const [inputs, setInputs] = useState({ ...SelectItem })
  console.log('selctitem---', inputs)
  const onHandleChange = (text, input) => {
    setInputs(prev => ({ ...prev, [text]: input }))
  }

  const onValidate = () => {
    let isValid = true
    if (!inputs?.name) {
      isValid = false
    } else if (!inputs?.description) {
      isValid = false
    } else if (!inputs?.valid_from) {
      isValid = false
    } else if (!inputs?.valid_to) {
      isValid = false
    } else if (!inputs?.start_time) {
      isValid = false
    } else if (!inputs?.end_time) {
      isValid = false
    } else if (!inputs?.price) {
      isValid = false
    }  else if (!inputs?.days_active) {
      isValid = false
    }
    console.log('inputss---',inputs)
    if (isValid) {
      uploadImage()
    } else {
      Alert.alert(`Please enter all details`)
    }
  }

  const uploadImage = async () => {
    console.log('presss')
    if (selectImage?.update) {
      setImageLoading(true)
      const formData = new FormData();
      formData.append('image', {
        uri: selectImage?.uri,
        name: 'upload.jpg',
        type: 'image/jpeg',
      });
      try {
        const response = await fetch(
          'https://api.imgbb.com/1/upload?key=ff3de0236b8576ac67a873ce0352c6b2',
          {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
        const result = await response.json();
        if (result.success) {
          console.log('loding false');
          // Alert.alert('Upload Success', 'Image uploaded successfully!');
          console.log('ImgBB URL:', result.data.url);
          onHandleChange('src', result?.data?.url)
          onSubmit?.({
            ...inputs,
            src: result?.data?.url,
            is_active: true,
            id: SelectItem?.id ? SelectItem?.id : `${Date.now()}`
          })
          onClose()
          setInputs(null)
          setSelectImage(null)
          setImageLoading(false);
        } else {
          Alert.alert('Upload Failed', 'Something went wrong.');
          setImageLoading(false);
          setInputs(null)
          setSelectImage(null)
        }
      } catch (error) {
        console.error('Upload Error:', error);
        Alert.alert('Upload Error', 'Could not upload image.');
        setImageLoading(false);
        setInputs(null)
        setSelectImage(null)
      }
    } else {
      onSubmit?.(inputs)
      setInputs(null)
      setSelectImage(null)
      onClose()
    }
  }

  useEffect(() => {
    if (SelectItem) {
      setInputs({ ...SelectItem });
      setSelectImage(SelectItem.src ? { uri: SelectItem.src } : null);
    }
  }, [SelectItem])

  return (
    <Modal
      transparent
      visible={open}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          // paddingHorizontal: 15,
          justifyContent: 'center',
        }}>
        <PopupHeader
          header={'Add Offer'}
          onClose={onClose} />
        <ScrollView
          style={{
            backgroundColor: '#fff',
            paddingHorizontal: 15,
            // borderRadius: 15,
            flex: 1,
          }}>
          <InputView
            title={'Name'}
            defaultValue={inputs?.name}
            placeholder={'eg:Burger & French Fries Combo'}
            onChangeText={i => onHandleChange('name', i)}
          />
          <InputView
            title={'Description'}
            defaultValue={inputs?.description}
            placeholder={'eg: Juicy veggie patty burger served with crispy French fries.'}
            onChangeText={i => onHandleChange('description', i)}
          />
          <InputView
            keyboardType={'numeric'}
            title={'Price'}
            defaultValue={inputs?.price &&inputs?.price[0]?.price}
            placeholder={'Price'}
            onChangeText={i => {
              setInputs(prev => ({ ...prev, price: [{ price: i, size: 'Regular' }] }))
            }}
          />
          <DateTimeField
            label="Valid From"
            mode="date"
            value={inputs?.valid_from}
            onChange={(str) => {
              onHandleChange('valid_from', str)
            }}
          />
          <DateTimeField
            label="Valid To"
            mode="date"
            value={inputs?.valid_to}
            onChange={(str) => {
              onHandleChange('valid_to', str)
            }}
          />
          <DateTimeField
            label="Start Time"
            mode="time"
            value={inputs?.start_time}
            onChange={(str) => {
              onHandleChange('start_time', str)
            }}
          />
          <DateTimeField
            label="End Time"
            mode="time"
            value={inputs?.end_time}
            onChange={(str) => {
              onHandleChange('end_time', str)
            }}
          />
          <MultiSelectInput
            label="Select Days"
            options={["everyday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}
            value={inputs?.days_active}
            onChange={(list) => onHandleChange('days_active', list)}
          />
          <ImagePickerInput
            label="Product Image"
            value={selectImage}
            onChange={(img) => setSelectImage({ ...img, update: true })}
          />
          <ButtonView
            text={SelectItem ? 'Update' : 'Submit'}
            loading={imageLoading}
            onPress={onValidate}
            click
            styles={{ marginBottom: 20 }}
          />
        </ScrollView>
      </View>
    </Modal>
  )
}

export default OfferPopup

const PopupHeader = ({ header, onClose }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 55,
        backgroundColor: AppColors.WHITE
      }}>
      <SemiBoldText styles={{ fontWeight: 500 }} text={header} />
      <ImageButton
        styles={{ position: 'absolute', right: 10 }}
        imgStyles={{ height: 20, width: 20 }}
        src={AppImages?.CLOSE_ICON}
        onPress={onClose}
      />
    </View>
  )
}