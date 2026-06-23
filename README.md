# AutoHub

Webapplicatie om occasions te bekijken, filteren, vergelijken en beoordelen.
Gebouwd met Node.js, Express en MySQL.

---

## Documentatie

| | |
|---|---|
| [ERD (datamodel)](docs/erd/) | Databaseschema + Mermaid diagram |
| [UML (klassendiagram)](docs/uml/) | Klassenstructuur van de applicatie |
| [Figma designs](docs/figma/) | UI-ontwerpen en design link |
| [Examenmatrijs](docs/examenmatrijs/) | Beoordelingscriteria per kerntaak |
| [Testrapport](docs/testrapport/) | Testscenario's en resultaten |
| [Projectverslag](docs/verslag/) | Volledig verslag |

---

## Lokaal draaien

**Wat je nodig hebt:** Node.js, MAMP (MySQL)

**1. Database opzetten**

Start MAMP, open phpMyAdmin, importeer `database/schema.sql`.

**2. Project instellen**

```bash
cp .env.example .env
# Pas DB_PORT aan naar jouw MAMP-poort (3306 of 8889)
npm install
```

**3. Database vullen**

```bash
npm run seed
```

Testaccounts na seeden:
- Admin: `admin@autohub.nl` / `admin123`
- Gebruiker: `marco@voorbeeld.nl` / `test1234`

**4. Starten**

```bash
npm start        # productie
npm run dev      # development (auto-restart)
```

Open [http://localhost:3000](http://localhost:3000)

**5. Tests draaien**

```bash
npm test
```

---

## Projectstructuur

```
autohub/
├── app.js                    hoofdbestand, Express setup
├── config/
│   └── database.js           MySQL connection pool
├── controllers/              logica per feature
│   ├── autoController.js
│   ├── authController.js
│   ├── adminController.js
│   ├── favorietController.js
│   ├── reviewController.js
│   ├── proefritController.js
│   └── contactController.js
├── middleware/
│   ├── auth.js               JWT verificatie
│   └── upload.js             Multer afbeeldingen
├── models/                   database queries
│   ├── Auto.js
│   ├── User.js
│   ├── Favoriet.js
│   ├── Review.js
│   ├── Proefrit.js
│   └── Contact.js
├── routes/                   URL-routes
├── views/                    EJS templates
│   ├── partials/             nav, footer, kaart, sterren
│   └── admin/                adminpagina's
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   └── img/
├── database/
│   ├── schema.sql
│   └── seed.js
├── tests/
│   └── app.test.js
└── docs/
    ├── erd/                  ERD + Mermaid diagram
    ├── uml/                  UML klassendiagram
    ├── figma/                UI designs
    ├── examenmatrijs/        beoordelingscriteria
    ├── testrapport/          testscenario's
    └── verslag/              projectverslag
```

---

## Functionaliteiten

**Bezoekers**
- Homepage met hero, uitgelichte auto's en merkenrij
- Aanbodpagina met zoeken, filteren en sorteren
- Detailpagina met galerij, specs, tuning-calculator en financieringscalculator
- Reviews bekijken
- Proefrit aanvragen
- Auto's vergelijken (tot 4 tegelijk via vergelijkbalk)
- Live zoeken (autocomplete)
- Licht/donker thema

**Ingelogde gebruikers**
- Registreren en inloggen (JWT + bcrypt)
- Favorieten opslaan en beheren

**Admins**
- Dashboard met statistieken
- Auto's beheren (CRUD + foto-upload)
- Proefrit-aanvragen beheren
- Reviews modereren
- Contactberichten inzien
- Gebruikersbeheer (rol, verwijderen)
- Bulk-acties

---

## Probleemoplossing

**Database verbinding mislukt** — staat MAMP aan? Klopt `DB_PORT` in `.env`?

**Foto's laden niet** — auto-foto's komen van Unsplash (internet nodig); anders zie je een placeholder.

**Poort 3000 bezet** — pas `PORT` in `.env` aan naar bijv. 3001.
