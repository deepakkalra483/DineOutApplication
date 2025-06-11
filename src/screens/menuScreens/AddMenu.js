import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeModules,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {RegularText, SemiBoldText, styles} from '../../utils/AppConstants';
import {Header, ImageButton} from '../HomeScreen';
import {AppImages} from '../../utils/AppImages';
import {ButtonView, InputSelection, InputView} from '../auth/LoginScreen';
import {navigateTo} from '../../utils/RootNavigation';
import {AppScreens, EDIT_SCREEN} from '../../utils/AppScreens';
import {useEffect, useState} from 'react';
import {
  EditMenuItem,
  getMenu,
  getUser,
  MENU,
  SetMenu,
} from '../../utils/AsynStorageHelper';
import AsyncStorage from '@react-native-community/async-storage';
import {getMenuData, UpdateMenu} from '../../networking/FireStoreService';
import {launchImageLibrary} from 'react-native-image-picker';
import {SaveButton} from './AddItems';
import {AppColors} from '../../utils/AppColors';
import {query} from '@react-native-firebase/database';

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
let backup = [];
const AddMenu = ({navigation}) => {
  const {OrdersModule} = NativeModules;
  const [category, setCategory] = useState(null);
  const [name, setName] = useState(SelectItem?.name);
  const [price_one, setPriceOne] = useState(null);
  const [price_two, setPriceTwo] = useState(null);
  const [price_three, setPriceThree] = useState(null);
  const [price_four, setPriceFour] = useState(null);
  const [size_one, setSizeOne] = useState(null);
  const [size_two, setSizeTwo] = useState(null);
  const [size_three, setSizeThree] = useState(null);
  const [size_four, setSizeFour] = useState(null);
  const [price, setPrice] = useState([]);
  const [size, setSize] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [id, setId] = useState(0);
  const [open, setOpen] = useState(false);
  const [SelectItem, setSelectedItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [selectCategory, setSelectCategory] = useState(null);
  const fetchData = async () => {
    console.log('call');
  };

  useEffect(() => {
    getUser(res => {
      getMenuData(res?.id);
    });
  }, []);

  const getMenu = async () => {
    try {
      const response = await OrdersModule.getMenu();
      const parsedOrders = JSON.parse(response);
      setMenuItems(parsedOrders);
      console.log('parsed--', response);
      // setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // setLoading(false);
    }
  };

  const getCategory = async () => {
    try {
      const response = await OrdersModule.getCategory();
      const parsedOrders = JSON.parse(response);
      setCategoryList(parsedOrders);
      backup = [...parsedOrders];
      // setOrders(parsedOrders);
      console.log('parsed--', response);
      // setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // setLoading(false);
    }
  };

  const searchCategory = query => {
    if (!query) {
      setCategoryList(backup);
      return;
    }
    const filterdList = categoryList.filter(o =>
      o.category_name?.toLowerCase().includes(query.toLowerCase()),
    );
    if (filterdList?.length > 0) {
      setCategoryList(filterdList);
    } else if (filterdList?.length == 0) {
      const newList = [
        {
          category_name: query,
          category_id: -2,
        },
      ];
      setCategoryList(newList);
    }
  };

  const defaultPrice = index => {
    if (index === 0) {
      return price_one;
    } else if (index === 1) {
      return price_two;
    } else if (index === 2) {
      return price_three;
    } else {
      return price_four;
    }
  };

  const defaultSize = index => {
    if (index === 0) {
      return size_one;
    } else if (index === 1) {
      return size_two;
    } else if (index === 2) {
      return size_three;
    } else {
      return size_four;
    }
  };

  const HandleSize = (index, value) => {
    if (index === 0) {
      setSizeOne(value);
    } else if (index === 1) {
      setSizeTwo(value);
    } else if (index === 2) {
      setSizeThree(value);
    } else {
      setSizeFour(value);
    }
  };

  const HandlePrice = (index, value) => {
    if (index === 0) {
      setPriceOne(value);
    } else if (index === 1) {
      setPriceTwo(value);
    } else if (index === 2) {
      setPriceThree(value);
    } else {
      setPriceFour(value);
    }
  };

  const UpdateMenuInDb = () => {
    setUpdateLoading(true);
    getUser(res => {
      UpdateMenu(
        res?.id,
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
    setPrice(SelectItem?.price);
    setName(SelectItem?.name);
    setImageUrl(SelectItem?.src);
    setSelectCategory(SelectItem?.category);
    Object.entries(SelectItem?.price || {}).forEach(([size, price], index) => {
      if (index === 0) {
        setSizeOne(size);
        setPriceOne(price);
      } else if (index === 1) {
        setSizeTwo(size);
        setPriceTwo(price);
      } else if (index === 2) {
        setSizeThree(size);
        setPriceThree(price);
      } else if (index === 3) {
        setSizeFour(size);
        setPriceFour(price);
      }
    });
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

  const saveCategory = async edit => {
    console.log('itemid--', edit);
    if (selectCategory?.category_id == -2) {
      setImageLoading(true);
      try {
        const response = await OrdersModule.insertCategoryItem(
          selectCategory?.category_name,
        );
        console.log('read', response);
        setSelectCategory({
          ...selectCategory,
          category_id: response,
        });
        if (edit) {
          EditItem(edit, response);
        } else {
          saveItem(response);
        }
      } catch (error) {
        console.log('er', error);
      }
    } else {
      if (edit) {
        EditItem(edit, selectCategory?.category_id);
      } else {
        saveItem(selectCategory?.category_id);
      }
    }
  };
  const addIfValid = (obj, key, value) => {
    if (key && value) {
      obj[key] = value;
    }
  };

  const saveItem = async id => {
    try {
      let price = {};

      addIfValid(price, size_one, price_one);
      addIfValid(price, size_two, price_two);
      addIfValid(price, size_three, price_three);
      addIfValid(price, size_four, price_four);
      const strinfgyPrice = JSON.stringify(price);
      console.log('price--', strinfgyPrice);
      // return
      uploadImage(url => {
        OrdersModule.insertMenuItem(name, strinfgyPrice, url, id)
          .then(res => {
            setImageLoading(false);
          })
          .catch(e => {
            setImageLoading(false);
          });
        // SetMenu({category: category, item: item}, res => {
        //   setId(id + 1);
        //   AsyncStorage.setItem('id', JSON.stringify(id + 1));
        // });
        setName(null);
        setPrice(null);
        setImageUrl(null);
        setImageLoading(false);
        // setSelectCategory(null);
        setPriceOne(null);
        setPriceTwo(null);
        setPriceThree(null);
        setPriceFour(null);
        setSizeOne(null);
        setSizeTwo(null);
        setSizeThree(null);
        setSizeFour(null);
      });

      // console.log('read', response);
    } catch (error) {
      console.log('er', error);
    }
  };

  const AddItem = async () => {
    console.log('cll');
    if (imageUrl && name && price && category) {
      setImageLoading(true);
      uploadImage(url => {
        const item = {
          name: name,
          price: price,
          src: url,
          id: id + 1,
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

  const EditItem = (Itemid, catId) => {
    if (name && imageUrl) {
      let price = {};

      addIfValid(price, size_one, price_one);
      addIfValid(price, size_two, price_two);
      addIfValid(price, size_three, price_three);
      addIfValid(price, size_four, price_four);
      const strinfgyPrice = JSON.stringify(price);
      setImageLoading(true);
      if (SelectItem?.src === imageUrl) {
        OrdersModule.updateMenuItem(
          Itemid,
          name,
          strinfgyPrice,
          imageUrl,
          catId,
        )
          .then(res => {
            setImageLoading(false);
            setOpen(false);
          })
          .catch(e => {
            setImageLoading(false);
            setOpen(false);
          });
      } else {
        console.log('image is chnage');
        uploadImage(url => {
          OrdersModule.updateMenuItem(Itemid, name, strinfgyPrice, url, catId)
            .then(res => {
              setOpen(false);
              setImageLoading(false);
            })
            .catch(e => {
              setOpen(false);
              setImageLoading(false);
              console.log('error', e);
            });
        });
      }
      // uploadImage(url => {});
    } else {
      Alert.alert('Fill all the details');
    }
  };

  useEffect(() => {
    if (id == 0) {
      AsyncStorage.getItem('id').then(number => {
        if (number) {
          setId(parseInt(number, 10));
        }
      });
    }
    if (!open) {
      getCategory();
      getMenu(res => {
        // console.log('re---', JSON.stringify(res));
        setMenuItems(res);
      });
    }
  }, [id, open]);
  return (
    <View style={styles.container}>
      <Modal transparent visible={open}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            // paddingHorizontal: 15,
            justifyContent: 'center',
          }}>
          <ScrollView
            style={{
              backgroundColor: '#fff',
              paddingHorizontal: 15,
              borderRadius: 15,
              flex: 1,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 55,
              }}>
              <SemiBoldText styles={{fontWeight: 500}} text={'Add Item'} />
              <ImageButton
                styles={{position: 'absolute', right: 10}}
                imgStyles={{height: 20, width: 20}}
                src={AppImages?.CLOSE_ICON}
                onPress={() => setOpen(false)}
              />
            </View>
            <View>
              <InputView
                title={'Category'}
                placeholder={'eg: Burgers'}
                defaultValue={SelectItem?.category || category}
                onChangeText={i => searchCategory(i)}
              />
              <FlatList
                data={categoryList}
                horizontal
                contentContainerStyle={{paddingVertical: 10}}
                renderItem={({item, index}) => {
                  const check =
                    item.category_name === selectCategory?.category_name;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      key={`J${index}`}
                      style={{
                        paddingHorizontal: 15,
                        paddingVertical: 7,
                        marginHorizontal: 5,
                        borderRadius: 10,
                        backgroundColor: check
                          ? AppColors.LIGHT_GREEN_TEXT
                          : AppColors.GRAY,
                      }}
                      onPress={() => {
                        setSelectCategory(item);
                      }}>
                      <SemiBoldText
                        styles={{color: AppColors.WHITE}}
                        text={item?.category_name}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
            <InputView
              title={'Name of Item'}
              defaultValue={SelectItem?.name || name}
              placeholder={'eg: Chees Burger'}
              onChangeText={i => setName(i)}
            />
            {/* <InputView
              title={'Image'}
              defaultValue={imageUrl}
              placeholder={'eg: Image Url'}
              onChangeText={i => setImageUrl(i)}
            /> */}
            {Array.from({length: 4}).map((_, index) => (
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <InputView
                  styles={{width: '48%'}}
                  defaultValue={defaultSize(index)}
                  title={index == 0 ? 'Size' : null}
                  placeholder={'eg: 75'}
                  // keyboardType={'numeric'}
                  onChangeText={i => {
                    HandleSize(index, i);
                  }}
                />
                <InputView
                  styles={{width: '48%'}}
                  defaultValue={defaultPrice(index)}
                  title={index == 0 ? 'Price' : null}
                  placeholder={'eg: 75'}
                  keyboardType={'numeric'}
                  onChangeText={i => {
                    HandlePrice(index, i);
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
              {/* <InputSelection
                list={categoryList}
                styles={{width: '70%'}}
                title={'Category'}
                placeholder={'eg: Burgers'}
                defaultValue={SelectItem?.category || category}
                // onChangeText={i => setCategory(i)}
                // onPress={item => setCategory(item?.category_name)}
              /> */}
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
            <ButtonView
              loading={imageLoading}
              styles={{marginTop: 15}}
              text={SelectItem ? 'Update' : 'Add'}
              click={category && name && price && imageUrl}
              // onPress={() => {
              //   SelectItem ? EditItem() : AddItem();
              // }}
              onPress={() => {
                SelectItem ? saveCategory(SelectItem?.id) : saveCategory();
              }}
            />
          </ScrollView>
        </View>
      </Modal>
      <Header
        leftSrc={AppImages.ADD_ICON}
        loading={updateLoading}
        title={'Menu'}
        right={'Update'}
        rightPress={() => {
          Alert.alert('Do you want to chnage your menu in all QR ?', '', [
            {text: 'No', style: 'cancel'},
            {text: 'Yes', style: 'default', onPress: () => UpdateMenuInDb()},
          ]);
        }}
        leftPress={() => {
          // navigation.navigate(AppScreens.ADD_ITEMS_SCREEN)
          setSelectedItem(null);
          // AsyncStorage.removeItem(MENU)
          setOpen(true);
        }}
      />
      <FlatList
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
            onEdit={data => {
              setSelectedItem({
                ...data,
                ...{
                  category: {
                    category_name: item?.category,
                    category_id: item?.categoryId,
                  },
                },
              });
              setOpen(true);
              console.warn(data);
            }}
          />
        )}
      />
    </View>
  );
};
export default AddMenu;

export const MenuBox = props => {
  const item = props?.item;
  return (
    <View
      key={`a${item?.id}`}
      style={
        {
          // backgroundColor: '#fff',
        }
      }>
      <SemiBoldText styles={{marginBottom: 10}} text={item?.category} />
      <ScrollView contentContainerStyle={{paddingBottom: 10}} horizontal>
        {item?.items.map((item, index) => (
          <ItemBox
            id={`d${index}`}
            item={item}
            onEdit={() => props?.onEdit(item)}
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
  // const parsedPrice = JSON.parse(item?.price);
  const priceArray = Object.entries(item?.price).map(([size, price]) => ({
    size,
    price,
  }));
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
          // height: height / 7,
          width: width / 3,
        }}>
        <SemiBoldText styles={{textAlign: 'center'}} text={item?.name} />
        {priceArray?.length == 1 ? (
          <RegularText text={`₹ ${priceArray[0]?.price}`} />
        ) : (
          priceArray.map(item => (
            <RegularText text={`${item?.size} ₹ ${item?.price}`} />
          ))
        )}

        <ButtonView
          click
          styles={{height: 27, width: '60%', marginTop: 5}}
          text={'Edit'}
          onPress={props?.onEdit}
        />
      </View>
    </View>
  );
};
