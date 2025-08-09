import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import * as ScreenCapture from 'expo-screen-capture';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, StyleSheet, Switch, Text, TouchableOpacity, View, Linking } from 'react-native';
import { Colors } from '../../constants/Colors';

const CUBE_TEXT_COLOR_OPTIONS = [
  Colors.dark.cubeTextBlack,
  Colors.dark.cubeTextMuted,
  Colors.dark.cubeTextWhite,
  Colors.dark.cubeTextAlt,
  Colors.dark.cubeText,
  Colors.dark.cubeTextRed,
  Colors.dark.cubeTextPink,
  Colors.dark.cubeTextPurple,
  Colors.dark.cubeTextBlue,
  Colors.dark.cubeTextCyan,
  Colors.dark.cubeTextGreen,
  Colors.dark.cubeTextDarkGreen,
];

const MIN_MAX_CUBES = 9;
const MAX_MAX_CUBES = 12;
const DEFAULT_DICE_MAX = 6;
const DEFAULT_MAX_CUBES = 9;
const DEFAULT_CUBE_TEXT_COLOR = Colors.dark.cubeText;

const SettingsScreen: React.FC = () => {
  const [allowCapture, setAllowCapture] = useState(false);
  const [allowCaptureLoaded, setAllowCaptureLoaded] = useState(false);
  const [defaultDiceMax, setDefaultDiceMax] = useState(DEFAULT_DICE_MAX);
  const [maxCubes, setMaxCubes] = useState(DEFAULT_MAX_CUBES);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [cubeTextColor, setCubeTextColor] = useState(DEFAULT_CUBE_TEXT_COLOR);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [cubeBgImage, setCubeBgImage] = useState<string | null>(null);
  const screenWidth = useMemo(() => Dimensions.get('window').width, []);

  // Load all settings from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
        const [diceMax, cubes, allow, textColor, bgImage] = await Promise.all([
          AsyncStorage.getItem('defaultDiceMax'),
          AsyncStorage.getItem('maxCubes'),
          AsyncStorage.getItem('allowCapture'),
          AsyncStorage.getItem('cubeTextColor'),
          AsyncStorage.getItem('cubeBgImage'),
        ]);
        if (diceMax !== null) setDefaultDiceMax(Number(diceMax));
        if (cubes !== null) setMaxCubes(Number(cubes));
        if (allow === null) {
          setAllowCapture(false);
        } else {
          setAllowCapture(allow === 'true');
        }
        if (textColor) setCubeTextColor(textColor);
        if (bgImage) setCubeBgImage(bgImage);
      } finally {
        setAllowCaptureLoaded(true);
      }
    })();
  }, []);

  // Save cubeBgImage to AsyncStorage
  useEffect(() => {
    if (cubeBgImage !== null) {
      AsyncStorage.setItem('cubeBgImage', cubeBgImage);
    }
  }, [cubeBgImage]);

  // Save allowCapture and update screen capture permission
  useEffect(() => {
    if (!allowCaptureLoaded) return;
    (async () => {
      try {
        if (allowCapture) {
          await ScreenCapture.allowScreenCaptureAsync();
        } else {
          await ScreenCapture.preventScreenCaptureAsync();
        }
        await AsyncStorage.setItem('allowCapture', String(allowCapture));
      } catch {
        // ignore
      }
    })();
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

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCubeBgImage(result.assets[0].uri);
    }
  }, []);

  const handleRemoveImage = useCallback(async () => {
    setCubeBgImage(null);
    await AsyncStorage.removeItem('cubeBgImage');
  }, []);

  const handleDefaultSettings = useCallback(async () => {
    setDefaultDiceMax(DEFAULT_DICE_MAX);
    setMaxCubes(DEFAULT_MAX_CUBES);
    setAllowCapture(false);
    setCubeTextColor(DEFAULT_CUBE_TEXT_COLOR);
    setCubeBgImage(null);
    await AsyncStorage.multiSet([
      ['defaultDiceMax', String(DEFAULT_DICE_MAX)],
      ['maxCubes', String(DEFAULT_MAX_CUBES)],
      ['allowCapture', 'false'],
      ['cubeTextColor', DEFAULT_CUBE_TEXT_COLOR],
    ]);
    await AsyncStorage.removeItem('cubeBgImage');
  }, []);

  const handleToggleCapture = useCallback(() => {
    setAllowCapture((prev) => !prev);
  }, []);

  const cubeOptions = useMemo(
    () => Array.from({ length: MAX_MAX_CUBES - MIN_MAX_CUBES + 1 }, (_, i) => MIN_MAX_CUBES + i),
    []
  );

  if (!allowCaptureLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Cube Background Image Picker */}
      <View style={styles.inlineRow}>
        <Text style={styles.colorLabel}>Cube Background</Text>
        <TouchableOpacity
          style={styles.pickColorButton}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          <Text style={styles.pickColorButtonText}>Pick</Text>
        </TouchableOpacity>
        {cubeBgImage && (
          <>
            <Image
              source={{ uri: cubeBgImage }}
              style={styles.bgImagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
              activeOpacity={0.7}
            >
              <Text style={styles.removeImageButtonText}>X</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Cube Text Color Picker */}
      <View style={styles.inlineRow}>
        <Text style={styles.colorLabel}>Cube Text Color</Text>
        <TouchableOpacity
          style={styles.pickColorButton}
          onPress={() => setColorPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.pickColorButtonText}>Pick</Text>
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
              {CUBE_TEXT_COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderWidth: color === cubeTextColor ? 3 : 1,
                      borderColor: color === cubeTextColor ? Colors.dark.cubeTextWhite : Colors.dark.border,
                    },
                  ]}
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
              data={cubeOptions}
              keyExtractor={(item) => item.toString()}
              contentContainerStyle={{ width: screenWidth * 0.9, alignItems: 'stretch' }}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: '#ccc', width: '96%', alignSelf: 'center' }} />
              )}
              renderItem={({ item }) => (
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
      <View style={styles.switchInlineRow}>
        <Text style={styles.label}>Allow Recording</Text>
        <Switch
          value={allowCapture}
          onValueChange={handleToggleCapture}
          trackColor={{ false: '#767577', true: Colors.dark.buttonText }}
          thumbColor={allowCapture ? Colors.dark.buttonText : '#f4f3f4'}
          style={{ marginLeft: 5, marginTop: -10 }}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Default Settings Button */}
      <TouchableOpacity
        style={styles.defaultButton}
        onPress={handleDefaultSettings}
      >
        <Text style={styles.defaultButtonText}>Default Settings</Text>
      </TouchableOpacity>

      {/* License and repo link at the bottom */}
      <View style={styles.licenseContainer}>
        <Text
          style={[styles.licenseText, styles.link]}
          accessibilityRole="link"
          onPress={() => {
            Linking.openURL('https://github.com/barakadax/DiceRoller');
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
  bgImagePreview: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.imageBg,
  },
  removeImageButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.dark.button,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  removeImageButtonText: {
    color: Colors.dark.button,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 22,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 36,
  },
  switchInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 36,
    marginBottom: -10,
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
    color: Colors.dark.buttonText,
    alignSelf: 'center',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginBottom: -5,
    marginTop: -5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 18,
    color: Colors.dark.buttonText,
    marginLeft: 12,
    width: 32,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 10,
  },
  pickerRow: {
    width: '100%',
    height: 50,
    marginBottom: 6,
    backgroundColor: Colors.dark.pickerBg,
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
    backgroundColor: Colors.dark.pickerBg,
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
    alignSelf: 'stretch',
    paddingVertical: 16,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemText: {
    color: Colors.dark.button,
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'none',
  },
  pickerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  licenseContainer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  licenseText: {
    color: Colors.dark.buttonText,
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    color: Colors.dark.link,
    textDecorationLine: 'underline',
  },
});

export default SettingsScreen;
