import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animations pour la transition de fond
  const backgroundFadeAnim = useRef(new Animated.Value(1)).current;
  const textColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de démarrage
    const startAnimations = () => {
      // Animation parallèle : fade in, scale, et slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation de pulsation continue
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Transition après 2 secondes : fond orange vers blanc, texte blanc vers orange
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(backgroundFadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false, // Pour les couleurs
          }),
          Animated.timing(textColorAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false, // Pour les couleurs
          }),
        ]).start();
      }, 2000);

      // Fin de l'écran de démarrage après 4 secondes
      setTimeout(() => {
        // Animation de sortie
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onFinish();
        });
      }, 4000);
    };

    startAnimations();
  }, [fadeAnim, scaleAnim, slideAnim, pulseAnim, backgroundFadeAnim, textColorAnim, onFinish]);

  // Interpolation pour la couleur du texte (blanc vers orange)
  const textColor = textColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.white, COLORS.primary],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Fond blanc */}
      <View style={styles.whiteBackground} />
      
      {/* Fond image Light Orange avec fade */}
      <Animated.View style={[styles.backgroundContainer, { opacity: backgroundFadeAnim }]}>
        <Image
          source={require('../assets/Light Orange.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </Animated.View>
      
      {/* Texte PAKO au centre */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        <Animated.Text style={[styles.title, { color: textColor }]}>PAKO</Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    letterSpacing: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 60,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  version: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
  },
});

export default SplashScreen;
