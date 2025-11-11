import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, StatusBar } from 'react-native';
import { COLORS } from '../constants';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current; // commence avec l'écran orange visible
  const whiteFade = useRef(new Animated.Value(0)).current; // blanc invisible au départ

  useEffect(() => {
    // Phase 1 : afficher l'image orange pendant 2 secondes
    setTimeout(() => {
      // Phase 2 : transition douce vers le blanc
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(whiteFade, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Attente brève avant de terminer le splash
        setTimeout(() => onFinish(), 700);
      });
    }, 2000);
  }, [fadeAnim, whiteFade, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

      {/* Écran orange avec image */}
      <Animated.View style={[styles.orangeScreen, { opacity: fadeAnim }]}>
        <Image
          source={require('../assets/Juicy Orange.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.logoContainer}>
          <Text style={styles.whiteLogoText}>PAKO</Text>
        </View>
      </Animated.View>

      {/* Écran blanc avec logo orange */}
      <Animated.View style={[styles.whiteScreen, { opacity: whiteFade }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.orangeLogoText}>PAKO</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  orangeScreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteLogoText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  orangeLogoText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default SplashScreen;
