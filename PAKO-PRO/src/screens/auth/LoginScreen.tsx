import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { COLORS, SHADOW } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { UserRole } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'driver', label: 'Livreur' },
  { value: 'agent', label: 'Agent de gare' },
];

const LoginScreen: React.FC = () => {
  const { signIn, loading } = useAuth();
  const [role, setRole] = useState<UserRole>('driver');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Fonction pour formater le numéro (limiter à 10 chiffres)
  const handlePhoneChange = (text: string) => {
    // Garder seulement les chiffres
    const digitsOnly = text.replace(/\D/g, '');
    // Limiter à 10 chiffres
    const limitedDigits = digitsOnly.slice(0, 10);
    setPhone(limitedDigits);
  };

  const handleSubmit = async () => {
    // Validation des champs
    const trimmedPhone = phone.trim();
    
    if (!trimmedPhone) {
      Alert.alert('Champ requis', 'Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (trimmedPhone.length !== 10) {
      Alert.alert('Format invalide', 'Le numéro de téléphone doit contenir 10 chiffres');
      return;
    }

    if (!password) {
      Alert.alert('Champ requis', 'Veuillez entrer votre mot de passe');
      return;
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      Alert.alert('Mot de passe invalide', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Ajouter automatiquement l'indicatif +225
    const fullPhoneNumber = `+225${trimmedPhone}`;

    try {
      await signIn({
        phone: fullPhoneNumber,
        password,
        role,
      });
    } catch (error) {
      // L'erreur est déjà gérée dans AuthContext avec Alert
      // On ne fait rien ici pour éviter les doubles alertes
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PAKO PRO</Text>
          <Text style={styles.headerSubtitle}>
            Portail des livreurs et agents de gare
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.badge}>PAKO PRO</Text>

          <Text style={styles.sectionLabel}>Je suis</Text>
          <View style={styles.roleContainer}>
            {ROLE_OPTIONS.map((option, index) => {
              const isActive = role === option.value;
              const isLast = index === ROLE_OPTIONS.length - 1;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.roleCard,
                    isActive && styles.roleCardActive,
                    !isLast && styles.roleCardSpacing,
                  ]}
                  onPress={() => setRole(option.value)}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.roleLabel,
                      isActive ? styles.roleLabelActive : undefined,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.phoneContainer}>
            <Text style={styles.phoneLabel}>Numero de telephone</Text>
            <View style={styles.phoneInputWrapper}>
              <View style={styles.phonePrefix}>
                <Text style={styles.flag}>🇨🇮</Text>
                <Text style={styles.prefixText}>+225</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="0701234567"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={handlePhoneChange}
                maxLength={10}
              />
            </View>
          </View>
          <Input
            label="Mot de passe"
            placeholder="Votre mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button 
            title="Se connecter" 
            onPress={handleSubmit} 
            loading={loading}
            disabled={!phone.trim() || phone.length !== 10 || !password || loading}
          />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() =>
              Alert.alert('Mot de passe oublie ?', 'Contactez votre administrateur PAKO PRO.')
            }
          >
            <Text style={styles.linkLabel}>Mot de passe oublie ?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SIZES.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  headerTitle: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.xxl,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: SIZES.spacing.xs,
    color: COLORS.textInverse,
    fontSize: SIZES.font.sm,
    opacity: 0.8,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
    ...SHADOW,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: COLORS.primaryLight,
    color: COLORS.textPrimary,
    fontSize: SIZES.font.xs,
    fontWeight: '700',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.sm,
    marginBottom: SIZES.spacing.lg,
    letterSpacing: 1,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
    marginBottom: SIZES.spacing.sm,
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.lg,
  },
  roleCard: {
    flex: 1,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  roleLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
    fontWeight: '600',
  },
  roleLabelActive: {
    color: COLORS.textPrimary,
  },
  roleCardSpacing: {
    marginRight: SIZES.spacing.sm,
  },
  linkButton: {
    marginTop: SIZES.spacing.md,
    alignItems: 'center',
  },
  linkLabel: {
    color: COLORS.primary,
    fontSize: SIZES.font.sm,
    fontWeight: '500',
  },
  phoneContainer: {
    marginBottom: SIZES.spacing.md,
  },
  phoneLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    height: SIZES.height.input,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    overflow: 'hidden',
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    backgroundColor: COLORS.background,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  flag: {
    fontSize: 20,
    marginRight: SIZES.spacing.xs,
  },
  prefixText: {
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SIZES.spacing.md,
    color: COLORS.textPrimary,
    fontSize: SIZES.font.md,
  },
});

export default LoginScreen;
