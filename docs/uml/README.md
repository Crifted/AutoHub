# UML – AutoHub

Het UML-klassendiagram van AutoHub staat als PDF in deze map: [UML_AutoHub.pdf](./UML_AutoHub.pdf)

---

## Klassenstructuur (vereenvoudigd)

```
AutoController
  + overzicht()
  + detail()
  + vergelijken()
  + zoeken()

AuthController
  + loginFormulier()
  + login()
  + registreerFormulier()
  + registreer()
  + uitloggen()

AdminController
  + dashboard()
  + autosLijst()
  + autoToevoegen()
  + autoBewerken()
  + autoVerwijderen()
  + proefrittenLijst()
  + proefritStatusWijzigen()
  + reviewsLijst()
  + reviewVerwijderen()
  + gebruikersLijst()
  + gebruikerRolWijzigen()
  + gebruikerVerwijderen()

FavorietController
  + overzicht()
  + toggle()

ReviewController
  + plaatsen()

ProefritController
  + aanvragen()

ContactController
  + formulier()
  + versturen()

Auto (model)
  + zoekenEnFilteren()
  + vindOpId()
  + vindMeerdereOpIds()
  + nieuwste()
  + uitgelicht()
  + toevoegen()
  + bijwerken()
  + verwijderen()

User (model)
  + vindOpEmail()
  + vindOpId()
  + aanmaken()
  + alleGebruikers()
  + rolWijzigen()
  + verwijderen()

Favoriet (model)
  + ophalenVoorUser()
  + idsVoorUser()
  + isFavoriet()
  + toggle()

Review (model)
  + vindVoorAuto()
  + toevoegen()
  + verwijderen()

Proefrit (model)
  + aanvragen()
  + alleAanvragen()
  + statusWijzigen()

Contact (model)
  + opslaan()
  + alleberichten()
```
