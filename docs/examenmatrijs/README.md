# Examenmatrijs – AutoHub BPV

Overzicht van de beoordelingscriteria en hoe dit project daaraan voldoet.

---

## Kerntaak 1 – Analyseren

| Criterium | Bewijslast in dit project |
|---|---|
| Functionele requirements vastgesteld | Zie [verslag](../verslag/) — use cases, user stories |
| Doelgroep en context beschreven | README.md, verslag inleiding |
| Bestaande situatie geanalyseerd | Marktonderzoek autoplatforms (Autotrack, Marktplaats) |
| Risico's en randvoorwaarden benoemd | Verslag §2 |

---

## Kerntaak 2 – Ontwerpen

| Criterium | Bewijslast in dit project |
|---|---|
| Datamodel (ERD) gemaakt | [docs/erd/](../erd/) — ERD_AutoHub.pdf + Mermaid diagram |
| UML-diagram aanwezig | [docs/uml/](../uml/) — UML_AutoHub.pdf |
| UI-ontwerp (wireframes / high-fi) | [docs/figma/](../figma/) — Figma Design link |
| Technische architectuur beschreven | Verslag §3 — MVC-structuur |
| Databaseontwerp onderbouwd | Schema.sql + ERD toelichting |

---

## Kerntaak 3 – Realiseren

| Criterium | Bewijslast in dit project |
|---|---|
| Werkende webapplicatie gebouwd | `app.js`, alle controllers/models/views |
| MVC-patroon toegepast | `controllers/`, `models/`, `views/` |
| Database correct geïmplementeerd | `database/schema.sql`, `database/seed.js` |
| Authenticatie en autorisatie | JWT + bcrypt — `middleware/auth.js` |
| CRUD-functionaliteit aanwezig | Beheer auto's, reviews, proefritten, gebruikers |
| Responsief ontwerp | CSS media queries in `public/css/style.css` |
| Bestandsuploads | Multer middleware — `middleware/upload.js` |
| Favorieten-systeem | AJAX toggle, persistent in database |
| Vergelijkingssysteem | Multi-select via localStorage, vergelijkbalk |

---

## Kerntaak 4 – Testen

| Criterium | Bewijslast in dit project |
|---|---|
| Testplan opgesteld | [docs/testrapport/](../testrapport/) |
| Geautomatiseerde tests geschreven | `tests/app.test.js` — `npm test` |
| Testrapport aanwezig | Testrapport_AutoHub.pdf |
| Bugs gedocumenteerd en opgelost | Verslag §5 — testbevindingen |

---

## Kerntaak 5 – Beheer & Documentatie

| Criterium | Bewijslast in dit project |
|---|---|
| Versiebeheer (Git/GitHub) | Deze repository — commit-geschiedenis |
| Installatie-instructies | README.md (stap-voor-stap) |
| Projectverslag | [docs/verslag/](../verslag/) — verslagauto.docx |
| Code leesbaar en onderhoudbaar | Duidelijke mapstructuur, Nederlandse variabelenamen |

---

## Gebruikte technieken

| Techniek | Versie | Toepassing |
|---|---|---|
| Node.js | 18+ | Backend runtime |
| Express | 4.x | Web framework, routing |
| MySQL | 8.x | Database (via MAMP) |
| EJS | 3.x | Templating (server-side rendering) |
| JWT | 9.x | Authenticatie tokens |
| bcryptjs | 2.x | Wachtwoord-hashing |
| Multer | 1.x | Afbeelding-uploads |
| HTML5 / CSS3 | — | Frontend |
| JavaScript (ES6+) | — | Client-side interactie |
| Git & GitHub | — | Versiebeheer |
