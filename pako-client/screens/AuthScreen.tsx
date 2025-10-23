import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { Input, Button, PhoneInput, Checkbox } from '../components';
import { COLORS, SIZES } from '../constants';
import { AuthScreenProps, RegisterData, AuthCredentials } from '../types';
import { AuthService } from '../services/authService';

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation, route }) => {
  const initialMode = route.params?.initialMode;
  const [isLogin, setIsLogin] = useState<boolean>(initialMode === 'login');
  const [formData, setFormData] = useState<RegisterData>({
    phone: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorTitle, setErrorTitle] = useState<string>('Erreur');

  const handleInputChange = (field: keyof RegisterData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const showError = (title: string, message: string): void => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const validateForm = (): boolean => {
    if (!formData.phone) {
      showError('Erreur', 'Veuillez saisir votre numéro de téléphone');
      return false;
    }

    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) {
        showError('Erreur', 'Veuillez remplir tous les champs d\'inscription');
        return false;
      }

      // Vérifier l'acceptation des conditions pour l'inscription
      if (!acceptedTerms) {
        showError('Erreur', 'Veuillez accepter les conditions d\'utilisation');
        return false;
      }

      if (!acceptedPrivacy) {
        showError('Erreur', 'Veuillez accepter la politique de confidentialité');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    // Debug: Afficher les données du formulaire
    console.log('=== AUTH SCREEN DEBUG ===');
    console.log('isLogin:', isLogin);
    console.log('formData:', formData);
    console.log('formData.phone:', formData.phone);
    console.log('formData.firstName:', formData.firstName);
    console.log('formData.lastName:', formData.lastName);
    console.log('========================');

    setLoading(true);
    
    try {
      // Envoyer le code OTP au serveur avec les informations utilisateur
      const otpResult = await AuthService.sendOtp(
        formData.phone, 
        formData.firstName, 
        formData.lastName
      );
      
      if (otpResult.success) {
        setLoading(false);
        
        // Aller à la vérification du code
        navigation.navigate('PhoneVerification', { 
          phone: formData.phone, 
          isRegistration: !isLogin,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      } else {
        setLoading(false);
        showError('Erreur', otpResult.error || 'Erreur lors de l\'envoi du code OTP');
      }
    } catch (error: any) {
      setLoading(false);
      console.log('Erreur détaillée:', error);
      
      // Gestion des erreurs plus spécifique
      if (error.code === 'ECONNREFUSED') {
        showError('Erreur de connexion', 'Le serveur backend n\'est pas accessible. Vérifiez que le serveur est démarré sur le port 3000.');
      } else if (error.message?.includes('Network Error')) {
        showError('Erreur réseau', 'Impossible de se connecter au serveur. En mode développement, l\'inscription fonctionnera avec simulation.');
      } else if (error.message?.includes('timeout')) {
        showError('Timeout', 'Le serveur met trop de temps à répondre. Vérifiez votre connexion.');
      } else {
        showError('Erreur', 'Erreur de connexion au serveur: ' + (error.message || 'Erreur inconnue'));
      }
    }
  };

  const handleOpenTerms = (): void => {
    // Navigation vers la page des conditions d'utilisation
    Alert.alert(
      'Conditions d\'utilisation',
      'Cette fonctionnalité sera disponible prochainement. Pour l\'instant, vous pouvez accepter les conditions générales d\'utilisation de PAKO.',
      [{ text: 'OK' }]
    );
  };

  const handleOpenPrivacy = (): void => {
    // Navigation vers la page de politique de confidentialité
    Alert.alert(
      'Politique de confidentialité',
      'Cette fonctionnalité sera disponible prochainement. Pour l\'instant, vous pouvez accepter la politique de confidentialité de PAKO.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Contenu principal centré */}
        <View style={styles.mainContent}>
          {/* Logo PAKO */}
          <Text style={styles.logoText}>PAKO</Text>

          {/* Titre */}
          <Text style={styles.title}>
            {isLogin ? 'Connexion' : 'Inscription'}
          </Text>
          
          {/* Sous-titre */}
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Connectez-vous pour accéder à vos commandes'
              : 'Entrez vos informations pour commencer'}
          </Text>

          {/* Formulaire */}
          <View style={styles.form}>
            {!isLogin && (
              <>
                <Input
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  style={styles.input}
                />
                <Input
                  placeholder="Nom"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  style={styles.input}
                />
              </>
            )}

            <PhoneInput
              placeholder="Numéro de téléphone"
              value={formData.phone}
              onChangeText={(fullPhone) => handleInputChange('phone', fullPhone)}
              style={styles.input}
            />

            {/* Conditions d'utilisation et politique de confidentialité - seulement pour l'inscription */}
            {!isLogin && (
              <View style={styles.conditionsContainer}>
                <View style={styles.checkboxRow}>
                  <Checkbox
                    checked={acceptedTerms && acceptedPrivacy}
                    onPress={() => {
                      const newValue = !(acceptedTerms && acceptedPrivacy);
                      setAcceptedTerms(newValue);
                      setAcceptedPrivacy(newValue);
                    }}
                    style={styles.checkbox}
                  />
                  <View style={styles.conditionsText}>
                    <Text style={styles.conditionsLabel}>J'accepte les </Text>
                    <TouchableOpacity onPress={handleOpenTerms}>
                      <Text style={styles.linkText}>conditions d'utilisation</Text>
                    </TouchableOpacity>
                    <Text style={styles.conditionsLabel}> et la </Text>
                    <TouchableOpacity onPress={handleOpenPrivacy}>
                      <Text style={styles.linkText}>politique de confidentialité</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Bouton principal */}
            <Button
              title={isLogin ? 'Se connecter' : 'Commencer'}
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
            />

            {/* Lien alternatif */}
            {!isLogin && (
              <TouchableOpacity 
                style={styles.alternativeButton}
                onPress={() => setIsLogin(true)}
              >
                <Text style={styles.phoneIcon}></Text>
                <Text style={styles.alternativeButtonText}></Text>
              </TouchableOpacity>
            )}

            {/* Switch entre connexion et inscription */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? "Vous n'avez pas de compte ? " : 'Vous avez déjà un compte ? '}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchLink}>
                  {isLogin ? 'S\'inscrire' : 'Se connecter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal d'erreur */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>⚠️</Text>
              <Text style={styles.modalTitle}>{errorTitle}</Text>
            </View>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
    paddingVertical: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
    minHeight: '100%',
  },
  iconImage: {
    width: 140,
    height: 140,
    marginBottom: 30,
    marginTop: 20,
    alignSelf: 'center',
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#2C3E50',
  },
  conditionsContainer: {
    marginBottom: 32,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  conditionsText: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  conditionsLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  alternativeButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    color: '#7F8C8D',
    fontSize: 14,
  },
  switchLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Styles pour le modal d'erreur
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthScreen;
