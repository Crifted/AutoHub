# Testrapport – AutoHub

Het volledige testrapport staat als PDF in deze map: [Testrapport_AutoHub.pdf](./Testrapport_AutoHub.pdf)

---

## Geautomatiseerde tests

Draai de geautomatiseerde testsuite:

```bash
npm test
```

Tests staan in `tests/app.test.js` en controleren:
- Zoeken en filteren van auto's
- Sortering
- Favorieten-logica
- Gebruikersmodel

De tests draaien zonder database (in-memory mock).

---

## Handmatige testscenario's

| # | Scenario | Verwacht | Resultaat |
|---|---|---|---|
| 1 | Homepage laden | Alle secties zichtbaar | Geslaagd |
| 2 | Zoeken op merk | Correcte resultaten | Geslaagd |
| 3 | Filteren op prijs | Resultaten binnen bereik | Geslaagd |
| 4 | Registreren nieuwe gebruiker | Account aangemaakt, ingelogd | Geslaagd |
| 5 | Inloggen bestaande gebruiker | Redirect naar homepage | Geslaagd |
| 6 | Favoriet toevoegen (ingelogd) | Hartje wordt actief (AJAX) | Geslaagd |
| 7 | Favoriet verwijderen op /favorieten | Kaart verdwijnt direct | Geslaagd |
| 8 | Proefrit aanvragen | Bevestigingsmelding zichtbaar | Geslaagd |
| 9 | Review plaatsen | Review zichtbaar op detailpagina | Geslaagd |
| 10 | Vergelijken 2 auto's | Tabel met beide auto's | Geslaagd |
| 11 | Admin — auto toevoegen | Auto zichtbaar in aanbod | Geslaagd |
| 12 | Admin — gebruikersrol wijzigen | Rol bijgewerkt | Geslaagd |
| 13 | Niet-admin probeert /admin | 403 foutpagina | Geslaagd |
| 14 | Niet-ingelogd probeert /favorieten | Redirect naar /login | Geslaagd |
