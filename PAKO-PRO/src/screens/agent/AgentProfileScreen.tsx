import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useAuth } from '../../context/AuthContext';

const AgentProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil agent</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nom complet</Text>
        <Text style={styles.value}>{user?.fullName ?? 'Agent PAKO PRO'}</Text>

        <Text style={styles.label}>Numéro</Text>
        <Text style={styles.value}>{user?.phone}</Text>
      </View>

      <Button title="Se déconnecter" onPress={signOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.lg,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
  },
  label: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.sm,
  },
  value: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default AgentProfileScreen;
