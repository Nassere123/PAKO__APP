export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Au moins 8 caractères, une majuscule, une minuscule et un chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone: string): boolean => {
  // Validation générale pour numéros internationaux
  const cleaned = phone.replace(/\D/g, '');
  
  // Doit commencer par un indicatif international et avoir au moins 7 chiffres
  if (cleaned.length < 8 || cleaned.length > 15) {
    return false;
  }
  
  // Doit commencer par un indicatif valide
  const validCountryCodes = [
    '1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44',
    '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60',
    '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93',
    '94', '95', '98', '212', '213', '216', '218', '220', '221', '222', '223', '224', '225',
    '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237',
    '238', '239', '240', '241', '242', '243', '244', '245', '246', '248', '249', '250',
    '251', '252', '253', '254', '255', '256', '257', '258', '260', '261', '262', '263',
    '264', '265', '266', '267', '268', '269', '290', '291', '297', '298', '299'
  ];
  
  // Vérifier si le numéro commence par un indicatif valide
  for (const code of validCountryCodes) {
    if (cleaned.startsWith(code)) {
      return true;
    }
  }
  
  return false;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatage spécial pour la Côte d'Ivoire
  if (cleaned.startsWith('225') && cleaned.length === 11) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 9) {
    return `+225 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
  }
  
  // Formatage général pour autres pays
  if (cleaned.length >= 8) {
    const countryCode = cleaned.slice(0, 1);
    const localNumber = cleaned.slice(1);
    
    if (localNumber.length >= 7) {
      return `+${countryCode} ${localNumber.slice(0, 3)} ${localNumber.slice(3)}`;
    }
  }
  
  return phone;
};

export const validateRequired = (value: string): boolean => {
  return value && value.trim().length > 0;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};
