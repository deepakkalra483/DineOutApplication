import React, { useState } from 'react';
import { View, Modal, TextInput, Text, TouchableOpacity, StyleSheet, NativeModules, Alert } from 'react-native';
import { AppColors } from '../utils/AppColors';
import { useDispatch } from 'react-redux';
import { addOrderToDatabase, AddOrUpdateUser } from '../networking/FireStoreService';
import { getUser } from '../utils/AsynStorageHelper';
import { SET_REFRESH } from '../../redux/ReduxConstants';

const CheckInButton = ({ onSubmit, data, isCheckIn }) => {
  console.log('romdata---', data)
  const dispatch = useDispatch();
  const { OrdersModule } = NativeModules;
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState({
    name: "",
    number: "",
    price: "",
    timing: "",
  });

  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const CheckIn = async () => {
    const rentData = [{ quantity: 1, name: `${inputs?.timing} rent`, price: inputs?.price, message: 'rent' }]
    const customerData = { name: inputs?.name, mobile: inputs?.number }
    const items = JSON.stringify([{ quantity: 1, name: `${inputs?.timing} rent`, price: inputs?.price,message: 'rent'  }]);
    OrdersModule.insertRoomRent(data?.table, items, "rent", inputs?.name, inputs?.number).
      then((text) => {
        const user = {
          room: data?.table,
          number: inputs?.number,
          name: inputs?.name
        };
        AddOrUpdateUser(
          user,
          () => {
            handleSave()
            dispatch({ type: SET_REFRESH });
            getUser(userDetail => {
              addOrderToDatabase(userDetail?.id, data?.table, inputs?.number, { items: rentData }, customerData)
            })
            // onSave(inputs)
            console.log('text---', text)
            console.log("User updated!")
          },
          (err) => console.log("Failed:", err)
        );

      }).
      catch((error) => {
        console.log('erorr--', error)
      })
  }

  const CheckOut = async () => {
    OrdersModule.checkOut(data?.table, inputs?.number).
      then((text) => {
        const user = {
          room: data?.table,
          number: '',
          name: ''
        };
        AddOrUpdateUser(
          user,
          () => {
            handleSave()
            dispatch({ type: SET_REFRESH });
          },
          (err) => console.log("Failed:", err)
        );
      }).
      catch((error) => {
        console.log('erorr--', error)
      })
  }

  const handleSave = () => {
    onSubmit(inputs);
    setOpen(false);

    // reset
    setInputs({
      name: "",
      number: "",
      price: "",
      timing: "",
    });
  };

  return (
    <>
      {/* Button */}
      {!isCheckIn ? <TouchableOpacity
        activeOpacity={0.9}
        style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.buttonText}>Check-in</Text>
      </TouchableOpacity> :
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.button} onPress={() => {
            Alert.alert(`Are You sure you want to checkout?`, `Make sure customer is checked out.`, [
              { text: 'cancel', onPress: () => null },
              { text: 'Yes', onPress: () => CheckOut() }
            ])
          }}>
          <Text style={styles.buttonText}>Check-Out</Text>
        </TouchableOpacity>
      }

      {/* Popup */}
      <Modal visible={open} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.title}>New Check-in</Text>

            <TextInput
              placeholder="Name"
              style={styles.input}
              value={inputs.name}
              onChangeText={(v) => handleChange("name", v)}
            />

            <TextInput
              placeholder="Number"
              style={styles.input}
              keyboardType="numeric"
              value={inputs.number}
              onChangeText={(v) => handleChange("number", v)}
            />

            <TextInput
              placeholder="Price"
              style={styles.input}
              keyboardType="numeric"
              value={inputs.price}
              onChangeText={(v) => handleChange("price", v)}
            />

            <TextInput
              placeholder="Timing"
              style={styles.input}
              value={inputs.timing}
              onChangeText={(v) => handleChange("timing", v)}
            />

            <View style={styles.row}>
              <TouchableOpacity style={styles.cancel} onPress={() => setOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.save} onPress={CheckIn}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CheckInButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: AppColors.LIGHT_GREEN_TEXT,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    // alignSelf: "center",
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  popup: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancel: {
    padding: 10,
  },
  cancelText: {
    color: "#999",
    fontSize: 16
  },
  save: {
    backgroundColor: AppColors.LIGHT_GREEN_TEXT,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }
});
