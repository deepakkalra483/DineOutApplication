import Sound from "react-native-sound";

Sound.setCategory("Playback");

let player = null;
let currentUrl = null;
let isLoading = false;

// Toggle play/pause for a given audio URL
export const toggleAudio = (url, setPlayingUrl) => {
  if (isLoading) return;

  // Pause same audio
  if (player && currentUrl === url) {
    player.pause();
    setPlayingUrl(null);
    return;
  }

  // Stop previous audio
  if (player) {
    player.stop(() => {
      player.release();
      player = null;
      currentUrl = null;
    });
  }

  // Play new audio
  isLoading = true;

  player = new Sound(url, null, (error) => {
    isLoading = false;

    if (error) {
      console.log("Audio load error:", error);
      return;
    }

    currentUrl = url;
    setPlayingUrl(url);

    player.play(() => {
      player.release();
      player = null;
      currentUrl = null;
      setPlayingUrl(null);
    });
  });
};

// Stop any playing audio
export const stopAudio = (setPlayingUrl) => {
  if (player) {
    player.stop(() => {
      player.release();
      player = null;
      currentUrl = null;
      setPlayingUrl?.(null);
    });
  }
};
