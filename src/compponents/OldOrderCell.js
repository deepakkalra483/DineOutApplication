import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SemiBoldText } from '../utils/AppConstants';

const OldOrderCell = props => {
  const list = props?.list;
  const [playingUrl, setPlayingUrl] = useState(null);

  useEffect(() => {
    return () => stopAudio(setPlayingUrl);
  }, []);

  return (
    <View>
      {list.map((item, index) => (
        <View
          key={`item-${item.audioUrl || index}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 3,
          }}
        >
          <SemiBoldText
            styles={{ textAlign: 'center' }}
            text={item?.id === 'audio' ? '' : item?.quantity + ' × '}
          />

          {item?.id === 'audio' ? (
            item?.type === 'audio' ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  flex: 1,
                  justifyContent: 'center',
                  paddingBottom: 3,
                  backgroundColor: '#ffefea',
                  borderRadius: 6,
                }}
                onPress={() => toggleAudio(item.audioUrl, setPlayingUrl)}
              >
                <Text style={{ marginRight: 6 }}>Voice Message/Instruction</Text>
                <Image
                  style={{ height: 20, width: 20, resizeMode: 'contain' }}
                  source={
                    playingUrl === item.audioUrl
                      ? require('../../assets/images/icons/pause.png')
                      : require('../../assets/images/icons/play_icon.png')
                  }
                />
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  flex: 1,
                  paddingBottom: 3,
                  backgroundColor: '#ffefea',
                  borderRadius: 6,
                }}
              >
                <Text style={{ textAlign: 'center' }}>Message / Instruction:</Text>
                <SemiBoldText
                  text={item?.audioUrl}
                  styles={{ textAlign: 'center' }}
                />
              </View>
            )
          ) : (
            <SemiBoldText styles={{ flex: 1 }} text={item?.name} />
          )}

          {item?.id !== 'audio' && <SemiBoldText text={`₹ ${item?.price}`} />}
        </View>
      ))}
    </View>
  );
};

export default OldOrderCell