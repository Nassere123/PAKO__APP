import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Input, Button, PhoneInput } from '../components';
import { COLORS } from '../constants';
import { ForgotPasswordScreenProps } from '../types';

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [codeSent, setCodeSent] = useState<boolean>(false);

  const handleSendCode = async (): Promise<void> => {
    if (!phone) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone');
      return;
    }

    setLoading(true);
    
    // Simulation d'envoi de code
    setTimeout(() => {
      setLoading(false);
      setCodeSent(true);
      Alert.alert(
        'Code envoyé',
        'Un code de réinitialisation a été envoyé à votre numéro.',
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  if (codeSent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titleText}>Code envoyé</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>
          
          <Text style={styles.successTitle}>Vérifiez votre téléphone</Text>
          <Text style={styles.successMessage}>
            Nous avons envoyé un code de réinitialisation à :
          </Text>
          <Text style={styles.phoneText}>{phone}</Text>
          
          <Text style={styles.instructionText}>
            Saisissez le code reçu par SMS ou WhatsApp pour réinitialiser votre mot de passe.
            Si vous ne recevez pas le code, vérifiez votre dossier spam.
          </Text>

          <Button
            title="Renvoyer le code"
            onPress={handleSendCode}
            style={styles.resendButton}
          />

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate('Auth', { initialMode: 'login' })}
          >
            <Text style={styles.backToLoginText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        <Text style={styles.subtitle}>
          Pas de panique ! Saisissez votre numéro de téléphone et nous vous enverrons
          un code pour réinitialiser votre mot de passe.
        </Text>

        <PhoneInput
          placeholder="Numéro de téléphone"
          value={phone}
          onChangeText={(fullPhone) => setPhone(fullPhone)}
          style={styles.input}
        />

        <Button
          title="Envoyer le code de réinitialisation"
          onPress={handleSendCode}
          style={styles.submitButton}
          loading={loading}
        />

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Vous vous souvenez de votre mot de passe ?
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Auth', { initialMode: 'login' })}
          >
            <Text style={styles.helpLink}>Retour à la connexion</Text>
          </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    marginBottom: 30,
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  helpLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  resendButton: {
    backgroundColor: '#FF8C42',
    height: 50,
    borderRadius: 12,
    marginBottom: 20,
  },
  backToLogin: {
    alignItems: 'center',
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
