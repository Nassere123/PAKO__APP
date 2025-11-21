import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { COLORS } from '../constants/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current; // commence avec l'écran orange visible
  const whiteFade = useRef(new Animated.Value(0)).current; // blanc invisible au départ

  useEffect(() => {
    // Phase 1 : afficher l'écran orange pendant 2 secondes
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

      {/* Écran orange avec logo */}
      <Animated.View style={[styles.orangeScreen, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.whiteLogoText}>PAKO PRO</Text>
        </View>
      </Animated.View>

      {/* Écran blanc avec logo orange */}
      <Animated.View style={[styles.whiteScreen, { opacity: whiteFade }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.orangeLogoText}>PAKO PRO</Text>
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteLogoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  orangeLogoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default SplashScreen;

