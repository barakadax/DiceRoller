import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as ScreenCapture from 'expo-screen-capture';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const cubeTextColorOptions = [
  '#000000',
  '#808080',
  '#ffffff',
  '#f1c40f',
  Colors.dark.cubeText,
  '#f1181b',
  '#c300e7',
  '#800080',
  '#365ca9',
  '#00A6E1',
  '#27ae60',
  '#06402B',
];

const SettingsScreen = () => {
  const [allowCapture, setAllowCapture] = useState(false);
  const [allowCaptureLoaded, setAllowCaptureLoaded] = useState(false);
  const [defaultDiceMax, setDefaultDiceMax] = useState(6);
  const [maxCubes, setMaxCubes] = useState(9);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [cubeTextColor, setCubeTextColor] = useState(Colors.dark.cubeText);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  // Load from AsyncStorage on mount (for all settings)
  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    AsyncStorage.getItem('defaultDiceMax').then(val => {
      if (val !== null) setDefaultDiceMax(Number(val));
    });
    AsyncStorage.getItem('maxCubes').then(val => {
      if (val !== null) setMaxCubes(Number(val));
    });
    AsyncStorage.getItem('allowCapture').then(val => {
      if (val === null) {
        setAllowCapture(false);
        setAllowCaptureLoaded(true);
      } else {
        setAllowCapture(val === 'true');
        setAllowCaptureLoaded(true);
      }
    });
    AsyncStorage.getItem('cubeTextColor').then(val => {
      if (val) setCubeTextColor(val);
    });
  }, []);

  useEffect(() => {
    if (!allowCaptureLoaded) return;
    if (allowCapture) {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    } else {
      ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    }
    AsyncStorage.setItem('allowCapture', String(allowCapture));
  }, [allowCapture, allowCaptureLoaded]);

  // Save to AsyncStorage when changed
  useEffect(() => {
    AsyncStorage.setItem('defaultDiceMax', String(defaultDiceMax));
  }, [defaultDiceMax]);
  useEffect(() => {
    AsyncStorage.setItem('maxCubes', String(maxCubes));
  }, [maxCubes]);
  useEffect(() => {
    AsyncStorage.setItem('cubeTextColor', cubeTextColor);
  }, [cubeTextColor]);

  const toggleSwitch = async () => {
    setAllowCapture((prev) => !prev);
  };

  const minOfMaxCubes = 9;
  const maxOfMaxCubes = 12;
  const screenWidth = Dimensions.get('window').width;
  if (!allowCaptureLoaded) return null;
  return (
    <View style={styles.container}>

      {/* Cube Text Color Picker */}
      <View style={styles.inlineRow}>
        <Text style={styles.colorLabel}>Cube Text Color</Text>
        <TouchableOpacity
          style={styles.pickColorButton}
          onPress={() => setColorPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.pickColorButtonText}>Pick Color</Text>
        </TouchableOpacity>
        <View style={[styles.colorPreview, { backgroundColor: cubeTextColor }]} />
      </View>
      <Modal
        visible={colorPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setColorPickerVisible(false)}
      >
        <TouchableOpacity style={styles.pickerModalOverlay} activeOpacity={1} onPress={() => setColorPickerVisible(false)}>
          <View style={[styles.pickerModalContent, { width: screenWidth * 0.7 }]}>
            <Text style={{ color: Colors.dark.buttonText, fontSize: 16, marginBottom: 10 }}>Select Cube Text Color</Text>
            <View style={styles.colorOptionsRow}>
              {cubeTextColorOptions.map((color, _) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color, borderWidth: color === cubeTextColor ? 3 : 1, borderColor: color === cubeTextColor ? '#fff' : Colors.dark.border }]}
                  onPress={() => {
                    setCubeTextColor(color);
                    setColorPickerVisible(false);
                  }}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Default dice max value setting */}
      <Text style={styles.label}>Default Dice Max Value</Text>
      <View style={styles.sliderRow}>
        <Slider
          style={styles.slider}
          minimumValue={2}
          maximumValue={20}
          step={1}
          value={defaultDiceMax}
          onValueChange={setDefaultDiceMax}
          minimumTrackTintColor={Colors.dark.sliderMinTrack}
          maximumTrackTintColor={Colors.dark.sliderMaxTrack}
          thumbTintColor={Colors.dark.sliderThumb}
        />
        <Text style={styles.valueText}>{defaultDiceMax}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Max cubes setting */}
      <Text style={styles.label}>Maximum Number of Dice</Text>
      <TouchableOpacity style={styles.pickerRow} onPress={() => setPickerVisible(true)} activeOpacity={0.7}>
        <Text style={styles.pickerSelectedText}>{maxCubes}</Text>
      </TouchableOpacity>
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity style={styles.pickerModalOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <View style={[styles.pickerModalContent, { width: screenWidth * 0.9 }]}>
            <FlatList
              data={Array.from({ length: maxOfMaxCubes - minOfMaxCubes + 1 }, (_, i) => minOfMaxCubes + i)}
              keyExtractor={item => item.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    setMaxCubes(item);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Screenshot option */}
      <Text style={styles.label}>Allow Screenshots & Video Recording</Text>
      <Switch
        value={allowCapture}
        onValueChange={toggleSwitch}
        trackColor={{ false: '#767577', true: Colors.dark.buttonText }}
        thumbColor={allowCapture ? Colors.dark.buttonText : '#f4f3f4'}
      />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Default Settings Button */}
      <TouchableOpacity
        style={styles.defaultButton}
        onPress={async () => {
          setDefaultDiceMax(6);
          setMaxCubes(9);
          setAllowCapture(false);
          setCubeTextColor(Colors.dark.cubeText);
          await AsyncStorage.setItem('defaultDiceMax', '6');
          await AsyncStorage.setItem('maxCubes', '9');
          await AsyncStorage.setItem('allowCapture', 'false');
          await AsyncStorage.setItem('cubeTextColor', Colors.dark.cubeText);
        }}
      >
        <Text style={styles.defaultButtonText}>Default Settings</Text>
      </TouchableOpacity>

      {/* License and repo link at the bottom */}
      <View style={styles.licenseContainer}>
        <Text
          style={[styles.licenseText, styles.link]}
          accessibilityRole="link"
          onPress={() => {
            import('react-native').then(({ Linking }) => {
              Linking.openURL('https://github.com/barakadax/DiceRoller');
            });
          }}
        >
          GitHub repo
        </Text>
        <Text style={styles.licenseText}>AGPL-3.0 license</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    minHeight: 36,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    color: Colors.dark.buttonText,
    alignSelf: 'flex-start',
  },
  pickColorButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.button,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignSelf: 'center',
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignSelf: 'center',
  },
  pickColorButtonText: {
    color: Colors.dark.buttonText,
    fontWeight: 'bold',
    fontSize: 15,
  },
  colorOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  defaultButton: {
    margin: 8,
    marginBottom: 24,
    backgroundColor: Colors.dark.button,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    alignSelf: 'center',
  },
  defaultButtonText: {
    color: Colors.dark.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 24,
  },
  colorLabel: {
    fontSize: 18,
    marginBottom: 0,
    color: Colors.dark.buttonText,
    alignSelf: 'center',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  valueText: {
    fontSize: 18,
    color: Colors.dark.buttonText,
    marginLeft: 12,
    width: 32,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 14,
  },
  pickerRow: {
    width: '100%',
    height: 50,
    marginBottom: 16,
    backgroundColor: '#2d2d2d', // grayish background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerSelectedText: {
    color: '#ff8c00',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalContent: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    paddingVertical: 0,
    width: 130,
    alignItems: 'center',
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pickerItem: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d2d',
  },
  pickerItemText: {
    color: '#ff8c00',
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'none',
  },
  pickerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.dark.border,
    marginTop: 0,
  },
  licenseContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  licenseText: {
    color: Colors.dark.buttonText,
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    color: '#2980b9',
    textDecorationLine: 'underline',
  },
});

export default SettingsScreen;
