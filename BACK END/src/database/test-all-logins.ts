/**
 * Script pour tester l'authentification de tous les utilisateurs créés
 * 
 * Usage: ts-node src/database/test-all-logins.ts
 */

const testUsers = [
  { name: 'Kouadio Pascal (Livreur)', phone: '+2250701234567', password: 'Livreur123!' },
  { name: 'Bakayoko Ismaël (Livreur)', phone: '+2250702345678', password: 'Livreur123!' },
  { name: 'Koné Moussa (Livreur)', phone: '+2250703456789', password: 'Livreur123!' },
  { name: 'Koné Aïcha (Agent)', phone: '+2250501234567', password: 'Agent123!' },
  { name: 'Ouattara Bruno (Agent)', phone: '+2250502345678', password: 'Agent123!' },
];

async function testAllLogins() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Test de connexion pour tous les utilisateurs...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let successCount = 0;
  let errorCount = 0;

  for (const user of testUsers) {
    try {
      console.log(`📝 Test: ${user.name}`);
      console.log(`   📞 ${user.phone}`);

      const response = await fetch(`${baseURL}/auth/login-worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: user.phone,
          password: user.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`   ✅ Connexion réussie!`);
        console.log(`   👤 ${data.user.firstName} ${data.user.lastName}`);
        console.log(`   🆔 ID: ${data.user.id}`);
        console.log(`   🔑 Token: ${data.access_token.substring(0, 30)}...`);
        successCount++;
      } else {
        console.log(`   ❌ Échec: ${data.message || data.error || 'Erreur inconnue'}`);
        errorCount++;
      }
      console.log('');
    } catch (error: any) {
      console.log(`   ❌ Erreur: ${error.message}`);
      errorCount++;
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Résumé: ${successCount} réussis, ${errorCount} échecs`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (successCount === testUsers.length) {
    console.log('✨ Tous les tests d\'authentification ont réussi!');
    console.log('✅ Le système d\'authentification est opérationnel.\n');
  }
}

testAllLogins();

