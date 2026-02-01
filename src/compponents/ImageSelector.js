import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const ImagePickerInput = ({
  label = "Select Image",
  value,
  onChange,
  style
}) => {

  const openPicker = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage);
          return;
        }

        const asset = response?.assets?.[0];
        if (asset) {
          onChange(asset);  // return full object
        }
      }
    );
  };

  return (
    <View style={[{ marginBottom: 15 }, style]}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
        {label}
      </Text>

      <TouchableOpacity
        onPress={openPicker}
        style={{
          height: 140,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9f9f9'
        }}
      >
        {value?.uri ? (
          <Image
            source={{ uri: value?.uri }}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ color: '#666' }}>Tap to select image</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ImagePickerInput;
