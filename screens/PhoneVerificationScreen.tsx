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
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (updatedCode.length === 6 && /^\d{6}$/.test(updatedCode)) {
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
    
    if (currentCode.length !== 6 || !/^\d{6}$/.test(currentCode)) {
      Alert.alert('Erreur', 'Veuillez saisir le code complet à 6 chiffres');
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
    // Format: +225 05 76 32 0581
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+225 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
    }
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/8bedea66-f318-404b-8ffd-73beacaa06c5.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>PAKO Client</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>SAISISSEZ LE CODE À 6 CHIFFRES</Text>
        
        <Text style={styles.subtitle}>
          {isRegistration 
            ? `Nous l'avons envoyé au ${formatPhoneNumber(phone)} pour vérifier votre compte`
            : `Nous l'avons envoyé au ${formatPhoneNumber(phone)} pour vous connecter`
          }
        </Text>

        {/* WhatsApp notification hint */}
        <View style={styles.whatsappHint}>
          <Text style={styles.whatsappIcon}>📱</Text>
          <View style={styles.whatsappText}>
            <Text style={styles.whatsappTitle}>Vérifiez votre WhatsApp</Text>
            <Text style={styles.whatsappSubtitle}>
              Le message n'est peut-être pas accompagné d'un son de notification
            </Text>
          </View>
        </View>

        {/* Code input fields */}
        <View style={styles.codeContainer}>
          {Array.from({ length: 6 }, (_, index) => renderCodeInput(index))}
        </View>

        {/* Timer and resend options */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Vous ne l'avez pas reçu? {timer > 0 ? `${timer.toString().padStart(2, '0')}:${(timer % 60).toString().padStart(2, '0')}` : '00:00'}
          </Text>
          
          <View style={styles.resendButtons}>
            <TouchableOpacity
              style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
              onPress={handleResendCode}
              disabled={!canResend || loading}
            >
              <Text style={[styles.resendButtonText, !canResend && styles.resendButtonTextDisabled]}>
                Renvoyer le code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resendButton, styles.smsButton]}
              onPress={handleResendCode}
              disabled={loading}
            >
              <Text style={styles.smsIcon}>💬</Text>
              <Text style={styles.resendButtonText}>Envoyer par SMS</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: '#2C3E50',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  logoImage: {
    width: 80,
    height: 40,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  whatsappHint: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  whatsappIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  whatsappText: {
    flex: 1,
  },
  whatsappTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  whatsappSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  resendButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  resendButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  resendButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  smsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smsIcon: {
    marginRight: 8,
    fontSize: 16,
  },
});

export default PhoneVerificationScreen;
