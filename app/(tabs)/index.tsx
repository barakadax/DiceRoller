import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, ImageBackground, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const DEFAULT_DICE_MAX = 6;
const DEFAULT_MAX_CUBES = 9;
const MIN_CUBE_VALUE = 2;
const MAX_CUBE_VALUE = 20;

const App: React.FC = () => {
  const [numCubes, setNumCubes] = useState(1);
  const [cubeValues, setCubeValues] = useState<number[]>([]);
  const [lockedCubes, setLockedCubes] = useState<boolean[]>([]);
  const [cubeMaxValues, setCubeMaxValues] = useState<number[]>([]);
  const [defaultDiceMax, setDefaultDiceMax] = useState(DEFAULT_DICE_MAX);
  const [cubeTextColor, setCubeTextColor] = useState(Colors.dark.cubeText);
  const animationValues = useRef<Animated.Value[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCubeIndex, setSelectedCubeIndex] = useState<number | null>(null);
  const [cubeBgImage, setCubeBgImage] = useState<string | null>(null);
  const [sliderMax, setSliderMax] = useState(DEFAULT_MAX_CUBES);

  // Generate a random number between 1 and max
  const generateRandomValue = useCallback((max: number) => Math.floor(Math.random() * max) + 1, []);

  // Initialize or re-randomize all cube values based on numCubes
  const initializeCubeValues = useCallback(() => {
    const newValues: number[] = [];
    const newLocks: boolean[] = [];
    const newMaxValues: number[] = [];
    for (let i = 0; i < numCubes; i++) {
      newMaxValues.push(defaultDiceMax);
      newValues.push(generateRandomValue(defaultDiceMax));
      newLocks.push(false);
    }
    setCubeValues(newValues);
    setLockedCubes(newLocks);
    setCubeMaxValues(newMaxValues);
    animationValues.current = Array(numCubes)
      .fill(0)
      .map((_, i) => animationValues.current[i] || new Animated.Value(1));
  }, [numCubes, defaultDiceMax, generateRandomValue]);

  // Poll AsyncStorage for settings every 1 second
  useEffect(() => {
    let isMounted = true;
    let lastDefaultDiceMax = defaultDiceMax;
    let lastMaxCubes = sliderMax;
    let lastCubeTextColor = cubeTextColor;
    let lastCubeBgImage = cubeBgImage;
    const poll = async () => {
      const [val, maxCubesVal, colorVal, bgVal] = await Promise.all([
        AsyncStorage.getItem('defaultDiceMax'),
        AsyncStorage.getItem('maxCubes'),
        AsyncStorage.getItem('cubeTextColor'),
        AsyncStorage.getItem('cubeBgImage'),
      ]);
      if (val !== null && isMounted) {
        const numVal = Number(val);
        if (numVal !== lastDefaultDiceMax) {
          setDefaultDiceMax(numVal);
          lastDefaultDiceMax = numVal;
        }
      }
      if (maxCubesVal !== null && isMounted) {
        const numMaxCubes = Number(maxCubesVal);
        if (numMaxCubes !== lastMaxCubes) {
          setSliderMax(numMaxCubes);
          lastMaxCubes = numMaxCubes;
        }
      }
      if (colorVal && isMounted && colorVal !== lastCubeTextColor) {
        setCubeTextColor(colorVal);
        lastCubeTextColor = colorVal;
      }
      if (isMounted && bgVal !== lastCubeBgImage) {
        setCubeBgImage(bgVal);
        lastCubeBgImage = bgVal;
      }
      if (isMounted) setTimeout(poll, 1000);
    };
    poll();
    return () => { isMounted = false; };
  }, [defaultDiceMax, cubeTextColor, cubeBgImage, sliderMax]);

  // Re-initialize cubes when numCubes or defaultDiceMax changes
  useEffect(() => {
    initializeCubeValues();
  }, [initializeCubeValues]);

  // Animate only unlocked cubes
  const animateCubes = useCallback(() => {
    const animations = animationValues.current
      .map((anim, idx) => {
        if (lockedCubes[idx]) return null;
        return Animated.sequence([
          Animated.timing(anim, {
            toValue: numCubes <= 5 ? 1.05 : 1.1,
            duration: 120,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ]);
      })
      .filter((a): a is Animated.CompositeAnimation => a !== null);
    if (animations.length > 0) {
      Animated.stagger(30, animations).start();
    }
  }, [lockedCubes, numCubes]);

  // Rerandomize only unlocked cubes and animate
  const rerandomizeCubes = useCallback(() => {
    setCubeValues((prevValues) =>
      prevValues.map((val, idx) =>
        lockedCubes[idx] ? val : generateRandomValue(cubeMaxValues[idx] || defaultDiceMax)
      )
    );
    animateCubes();
  }, [lockedCubes, cubeMaxValues, defaultDiceMax, generateRandomValue, animateCubes]);

  // Calculate grid and cube dimensions
  const { width } = Dimensions.get('window');
  const maxCubesInRow = useMemo(() => (numCubes <= 3 ? numCubes : numCubes <= 5 ? 2 : 3), [numCubes]);
  const containerPadding = 20;
  const cubeMargin = 5;
  let cubeSize = (width - containerPadding * 2 - cubeMargin * (maxCubesInRow - 1)) / maxCubesInRow - 25;
  cubeSize = Math.min(cubeSize, 150);

  // Toggle lock state for a cube
  const toggleLock = useCallback((index: number) => {
    setLockedCubes((prev) => {
      const updated = [...prev];
      if (!updated[index]) {
        const lockedCount = updated.filter(Boolean).length;
        if (lockedCount === updated.length - 1) {
          return prev;
        }
      }
      updated[index] = !updated[index];
      return updated;
    });
  }, []);

  // Render cubes with their values and animation
  const renderCubes = useCallback(() => {
    const dynamicFontSize = Math.max(32, Math.round(cubeSize * 0.35));
    return cubeValues.map((value, index) => {
      const isLocked = lockedCubes[index];
      const hasBgImage = !!cubeBgImage;
      const baseCubeStyle = [
        styles.cube,
        { width: cubeSize, height: cubeSize, margin: cubeMargin },
        isLocked && styles.lockedCube,
        (!isLocked && hasBgImage) && { backgroundColor: 'transparent', borderWidth: 0 },
      ];
      if (isLocked && hasBgImage) {
        return (
          <Animated.View
            key={index}
            style={{
              transform: [
                { scale: animationValues.current[index] || 1 },
              ],
            }}
          >
            <TouchableOpacity
              style={{
                width: cubeSize,
                height: cubeSize,
                margin: cubeMargin,
                borderRadius: 5,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 0,
              }}
              onPress={() => toggleLock(index)}
              onLongPress={() => {
                setSelectedCubeIndex(index);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <ImageBackground
                source={{ uri: cubeBgImage }}
                style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                imageStyle={{ borderRadius: 5 }}
                resizeMode="cover"
              >
                <View style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(60,60,60,0.9)',
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: Colors.dark.lockIcon,
                  zIndex: 1,
                }} />
                <Text style={[styles.cubeText, { fontSize: dynamicFontSize, color: cubeTextColor, zIndex: 2 }]}>{value}</Text>
                <Text style={[styles.lockIcon, { zIndex: 2 }]}>{'\u{1F512}'}</Text>
              </ImageBackground>
            </TouchableOpacity>
          </Animated.View>
        );
      }
      if (!isLocked && hasBgImage) {
        return (
          <Animated.View
            key={index}
            style={{
              transform: [
                { scale: animationValues.current[index] || 1 },
              ],
            }}
          >
            <TouchableOpacity
              style={{
                width: cubeSize,
                height: cubeSize,
                margin: cubeMargin,
                borderRadius: 5,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
                padding: 0,
              }}
              onPress={() => toggleLock(index)}
              onLongPress={() => {
                setSelectedCubeIndex(index);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <ImageBackground
                source={{ uri: cubeBgImage }}
                style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                imageStyle={{ borderRadius: 5 }}
                resizeMode="cover"
              >
                <Text style={[styles.cubeText, { fontSize: dynamicFontSize, color: cubeTextColor }]}>{value}</Text>
              </ImageBackground>
            </TouchableOpacity>
          </Animated.View>
        );
      }
      return (
        <Animated.View
          key={index}
          style={{
            transform: [
              { scale: animationValues.current[index] || 1 },
            ],
          }}
        >
          <TouchableOpacity
            style={baseCubeStyle}
            onPress={() => toggleLock(index)}
            onLongPress={() => {
              setSelectedCubeIndex(index);
              setModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.cubeText, { fontSize: dynamicFontSize, color: cubeTextColor }]}>{value}</Text>
            {isLocked && <Text style={styles.lockIcon}>{'\u{1F512}'}</Text>}
          </TouchableOpacity>
        </Animated.View>
      );
    });
  }, [cubeValues, lockedCubes, cubeBgImage, cubeTextColor, cubeSize, toggleLock]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={sliderMax}
          step={1}
          value={numCubes > sliderMax ? sliderMax : numCubes}
          onValueChange={setNumCubes}
          minimumTrackTintColor={Colors.dark.sliderMinTrack}
          maximumTrackTintColor={Colors.dark.sliderMaxTrack}
          thumbTintColor={Colors.dark.sliderThumb}
        />

        <View style={styles.gridContainer}>
          {renderCubes()}
        </View>

        <TouchableOpacity
          style={styles.rerandomizeButton}
          onPress={rerandomizeCubes}
        >
          <Text style={styles.buttonText}>Throw the dices!</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for long-press on cube */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cube Options</Text>
            <Text style={styles.modalText}>
              {selectedCubeIndex !== null ? `Cube #${selectedCubeIndex + 1}\nvalue: ${cubeValues[selectedCubeIndex]}` : ''}
            </Text>
            {/* Max value selector */}
            {selectedCubeIndex !== null && (
              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: Colors.dark.cubeText, marginBottom: 6 }}>Max value for this cube:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Slider
                    style={{ width: 120, height: 30 }}
                    minimumValue={MIN_CUBE_VALUE}
                    maximumValue={MAX_CUBE_VALUE}
                    step={1}
                    value={cubeMaxValues[selectedCubeIndex] || DEFAULT_DICE_MAX}
                    onValueChange={val => {
                      setCubeMaxValues(prev => {
                        const updated = [...prev];
                        updated[selectedCubeIndex] = val;
                        return updated;
                      });
                    }}
                    minimumTrackTintColor={Colors.dark.sliderMinTrack}
                    maximumTrackTintColor={Colors.dark.sliderMaxTrack}
                    thumbTintColor={Colors.dark.sliderThumb}
                  />
                  <Text style={{ marginLeft: 8, fontSize: 16, color: Colors.dark.cubeText }}>{cubeMaxValues[selectedCubeIndex] || DEFAULT_DICE_MAX}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 20,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 30,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    flexGrow: 1,
    marginBottom: 20,
  },
  cube: {
    backgroundColor: Colors.dark.cube,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.dark.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  lockedCube: {
    backgroundColor: Colors.dark.cubeLocked,
    borderWidth: 2,
    borderColor: Colors.dark.lockIcon,
  },
  lockIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 18,
    color: Colors.dark.lockIcon,
  },
  cubeText: {
    fontWeight: 'bold',
    color: Colors.dark.cubeText,
  },
  rerandomizeButton: {
    backgroundColor: Colors.dark.button,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.dark.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.dark.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 220,
    elevation: 5,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.dark.cubeText,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: Colors.dark.cubeText,
  },
  modalCloseButton: {
    backgroundColor: Colors.dark.button,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  modalCloseButtonText: {
    color: Colors.dark.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;