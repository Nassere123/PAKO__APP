/**
 * Utilitaire de nettoyage du stockage pour résoudre les problèmes d'UUID
 * À utiliser en cas de problème avec des anciens ID timestamp
 */

import { UserStorageService } from '../services/userStorage';
import { AuthService } from '../services/authService';

/**
 * Nettoie toutes les données de session obsolètes
 * Utilisé pour résoudre les problèmes d'UUID invalides
 */
export const cleanupObsoleteSessionData = async (): Promise<void> => {
  try {
    console.log('🧹 ===== NETTOYAGE DONNÉES OBSOLÈTES =====');
    
    // Nettoyer via le service utilisateur
    await UserStorageService.cleanObsoleteData();
    
    // Double nettoyage via le service d'authentification
    await AuthService.logout();
    
    console.log('✅ Nettoyage complet terminé');
    console.log('🔄 Une reconnexion sera nécessaire');
    console.log('==========================================');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
};

/**
 * Vérifie et nettoie automatiquement les données obsolètes au démarrage
 * Cette fonction est appelée automatiquement par useAuth
 */
export const autoCleanupOnStart = async (): Promise<boolean> => {
  try {
    const user = await UserStorageService.getUser();
    
    // Si getUser retourne null à cause d'un ID invalide,
    // le nettoyage a déjà été fait automatiquement
    if (user === null) {
      console.log('🔄 Données obsolètes détectées et nettoyées automatiquement');
      return true; // Nettoyage effectué
    }
    
    return false; // Pas de nettoyage nécessaire
  } catch (error) {
    console.error('❌ Erreur lors de la vérification automatique:', error);
    return false;
  }
};

/**
 * Valide si un ID utilisateur est un UUID valide
 */
export const validateUserUUID = (userId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
};

/**
 * Diagnostique le stockage utilisateur
 * Utile pour déboguer les problèmes d'UUID
 */
export const diagnoseUserStorage = async (): Promise<void> => {
  try {
    console.log('🔍 ===== DIAGNOSTIC STOCKAGE =====');
    
    const connected = await UserStorageService.isUserConnected();
    const user = await UserStorageService.getUser();
    const hasToken = await AuthService.hasValidToken();
    
    console.log('📊 État actuel:');
    console.log(`   - Connecté: ${connected}`);
    console.log(`   - Utilisateur: ${user ? 'Présent' : 'Absent'}`);
    console.log(`   - Token: ${hasToken ? 'Présent' : 'Absent'}`);
    
    if (user) {
      console.log(`📱 Données utilisateur:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - ID valide: ${validateUserUUID(user.id)}`);
      console.log(`   - Nom: ${user.firstName} ${user.lastName}`);
      console.log(`   - Téléphone: ${user.phone}`);
      console.log(`   - Date connexion: ${user.loginDate}`);
    }
    
    console.log('==================================');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
};
