
import Slider from "@react-native-community/slider";
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const App = () => {
  const [numCubes, setNumCubes] = useState(1);
  const [cubeValues, setCubeValues] = useState<number[]>([]);
  const [lockedCubes, setLockedCubes] = useState<boolean[]>([]);
  // Animated values for each cube
  const animationValues = useRef<Animated.Value[]>([]);

  // Function to generate a random number between 1 and 6
  const generateRandomValue = (max: number = 6) => {
    return Math.floor(Math.random() * max) + 1;
  };

  // Function to initialize or re-randomize all cube values based on numCubes
  const initializeCubeValues = React.useCallback(() => {
    const newValues = [];
    const newLocks = [];
    for (let i = 0; i < numCubes; i++) {
      newValues.push(generateRandomValue());
      newLocks.push(false);
    }
    setCubeValues(newValues);
    setLockedCubes(newLocks);
    // Initialize animation values for each cube
    animationValues.current = Array(numCubes)
      .fill(0)
      .map((_, i) => animationValues.current[i] || new Animated.Value(1));
  }, [numCubes]);

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
        lockedCubes[idx] ? val : generateRandomValue()
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
      updated[index] = !updated[index];
      return updated;
    });
  };

  // Function to render the cubes with their values and animation
  const renderCubes = () => {
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
            activeOpacity={0.7}
          >
            <Text style={[styles.cubeText, isLocked && styles.cubeTextLocked]}>{value}</Text>
            {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
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
          maximumValue={9}
          step={1}
          value={numCubes}
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
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.cubeText,
  },
  cubeTextLocked: {
    color: Colors.dark.cubeTextLocked, // Change this to your preferred locked color
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
});

export default App;