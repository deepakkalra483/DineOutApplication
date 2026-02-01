import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { RegularText, SemiBoldText, styles } from '../../utils/AppConstants';
import { Header, ImageButton } from '../HomeScreen';
import { AppImages } from '../../utils/AppImages';
import { ButtonView, InputSelection, InputView } from '../auth/LoginScreen';
import {
  DeleteMenuItem,
  EditCategory,
  EditMenuItem,
  getCategories,
  getMenu,
  getUser,
  SetMenu,
} from '../../utils/AsynStorageHelper';
import AsyncStorage from '@react-native-community/async-storage';
import { getMenuData, syncOrdersForMonth, UpdateMenu } from '../../networking/FireStoreService';
import { launchImageLibrary } from 'react-native-image-picker';
import { AppColors } from '../../utils/AppColors';

const UpdateMenuScreen = props => {
  const data = props?.route?.params?.data;

  const [id, setId] = useState(0);
  const [category, setCategory] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);

  const [open, setOpen] = useState(null);
  const [SelectItem, setSelectedItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [refresh, setRefresh] = useState(false);

  /* ---------------- PREFILL ON EDIT ---------------- */
  useEffect(() => {
    if (SelectItem) {
      setName(SelectItem?.name);
      setDescription(SelectItem?.description || '');
      setPrice(SelectItem?.price?.[0]?.price?.toString() || '');
      setImageUrl(SelectItem?.src);
      setCategory(SelectItem?.category);
    } else {
      resetForm();
    }
  }, [SelectItem]);

  const isLocalImage = (uri) =>
    uri?.startsWith('file://') || uri?.startsWith('content://');


  /* ---------------- IMAGE PICKER ---------------- */
  const SelectImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, res => {
      if (!res.didCancel && !res.errorMessage) {
        setImageUrl(res.assets[0].uri);
      }
    });
  };

  /* ---------------- IMAGE UPLOAD ---------------- */
  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      name: 'upload.jpg',
      type: 'image/jpeg',
    });

    const response = await fetch(
      'https://api.imgbb.com/1/upload?key=ff3de0236b8576ac67a873ce0352c6b2',
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error('Image upload failed');
    }

    return result.data.url;
  };



  /* ---------------- PRICE FORMAT ---------------- */
  const buildPrice = () => [
    {
      price: Number(price),
      size: 'Regular',
    },
  ];

  /* ---------------- ADD ITEM ---------------- */
  const AddItem = async () => {
    if (!name || !price || !category || !imageUrl) {
      Alert.alert('Please fill all fields');
      return;
    }

    try {
      setImageLoading(true);

      const uploadedUrl = await uploadImage(imageUrl);

      const item = {
        id: Date.now(),
        name,
        description,
        price: buildPrice(),
        src: uploadedUrl,
      };

      SetMenu({ category, item }, () => {
        setImageLoading(false);
        resetForm();
        setOpen(null);
        setRefresh(prev => !prev);
      });

    } catch (error) {
      console.log(error);
      setImageLoading(false);
      Alert.alert('Failed to add item');
    }
  };

  /* ---------------- EDIT ITEM ---------------- */
  const EditItem = async () => {
    try {
      setImageLoading(true);

      let finalImageUrl = SelectItem.src;

      if (isLocalImage(imageUrl)) {
        finalImageUrl = await uploadImage(imageUrl);
      }

      const updatedItem = {
        id: SelectItem.id,
        name,
        description,
        price: buildPrice(),
        src: finalImageUrl,
      };

      EditMenuItem(SelectItem.category, updatedItem, () => {
        setMenuItems(prev =>
          prev.map(cat =>
            cat.category === SelectItem.category
              ? {
                ...cat,
                items: cat.items.map(it =>
                  it.id === updatedItem.id ? updatedItem : it
                ),
              }
              : cat
          )
        );

        setImageLoading(false);
        setOpen(null);
        setSelectedItem(null);
      });

    } catch (error) {
      console.log(error);
      setImageLoading(false);
      Alert.alert('Failed to update item');
    }
  };


  /* ---------------- DELETE ITEM ---------------- */
  const DeleteItem = (cat, item) => {
    DeleteMenuItem(cat, item.id, () => setRefresh(!refresh));
  };

  /* ---------------- UPDATE MENU IN FIRESTORE ---------------- */
  const UpdateMenuInDb = () => {
    setUpdateLoading(true);
    getUser(res => {
      UpdateMenu(res.id, menuItems, () => {
        setUpdateLoading(false);
        Alert.alert('Menu updated in all QR');
      });
    });
  };

  const startSync = async (id) => {
    const response = await syncOrdersForMonth(
      id,
      2025,
      12
    );
    console.log("RESULT:", response);
  };

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!fetching) {
      if (id == 0) {
        AsyncStorage.getItem('id').then(number => {
          if (number) {
            setId(parseInt(number, 10));
          }
        });
      }
      if (!open) {
        getMenu(res => {
          if (res) {
            console.log('res---', JSON.stringify(res));
            setMenuItems(res);
            getCategories(success => {
              if (success) {
                setCategoryList(success);
              }
            });
          } else {
            setFetching(true);
            getUser(userDetail => {
              getMenuData(
                userDetail?.id,
                res => {
                  let maxId = 0;
                  console.log('res--', res);
                  if (res) {
                    maxId = Math.max(
                      ...res.flatMap(category =>
                        category.items.map(item => item.id),
                      ),
                    );
                  }
                  console.log('max--', maxId);
                  AsyncStorage.setItem('id', JSON.stringify(maxId)).then(() => {
                    setId(maxId);
                    setFetching(false);
                  });
                },
                error => {
                  setFetching(false);
                },
              );
              startSync(userDetail?.id)
            });
          }
        });
      }
    }
  }, [id, open, fetching, refresh]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setImageUrl(null);
    setCategory(null);
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      <Modal transparent visible={open === 'item'}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            // paddingHorizontal: 15,
            justifyContent: 'center',
          }}>
          <ScrollView style={{ backgroundColor: '#fff', margin: 15, padding: 15, marginTop: 0, }}>
            <View
              style={{
                // height: 55,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <SemiBoldText styles={{ fontSize: 20 }} text={'Add Item'} />
              <ImageButton
                styles={{ position: 'absolute', right: 10 }}
                imgStyles={{ height: 20, width: 20 }}
                src={AppImages?.CLOSE_ICON}
                onPress={() => {
                  setSelectedItem(null);
                  setOpen(null);
                  setCategory(null);
                }}
              />
            </View>

            <InputSelection
              title="Category"
              list={categoryList}
              defaultValue={category}
              onPress={setCategory}
            />

            <InputView title="Item Name" defaultValue={name} onChangeText={setName} />
            <InputView
              title="Price"
              keyboardType="numeric"
              defaultValue={price}
              onChangeText={setPrice}
            />
            <InputView
              title="Description"
              defaultValue={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity style={{ marginVertical: 10 }} onPress={SelectImage}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={{ height: 120 }} />
              ) : (
                <View style={{
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  marginVertical: 10,
                  backgroundColor: '#fafafa',
                  padding: 8,
                  elevation: 3
                }}>
                  <Image
                    style={{ height: 25, width: 25, tintColor: '#000' }}
                    source={AppImages?.ADD_ICON}
                  />
                  <RegularText
                    styles={{
                      textAlign: 'center',
                      color: 'gray',
                      fontSize: 10,
                    }}
                    text={'Add Image'}
                  />
                </View>
              )}
              {imageLoading && <ActivityIndicator />}
            </TouchableOpacity>

            <ButtonView
              text={SelectItem ? 'Update' : 'Add'}
              click
              onPress={SelectItem ? EditItem : AddItem}
            />
          </ScrollView>
        </View>
      </Modal>

      <Header
        title={data?.name || 'Menu'}
        leftSrc={AppImages.ADD_ICON}
        loading={updateLoading}
        leftPress={() => {
          setSelectedItem(null);
          setOpen('item');
        }}
        right="Update"
        rightPress={UpdateMenuInDb}
      />

      <FlatList
        data={menuItems}
        keyExtractor={item => item.category}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <MenuBox
            item={item}
            onEdit={i => {
              setSelectedItem({ ...i, category: item.category });
              setOpen('item');
            }}
            onRemove={i => DeleteItem(item.category, i)}
          />
        )}
      />
    </View>
  );
};

export default UpdateMenuScreen;

export const MenuBox = props => {
  const item = props?.item;
  console.log('item---', item);
  return (
    <View key={props?.id}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <SemiBoldText styles={{}} text={item?.category} />
        <ImageButton
          styles={{ height: 20, width: 30, paddingTop: 5, paddingLeft: 10 }}
          imgStyles={{ height: 15, width: 15 }}
          src={AppImages.PENCIL_ICON}
          onPress={props?.editCategory}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 10 }} horizontal>
        {item?.items.map(item => (
          <ItemBox
            id={item?.id}
            item={item}
            onEdit={() => props?.onEdit(item)}
            onRemove={() => props?.onRemove(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export const ItemBox = props => {
  const item = props?.item;
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const priceArray = item?.price;
  return (
    <View
      key={item?.id}
      style={{
        backgroundColor: '#fff',
        marginHorizontal: 7,
        borderRadius: 15,
        elevation: 2,
      }}>
      <Image
        style={{
          height: height / 8,
          width: width / 3,
          resizeMode: 'cover',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          backgroundColor: '#fafafa',
        }}
        source={
          item?.src
            ? { uri: item?.src }
            : require('../../assets/images/backgroud/burger_photo.png')
        }
      />
      <View
        style={{
          justifyContent: 'space-evenly',
          alignItems: 'center',
          padding: 5,
          backgroundColor: '#fff',
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
          //   height: height / 7,
          width: width / 3,
        }}>
        <SemiBoldText styles={{ textAlign: 'center' }} text={item?.name} />
        <RegularText styles={{ textAlign: 'center', fontSize: 11 }} text={item?.description} />
        {priceArray?.length == 1 ? (
          <RegularText
            styles={{ fontSize: 12 }}
            text={`₹ ${priceArray[0]?.price}`}
          />
        ) : (
          priceArray.map(item => (
            <RegularText
              styles={{ fontSize: 12, marginTop: 3 }}
              text={`${item?.size} ₹ ${item?.price}`}
            />
          ))
        )}
        {/* <RegularText text={`₹ ${item?.price}`} /> */}
        <ButtonView
          click
          styles={{ height: 27, width: '60%', marginTop: 5 }}
          text={'Edit'}
          onPress={props?.onEdit}
        />
      </View>
      <ImageButton
        imgStyles={{ tintColor: '#fff', height: 10, width: 10 }}
        styles={{
          height: 15,
          width: 15,
          position: 'absolute',
          top: 7,
          right: 7,
          backgroundColor: '#000',
          borderRadius: 15,
          padding: 5,
        }}
        src={AppImages?.CLOSE_ICON}
        onPress={props?.onRemove}
      />
    </View>
  );
};
