import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useAuth } from '../../context/AuthContext';

const AgentHomeScreen: React.FC = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Bienvenue {user?.fullName ?? 'Agent'}</Text>
      <Text style={styles.subtitle}>Surveillez le flux des colis entrants et sortants.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.lg,
  },
  greeting: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },
});

export default AgentHomeScreen;
