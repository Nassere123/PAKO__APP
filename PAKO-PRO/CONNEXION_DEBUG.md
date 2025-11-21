# 🔍 Guide de Diagnostic de Connexion API

## ✅ Vérifications à faire

### 1. Vérifier que le serveur backend est démarré
Le serveur doit afficher dans la console :
```
🚀 Application PAKO démarrée sur 0.0.0.0:3000
📚 Documentation API disponible sur http://localhost:3000/api
```

### 2. Vérifier l'URL configurée dans l'app
Au démarrage de l'app, vous devriez voir dans la console :
```
🔧 Configuration API:
   Base URL: http://10.0.2.2:3000  (ou votre IP)
   Timeout: 30000ms
```

### 3. Tester la connexion manuellement

#### Si vous utilisez un **émulateur Android** :
- L'URL doit être : `http://10.0.2.2:3000`
- Testez dans le navigateur de votre machine : `http://localhost:3000/api`

#### Si vous utilisez un **appareil physique** :
1. Trouvez votre IP locale avec : `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Modifiez `PAKO-PRO/src/lib/api/config.ts` :
   ```typescript
   const MANUAL_IP = '192.168.1.10'; // Votre IP locale
   ```
   Et décommentez la ligne :
   ```typescript
   if (MANUAL_IP) {
     return `http://${MANUAL_IP}:3000`;
   }
   ```
3. Assurez-vous que votre appareil et votre machine sont sur le même réseau Wi-Fi

### 4. Vérifier les logs d'erreur
En cas d'erreur, la console affichera :
```
❌ Erreur réseau lors de l'appel à: http://10.0.2.2:3000/auth/login-worker
   Base URL configurée: http://10.0.2.2:3000
```

### 5. Tester avec curl ou Postman
Testez directement depuis votre machine :
```bash
curl http://localhost:3000/api
```

## 🔧 Solutions courantes

### Problème : "Network request failed"
**Solutions :**
1. Vérifiez que le serveur est démarré (pas juste ouvert dans l'éditeur)
2. Vérifiez l'URL dans `config.ts` correspond à votre environnement
3. Si appareil physique, utilisez l'IP locale au lieu de `10.0.2.2`
4. Vérifiez que le firewall ne bloque pas le port 3000
5. Vérifiez que l'appareil et la machine sont sur le même réseau

### Problème : "CORS error"
**Solution :** L'IP est déjà ajoutée dans `BACK END/src/main.ts`. Redémarrez le serveur.

### Problème : "Timeout"
**Solutions :**
1. Vérifiez que le serveur répond rapidement
2. Augmentez le timeout dans `config.ts` si nécessaire
3. Vérifiez votre connexion réseau

## 📱 IPs détectées sur votre machine

D'après `ipconfig`, vos IPs locales sont :
- `192.168.190.1`
- `192.168.195.1`
- `192.168.1.10` ⭐ (probablement votre IP principale)
- `172.18.128.1`

Si vous utilisez un appareil physique, essayez `192.168.1.10` en premier.

