require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// --- Foto-pool per carrosserie/merk (echte Unsplash foto's, stabiele id's) ---
const fotoPool = {
  sport:   ['photo-1503376780353-7e6692767b70','photo-1544636331-e26879cd4d9b','photo-1583121274602-3e2820c69888','photo-1614162692292-7ac56d7f7f1e'],
  sedan:   ['photo-1555215695-3004980ad54e','photo-1606664515524-ed2f786a0bd6','photo-1618843479313-40f8afb4b4d8','photo-1549399542-7e3f8b79c341'],
  suv:     ['photo-1606220588913-b3aacb4d2f46','photo-1632245889029-e406faaa34cd','photo-1617469767053-d3b523a0b982','photo-1568844293986-8d0400bd4745'],
  hatch:   ['photo-1541899481282-d53bffe3c35d','photo-1551830820-330a71b99659','photo-1549317661-bd32c8ce0db2','photo-1617814076367-b759c7d7e738'],
  ev:      ['photo-1560958089-b8a1929cea89','photo-1593941707882-a5bba14938c7','photo-1571127236794-81c0bbfe1ce3','photo-1610915736329-78b95c1b7c1d']
};
const galerijExtra = ['photo-1503736334956-4c8f8e92946d','photo-1492144534655-ae79c964c9d7','photo-1494976388531-d1058494cdd8'];
const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

// --- Basismodellen: [merk, model, type, basisprijs2024, pk, brandstof, transmissie] ---
const modellen = [
  ['BMW','3-serie','sedan',45000,190,'Benzine','Automaat'],
  ['BMW','5-serie','sedan',62000,252,'Hybride','Automaat'],
  ['BMW','X5','suv',82000,340,'Diesel','Automaat'],
  ['BMW','M4','sport',98000,510,'Benzine','Automaat'],
  ['BMW','i4','ev',58000,340,'Elektrisch','Automaat'],
  ['Audi','A3','hatch',34000,150,'Benzine','Handgeschakeld'],
  ['Audi','A4 Avant','sedan',46000,204,'Diesel','Automaat'],
  ['Audi','Q5','suv',58000,265,'Hybride','Automaat'],
  ['Audi','RS6','sport',128000,600,'Benzine','Automaat'],
  ['Audi','e-tron GT','ev',105000,476,'Elektrisch','Automaat'],
  ['Mercedes-Benz','A-klasse','hatch',33000,163,'Benzine','Automaat'],
  ['Mercedes-Benz','C-klasse','sedan',48000,204,'Hybride','Automaat'],
  ['Mercedes-Benz','GLC','suv',64000,258,'Diesel','Automaat'],
  ['Mercedes-Benz','AMG GT','sport',135000,530,'Benzine','Automaat'],
  ['Mercedes-Benz','EQE','ev',74000,292,'Elektrisch','Automaat'],
  ['Volkswagen','Golf','hatch',32000,150,'Benzine','Handgeschakeld'],
  ['Volkswagen','Passat','sedan',42000,190,'Diesel','Automaat'],
  ['Volkswagen','Tiguan','suv',46000,190,'Benzine','Automaat'],
  ['Volkswagen','ID.4','ev',45000,204,'Elektrisch','Automaat'],
  ['Tesla','Model 3','ev',44000,283,'Elektrisch','Automaat'],
  ['Tesla','Model Y','ev',52000,351,'Elektrisch','Automaat'],
  ['Tesla','Model S','ev',95000,670,'Elektrisch','Automaat'],
  ['Toyota','Yaris','hatch',24000,116,'Hybride','Automaat'],
  ['Toyota','Corolla','hatch',30000,140,'Hybride','Automaat'],
  ['Toyota','RAV4','suv',45000,222,'Hybride','Automaat'],
  ['Porsche','718 Cayman','sport',75000,300,'Benzine','Automaat'],
  ['Porsche','911 Carrera','sport',135000,385,'Benzine','Automaat'],
  ['Porsche','Taycan','ev',105000,476,'Elektrisch','Automaat'],
  ['Porsche','Macan','suv',72000,265,'Benzine','Automaat'],
  ['Volvo','XC40','suv',44000,197,'Hybride','Automaat'],
  ['Volvo','XC60','suv',58000,250,'Hybride','Automaat'],
  ['Volvo','V60','sedan',48000,197,'Diesel','Automaat'],
  ['Peugeot','208','hatch',23000,100,'Benzine','Automaat'],
  ['Peugeot','308','hatch',30000,130,'Benzine','Automaat'],
  ['Peugeot','3008','suv',40000,180,'Hybride','Automaat'],
  ['Renault','Clio','hatch',22000,90,'Benzine','Handgeschakeld'],
  ['Renault','Megane E-Tech','ev',38000,220,'Elektrisch','Automaat'],
  ['Ford','Focus','hatch',28000,125,'Benzine','Handgeschakeld'],
  ['Ford','Puma','suv',32000,155,'Benzine','Automaat'],
  ['Ford','Mustang Mach-E','ev',56000,294,'Elektrisch','Automaat'],
  ['Hyundai','i30','hatch',27000,120,'Benzine','Handgeschakeld'],
  ['Hyundai','Tucson','suv',42000,150,'Hybride','Automaat'],
  ['Hyundai','IONIQ 5','ev',48000,229,'Elektrisch','Automaat'],
  ['Kia','Ceed','hatch',28000,140,'Benzine','Handgeschakeld'],
  ['Kia','Sportage','suv',43000,160,'Hybride','Automaat'],
  ['Kia','EV6','ev',52000,229,'Elektrisch','Automaat'],
  ['Mazda','Mazda3','hatch',29000,150,'Benzine','Handgeschakeld'],
  ['Mazda','CX-5','suv',42000,165,'Benzine','Automaat'],
  ['Mazda','MX-5','sport',38000,184,'Benzine','Handgeschakeld'],
  ['Skoda','Octavia','sedan',34000,150,'Diesel','Automaat'],
  ['Skoda','Kodiaq','suv',46000,190,'Benzine','Automaat'],
  ['Mini','Cooper','hatch',30000,136,'Benzine','Automaat'],
  ['Mini','Countryman','suv',38000,178,'Hybride','Automaat'],
  ['Fiat','500e','ev',30000,118,'Elektrisch','Automaat'],
  ['Nissan','Qashqai','suv',38000,158,'Benzine','Automaat'],
  ['Nissan','Leaf','ev',37000,150,'Elektrisch','Automaat'],
  ['Seat','Leon','hatch',29000,150,'Benzine','Handgeschakeld'],
  ['Cupra','Formentor','suv',48000,245,'Hybride','Automaat'],
  ['Citroen','C3','hatch',21000,83,'Benzine','Handgeschakeld'],
  ['Opel','Astra','hatch',30000,130,'Benzine','Automaat'],
  ['Opel','Mokka-e','ev',38000,136,'Elektrisch','Automaat']
];

const kleuren = ['Zwart metallic','Wit','Zilvergrijs','Antraciet','Donkerblauw','Rood','Grijs metallic','Groen','Beige','Champagne'];
const omschrijvingen = [
  'In nieuwstaat verkerend exemplaar met volledige onderhoudshistorie en dealeronderhoud.',
  'Zeer compleet uitgevoerd met navigatie, climate control en parkeersensoren.',
  'Eerste eigenaar, niet-roker, altijd in de garage gestald. Rijklaar geleverd.',
  'Sportieve uitvoering met lichtmetalen velgen en getint glas. Recent grote beurt.',
  'Comfortabele gezinsauto met ruime kofferbak en lage kilometerstand.',
  'Zuinig en betrouwbaar, perfect voor woon-werkverkeer. Nieuwe APK bij aflevering.',
  'Luxe uitvoering met lederen interieur, stoelverwarming en panoramadak.',
  'Krachtige motor gecombineerd met een verfijnde afwerking. Een echte aanrader.'
];

const tuningPerType = {
  sport: [['Sport uitlaatsysteem',1850],['Carbon spoilerpakket',2400],['Verlaagd sportonderstel',1600],['Chiptuning Stage 1',1200]],
  sedan: [['Lederen bekleding',1800],['Adaptieve cruise control',950],['19 inch velgen',1400]],
  suv:   [['Trekhaak afneembaar',850],['Panoramadak',1500],['Dakdragers + box',650]],
  hatch: [['Apple CarPlay pakket',450],['Sportstoelen',900],['LED koplampen',700]],
  ev:    [['Snellaadpakket 150kW',1900],['Warmtepomp',1100],['Autopilot upgrade',3500]]
};

function bouwAutos() {
  const lijst = [];
  const nu = 2024;
  modellen.forEach((m, idx) => {
    const [merk, model, type, basis2024, pk, brandstof, transmissie] = m;
    // 1 of 2 varianten per model (verschillende bouwjaren), totaal ~80
    const aantalVarianten = (idx % 3 === 0) ? 2 : 1;
    for (let v = 0; v < aantalVarianten; v++) {
      const bouwjaar = nu - (v === 0 ? (idx % 5) : (3 + idx % 4)); // 2019-2024
      const leeftijd = nu - bouwjaar;
      // afschrijving ~11% per jaar
      const prijs = Math.round((basis2024 * Math.pow(0.89, leeftijd)) / 100) * 100;
      const km = leeftijd === 0 ? 1000 + (idx*137 % 9000) : leeftijd * (12000 + (idx*311 % 9000));
      const kleur = kleuren[(idx + v) % kleuren.length];
      const omschrijving = omschrijvingen[(idx + v) % omschrijvingen.length];
      const isNieuw = leeftijd <= 1 ? 1 : 0;
      const isPopulair = (idx % 4 === 0) ? 1 : 0;
      const fotos = fotoPool[type];
      const hoofdfoto = U(fotos[(idx + v) % fotos.length]);
      lijst.push({
        merk, model: model + (pk >= 400 ? ' '+pk+'pk' : ''), bouwjaar, prijs, pk, brandstof, transmissie,
        km, kleur, omschrijving, isNieuw, isPopulair, hoofdfoto, type
      });
    }
  });
  return lijst;
}

const reviewsData = [
  [5,'Topauto, rijdt heerlijk','Echt een fantastische auto. Soepele motor en strakke afwerking. Aanrader!'],
  [4,'Goede prijs-kwaliteit','Voor deze prijs een hele nette auto. Kleine gebruikssporen maar verder prima.'],
  [5,'Zeer tevreden','Snelle levering en precies zoals beschreven. Top ervaring met AutoHub.'],
  [3,'Prima, verbruik valt tegen','Mooie auto, alleen het verbruik is wat hoger dan ik had verwacht.'],
  [5,'Mijn beste aankoop','Rijdt als nieuw, niets op aan te merken. Zou zo weer hier kopen.'],
  [4,'Fijne gezinsauto','Veel ruimte en comfortabel op lange ritten. Blij mee.']
];

async function seed() {
  try {
    console.log('Database seeden gestart...');
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of ['reviews','proefritten','auto_fotos','favorieten','tuning_opties','contactberichten','autos','users']) {
      await pool.query('TRUNCATE TABLE ' + t);
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    // users
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('test1234', 10);
    await pool.query('INSERT INTO users (naam, email, wachtwoord_hash, rol) VALUES (?, ?, ?, ?)', ['Admin', 'admin@autohub.nl', adminHash, 'admin']);
    const [userRes] = await pool.query('INSERT INTO users (naam, email, wachtwoord_hash, rol) VALUES (?, ?, ?, ?)', ['Marco', 'marco@voorbeeld.nl', userHash, 'user']);
    const marcoId = userRes.insertId;
    // een paar extra gebruikers voor gebruikersbeheer-demo
    for (const naam of ['Sophie Bakker','Tim de Jong','Lisa Visser']) {
      const h = await bcrypt.hash('test1234', 10);
      await pool.query('INSERT INTO users (naam, email, wachtwoord_hash, rol) VALUES (?, ?, ?, ?)',
        [naam, naam.toLowerCase().replace(/ /g,'.').replace(/[^a-z.]/g,'')+'@voorbeeld.nl', h, 'user']);
    }
    console.log('5 gebruikers aangemaakt (admin@autohub.nl / admin123, marco@voorbeeld.nl / test1234)');

    // autos
    const autos = bouwAutos();
    const autoIds = [];
    const autoTypes = [];
    for (const a of autos) {
      const [r] = await pool.query(
        `INSERT INTO autos (merk, model, bouwjaar, prijs, vermogen_pk, brandstof, transmissie, kilometerstand, kleur, omschrijving, is_nieuw, is_populair, afbeelding_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.merk, a.model, a.bouwjaar, a.prijs, a.pk, a.brandstof, a.transmissie, a.km, a.kleur, a.omschrijving, a.isNieuw, a.isPopulair, a.hoofdfoto]);
      autoIds.push(r.insertId);
      autoTypes.push(a.type);
      // galerij: hoofdfoto + 2 sfeerbeelden
      await pool.query('INSERT INTO auto_fotos (auto_id, foto_url, volgorde) VALUES (?, ?, 0)', [r.insertId, a.hoofdfoto]);
      for (let i = 0; i < 2; i++) {
        await pool.query('INSERT INTO auto_fotos (auto_id, foto_url, volgorde) VALUES (?, ?, ?)', [r.insertId, U(galerijExtra[i % galerijExtra.length]), i+1]);
      }
    }
    console.log(autos.length + ' auto\'s toegevoegd (met galerij-foto\'s)');

    // tuning per type
    let tuningCount = 0;
    for (let i = 0; i < autoIds.length; i++) {
      const opties = tuningPerType[autoTypes[i]] || [];
      // pak 2-3 opties
      const n = 2 + (i % 2);
      for (let j = 0; j < Math.min(n, opties.length); j++) {
        await pool.query('INSERT INTO tuning_opties (auto_id, naam, prijs_extra) VALUES (?, ?, ?)', [autoIds[i], opties[j][0], opties[j][1]]);
        tuningCount++;
      }
    }
    console.log(tuningCount + ' tuning-opties toegevoegd');

    // reviews verspreid over ~20 auto's
    let revCount = 0;
    for (let i = 0; i < Math.min(20, autoIds.length); i++) {
      const aantal = 1 + (i % 3); // 1-3 reviews
      for (let j = 0; j < aantal; j++) {
        const rev = reviewsData[(i + j) % reviewsData.length];
        await pool.query('INSERT INTO reviews (auto_id, user_id, sterren, titel, tekst) VALUES (?, ?, ?, ?, ?)',
          [autoIds[i], marcoId, rev[0], rev[1], rev[2]]);
        revCount++;
      }
    }
    console.log(revCount + ' reviews toegevoegd');

    // proefritten
    const prData = [
      [autoIds[0],'Jan Jansen','jan@voorbeeld.nl','0612345678','2026-07-01','Graag in de ochtend','aangevraagd'],
      [autoIds[3],'Lisa de Vries','lisa@voorbeeld.nl','0698765432','2026-07-03','','bevestigd'],
      [autoIds[7],'Peter Smit','peter@voorbeeld.nl','0611223344','2026-07-05','Liefst weekend','aangevraagd'],
      [autoIds[12],'Emma Bos','emma@voorbeeld.nl','0655667788','2026-06-28','','afgerond']
    ];
    for (const p of prData) {
      await pool.query('INSERT INTO proefritten (auto_id, naam, email, telefoon, gewenste_datum, opmerking, status) VALUES (?, ?, ?, ?, ?, ?, ?)', p);
    }
    console.log(prData.length + ' proefrit-aanvragen toegevoegd');

    // een paar contactberichten voor de demo
    const berichten = [
      ['Kevin Mulder','kevin@voorbeeld.nl','0612000000','Vraag over financiering','Hallo, is financiering mogelijk op de Tesla Model 3? Graag meer info.'],
      ['Anna Peters','anna@voorbeeld.nl',null,'Inruil mogelijk?','Ik heb een auto om in te ruilen, kan dat bij jullie?']
    ];
    for (const b of berichten) {
      await pool.query('INSERT INTO contactberichten (naam, email, telefoon, onderwerp, bericht) VALUES (?, ?, ?, ?, ?)', b);
    }
    console.log(berichten.length + ' contactberichten toegevoegd');

    console.log('Seeden voltooid! (' + autos.length + ' auto\'s)');
    process.exit(0);
  } catch (err) {
    console.error('Fout tijdens seeden:', err);
    process.exit(1);
  }
}

seed();
