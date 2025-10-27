## Problèmes courants

### "ECONNREFUSED"
- Le serveur backend n'est pas démarré
- Vérifiez avec `netstat -ano | findstr :3000`

### "Network Error"
- Problème de connexion réseau
- Vérifiez que vous êtes sur le même réseau Wi-Fi
- Vérifiez l'adresse IP dans la configuration

### "Code OTP invalide ou expiré"
- **Cause**: Le code OTP stocké dans la base de données ne correspond pas à celui saisi
- **Solution**: 
  1. Vérifiez les logs du serveur backend pour voir le code OTP généré
  2. Assurez-vous de saisir exactement le même code affiché dans la console
  3. Vérifiez que le code n'a pas expiré (10 minutes)
  4. Si le problème persiste, demandez un nouveau code OTP

### "CORS Error"
- L'adresse IP n'est pas dans la liste des origines autorisées
- Ajoutez-la dans `BACK END/src/main.ts`
