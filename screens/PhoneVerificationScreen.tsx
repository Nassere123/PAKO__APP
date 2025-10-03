import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { Button } from '../components';
import { COLORS } from '../constants';
import { PhoneVerificationScreenProps } from '../types';

const PhoneVerificationScreen: React.FC<PhoneVerificationScreenProps> = ({ navigation, route }) => {
  const { phone, isRegistration, firstName, lastName } = route.params;
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (value: string, index: number): void => {
    const newCode = code.split('');
    newCode[index] = value;
    const updatedCode = newCode.join('');
    setCode(updatedCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (updatedCode.length === 4 && /^\d{4}$/.test(updatedCode)) {
      setTimeout(() => handleVerifyCode(updatedCode), 100); // Petit délai pour l'UX
    }
  };

  const handleKeyPress = (key: string, index: number): void => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeToVerify?: string): Promise<void> => {
    const currentCode = codeToVerify || code;
    
    if (currentCode.length !== 4 || !/^\d{4}$/.test(currentCode)) {
      Alert.alert('Erreur', 'Veuillez saisir le code complet à 4 chiffres');
      return;
    }

    // Vérification immédiate - pas de délai pour l'auto-connexion
    setLoading(true);
    
    // Simulation de vérification rapide
    setTimeout(() => {
      setLoading(false);
      
      if (isRegistration) {
        // Pour l'inscription, aller à l'écran de bienvenue
        if (firstName && lastName && phone) {
          navigation.navigate('Welcome', {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
          });
        } else {
          Alert.alert('Erreur', 'Informations manquantes pour l\'inscription');
        }
      } else {
        // Pour la connexion, aller directement à l'accueil
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    }, 800); // Délai réduit pour une connexion plus rapide
  };

  const handleResendCode = async (): Promise<void> => {
    setLoading(true);
    
    // Simulation d'envoi
    setTimeout(() => {
      setLoading(false);
      setTimer(60);
      setCanResend(false);
      setCode('');
      Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé à votre numéro');
    }, 1000);
  };

  const formatPhoneNumber = (phone: string): string => {
    // Retourner le numéro tel qu'il a été saisi par l'utilisateur
    return phone;
  };

  const renderCodeInput = (index: number) => (
    <TextInput
      key={index}
      ref={(ref) => {
        if (ref) inputRefs.current[index] = ref;
      }}
      style={styles.codeInput}
      value={code[index] || ''}
      onChangeText={(value) => handleCodeChange(value, index)}
      onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
      keyboardType="numeric"
      maxLength={1}
      textAlign="center"
      autoFocus={index === 0}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header avec navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérification OTP</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Icône centrale */}
        <View style={styles.iconContainer}>
          <Text style={styles.otpIcon}>💬</Text>
        </View>

        {/* Titre principal */}
        <Text style={styles.title}>Entrez le code de vérification</Text>
        
        {/* Message d'instruction */}
        <Text style={styles.subtitle}>
          Nous avons envoyé un code de vérification à votre numéro de téléphone
        </Text>
        
        {/* Numéro de téléphone */}
        <Text style={styles.phoneNumber}>{formatPhoneNumber(phone)}</Text>

        {/* Code input fields - 4 chiffres */}
        <View style={styles.codeContainer}>
          {Array.from({ length: 4 }, (_, index) => renderCodeInput(index))}
        </View>

        {/* Timer de renvoi */}
        <Text style={styles.timerText}>
          Renvoyer le code dans {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </Text>

        {/* Bouton de vérification */}
        <TouchableOpacity 
          style={[styles.verifyButton, code.length === 4 && styles.verifyButtonActive]}
          onPress={() => handleVerifyCode()}
          disabled={code.length !== 4 || loading}
        >
          <Text style={[styles.verifyButtonText, code.length === 4 && styles.verifyButtonTextActive]}>
            Vérifier
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#333',
    fontSize: 24,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  otpIcon: {
    fontSize: 60,
    color: '#FF6B35',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%',
    paddingHorizontal: 40,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: COLORS.white,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  verifyButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  verifyButtonActive: {
    backgroundColor: '#FF6B35',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  verifyButtonTextActive: {
    color: COLORS.white,
  },
});

export default PhoneVerificationScreen;
