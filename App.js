import { useState, useEffect } from "react";
import { Text, View, Dimensions, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { genRandNum } from './numGen';
import { styles } from './style';

const indexRange = (count) => {
  return [...Array(count).keys()]
};

const GridComponent = ({ selectedValue, screenWidth, randomNumbers }) => {
  const dices = indexRange(selectedValue).map((index) => {
    return (
      <View key={index} style={styles.gridItem}>
        <Text style={styles.gridItemText}>{randomNumbers[index] !== undefined ? randomNumbers[index] : '?'}</Text>
      </View>
    );
  });

  return (
    <View style={[styles.gridContainer, { width: screenWidth }]}>
      {dices}
    </View>
  );
};

const randomValues = (value) => {
  const randomNumbers = [];
  for (let i = 0; i < parseInt(value); i++) {
    randomNumbers.push(genRandNum(1, 6));
  }
  return randomNumbers;
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
  const [items, _] = useState(initialItems);
  const [dicesValues, setDicesValues] = useState(randomValues(initialItems.length))
  const screenWidth = Dimensions.get('window').width;
  const pickerMaxWidth = (screenWidth * 0.8) > 300 ? 300 : (screenWidth * 0.8);

  useEffect(() => {
    const fetchAmountOfDices = async () => {
      let amount = {};
      try {
        const jsonValue = await AsyncStorage.getItem('amountOfDices');
        amount = jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch (e) {
        console.error("Error getting amount of dices:", e);
      }
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
    } catch (e) {
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
      <GridComponent
        selectedValue={parseInt(value)}
        screenWidth={pickerMaxWidth}
        randomNumbers={dicesValues}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { width: pickerMaxWidth }]}
          onPress={() => setDicesValues(
            randomValues(value)
          )}
        >
          <Text style={styles.buttonText}>{'\u{1F340}'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
