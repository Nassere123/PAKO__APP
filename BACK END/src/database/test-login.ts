/**
 * Script pour tester l'authentification des travailleurs
 * 
 * Usage: ts-node src/database/test-login.ts
 */

async function testLogin() {
  const baseURL = 'http://localhost:3000';
  
  // Test avec un livreur
  const testCredentials = {
    phone: '+2250702345678',
    password: 'Livreur123!'
  };

  console.log('🧪 Test de connexion...\n');
  console.log(`📞 Téléphone: ${testCredentials.phone}`);
  console.log(`🔑 Mot de passe: ${testCredentials.password}\n`);

  try {
    const response = await fetch(`${baseURL}/auth/login-worker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Connexion réussie!\n');
      console.log('📋 Données reçues:');
      console.log(`   Token: ${data.access_token ? data.access_token.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`   Utilisateur ID: ${data.user?.id}`);
      console.log(`   Nom: ${data.user?.firstName} ${data.user?.lastName}`);
      console.log(`   Téléphone: ${data.user?.phone}`);
      console.log(`   Type: ${data.user?.userType}`);
      console.log(`   Vérifié: ${data.user?.isVerified}`);
      console.log('\n✨ L\'authentification fonctionne correctement!');
    } else {
      console.log('❌ Erreur de connexion:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message || data.error || 'Erreur inconnue'}`);
    }
  } catch (error: any) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n💡 Assurez-vous que le serveur backend est démarré sur http://localhost:3000');
  }
}

testLogin();

