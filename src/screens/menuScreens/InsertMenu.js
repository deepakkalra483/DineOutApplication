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
import {RegularText, SemiBoldText, styles} from '../../utils/AppConstants';
import {Header, ImageButton} from '../HomeScreen';
import {AppImages} from '../../utils/AppImages';
import {ButtonView, InputSelection, InputView} from '../auth/LoginScreen';
import {navigateTo} from '../../utils/RootNavigation';
import {EDIT_SCREEN} from '../../utils/AppScreens';
import {useEffect, useState} from 'react';
import {
  DeleteMenuItem,
  EditCategory,
  EditMenuItem,
  getCategories,
  getMenu,
  getUser,
  MENU,
  SetMenu,
  SetResturantMenu,
} from '../../utils/AsynStorageHelper';
import AsyncStorage from '@react-native-community/async-storage';
import {getMenuData, UpdateMenu} from '../../networking/FireStoreService';
import {launchImageLibrary} from 'react-native-image-picker';
import {AppColors} from '../../utils/AppColors';

const menuItems = [
  {
    category: 'Burgers',
    items: [
      {
        id: 1,
        name: 'Chees Burger',
        price: '65',
        description: 'fully veg load',
      },
      {
        id: 2,
        name: 'Veg Burger',
        price: '85',
        description: 'Allo tikki ',
      },
      {
        id: 1,
        name: 'Chees Burger with Mashroom',
        price: '65',
        description: 'fully veg load',
      },
      {
        id: 2,
        name: 'Veg Burger',
        price: '85',
        description: 'Allo tikki ',
      },
    ],
  },
  {
    category: 'Pizzas',
    items: [
      {
        id: 1,
        name: 'Chees Burger',
        price: '65',
        description: 'fully veg load',
      },
      {
        id: 2,
        name: 'Veg Burger',
        price: '85',
        description: 'Allo tikki ',
      },
    ],
  },
];
const InsertMenu = props => {
  const data = props?.route?.params?.data;
  const [category, setCategory] = useState(null);
  const [name, setName] = useState(SelectItem?.name);
  const [price, setPrice] = useState(SelectItem?.price);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [id, setId] = useState(0);
  const [open, setOpen] = useState(null);
  const [SelectItem, setSelectedItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [sizePrice, setSizePrice] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const fetchData = async () => {
    console.log('call');
  };

  const DeleteItem = (cat, data) => {
    setRefresh(true);
    DeleteMenuItem(cat, data?.id, res => {
      setRefresh(false);
    });
  };

  const UpdateMenuInDb = () => {
    setUpdateLoading(true);
    getUser(res => {
      UpdateMenu(
        data ? data?.restaurantId : res?.id,
        menuItems,
        response => {
          // console.log('updated');
          Alert.alert(
            'Successfully Updated!',
            `your menu has been chnaged in all QR`,
          );
          setUpdateLoading(false);
        },
        error => {
          console.log('notUpdet--', error);
          setUpdateLoading(false);
        },
      );
    });
  };

  useEffect(() => {
    if (SelectItem) {
      //   setPrice(SelectItem?.price);
      setSizePrice(SelectItem?.price);
      setName(SelectItem?.name);
      setImageUrl(SelectItem?.src);
      setCategory(SelectItem?.category);
    } else {
      setSizePrice([]);
      setName(null);
      setImageUrl(null);
      setCategory(null);
    }
  }, [SelectItem]);

  const SelectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        Alert.alert('Cancelled', 'You cancelled the image picker.');
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else {
        const source = response.assets[0].uri;
        console.log(JSON.stringify(response.assets[0]));
        setImageUrl(source);
      }
    });
  };

  const uploadImage = async onSuccess => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUrl,
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
        onSuccess(result?.data?.url);
      } else {
        Alert.alert('Upload Failed', 'Something went wrong.');
        setImageLoading(false);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Upload Error', 'Could not upload image.');
      setImageLoading(false);
    }
  };

  const AddItem = async () => {
    console.log('sizePrice--', JSON.stringify(sizePrice));
    if (imageUrl && name && sizePrice && category) {
      setImageLoading(true);
      uploadImage(url => {
        const item = {
          name: name,
          price: sizePrice,
          src: url,
          id: Date.now(),
        };
        SetMenu({category: category, item: item}, res => {
          setId(id + 1);
          AsyncStorage.setItem('id', JSON.stringify(id + 1));
        });
        setName(null);
        setPrice(null);
        setImageUrl(null);
        setImageLoading(false);
      });
    } else {
      Alert.alert('Please Select All filed');
    }
  };

  const EditCat = () => {
    if (category?.trim()?.length > 0) {
      setImageLoading(true);
      EditCategory(SelectItem?.category, {category: category}, res => {
        setOpen(null);
        setSelectedItem(null);
        setImageLoading(false);
      });
    }
  };

  const EditItem = () => {
    console.log('priceSize-- ', JSON.stringify(sizePrice));
    if (sizePrice && name && category && imageUrl) {
      setImageLoading(true);
      if (SelectItem?.src === imageUrl) {
        console.log('image is same ');
        const data = {
          price: sizePrice,
          name: name,
          src: imageUrl,
          id: SelectItem?.id,
        };
        EditMenuItem(SelectItem?.category, data, res => {
          setOpen(null);
          setSelectedItem(null);
          setImageLoading(false);
        });
      } else {
        console.log('image is chnage');
        uploadImage(url => {
          const data = {
            price: sizePrice,
            name: name,
            src: url,
            id: SelectItem?.id,
          };
          EditMenuItem(SelectItem?.category, data, res => {
            setOpen(null);
            setImageLoading(false);
            setSelectedItem(null);
          });
        });
      }
      // uploadImage(url => {});
    } else {
      Alert.alert('Fill all the details');
    }
  };

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
            });
          }
        });
      }
    }
  }, [id, open, fetching, refresh]);
  return (
    <View style={styles.container}>
      <Modal transparent visible={open != null}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            // paddingHorizontal: 15,
            justifyContent: 'center',
          }}>
          <ScrollView style={{backgroundColor: '#fff', padding: 15}}>
            <View
              style={{
                height: 55,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <SemiBoldText styles={{fontSize: 20}} text={'Add Item'} />
              <ImageButton
                styles={{position: 'absolute', right: 10}}
                imgStyles={{height: 20, width: 20}}
                src={AppImages?.CLOSE_ICON}
                onPress={() => {
                  setSelectedItem(null);
                  setOpen(null);
                  setSizePrice([]);
                  setCategory(null);
                }}
              />
            </View>
            {open == 'item' ? (
              <View>
                <InputSelection
                  editable={SelectItem ? false : true}
                  title={'Category'}
                  placeholder={'eg: Burgers'}
                  defaultValue={SelectItem?.category || category}
                  // onChangeText={i => setCategory(i)}
                  list={categoryList}
                  onPress={item => {
                    setCategory(item);
                  }}
                />
                {/* <InputView
                  editable={false}
                  title={'Category'}
                  placeholder={'eg: Burgers'}
                  defaultValue={SelectItem?.category || category}
                  onChangeText={i => setCategory(i)}
                /> */}
                <InputView
                  title={'Name of Item'}
                  defaultValue={SelectItem?.name || name}
                  placeholder={'eg: Chees Burger'}
                  onChangeText={i => setName(i)}
                />
                {Array.from({length: 3}).map((_, index) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <InputView
                      styles={{width: '48%'}}
                      defaultValue={sizePrice[index]?.size}
                      title={index == 0 ? 'Size' : null}
                      placeholder={'enter Size'}
                      //   keyboardType={'numeric'}
                      // onChangeText={text => {
                      //   if (text?.trim()?.length > 0) {
                      //     setSizePrice(prevState => {
                      //       const newSizePrice = [...prevState];
                      //       newSizePrice[index] = {
                      //         ...newSizePrice[index],
                      //         size: text,
                      //       };
                      //       return newSizePrice;
                      //     });
                      //   }
                      // }}
                      onChangeText={text => {
                        setSizePrice(prevState => {
                          const newSizePrice = [...prevState];

                          if (text.trim().length === 0) {
                            // Remove the item at the given index
                            const {size, price} = newSizePrice[index];
                            price
                              ? (newSizePrice[index] = price)
                              : newSizePrice.splice(index, 1);
                          } else {
                            // Update the size value
                            newSizePrice[index] = {
                              ...newSizePrice[index],
                              size: text,
                            };
                          }

                          return newSizePrice;
                        });
                      }}
                    />
                    <InputView
                      styles={{width: '48%'}}
                      defaultValue={sizePrice[index]?.price}
                      title={index == 0 ? 'Price' : null}
                      placeholder={'eg: 75'}
                      keyboardType={'numeric'}
                      // onChangeText={text => {
                      //   if (text?.trim()?.length > 0) {
                      //     setSizePrice(prevState => {
                      //       const newSizePrice = [...prevState];
                      //       newSizePrice[index] = {
                      //         ...newSizePrice[index],
                      //         price: text,
                      //       };
                      //       return newSizePrice;
                      //     });
                      //   }
                      // }}
                      onChangeText={text => {
                        setSizePrice(prevState => {
                          const newSizePrice = [...prevState];

                          if (text.trim().length === 0) {
                            // Remove the item at the given index
                            const {price, size} = newSizePrice[index];
                            size
                              ? (newSizePrice[index] = size)
                              : newSizePrice.splice(index, 1);
                          } else {
                            // Update the size value
                            newSizePrice[index] = {
                              ...newSizePrice[index],
                              price: text,
                            };
                          }
                          return newSizePrice;
                        });
                      }}
                    />
                  </View>
                ))}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={{
                      backgroundColor: '#f5f5f5',
                      height: 65,
                      width: 65,
                      marginLeft: 15,
                      marginTop: 15,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                    }}
                    onPress={SelectImage}>
                    {imageUrl ? (
                      <Image
                        style={{
                          height: '100%',
                          width: '100%',
                          resizeMode: 'cover',
                          borderRadius: 10,
                          opacity: imageLoading ? 0.3 : 1,
                        }}
                        source={{uri: imageUrl}}
                      />
                    ) : (
                      <View style={{alignItems: 'center'}}>
                        <Image
                          style={{height: 25, width: 25, tintColor: '#000'}}
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
                    {imageLoading && imageUrl && (
                      <ActivityIndicator
                        size={30}
                        color={'#000'}
                        style={{position: 'absolute'}}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <InputView
                title={'Category'}
                placeholder={'eg: Burgers'}
                defaultValue={SelectItem?.category || category}
                onChangeText={i => setCategory(i)}
              />
            )}
            <ButtonView
              loading={imageLoading}
              styles={{marginTop: 15}}
              text={SelectItem ? 'Update' : 'Add'}
              click={
                open == 'item'
                  ? category && name && sizePrice && imageUrl
                  : category
              }
              onPress={() => {
                SelectItem
                  ? open == 'item'
                    ? EditItem()
                    : EditCat()
                  : AddItem();
              }}
            />
          </ScrollView>
        </View>
      </Modal>
      <Header
        leftSrc={AppImages.ADD_ICON}
        loading={updateLoading}
        title={data ? data?.name : 'Menu'}
        right={'Update'}
        rightPress={() => {
          Alert.alert('Do you want to chnage your menu in all QR ?', '', [
            {text: 'No', style: 'cancel'},
            {text: 'Yes', style: 'default', onPress: () => UpdateMenuInDb()},
          ]);
        }}
        leftPress={() => {
          setSelectedItem(null);
          // AsyncStorage.removeItem(MENU)
          setOpen('item');
        }}
      />
      {menuItems?.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.category}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingVertical: 15,
            flexGrow: 1,
            paddingBottom: 55,
          }}
          data={menuItems}
          renderItem={({item}) => (
            <MenuBox
              id={item?.category}
              item={item}
              onRemove={data => {
                Alert.alert('Are you sure you want to delete ?', '', [
                  {text: 'No', style: 'cancel'},
                  {
                    text: 'Yes',
                    style: 'default',
                    onPress: () => DeleteItem(item?.category, data),
                  },
                ]);
              }}
              onEdit={data => {
                setSelectedItem({...data, ...{category: item?.category}});
                setOpen('item');
                console.warn(data);
              }}
              editCategory={() => {
                setSelectedItem({category: item?.category});
                setOpen('cat');
              }}
            />
          )}
        />
      ) : fetching ? (
        <ActivityIndicator
          style={{marginTop: 30}}
          size={35}
          color={AppColors.BLACK}
        />
      ) : (
        <SemiBoldText
          styles={{alignSelf: 'center', marginTop: 30, fontSize: 20}}
          text={'No items found'}
        />
      )}
    </View>
  );
};
export default InsertMenu;

export const MenuBox = props => {
  const item = props?.item;
  console.log('item---', item);
  return (
    <View key={props?.id}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
        <SemiBoldText styles={{}} text={item?.category} />
        <ImageButton
          styles={{height: 20, width: 30, paddingTop: 5, paddingLeft: 10}}
          imgStyles={{height: 15, width: 15}}
          src={AppImages.PENCIL_ICON}
          onPress={props?.editCategory}
        />
      </View>
      <ScrollView contentContainerStyle={{paddingBottom: 10}} horizontal>
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
            ? {uri: item?.src}
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
        <SemiBoldText styles={{textAlign: 'center'}} text={item?.name} />
        {priceArray?.length == 1 ? (
          <RegularText
            styles={{fontSize: 12}}
            text={`₹ ${priceArray[0]?.price}`}
          />
        ) : (
          priceArray.map(item => (
            <RegularText
              styles={{fontSize: 12, marginTop: 3}}
              text={`${item?.size} ₹ ${item?.price}`}
            />
          ))
        )}
        {/* <RegularText text={`₹ ${item?.price}`} /> */}
        <ButtonView
          click
          styles={{height: 27, width: '60%', marginTop: 5}}
          text={'Edit'}
          onPress={props?.onEdit}
        />
      </View>
      <ImageButton
        imgStyles={{tintColor: '#fff', height: 10, width: 10}}
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
