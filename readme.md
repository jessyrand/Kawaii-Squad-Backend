

# 🚀 Setup & Migration Guide

## 📦 Installation

Avant de commencer, assure-toi d’avoir installé les dépendances :

```bash
npm install
```

---

## 🗄️ Database Migration (Prisma)

Pour appliquer les migrations à la base de données :

```bash
npx prisma migrate dev --name add_cin_table
```

👉 Cette commande :

* crée une nouvelle migration (`add_cin_table`)
* met à jour la base de données
* synchronise le client Prisma

---

## ▶️ Lancer l'application

Démarre le serveur avec les variables d’environnement :

```bash
node -r dotenv/config ./src/app.js
```

---

## ⚡ Commandes utiles

| Commande                 | Description                               |
| ------------------------ | ----------------------------------------- |
| `npx prisma migrate dev` | Appliquer les migrations en développement |
| `npx prisma generate`    | Générer le client Prisma                  |
| `npx prisma studio`      | Interface graphique pour la DB            |

---

## 🔐 Variables d'environnement

Crée un fichier `.env` à la racine du projet :

```env
DATABASE_URL="your_database_url"
```

---

## 🧠 Notes

* Assure-toi que ta base de données est en marche avant les migrations
* Utilise `prisma studio` pour visualiser les données facilement
* Ne commit jamais ton fichier `.env`
