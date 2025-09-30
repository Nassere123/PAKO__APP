import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  text?: string;
  textStyle?: any;
  style?: any;
  checkmarkColor?: string;
  checkmarkSize?: number;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  text,
  textStyle,
  style,
  checkmarkColor = COLORS.white,
  checkmarkSize = 16,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && (
          <Text style={[styles.checkmark, { color: checkmarkColor, fontSize: checkmarkSize }]}>
            ✓
          </Text>
        )}
      </View>
      {text && (
        <Text style={[styles.text, textStyle]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default Checkbox;
