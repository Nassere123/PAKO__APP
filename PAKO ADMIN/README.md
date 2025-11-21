# PAKO ADMIN

Tableau de bord administrateur pour la gestion de la plateforme de livraison Pako en Côte d'Ivoire.

## Technologies

- **React 18** - Bibliothèque UI
- **Vite** - Build tool et dev server
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Composants UI
- **Radix UI** - Composants accessibles
- **Lucide React** - Icônes

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Build

```bash
npm run build
```

## Structure du projet

```
PAKO ADMIN/
├── src/
│   ├── components/        # Composants React
│   │   ├── ui/          # Composants UI de base (shadcn/ui)
│   │   └── ...          # Composants métier
│   ├── lib/             # Utilitaires
│   ├── hooks/           # Hooks React personnalisés
│   ├── App.tsx          # Composant principal
│   ├── main.tsx         # Point d'entrée
│   └── index.css        # Styles globaux
├── public/              # Assets statiques
└── package.json
```

## Fonctionnalités

- 📊 Tableau de bord avec statistiques
- 💰 Gestion des transactions
- 💵 Gestion des commissions
- 📝 Rapports et analyses
- ⚠️ Gestion des incidents
- 👥 Gestion des utilisateurs
- 🔐 Rôles et permissions

## Configuration

Le projet utilise Vite avec React et TypeScript. Les alias de chemins sont configurés dans `vite.config.ts` et `tsconfig.json`.

