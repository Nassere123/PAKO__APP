import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { COLORS, SHADOW } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { AuthMode, UserRole } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'driver', label: 'Livreur' },
  { value: 'agent', label: 'Agent de gare' },
];

const LoginScreen: React.FC = () => {
  const { signIn, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('driver');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const submitLabel = mode === 'login' ? 'Se connecter' : "S'inscrire";

  const validateRegister = () => {
    if (!password || password.length < 4) {
      Alert.alert('Mot de passe', 'Le mot de passe doit contenir au moins 4 caracteres.');
      return false;
    }
    if (!lastName.trim() || !firstName.trim()) {
      Alert.alert('Nom et prenom', 'Veuillez renseigner votre nom et votre prenom.');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Numero requis', 'Veuillez saisir votre numero de telephone professionnel.');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Confirmation', 'Les mots de passe ne correspondent pas.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (mode === 'register' && !validateRegister()) {
      return;
    }

    try {
      const composedFullName =
        mode === 'register'
          ? [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
          : undefined;

      await signIn({
        phone: phone.trim(),
        password,
        fullName: composedFullName,
        role,
      });
      if (mode === 'register') {
        Alert.alert('Succes', 'Compte cree avec succes.');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Impossible de verifier vos identifiants. Reessayez.';
      Alert.alert('Erreur', message);
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

          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setMode('login')}
              style={[styles.tabButton, mode === 'login' && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  mode === 'login' ? styles.tabLabelActive : undefined,
                ]}
              >
                Connexion
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('register')}
              style={[styles.tabButton, mode === 'register' && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  mode === 'register' ? styles.tabLabelActive : undefined,
                ]}
              >
                Inscription
              </Text>
            </TouchableOpacity>
          </View>

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

          {mode === 'register' ? (
            <View style={styles.inlineFields}>
              <Input
                label="Nom"
                placeholder="Ex. Kouadio"
                value={lastName}
                onChangeText={setLastName}
                containerStyle={[styles.inlineField, styles.inlineFieldLeft]}
              />
              <Input
                label="Prenom"
                placeholder="Ex. Koffi"
                value={firstName}
                onChangeText={setFirstName}
                containerStyle={styles.inlineField}
              />
            </View>
          ) : null}

          <Input
            label="Numero de telephone"
            placeholder="Ex. +2250700000000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="Mot de passe"
            placeholder="Votre mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {mode === 'register' ? (
            <Input
              label="Confirmer le mot de passe"
              placeholder="Repetez votre mot de passe"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          ) : null}

          <Button title={submitLabel} onPress={handleSubmit} loading={loading} />

          {mode === 'login' ? (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() =>
                Alert.alert('Mot de passe oublie ?', 'Contactez votre administrateur PAKO PRO.')
              }
            >
              <Text style={styles.linkLabel}>Mot de passe oublie ?</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.linkButton} onPress={() => setMode('login')}>
              <Text style={styles.linkLabel}>
                Vous avez deja un compte ? Connectez-vous.
              </Text>
            </TouchableOpacity>
          )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.md,
    padding: 4,
    marginBottom: SIZES.spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.textInverse,
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
  inlineFields: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  inlineField: {
    flex: 1,
  },
  inlineFieldLeft: {
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
});

export default LoginScreen;
