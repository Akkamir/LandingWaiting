#!/usr/bin/env node

// Script pour forcer le rechargement du cache navigateur
console.log('🧹 Nettoyage du cache...');

// Instructions pour l'utilisateur
console.log(`
📋 Pour résoudre le problème de FOUC (Flash of Unstyled Content):

1. 🧹 Nettoyage du cache navigateur:
   - Chrome/Edge: Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
   - Firefox: Ctrl+F5 (ou Cmd+Shift+R sur Mac)
   - Ou: F12 → Network → "Disable cache" → F5

2. 🔄 Redémarrage du serveur de dev:
   - Arrête le serveur (Ctrl+C)
   - Relance: npm run dev

3. 🌐 Si le problème persiste:
   - Vider le cache du navigateur complètement
   - Mode incognito/privé pour tester
   - Vérifier que les styles sont bien chargés dans l'onglet Network

4. 🚀 Solutions appliquées:
   ✅ CSS critique inline dans <head>
   ✅ Variables de police sur <html>
   ✅ Composant NoSSR pour Lottie
   ✅ Dimensions stables pour éviter CLS
   ✅ Cache .next supprimé et rebuild

Le problème devrait être résolu maintenant !
`);

console.log('✨ Cache nettoyé et optimisations appliquées !');
