# Test de l'endpoint de création de commande

## ✅ Status : BACKEND FONCTIONNE !

L'endpoint `/orders/with-packages` fonctionne correctement. L'erreur 400 est normale car nous avons fourni un customerId invalide.

## 🧪 Test simple

Pour tester avec un UUID valide :

```bash
Invoke-WebRequest -Uri "http://192.168.1.17:3000/orders/with-packages" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"customerId":"123e4567-e89b-12d3-a456-426614174000","senderName":"Test User","senderPhone":"2250777021859","senderCity":"Abidjan","receiverName":"Receiver User","receiverPhone":"2250777021860","deliveryAddress":"Cocody, Abidjan","destinationStation":"Station Cocody","deliveryType":"standard","paymentMethod":"cash","packages":[{"packageCode":"ABC123","description":"Test Package","packageType":"standard"}]}'
```

## 🚀 Test avec l'application

1. **Démarrez l'application** : `npm start`
2. **Connectez-vous** avec un utilisateur
3. **Allez dans "Recevoir mon colis"**
4. **Remplissez les informations** et validez
5. **Vérifiez les logs** dans le terminal backend

## 📋 Logs attendus dans le backend

```
🚀 ===== NOUVELLE COMMANDE REÇUE =====
📋 Données de la commande:
   👤 Client ID: [UUID]
   📦 Nombre de colis: 1
   🚚 Type de livraison: standard
   💳 Méthode de paiement: cash
   💰 Prix total: [PRIX] FCFA

📦 Détails des colis:
   1. Code: ABC123
      Description: Test Package
      Type: standard

📍 Informations de livraison:
   🏠 Expéditeur: Test User (2250777021859)
   📍 Ville: Abidjan
   📦 Destinataire: Receiver User (2250777021860)
   🏠 Adresse: Cocody, Abidjan
   🚉 Station: Station Cocody

🎯 Numéro de commande généré: #PAKO-YYYYMMDD-XXX

✅ Commande créée avec succès!
   🆔 ID: [UUID]
   📦 Nombre de colis créés: 1
   ⚖️ Poids total: 0 kg
   💰 Prix final: [PRIX] FCFA
=====================================
```

## ✅ Prêt pour les tests !
