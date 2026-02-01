import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { playPauseAudio } from './AudioController';

const InstructionItem = React.memo(({ item, playingUrl, setPlayingUrl }) => {
  if (item.type === 'text') {
    return (
      <View style={styles.box}>
        <Text style={styles.title}>Instruction</Text>
        <Text style={styles.text}>{item.audioUrl}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.audioBox}
      onPress={() => playPauseAudio(item.audioUrl, setPlayingUrl)}
    >
      <Text style={{ marginRight: 8 }}>🎙 Voice Instruction</Text>
      <Image
        style={styles.icon}
        source={
          playingUrl === item.audioUrl
            ? require('../../assets/images/icons/pause.png')
            : require('../../assets/images/icons/play_icon.png')
        }
      />
    </TouchableOpacity>
  );
});

export default InstructionItem;

const styles = {
  box: {
    backgroundColor: '#ffefea',
    padding: 10,
    borderRadius: 6,
    marginVertical: 4,
  },
  audioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffefea',
    padding: 10,
    borderRadius: 6,
    marginVertical: 4,
  },
  title: { textAlign: 'center', fontWeight: '600' },
  text: { textAlign: 'center' },
  icon: { height: 18, width: 18 }
};
