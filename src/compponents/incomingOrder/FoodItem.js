import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppFonts } from '../../utils/AppFonts';

const FoodItem = React.memo(({ item }) => (
  <View style={styles.container}>
    <Text style={styles.price_text}>{item?.message=='rent'?`${item.name}`:`${item.quantity} × ${item.name}`}</Text>
    <Text style={styles.price_text}>{`₹ ${item.price}`}</Text>
  </View>
));

export const styles=StyleSheet.create({
  container:{
    flexDirection:'row',
    alignItems:'center',
     paddingVertical: 4 ,
     justifyContent:'space-between'
  },
  price_text:{
    fontSize:14,
    fontFamily:AppFonts.SEMIBOLD
  }
})

export default FoodItem;
