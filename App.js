import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GridComponent = ({ selectedValue, screenWidth }) => {
  const generateGridItems = (count) => {
    const items = [];
    for (let i = 1; i <= count; i++) {
      items.push({ label: `${i}`});
    }
    return items;
  };

  return (
    <View style={[styles.gridContainer, { width: screenWidth }]}>
      {generateGridItems(selectedValue).map((item, index) => (
        <View key={index} style={styles.gridItem}>
          <Text style={styles.gridItemText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default function App() {
  const initialItems = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' }
  ];

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialItems[0].value);
  const [items, setItems] = useState(initialItems);
  const screenWidth = Dimensions.get('window').width;
  const pickerMaxWidth = (screenWidth * 0.8) > 300 ? 300 : (screenWidth * 0.8);

  useEffect(() => {
    const fetchAmountOfDices = async () => {
      let amount = {};
      try {
        const jsonValue = await AsyncStorage.getItem('amountOfDices');
        amount = jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch(e) {
        console.error("Error getting amount of dices:", e);
      }
      //console.info("get was called with amount: ", amount);
      if (amount !== null) {
        setValue(amount);
      }
    };
    fetchAmountOfDices();
  }, []);

  const handleValueChange = async (selectedItem) => {
    setValue(selectedItem);
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('amountOfDices', jsonValue);
      //console.info("set was called with value of: ", jsonValue);
    } catch(e) {
      console.error("Error saving amount of dices:", e);
    }
  };
  
  return (
    <View style={styles.main}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={handleValueChange}
        setItems={setItems}
        containerStyle={{ width: pickerMaxWidth }}
        dropDownStyle={{ width: pickerMaxWidth }}
        itemSeparator={{ value: true }}
        itemSeparatorStyle={{
          backgroundColor: '#d9e4e9'
        }}
        style={{
          backgroundColor: '#42526e',
          borderColor: '#d9e4e9'
        }}
        dropDownContainerStyle={{
          backgroundColor: '#233040',
          borderColor: '#d9e4e9'
        }}
        dropDownTextStyle={{ textAlign: 'center' }}
        textStyle={{ fontSize: 20, color: '#d9e4e9', textAlign: 'center' }}
        showTickIcon={false}
        showArrowIcon={false}
      />
      <GridComponent selectedValue={parseInt(value)} screenWidth={pickerMaxWidth} /> 
      <View style={ styles.buttonContainer }>
        <TouchableOpacity style={[styles.button, { width: pickerMaxWidth }]}>
          <Text style={styles.buttonText}>{'\u{1F340}'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#6b7b8c',
    alignItems: 'center',
    paddingTop: 35
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: '#42526e',
    marginTop: 50,
    borderRadius: 5,
    borderColor: '#d9e4e9',
    borderWidth: 1,
    padding: 20,
    gap: 5
  },
  gridItem: {
    width: 80,
    height: 80,
    padding: 20,
    backgroundColor: '#d9e4e9',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
  },
  gridItemText: {
    textAlign: 'center',
    color: '#233040',
    fontSize: 30,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#42526e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    textAlign: 'center',
    borderColor: '#d9e4e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#d9e4e9',
    fontSize: 18,
  },
});