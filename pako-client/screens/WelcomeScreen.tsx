import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Button } from '../components';
import { COLORS } from '../constants';
import { useAuth } from '../hooks';
import { WelcomeScreenProps } from '../types/navigation';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation, route }) => {
  const { firstName, lastName, phone } = route.params || {};
  const { login } = useAuth();
  
  // Animations
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Si aucun paramètre n'est fourni, rediriger vers Auth
  React.useEffect(() => {
    if (!firstName && !lastName && !phone) {
      navigation.replace('Auth', {});
    }
  }, [firstName, lastName, phone, navigation]);

  // Animation de danse pour l'icône de succès
  useEffect(() => {
    const startDancingAnimation = () => {
      Animated.sequence([
        // Animation de rebond
        Animated.timing(bounceAnim, {
          toValue: -30,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        // Animation de rotation
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        // Animation de scale
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Répéter l'animation après un délai
        setTimeout(startDancingAnimation, 2000);
      });
    };

    // Démarrer l'animation après un court délai
    const timer = setTimeout(startDancingAnimation, 500);
    
    return () => clearTimeout(timer);
  }, [bounceAnim, rotateAnim, scaleAnim]);

  const handleStartAdventure = async (): Promise<void> => {
    try {
      console.log('🚀 Démarrage de l\'aventure PAKO...');
      console.log(`👤 Utilisateur: ${firstName} ${lastName}`);
      console.log(`📞 Téléphone: ${phone}`);
      
      // L'utilisateur est déjà connecté à ce stade (via PhoneVerificationScreen)
      // Navigation directe vers l'écran d'accueil principal
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      // Navigation quand même vers l'accueil en cas d'erreur
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icône de succès animée */}
        <View style={styles.iconContainer}>
          <Animated.View 
            style={[
              styles.successIcon,
              {
                transform: [
                  { translateY: bounceAnim },
                  { 
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <Image 
              source={require('../assets/check.png')} 
              style={styles.checkmarkImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Message de bienvenue */}
        <View style={styles.messageContainer}>
          <Text style={styles.welcomeTitle}></Text>
          
          <Text style={styles.welcomeMessage}>
            Félicitations <Text style={styles.userName}>{firstName || 'Utilisateur'} {lastName || ''}</Text> !
          </Text>
          
          <Text style={styles.subMessage}>
            Votre compte PAKO a été créé avec succès.
          </Text>
        </View>

        {/* Bouton d'action */}
        <View style={styles.actionContainer}>
          <Button
            title="Commencer l'aventure"
            onPress={handleStartAdventure}
            style={styles.startButton}
          />
          
          <Text style={styles.helpText}>
            Vous pouvez commencer à créer vos commandes et suivre vos livraisons
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 200,
  },
  successIcon: {
    // Show only the image without any circular background or shadow
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -16,
  },
  checkmark: {
    fontSize: 40,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  checkmarkImage: {
    width: 200,
    height: 200,
  },
  messageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: -20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  welcomeMessage: {
    fontSize: 32,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
    fontWeight: 'bold',
  },
  userName: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 26,
  },
  subMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default WelcomeScreen;