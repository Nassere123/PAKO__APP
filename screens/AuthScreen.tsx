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
} from 'react-native';
import { Input, Button, PhoneInput, Checkbox } from '../components';
import { COLORS, SIZES } from '../constants';
import { AuthScreenProps, RegisterData, AuthCredentials } from '../types';

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

  const handleInputChange = (field: keyof RegisterData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.phone) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone');
      return false;
    }

    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs d\'inscription');
        return false;
      }

      // Vérifier l'acceptation des conditions pour l'inscription
      if (!acceptedTerms) {
        Alert.alert('Erreur', 'Veuillez accepter les conditions d\'utilisation');
        return false;
      }

      if (!acceptedPrivacy) {
        Alert.alert('Erreur', 'Veuillez accepter la politique de confidentialité');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulation d'envoi de code
    setTimeout(() => {
      setLoading(false);
      
      // Pour la connexion ET l'inscription, aller à la vérification du code
      navigation.navigate('PhoneVerification', { 
        phone: formData.phone, 
        isRegistration: !isLogin,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
    }, 1500);
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
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Contenu principal centré */}
        <View style={styles.mainContent}>
          {/* Icône principale */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📱</Text>
          </View>

          {/* Titre */}
          <Text style={styles.title}>
            {isLogin ? 'Connexion' : 'Bienvenue'}
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
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
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
    color: '#666666',
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
    color: '#666666',
    fontSize: 14,
  },
  switchLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default AuthScreen;
