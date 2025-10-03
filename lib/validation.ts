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
  // Validation pour numéros de téléphone limités à 10 chiffres
  const cleaned = phone.replace(/\D/g, '');
  
  // Doit avoir exactement 10 chiffres (indicatif + numéro local)
  if (cleaned.length !== 10) {
    return false;
  }
  
  // Pour la Côte d'Ivoire, doit commencer par 225 suivi de 7 chiffres
  if (cleaned.startsWith('225')) {
    return cleaned.length === 10;
  }
  
  // Pour d'autres pays, vérifier les indicatifs courants
  const validCountryCodes = ['33', '32', '34', '39', '49', '44', '1'];
  
  // Vérifier si le numéro commence par un indicatif valide
  for (const code of validCountryCodes) {
    if (cleaned.startsWith(code) && cleaned.length === 10) {
      return true;
    }
  }
  
  return false;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const limitedPhone = cleaned.slice(0, 10);
  
  // Formatage spécial pour la Côte d'Ivoire (10 chiffres)
  if (limitedPhone.startsWith('225') && limitedPhone.length === 10) {
    return `+${limitedPhone.slice(0, 3)} ${limitedPhone.slice(3, 5)} ${limitedPhone.slice(5, 7)} ${limitedPhone.slice(7)}`;
  } else if (limitedPhone.startsWith('0') && limitedPhone.length === 9) {
    return `+225 ${limitedPhone.slice(1, 3)} ${limitedPhone.slice(3, 5)} ${limitedPhone.slice(5)}`;
  }
  
  // Formatage général pour autres pays (10 chiffres)
  if (limitedPhone.length >= 8) {
    const countryCode = limitedPhone.slice(0, 1);
    const localNumber = limitedPhone.slice(1);
    
    if (localNumber.length >= 7) {
      return `+${countryCode} ${localNumber.slice(0, 3)} ${localNumber.slice(3)}`;
    }
  }
  
  return limitedPhone;
};

export const validateRequired = (value: string): boolean => {
  return Boolean(value && value.trim().length > 0);
};

export const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};
