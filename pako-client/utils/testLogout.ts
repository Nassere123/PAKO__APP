/**
 * Script de test pour vérifier la déconnexion
 * À utiliser pour déboguer les problèmes de déconnexion
 */

import { AuthService } from '../services/authService';
import { UserStorageService } from '../services/userStorage';

export const testLogoutFlow = async (testUserId?: string): Promise<void> => {
  console.log('\n🧪 ===== TEST FLUX DÉCONNEXION =====');
  
  try {
    // Étape 1: Diagnostic initial
    console.log('📊 DIAGNOSTIC INITIAL:');
    const currentUser = await UserStorageService.getUser();
    console.log('   Utilisateur actuel:', currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Aucun');
    console.log('   ID utilisateur:', currentUser?.id || 'Non défini');
    
    // Étape 2: Définir l'UUID à tester
    const userId = testUserId || currentUser?.id || '2d0122cf-b4d8-4f53-ad3c-dd1ff92e12f4';
    console.log('🆔 UUID à tester:', userId);
    
    // Étape 3: Validation UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUUID = uuidRegex.test(userId);
    console.log('🔍 UUID valide:', isValidUUID);
    
    if (!isValidUUID) {
      console.log('❌ UUID invalide - le test va échouer');
      return;
    }
    
    // Étape 4: Test de l'API
    console.log('\n📡 TEST API BACKEND:');
    console.log('   Backend URL: http://localhost:3000');
    console.log('   Endpoint: POST /auth/logout');
    console.log('   Payload:', { userId });
    
    const result = await AuthService.logout(userId);
    
    console.log('\n📊 RÉSULTAT TEST:');
    console.log('   Succès:', result.success);
    if (result.error) {
      console.log('   Erreur:', result.error);
    }
    
    console.log('\n✅ TEST TERMINÉ');
    console.log('🔍 Vérifiez les logs du backend pour voir les statistiques');
    
  } catch (error) {
    console.error('\n❌ ERREUR DURANT LE TEST:', error);
  }
  
  console.log('================================\n');
};

export const testBackendConnection = async (): Promise<boolean> => {
  console.log('\n🔗 ===== TEST CONNEXION BACKEND =====');
  
  try {
    const { apiService } = await import('../lib/api');
    
    console.log('📡 Test endpoint racine...');
    const response = await apiService.get('/');
    
    console.log('✅ Backend accessible:');
    console.log('   Status:', response.status);
    console.log('   Message:', response.data.message);
    console.log('   URL:', response.config?.baseURL);
    
    console.log('=====================================\n');
    return true;
    
  } catch (error: any) {
    console.log('❌ Backend non accessible:');
    console.log('   Erreur:', error.message);
    console.log('   URL tentée:', error.config?.url);
    console.log('   Status:', error.response?.status);
    
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez que le backend est démarré');
    console.log('2. Vérifiez l\'URL dans constants/api.js');
    console.log('3. Vérifiez que le port 3000 est libre');
    
    console.log('=====================================\n');
    return false;
  }
};

export const fullDiagnostic = async (): Promise<void> => {
  console.log('\n🔍 ===== DIAGNOSTIC COMPLET =====');
  
  // Test 1: Connexion backend
  const backendOk = await testBackendConnection();
  
  if (!backendOk) {
    console.log('❌ Backend non accessible - arrêt du diagnostic');
    return;
  }
  
  // Test 2: Données utilisateur
  console.log('👤 DONNÉES UTILISATEUR:');
  const user = await UserStorageService.getUser();
  if (user) {
    console.log('   Nom:', user.firstName, user.lastName);
    console.log('   ID:', user.id);
    console.log('   Téléphone:', user.phone);
    console.log('   Connecté:', user.isConnected);
    
    // Test 3: Flux de déconnexion
    await testLogoutFlow(user.id);
  } else {
    console.log('   Aucun utilisateur connecté');
    console.log('   Test avec UUID fictif...');
    await testLogoutFlow('2d0122cf-b4d8-4f53-ad3c-dd1ff92e12f4');
  }
  
  console.log('===============================\n');
};
