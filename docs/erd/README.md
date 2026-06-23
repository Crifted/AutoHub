# ERD – AutoHub Database

Het volledige databasemodel van AutoHub, gegenereerd vanuit `database/schema.sql`.

Het PDF-bestand van het ERD staat ook in deze map: [ERD_AutoHub.pdf](./ERD_AutoHub.pdf)

---

```mermaid
erDiagram
    users {
        int id PK
        varchar naam
        varchar email
        varchar wachtwoord_hash
        enum rol
        datetime aangemaakt_op
    }

    autos {
        int id PK
        varchar merk
        varchar model
        int bouwjaar
        decimal prijs
        int vermogen_pk
        enum brandstof
        enum transmissie
        int kilometerstand
        varchar kleur
        text omschrijving
        varchar afbeelding_url
        tinyint is_nieuw
        tinyint is_populair
        datetime aangemaakt_op
    }

    auto_fotos {
        int id PK
        int auto_id FK
        varchar foto_url
        int volgorde
    }

    tuning_opties {
        int id PK
        int auto_id FK
        varchar naam
        decimal prijs_extra
    }

    favorieten {
        int id PK
        int user_id FK
        int auto_id FK
        datetime toegevoegd_op
    }

    reviews {
        int id PK
        int auto_id FK
        int user_id FK
        int sterren
        varchar titel
        text tekst
        datetime geplaatst_op
    }

    proefritten {
        int id PK
        int auto_id FK
        varchar naam
        varchar email
        varchar telefoon
        date gewenste_datum
        text opmerking
        enum status
        datetime aangevraagd_op
    }

    contactberichten {
        int id PK
        varchar naam
        varchar email
        varchar telefoon
        varchar onderwerp
        text bericht
        datetime verzonden_op
        tinyint gelezen
    }

    users ||--o{ favorieten : "slaat op"
    users ||--o{ reviews : "schrijft"
    autos ||--o{ auto_fotos : "heeft"
    autos ||--o{ tuning_opties : "heeft"
    autos ||--o{ favorieten : "wordt bewaard in"
    autos ||--o{ reviews : "ontvangt"
    autos ||--o{ proefritten : "krijgt aanvragen voor"
```

---

## Toelichting relaties

| Relatie | Type | Uitleg |
|---|---|---|
| `autos` → `auto_fotos` | 1 op n | Een auto kan meerdere galerij-foto's hebben |
| `autos` → `tuning_opties` | 1 op n | Een auto kan meerdere configuratie-opties hebben |
| `users` → `favorieten` | 1 op n | Een gebruiker kan meerdere auto's opslaan |
| `autos` → `favorieten` | 1 op n | Een auto kan door meerdere gebruikers worden opgeslagen |
| `users` → `reviews` | 1 op n | Een gebruiker kan meerdere reviews schrijven |
| `autos` → `reviews` | 1 op n | Een auto kan meerdere reviews ontvangen |
| `autos` → `proefritten` | 1 op n | Per auto kunnen meerdere proefritten worden aangevraagd |
| `contactberichten` | onafhankelijk | Staat los van users (ook bezoekers kunnen contact opnemen) |
