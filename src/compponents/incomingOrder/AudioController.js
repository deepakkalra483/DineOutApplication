import Sound from 'react-native-sound';

let currentSound = null;
let currentUrl = null;

export const playPauseAudio = (url, setPlayingUrl) => {
  // Pause if same audio
  if (currentSound && currentUrl === url) {
    currentSound.pause();
    setPlayingUrl(null);
    return;
  }

  // Stop previous
  if (currentSound) {
    currentSound.stop();
    currentSound.release();
  }

  currentUrl = url;
  currentSound = new Sound(url, null, error => {
    if (error) {
      console.log('Audio error', error);
      return;
    }
    setPlayingUrl(url);
    currentSound.play(() => {
      currentSound.release();
      currentSound = null;
      currentUrl = null;
      setPlayingUrl(null);
    });
  });
};

export const stopAudio = (setPlayingUrl) => {
  if (currentSound) {
    currentSound.stop();
    currentSound.release();
    currentSound = null;
    currentUrl = null;
    setPlayingUrl(null);
  }
};
