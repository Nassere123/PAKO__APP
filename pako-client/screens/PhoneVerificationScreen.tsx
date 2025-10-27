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
import { AuthService } from '../services/authService';
import { useAuth } from '../hooks';

const PhoneVerificationScreen: React.FC<PhoneVerificationScreenProps> = ({ navigation, route }) => {
  const { phone, isRegistration, firstName, lastName } = route.params;
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const [timer, setTimer] = useState<number>(600); // 10 minutes pour OTP 6 chiffres
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

    setLoading(true);
    
    try {
      if (isRegistration) {
        // Pour l'inscription, d'abord vérifier le code OTP
        const verifyResult = await AuthService.verifyOtp(phone, currentCode);
        
        if (verifyResult.success) {
          // Ensuite enregistrer l'utilisateur
          const registerResult = await AuthService.register({
            firstName: firstName || '',
            lastName: lastName || '',
            phone,
          });
          
          if (registerResult.success) {
            setLoading(false);
            
            // Sauvegarder l'utilisateur avec l'ID UUID du backend
            await login({
              id: registerResult.user.id, // ID UUID du backend
              firstName: registerResult.user.firstName,
              lastName: registerResult.user.lastName,
              phone: registerResult.user.phone,
              email: registerResult.user.email,
            });
            
            navigation.navigate('Welcome', {
              firstName: firstName || '',
              lastName: lastName || '',
              phone: phone,
            });
          } else {
            setLoading(false);
            Alert.alert('Erreur', registerResult.error || 'Erreur lors de l\'inscription');
          }
        } else {
          setLoading(false);
          Alert.alert('Erreur', verifyResult.error || 'Code OTP invalide');
        }
      } else {
        // Pour la connexion, utiliser le code OTP pour se connecter
        const loginResult = await AuthService.login(phone, currentCode);
        
        if (loginResult.success && loginResult.user) {
          // Récupérer les données complètes de l'utilisateur depuis la base de données
          try {
            const userDataResult = await AuthService.getUserByPhone(phone);
            if (userDataResult.success && userDataResult.user) {
              // Utiliser les données de la base de données
              await login({
                id: userDataResult.user.id,
                firstName: userDataResult.user.firstName,
                lastName: userDataResult.user.lastName,
                phone: userDataResult.user.phone,
                email: userDataResult.user.email,
              });
            } else {
              // Fallback sur les données de login
              await login({
                id: loginResult.user.id,
                firstName: loginResult.user.firstName,
                lastName: loginResult.user.lastName,
                phone: loginResult.user.phone,
                email: loginResult.user.email,
              });
            }
          } catch (error) {
            console.log('Erreur lors de la récupération des données utilisateur:', error);
            // Fallback sur les données de login
            await login({
              id: loginResult.user.id,
              firstName: loginResult.user.firstName,
              lastName: loginResult.user.lastName,
              phone: loginResult.user.phone,
              email: loginResult.user.email,
            });
          }
          
          setLoading(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          setLoading(false);
          Alert.alert('Erreur', loginResult.error || 'Code OTP invalide');
        }
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    }
  };

  const handleResendCode = async (): Promise<void> => {
    setLoading(true);
    
    try {
      const otpResult = await AuthService.sendOtp(phone);
      
      if (otpResult.success) {
        setLoading(false);
        setTimer(600); // 10 minutes
        setCanResend(false);
        setCode('');
        Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé à votre numéro');
      } else {
        setLoading(false);
        Alert.alert('Erreur', otpResult.error || 'Erreur lors du renvoi du code');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    }
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

        {/* Code input fields - 6 chiffres */}
        <View style={styles.codeContainer}>
          {Array.from({ length: 6 }, (_, index) => renderCodeInput(index))}
        </View>

        {/* Timer de renvoi */}
        <Text style={styles.timerText}>
          {timer > 0 ? `Renvoyer le code dans ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Vous pouvez renvoyer le code'}
        </Text>

        {/* Bouton de vérification */}
        <TouchableOpacity 
          style={[styles.verifyButton, code.length === 6 && styles.verifyButtonActive]}
          onPress={() => handleVerifyCode()}
          disabled={code.length !== 6 || loading}
        >
          <Text style={[styles.verifyButtonText, code.length === 6 && styles.verifyButtonTextActive]}>
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
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 20,
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
