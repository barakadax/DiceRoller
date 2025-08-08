import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as ScreenCapture from 'expo-screen-capture';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const SettingsScreen = () => {
  const [allowCapture, setAllowCapture] = useState(false);
  const [allowCaptureLoaded, setAllowCaptureLoaded] = useState(false);
  // Default dice max value state
  const [defaultDiceMax, setDefaultDiceMax] = useState(6);

  // Load from AsyncStorage on mount (for both settings)
  useEffect(() => {
    // Always block screenshots immediately on mount (first frame)
    ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    AsyncStorage.getItem('defaultDiceMax').then(val => {
      if (val !== null) setDefaultDiceMax(Number(val));
    });
    AsyncStorage.getItem('allowCapture').then(val => {
      if (val === null) {
        setAllowCapture(false); // default: prevent screenshots
        setAllowCaptureLoaded(true);
      } else {
        setAllowCapture(val === 'true');
        setAllowCaptureLoaded(true);
      }
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

  // Remove redundant effect: now handled by above effect


  // Save to AsyncStorage when changed
  useEffect(() => {
    AsyncStorage.setItem('defaultDiceMax', String(defaultDiceMax));
  }, [defaultDiceMax]);

  const toggleSwitch = async () => {
    setAllowCapture((prev) => !prev);
  };

  if (!allowCaptureLoaded) return null;
  return (
    <View style={styles.container}>
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

      {/* Screenshot option */}
      <Text style={styles.label}>Allow Screenshots & Video Recording</Text>
      <Switch
        value={allowCapture}
        onValueChange={toggleSwitch}
        trackColor={{ false: '#767577', true: Colors.dark.buttonText }}
        thumbColor={allowCapture ? Colors.dark.buttonText : '#f4f3f4'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    color: Colors.dark.buttonText,
    alignSelf: 'flex-start',
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
    marginVertical: 24,
  },
});

export default SettingsScreen;
