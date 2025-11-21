/**
 * Générateur d'UUID simple compatible React Native
 * Utilise crypto.randomUUID() si disponible, sinon une implémentation de fallback
 */

/**
 * Génère un UUID v4 (version 4) aléatoire
 * @returns UUID au format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export const generateUUID = (): string => {
  // Vérifier si crypto.randomUUID() est disponible (navigateurs modernes)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback pour les environnements qui ne supportent pas crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Valide si une chaîne est un UUID valide
 * @param uuid La chaîne à valider
 * @returns true si c'est un UUID valide, false sinon
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Convertit un ID (timestamp ou autre) en UUID v5 déterministe
 * Utilisé pour maintenir la compatibilité avec les anciens IDs
 * @param id L'ID à convertir
 * @returns UUID généré de manière déterministe
 */
export const convertToUUID = (id: string): string => {
  // Si c'est déjà un UUID valide, le retourner tel quel
  if (isValidUUID(id)) {
    return id;
  }

  // Générer un UUID déterministe basé sur l'ID
  const hash = id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  // Convertir le hash en format UUID
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-${'89ab'[Math.abs(hash) % 4]}${hex.slice(0, 3)}-${hex.padEnd(12, '0').slice(0, 12)}`;
};
