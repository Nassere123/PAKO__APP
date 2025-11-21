import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

const Input: React.FC<Props> = ({ label, error, containerStyle, style, secureTextEntry, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={COLORS.textSecondary}
          style={[
            styles.input,
            error ? styles.inputError : undefined,
            isPasswordField && styles.inputWithIcon,
            style,
          ]}
          secureTextEntry={isPasswordField && !isPasswordVisible}
          {...props}
        />
        {isPasswordField && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{isPasswordVisible ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.spacing.md,
  },
  label: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: SIZES.height.input,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.spacing.md,
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
    fontSize: SIZES.font.md,
  },
  inputWithIcon: {
    paddingRight: 50, // Espace pour l'icône
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  iconButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    zIndex: 1,
  },
  icon: {
    fontSize: 20,
  },
  error: {
    color: COLORS.danger,
    fontSize: SIZES.font.xs,
    marginTop: SIZES.spacing.xs / 2,
  },
});

export default Input;

