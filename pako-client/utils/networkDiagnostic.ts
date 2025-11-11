/**
 * Diagnostic réseau pour résoudre les erreurs de connexion
 * À utiliser depuis l'application mobile pour déboguer les problèmes réseau
 */

import { API_CONFIG } from '../constants/api';

/**
 * Test complet de connectivité réseau
 */
export const fullNetworkDiagnostic = async (): Promise<void> => {
  console.log('\n🔍 ===== DIAGNOSTIC RÉSEAU COMPLET =====');
  
  // Étape 1: Configuration actuelle
  console.log('📊 CONFIGURATION ACTUELLE:');
  console.log('   API Base URL:', API_CONFIG.BASE_URL);
  console.log('   Timeout:', API_CONFIG.TIMEOUT);
  console.log('   Environment DEV:', __DEV__);
  
  // Étape 2: Test de connectivité de base
  await testBasicConnectivity();
  
  // Étape 3: Test des endpoints spécifiques
  await testSpecificEndpoints();
  
  // Étape 4: Test avec différentes URLs
  await testAlternativeURLs();
  
  console.log('========================================\n');
};

/**
 * Test de connectivité de base
 */
const testBasicConnectivity = async (): Promise<void> => {
  console.log('\n🔗 TEST CONNECTIVITÉ DE BASE:');
  
  try {
    const response = await fetch(API_CONFIG.BASE_URL + '/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Timeout plus court pour le diagnostic
      signal: AbortSignal.timeout(5000),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connexion réussie:');
      console.log('   Status:', response.status);
      console.log('   Message:', data.message);
      console.log('   Timestamp:', data.timestamp);
    } else {
      console.log('❌ Erreur HTTP:', response.status, response.statusText);
    }
    
  } catch (error: any) {
    console.log('❌ Erreur de connexion:');
    console.log('   Type:', error.name);
    console.log('   Message:', error.message);
    console.log('   Cause:', error.cause?.message || 'Non spécifiée');
    
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      console.log('\n💡 SOLUTIONS POSSIBLES:');
      console.log('1. Vérifiez que le backend est démarré');
      console.log('2. Vérifiez l\'URL dans constants/api.js');
      console.log('3. Vérifiez votre connexion réseau');
      console.log('4. Essayez de redémarrer l\'application');
    }
  }
};

/**
 * Test des endpoints spécifiques
 */
const testSpecificEndpoints = async (): Promise<void> => {
  console.log('\n🎯 TEST ENDPOINTS SPÉCIFIQUES:');
  
  const endpoints = [
    { name: 'Root', path: '/' },
    { name: 'Auth Send OTP', path: '/auth/send-otp' },
    { name: 'Users Status', path: '/auth/users-status' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Test ${endpoint.name}...`);
      
      const response = await fetch(API_CONFIG.BASE_URL + endpoint.path, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(3000),
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('   ✅ Accessible');
      } else {
        console.log('   ⚠️  Non accessible (normal pour certains endpoints)');
      }
      
    } catch (error: any) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }
};

/**
 * Test avec différentes URLs
 */
const testAlternativeURLs = async (): Promise<void> => {
  console.log('\n🔄 TEST URLS ALTERNATIVES:');
  
  const urls = [
    'http://localhost:3000',
    'http://192.168.1.5:3000',
    'http://10.0.2.2:3000',
    'http://127.0.0.1:3000',
  ];
  
  for (const url of urls) {
    try {
      console.log(`\n🔗 Test ${url}...`);
      
      const response = await fetch(url + '/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(2000),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ OK - ${data.message}`);
      } else {
        console.log(`   ❌ Status: ${response.status}`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }
};

/**
 * Test simple de connectivité (à utiliser en premier)
 */
export const quickConnectionTest = async (): Promise<boolean> => {
  console.log('\n🚀 TEST RAPIDE DE CONNEXION...');
  
  try {
    const response = await fetch(API_CONFIG.BASE_URL + '/', {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    
    if (response.ok) {
      console.log('✅ Backend accessible');
      return true;
    } else {
      console.log('❌ Backend non accessible:', response.status);
      return false;
    }
    
  } catch (error: any) {
    console.log('❌ Erreur de connexion:', error.message);
    
    // Suggestions spécifiques selon le type d'erreur
    if (error.message.includes('Network request failed')) {
      console.log('\n💡 Vérifiez:');
      console.log('1. Backend démarré ?');
      console.log('2. URL correcte ?', API_CONFIG.BASE_URL);
      console.log('3. Pare-feu/antivirus ?');
    }
    
    return false;
  }
};

/**
 * Fonction pour tester un endpoint spécifique
 */
export const testEndpoint = async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<void> => {
  console.log(`\n🎯 TEST ENDPOINT: ${method} ${endpoint}`);
  
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    };
    
    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(API_CONFIG.BASE_URL + endpoint, options);
    
    console.log('📊 Résultat:');
    console.log('   Status:', response.status, response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log('   Data:', data);
      } catch {
        console.log('   Réponse non-JSON');
      }
    }
    
  } catch (error: any) {
    console.log('❌ Erreur:', error.message);
  }
};
