export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Limiter à 10 chiffres maximum
  const limitedPhone = cleaned.slice(0, 10);
  
  // Formater selon le format français (10 chiffres)
  if (limitedPhone.length === 10) {
    return limitedPhone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return limitedPhone;
};

export const formatPostalCode = (code) => {
  if (!code) return '';
  return code.toString().padStart(5, '0');
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};
