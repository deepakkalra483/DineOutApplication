import {StyleSheet, Text} from 'react-native';
import {AppColors} from './AppColors';
import {AppFonts} from './AppFonts';

export const RegularText = props => {
  return (
    <Text
      style={{
        fontSize: 14,
        color: AppColors.DARK_GREEN_TEXT,
        fontFamily: AppFonts.REGULAR,
        ...props?.styles
      }}>
      {props?.text}
    </Text>
  );
};

export const BoldText = props => {
  return (
    <Text
      style={{
        fontSize: 14,
        color: AppColors.DARK_GREEN_TEXT,
        fontFamily: AppFonts.EXTRABOLD,
        flexWrap:'wrap',
        ...props?.styles
      }}onPress={props?.onPress}>
      {props?.text}
    </Text>
  );
};

export const SemiBoldText = props => {
    return (
      <Text
        style={{
          fontSize: 14,
          color: AppColors.DARK_GREEN_TEXT,
          fontFamily: AppFonts.SEMIBOLD,
          flexWrap:'wrap',
          ...props?.styles
        }}onPress={props?.onPress}>
        {props?.text}
      </Text>
    );
  };

export const styles=StyleSheet.create({
   container:{
    flex:1,
    backgroundColor:AppColors.LIGHT_BACKGROUND
   }
})  

