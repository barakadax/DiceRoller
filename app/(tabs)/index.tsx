import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from "@react-native-community/slider";
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const App = () => {
  const [numCubes, setNumCubes] = useState(1);
  const [cubeValues, setCubeValues] = useState<number[]>([]);
  const [lockedCubes, setLockedCubes] = useState<boolean[]>([]);
  const [cubeMaxValues, setCubeMaxValues] = useState<number[]>([]);
  const [defaultDiceMax, setDefaultDiceMax] = useState(6);
  const [cubeTextColor, setCubeTextColor] = useState(Colors.dark.cubeText);
  const animationValues = useRef<Animated.Value[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCubeIndex, setSelectedCubeIndex] = useState<number | null>(null);

  // Function to generate a random number between 1 and max
  const generateRandomValue = (max: number) => {
    return Math.floor(Math.random() * max) + 1;
  };

  // Function to initialize or re-randomize all cube values based on numCubes
  const initializeCubeValues = React.useCallback(() => {
    const newValues = [];
    const newLocks = [];
    const newMaxValues = [];
    for (let i = 0; i < numCubes; i++) {
      // Always use the latest defaultDiceMax for new cubes
      newMaxValues.push(defaultDiceMax);
      newValues.push(generateRandomValue(defaultDiceMax));
      newLocks.push(false);
    }
    setCubeValues(newValues);
    setLockedCubes(newLocks);
    setCubeMaxValues(newMaxValues);
    // Initialize animation values for each cube
    animationValues.current = Array(numCubes)
      .fill(0)
      .map((_, i) => animationValues.current[i] || new Animated.Value(1));
  }, [numCubes, defaultDiceMax]);

  // Live update defaultDiceMax, maxCubes, and cubeTextColor from AsyncStorage (poll every 1 second)
  useEffect(() => {
    let isMounted = true;
    let lastDefaultDiceMax = defaultDiceMax;
    let lastMaxCubes = 9;
    let lastCubeTextColor = cubeTextColor;
    const poll = async () => {
      const val = await AsyncStorage.getItem('defaultDiceMax');
      if (val !== null && isMounted) {
        const numVal = Number(val);
        if (numVal !== lastDefaultDiceMax) {
          setDefaultDiceMax(numVal);
          lastDefaultDiceMax = numVal;
        }
      }
      const maxCubesVal = await AsyncStorage.getItem('maxCubes');
      if (maxCubesVal !== null && isMounted) {
        const numMaxCubes = Number(maxCubesVal);
        if (numMaxCubes !== lastMaxCubes) {
          setSliderMax(numMaxCubes);
          lastMaxCubes = numMaxCubes;
        }
      }
      const colorVal = await AsyncStorage.getItem('cubeTextColor');
      if (colorVal && isMounted && colorVal !== lastCubeTextColor) {
        setCubeTextColor(colorVal);
        lastCubeTextColor = colorVal;
      }
      if (isMounted) setTimeout(poll, 1000);
    };
    poll();
    return () => { isMounted = false; };
  }, [defaultDiceMax, cubeTextColor]);

  // State for slider maximum value
  const [sliderMax, setSliderMax] = useState(9);

  // Effect to run when numCubes changes (slider moved)
  // This ensures new cubes get a random value immediately
  useEffect(() => {
    initializeCubeValues();
  }, [initializeCubeValues]); // Dependency array: runs when initializeCubeValues changes

  // Function to animate only unlocked cubes
  const animateCubes = () => {
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
  };

  // Function to rerandomize only the currently displayed cubes, except locked ones, and animate
  const rerandomizeCubes = () => {
    setCubeValues((prevValues) => {
      return prevValues.map((val, idx) =>
        lockedCubes[idx] ? val : generateRandomValue(cubeMaxValues[idx] || defaultDiceMax)
      );
    });
    animateCubes();
  };

  // Calculate grid and cube dimensions based on screen width
  const { width } = Dimensions.get('window');
  const maxCubesInRow = numCubes <= 3 ? numCubes : numCubes <= 5 ? 2 : 3;
  const containerPadding = 20;
  const cubeMargin = 5;

  let cubeSize = (width - containerPadding * 2 - cubeMargin * (maxCubesInRow - 1)) / maxCubesInRow - 25;
  cubeSize = Math.min(cubeSize, 150);

  // Function to toggle lock state for a cube
  const toggleLock = (index: number) => {
    setLockedCubes((prev) => {
      const updated = [...prev];
      // If trying to lock, check if it would lock all cubes
      if (!updated[index]) {
        const lockedCount = updated.filter(Boolean).length;
        if (lockedCount === updated.length - 1) {
          // Prevent locking the last available cube
          return prev;
        }
      }
      updated[index] = !updated[index];
      return updated;
    });
  };

  // Function to render the cubes with their values and animation
  const renderCubes = () => {
    const dynamicFontSize = Math.max(32, Math.round(cubeSize * 0.35));
    return cubeValues.map((value, index) => {
      const isLocked = lockedCubes[index];
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
            style={[
              styles.cube,
              { width: cubeSize, height: cubeSize, margin: cubeMargin },
              isLocked && styles.lockedCube,
            ]}
            onPress={() => toggleLock(index)}
            onLongPress={() => {
              setSelectedCubeIndex(index);
              setModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.cubeText, isLocked && { fontSize: dynamicFontSize, color: cubeTextColor }]}>{value}</Text>
            {isLocked && <Text style={styles.lockIcon}>{'\u{1F512}'}</Text>}
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={sliderMax}
          step={1}
          value={numCubes > sliderMax ? sliderMax : numCubes}
          onValueChange={(value) => setNumCubes(value)}
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
              <View style={{marginBottom: 20, alignItems: 'center'}}>
                <Text style={{fontSize: 14, color: Colors.dark.cubeText, marginBottom: 6}}>Max value for this cube:</Text>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                  <Slider
                    style={{width: 120, height: 30}}
                    minimumValue={2}
                    maximumValue={20}
                    step={1}
                    value={cubeMaxValues[selectedCubeIndex] || 6}
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
                  <Text style={{marginLeft:8, fontSize:16, color: Colors.dark.cubeText}}>{cubeMaxValues[selectedCubeIndex] || 6}</Text>
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
    flexGrow: 1, // Allows the grid to take available space
    marginBottom: 20, // Space between grid and button
  },
  cube: {
    backgroundColor: Colors.dark.cube,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
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
    width: '80%', // Make the button a bit narrower than full width
    marginBottom: 20, // Add some margin at the bottom
  },
  buttonText: {
    color: Colors.dark.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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