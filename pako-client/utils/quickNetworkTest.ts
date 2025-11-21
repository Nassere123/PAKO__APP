/**
 * Test réseau rapide à exécuter au démarrage de l'app
 * Pour diagnostiquer immédiatement les problèmes de connexion
 */

import { API_CONFIG } from '../constants/api';
import { AuthService } from '../services/authService';

/**
 * Test réseau au démarrage de l'application
 * À appeler dans App.tsx ou AppWrapper.tsx
 */
export const startupNetworkTest = async (): Promise<boolean> => {
  console.log('\n🔍 ===== TEST RÉSEAU DÉMARRAGE =====');
  
  try {
    // Test 1: Configuration API
    console.log('📊 Configuration API:');
    console.log('   URL:', API_CONFIG.BASE_URL);
    console.log('   Timeout:', API_CONFIG.TIMEOUT, 'ms');
    console.log('   Dev Mode:', __DEV__);
    
    // Test 2: Test basique avec fetch natif
    console.log('\n📡 Test fetch natif...');
    const fetchResponse = await fetch(API_CONFIG.BASE_URL + '/', {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    if (fetchResponse.ok) {
      const data = await fetchResponse.json();
      console.log('✅ Fetch natif OK:', data.message);
    } else {
      console.log('❌ Fetch natif erreur:', fetchResponse.status);
      return false;
    }
    
    // Test 3: Test avec apiService (axios)
    console.log('\n📡 Test apiService (axios)...');
    const { apiService } = await import('../lib/api');
    const axiosResponse = await apiService.get('/');
    
    if (axiosResponse.status === 200) {
      console.log('✅ ApiService OK:', axiosResponse.data.message);
    } else {
      console.log('❌ ApiService erreur:', axiosResponse.status);
      return false;
    }
    
    console.log('\n✅ TOUS LES TESTS RÉSEAU RÉUSSIS');
    console.log('🎯 La connexion backend fonctionne correctement');
    console.log('=====================================\n');
    
    return true;
    
  } catch (error: any) {
    console.log('\n❌ ÉCHEC DU TEST RÉSEAU:');
    console.log('🔍 Erreur:', error.message);
    console.log('🔍 Type:', error.name);
    console.log('🔍 Code:', error.code);
    
    // Diagnostics spécifiques
    if (error.message.includes('Network request failed')) {
      console.log('\n🚨 PROBLÈME DE RÉSEAU DÉTECTÉ:');
      console.log('💡 Actions recommandées:');
      console.log('1. Vérifiez que le backend PAKO est démarré');
      console.log('2. Vérifiez l\'URL:', API_CONFIG.BASE_URL);
      console.log('3. Testez manuellement:', `curl ${API_CONFIG.BASE_URL}/`);
      console.log('4. Vérifiez votre connexion réseau');
    } else if (error.name === 'AbortError') {
      console.log('\n🚨 TIMEOUT RÉSEAU:');
      console.log('💡 Le backend met trop de temps à répondre');
      console.log('Timeout testé: 5000ms');
    }
    
    console.log('\n🔧 CONFIGURATION ALTERNATIVE:');
    console.log('Si vous utilisez:');
    console.log('- iOS Simulator: http://localhost:3000');
    console.log('- Android Emulator: http://10.0.2.2:3000');
    console.log('- Expo Go: http://[VOTRE_IP]:3000');
    console.log('\nModifiez pako-client/constants/api.js en conséquence');
    
    console.log('=====================================\n');
    
    return false;
  }
};

/**
 * Test OTP simplifié pour déboguer les erreurs de connexion
 */
export const testOtpConnection = async (): Promise<void> => {
  console.log('\n🧪 ===== TEST CONNEXION OTP =====');
  
  try {
    // Utiliser un numéro de test
    const testPhone = '+225071234567';
    const testFirstName = 'Test';
    const testLastName = 'User';
    
    console.log('📞 Test avec:', testPhone);
    console.log('👤 Nom:', testFirstName, testLastName);
    
    const result = await AuthService.sendOtp(testPhone, testFirstName, testLastName);
    
    if (result.success) {
      console.log('✅ TEST OTP RÉUSSI');
      console.log('📩 Message:', result.message);
      console.log('⏱️  Expire dans:', result.expiresIn, 'secondes');
    } else {
      console.log('❌ TEST OTP ÉCHOUÉ');
      console.log('💥 Erreur:', result.error);
    }
    
  } catch (error: any) {
    console.log('❌ EXCEPTION DURANT TEST OTP:');
    console.log('💥 Erreur:', error.message);
  }
  
  console.log('===============================\n');
};

/**
 * Instructions pour l'utilisateur en cas de problème réseau
 */
export const showNetworkTroubleshooting = (): void => {
  console.log('\n🆘 ===== DÉPANNAGE RÉSEAU =====');
  console.log('Si vous avez des erreurs de connexion:');
  console.log('');
  console.log('📱 ÉTAPE 1 - Vérifiez le backend:');
  console.log('1. Ouvrez un terminal');
  console.log('2. cd "BACK END"');
  console.log('3. npm run start:dev');
  console.log('4. Vérifiez que ça affiche "Application PAKO démarrée"');
  console.log('');
  console.log('🌐 ÉTAPE 2 - Testez la connexion:');
  console.log('1. Ouvrez un navigateur');
  console.log('2. Allez sur http://localhost:3000');
  console.log('3. Vous devriez voir: "PAKO API est opérationnelle"');
  console.log('');
  console.log('📱 ÉTAPE 3 - Configurez l\'URL mobile:');
  console.log('Dans pako-client/constants/api.js, utilisez:');
  console.log('- iOS Simulator: http://localhost:3000');
  console.log('- Android Emulator: http://10.0.2.2:3000');
  console.log('- Expo Go: http://192.168.1.5:3000 (votre IP locale)');
  console.log('');  
  console.log('🔧 ÉTAPE 4 - Obtenez votre IP locale:');
  console.log('Windows: ipconfig | findstr "IPv4"');
  console.log('Mac/Linux: ifconfig | grep "inet "');
  console.log('');
  console.log('🆘 Si rien ne fonctionne:');
  console.log('1. Redémarrez le backend');
  console.log('2. Redémarrez l\'application mobile');
  console.log('3. Vérifiez votre pare-feu/antivirus');
  console.log('===============================\n');
};
