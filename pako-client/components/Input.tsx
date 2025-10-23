import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { InputProps } from '../types/navigation';

const Input: React.FC<InputProps> = ({ 
  placeholder, 
  value, 
  onChangeText, 
  style, 
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  ...props 
}) => {
  return (
    <TextInput
      style={[
        styles.input, 
        multiline && styles.multilineInput,
        style
      ]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={numberOfLines}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
});

export default Input;
