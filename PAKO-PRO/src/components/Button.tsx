import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, SHADOW } from '../constants/colors';
import { SIZES } from '../constants/sizes';

type Props = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
};

const Button: React.FC<Props> = ({ title, loading, disabled, style, ...props }) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.button, isDisabled ? styles.buttonDisabled : undefined, style]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.textInverse} />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: SIZES.height.button,
    borderRadius: SIZES.borderRadius.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.7,
  },
  title: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
});

export default Button;

