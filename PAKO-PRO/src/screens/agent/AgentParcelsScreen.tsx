import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

const AgentParcelsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Colis en transit</Text>
      <Text style={styles.placeholder}>
        Les colis enregistrés dans votre gare apparaîtront ici.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
  },
  placeholder: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },
});

export default AgentParcelsScreen;
