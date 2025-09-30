import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { Country, DEFAULT_COUNTRY } from '../constants/countries';

interface PhoneInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (fullNumber: string) => void;
  style?: object;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  placeholder = "Numéro de téléphone",
  value,
  onChangeText,
  style,
}) => {
  const [selectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [localNumber, setLocalNumber] = useState<string>('');

  const handlePhoneChange = (text: string): void => {
    // Nettoyer le numéro (garder seulement les chiffres)
    const cleanedText = text.replace(/\D/g, '');
    setLocalNumber(cleanedText);
    
    // Construire le numéro complet avec l'indicatif
    const fullNumber = selectedCountry.dialCode + cleanedText;
    onChangeText(fullNumber);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.countrySelector}>
        <Text style={styles.flag}>{selectedCountry.flag}</Text>
        <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
      </View>
      
      <TextInput
        style={styles.phoneInput}
        placeholder={placeholder}
        value={localNumber}
        onChangeText={handlePhoneChange}
        keyboardType="phone-pad"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
});

export default PhoneInput;
