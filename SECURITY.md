# 🔒 Guide de Sécurité - ImageAI

## Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans l'application ImageAI et les bonnes pratiques à suivre.

## 🛡️ Mesures de Sécurité Implémentées

### 1. Validation d'Entrée Robuste
- **Zod Schema Validation** : Validation stricte de tous les inputs
- **Sanitisation** : Nettoyage des données utilisateur
- **Rate Limiting** : Protection contre les attaques par déni de service

### 2. Headers de Sécurité
- **CSP** : Content Security Policy pour prévenir XSS
- **HSTS** : HTTP Strict Transport Security
- **X-Frame-Options** : Protection contre clickjacking
- **X-Content-Type-Options** : Prévention MIME sniffing

### 3. Protection des API
- **Validation stricte** : Tous les endpoints validés
- **Logging sécurisé** : Pas d'exposition de données sensibles
- **Rate limiting** : Protection contre les abus
- **Headers CSRF** : Protection basique contre CSRF

### 4. Gestion des Secrets
- **Variables d'environnement** : Validation stricte
- **Service Role Key** : Jamais exposé au client
- **URLs de confiance** : Validation des domaines autorisés

## 🔍 Points de Contrôle de Sécurité

### Variables d'Environnement Requises
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REPLICATE_API_TOKEN=your-replicate-token
REPLICATE_MODEL=your-model-identifier
```

### Headers de Sécurité Appliqués
- `Content-Security-Policy` : Protection XSS
- `Strict-Transport-Security` : HTTPS obligatoire
- `X-Frame-Options: DENY` : Anti-clickjacking
- `X-Content-Type-Options: nosniff` : Anti-MIME sniffing
- `Referrer-Policy` : Contrôle des références
- `Permissions-Policy` : Contrôle des APIs navigateur

## 🚨 Monitoring et Alertes

### Événements Loggés
- Tentatives de validation échouées
- Rate limiting déclenché
- Erreurs de base de données
- Uploads de fichiers suspects
- Requêtes avec headers suspects

### Métriques de Sécurité
- Nombre de requêtes par IP
- Taux d'erreur de validation
- Temps de traitement des requêtes
- Taille des fichiers uploadés

## 🔧 Configuration Supabase

### Row Level Security (RLS)
```sql
-- Table waiting
ALTER TABLE waiting ENABLE ROW LEVEL SECURITY;

-- Politique pour les insertions
CREATE POLICY "Allow public inserts" ON waiting
  FOR INSERT WITH CHECK (true);

-- Politique pour les lectures (admin seulement)
CREATE POLICY "Admin only reads" ON waiting
  FOR SELECT USING (auth.role() = 'service_role');
```

### Buckets de Stockage
```sql
-- Configuration des buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('input-images', 'input-images', false),
  ('output-images', 'output-images', false);

-- Politiques de stockage
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'input-images');

CREATE POLICY "Allow downloads" ON storage.objects
  FOR SELECT USING (bucket_id IN ('input-images', 'output-images'));
```

## 🛠️ Bonnes Pratiques de Développement

### 1. Validation des Données
```typescript
// ✅ Bon
const validation = validateInput(schema, data);
if (!validation.success) {
  return NextResponse.json({ error: "Données invalides" }, { status: 400 });
}

// ❌ Mauvais
if (!data.email) {
  return NextResponse.json({ error: "Email requis" }, { status: 400 });
}
```

### 2. Logging Sécurisé
```typescript
// ✅ Bon
console.log("[SECURITY] Event occurred", { 
  ip, 
  timestamp: new Date().toISOString(),
  event: "validation_failed"
});

// ❌ Mauvais
console.log("User data:", { email, password, creditCard });
```

### 3. Gestion des Erreurs
```typescript
// ✅ Bon
try {
  // Opération risquée
} catch (error) {
  console.error("[SECURITY] Operation failed:", {
    error: error instanceof Error ? error.message : 'Unknown',
    ip,
    timestamp: new Date().toISOString()
  });
  return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
}
```

## 🔄 Maintenance de Sécurité

### Vérifications Régulières
1. **Audit des dépendances** : `npm audit`
2. **Mise à jour des packages** : `npm update`
3. **Review des logs** : Recherche d'activité suspecte
4. **Test de pénétration** : Tests de sécurité réguliers

### Alertes à Configurer
- Tentatives de brute force
- Uploads de fichiers suspects
- Erreurs de validation répétées
- Accès depuis des IPs suspectes

## 📋 Checklist de Déploiement

### Avant le Déploiement
- [ ] Variables d'environnement configurées
- [ ] Headers de sécurité testés
- [ ] Validation des inputs testée
- [ ] Rate limiting configuré
- [ ] Logs de sécurité fonctionnels

### Après le Déploiement
- [ ] Tests de sécurité effectués
- [ ] Monitoring configuré
- [ ] Alertes configurées
- [ ] Documentation mise à jour

## 🚀 Améliorations Futures

### Court Terme
- [ ] Authentification utilisateur
- [ ] Sessions sécurisées
- [ ] Audit trail complet
- [ ] Chiffrement des données sensibles

### Long Terme
- [ ] Intégration WAF
- [ ] Détection d'anomalies
- [ ] Chiffrement end-to-end
- [ ] Compliance RGPD

## 📞 Support de Sécurité

En cas de découverte d'une vulnérabilité :
1. Ne pas divulguer publiquement
2. Contacter l'équipe de sécurité
3. Fournir des détails techniques
4. Attendre la confirmation avant publication

---

**Dernière mise à jour** : $(date)
**Version** : 1.0.0
**Responsable sécurité** : Équipe ImageAI
