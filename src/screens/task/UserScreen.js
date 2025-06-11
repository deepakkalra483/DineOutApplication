import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppColors} from '../../utils/AppColors';
import {AppImages} from '../../utils/AppImages';
import {AppScreens} from '../../utils/AppScreens';

const users = [
  {
    id: 1,
    name: 'Jesse',
    last_message: 'I’ve been working on finding a different fabric stor...',
    time: 'Friday',
    active_status: 1,
    src: AppImages.USER_PROFILE,
  },
  {
    id: 2,
    name: 'Taylor',
    last_message: 'I’ve been working on finding a different fabric stor...',
    time: 'Friday',
    active_status: 0,
    src: AppImages.USER_PROFILE,
  },
  {
    id: 3,
    name: 'Jay',
    last_message: 'I’ve been working on finding a different fabric stor...',
    time: 'Friday',
    active_status: 0,
    src: AppImages.USER_PROFILE,
  },
];
const UserScreen = ({navigation}) => {
  const renderUser = ({item}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate(AppScreens.CHAT_SCREEN, {item: item})
        }>
        <UserCell item={item} />
        <View
          style={{
            height: 1,
            width: '83%',
            backgroundColor: '#9F9D9E',
            alignSelf: 'flex-end',
            marginVertical: 10,
          }}></View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <UserHeader
        leftSrc={AppImages.BACK_ICON}
        rightSrc={AppImages.EDIT_ICON}
      />
      {/* searchView----- */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 15,
          borderColor: AppColors.BORDER_COLOR,
          borderWidth: 1,
          paddingHorizontal: 15,
          margin: 15,
          //   paddingVertical: 10,
        }}>
        <Image
          style={{height: 18, width: 18, resizeMode: 'contain'}}
          source={AppImages.SEARCH_ICON}
        />
        <TextInput
          placeholderTextColor={AppColors.PLACEHOLDER_COLOR}
          placeholder="Search messages or Circles"
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 400,
            color: AppColors.BLACK,
            paddingLeft: 15,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 15,
          marginTop: 15,
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontSize: 24,
            color: AppColors.BLACK,
            fontWeight: 900,
          }}>
          Chats
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: AppColors.BLACK,
            fontWeight: 400,
          }}>
          Edit
        </Text>
      </View>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item?.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.WHITE,
  },
});
export default UserScreen;

export const UserHeader = props => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 55,
        paddingHorizontal: 15,
      }}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={{paddingVertical: 10, flexDirection: 'row',alignItems:'center'}}>
        <Image
          style={{height: 20, width: 20, resizeMode: 'contain'}}
          source={props?.leftSrc}
        />
        {props?.showCount&&<View
          style={{
            height: 15,
            width: 15,
            backgroundColor: AppColors.BLACK,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
            marginLeft:5
          }}>
          <Text
            style={{
              fontSize: 12,
              color: AppColors.WHITE,
              textAlign: 'center',

              textAlignVertical: 'center',
            }}>
            1
          </Text>
        </View>}
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.8} style={{paddingVertical: 10}}>
        <Image
          style={{height: 20, width: 20, resizeMode: 'contain'}}
          source={props?.rightSrc}
        />
      </TouchableOpacity>
    </View>
  );
};

const UserCell = props => {
  const item = props?.item;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
      }}>
      <Image
        style={{height: 48, width: 48, resizeMode: 'cover', borderRadius: 30}}
        source={item?.src}
      />

      <View
        style={{
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          flex: 1,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
          <Text style={{fontSize: 14, color: AppColors.BLACK, fontWeight: 700}}>
            {item?.name}
          </Text>
          <Text
            style={{fontSize: 10, color: AppColors.FADE_TEXT, fontWeight: 400}}>
            {item?.time}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 10,
            color: AppColors.BLACK,
            fontWeight: 400,
            flexWrap: 'wrap',
          }}>
          {item?.last_message}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          alignSelf: 'flex-end',
        }}>
        {item?.active_status != 1 ? (
          <Image
            style={{
              height: 12,
              width: 10,
              resizeMode: 'contain',
              transform: [{rotate: '180deg'}],
            }}
            source={AppImages?.BACK_ICON}
          />
        ) : (
          <View
            style={{
              height: 10,
              width: 10,
              backgroundColor: 'green',
              borderRadius: 20,
            }}></View>
        )}
      </TouchableOpacity>
    </View>
  );
};
