import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppColors} from '../../utils/AppColors';
import {UserHeader} from './UserScreen';
import {AppImages} from '../../utils/AppImages';
import {useState} from 'react';

const list = [
  {
    id: 1,
    message: 'hey there i m tetsing',
    sender: 1,
  },
  {
    id: 1,
    message: 'hey there i m tetsing',
    sender: 0,
  },
];
const ChatScreen = props => {
  const [chats, setChats] = useState(list);
  const [message, setMessage] = useState(null);
  const item = props?.route?.params?.item;

  const sendMessage = () => {
    if (message) {
      const newMessage = {
        message: message,
        sender: 1,
      };
      setChats([...chats, newMessage]);
      setMessage(null)
    }
  };

  const renderMessage = ({item}) => {
    return (
      <View
        style={{
          maxWidth: '70%',
          alignSelf:item?.sender==1?'flex-end': 'flex-start',
          backgroundColor:item?.sender==1?'#FFE49E':'gray',
          paddingHorizontal: 15,
          paddingTop: 8,
          justifyContent: 'flex-start',
          minHeight: 40,
          borderRadius: 30,
          borderBottomRightRadius: 0,
          marginTop: 10,
        }}>
        <Text style={{fontSize: 15, color: AppColors.BLACK, fontWeight: 700}}>
          {item?.message}
        </Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <UserHeader
        showCount
        leftSrc={AppImages.BACK_ICON}
        rightSrc={AppImages.DOTS_ICON}
      />
      <Text
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: AppColors.BLACK,
          alignSelf: 'center',
          marginTop: 10,
        }}>
        {item?.name}
      </Text>
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#9F9D9E',
          alignSelf: 'flex-end',
          marginVertical: 15,
        }}></View>

      <ScrollView
        contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
        keyboardShouldPersistTaps="handled">
        <FlatList
          contentContainerStyle={{
            paddingHorizontal: 15,
            flexGrow: 1,
          }}
          // keyExtractor={(item)=> item.id.toString()}
          data={chats}
          renderItem={renderMessage}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
          }}>
          <TextInput
            style={{
              paddingHorizontal: 15,
              borderRadius: 50,
              borderWidth: 1,
              flex: 1,
              borderColor: '#9F9D9E',
              color: AppColors.BLACK,
            }}
            value={message}
            placeholder="Message"
            placeholderTextColor={AppColors.PLACEHOLDER_COLOR}
            onChangeText={e => {
              setMessage(e);
            }}
          />
          <TouchableOpacity
            style={{
              height: 35,
              width: 35,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#EEEEEE',
              borderRadius: 30,
              marginLeft: 10,
            }}
            onPress={sendMessage}>
            <Image
              style={{
                height: 15,
                width: 15,
                resizeMode: 'contain',
                transform: [{rotate: '180deg'}],
              }}
              source={AppImages.BACK_ICON}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: 35,
              width: 35,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#EEEEEE',
              borderRadius: 30,
              marginLeft: 10,
            }}>
            <Image
              style={{
                height: 20,
                width: 20,
                resizeMode: 'contain',
              }}
              source={AppImages.ADD_DOC}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.WHITE,
  },
});
export default ChatScreen;

const ChatHeader = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 55,
      }}>
      <Image source={null} />
    </View>
  );
};
