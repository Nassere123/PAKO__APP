// Script de test de connectivité réseau
import { API_CONFIG } from '../constants/api';

export const testNetworkConnectivity = async () => {
  const testUrls = [
    'http://10.0.2.2:3000/health', // Émulateur Android
    'http://localhost:3000/health', // iOS Simulator
    'http://127.0.0.1:3000/health', // Local
  ];

  console.log('🔍 Test de connectivité réseau...');
  console.log('URL de base configurée:', API_CONFIG.BASE_URL);

  for (const url of testUrls) {
    try {
      console.log(`Test de ${url}...`);
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 5000 
      });
      
      if (response.ok) {
        console.log(`✅ ${url} - Connecté avec succès`);
        return url.replace('/health', '');
      } else {
        console.log(`❌ ${url} - Erreur ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - ${error.message}`);
    }
  }

  console.log('⚠️ Aucune URL accessible, utilisation du mode développement');
  return null;
};

export const getWorkingBaseURL = async () => {
  const workingUrl = await testNetworkConnectivity();
  return workingUrl || API_CONFIG.BASE_URL;
};
