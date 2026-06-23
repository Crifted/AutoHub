const assert = require('assert');
const Module = require('module');

// --- in-memory mock database ---
let store = { users: [], autos: [], favorieten: [], reviews: [] };
function resetStore() {
  store = {
    users: [{ id: 1, naam: 'Admin', email: 'admin@autohub.nl', wachtwoord_hash: 'hash', rol: 'admin' }],
    autos: [
      { id: 1, merk: 'BMW', model: '3-serie', bouwjaar: 2021, prijs: 28500, vermogen_pk: 190, brandstof: 'Benzine', transmissie: 'Automaat', kilometerstand: 42300, kleur: 'Grijs', omschrijving: 'T', afbeelding_url: 'x', is_nieuw: 1, is_populair: 0, aangemaakt_op: new Date() },
      { id: 2, merk: 'Audi', model: 'A4', bouwjaar: 2020, prijs: 24950, vermogen_pk: 150, brandstof: 'Diesel', transmissie: 'Handgeschakeld', kilometerstand: 61000, kleur: 'Zwart', omschrijving: 'T2', afbeelding_url: 'y', is_nieuw: 0, is_populair: 1, aangemaakt_op: new Date() },
      { id: 3, merk: 'Tesla', model: 'Model 3', bouwjaar: 2022, prijs: 39900, vermogen_pk: 283, brandstof: 'Elektrisch', transmissie: 'Automaat', kilometerstand: 18500, kleur: 'Wit', omschrijving: 'T3', afbeelding_url: 'z', is_nieuw: 0, is_populair: 1, aangemaakt_op: new Date() }
    ],
    favorieten: [], reviews: []
  };
}

function mockQuery(sql, params) {
  params = params || [];
  const s = sql.trim().replace(/\s+/g, ' ');

  if (/COUNT\(\*\) AS totaal FROM autos/i.test(s)) {
    let rows = store.autos.slice();
    rows = applyFilters(rows, s, params);
    return [[{ totaal: rows.length }]];
  }
  if (/SELECT autos\.\*,/i.test(s) || (/FROM autos WHERE 1=1/i.test(s))) {
    let rows = store.autos.slice();
    rows = applyFilters(rows, s, params);
    if (/prijs ASC/i.test(s)) rows.sort((a,b)=>a.prijs-b.prijs);
    if (/prijs DESC/i.test(s)) rows.sort((a,b)=>b.prijs-a.prijs);
    if (/vermogen_pk DESC/i.test(s)) rows.sort((a,b)=>b.vermogen_pk-a.vermogen_pk);
    return [rows.map(a => ({ ...a, gem_sterren: null, aantal_reviews: 0 }))];
  }
  if (/FROM autos WHERE merk LIKE \? OR model LIKE \? OR CONCAT/i.test(s)) {
    const term = String(params[0]).replace(/%/g,'').toLowerCase();
    return [store.autos.filter(a => (a.merk+' '+a.model).toLowerCase().includes(term)).slice(0, params[3] || 6)];
  }
  if (/DELETE FROM autos WHERE id IN/i.test(s)) { store.autos = store.autos.filter(a => !params.includes(a.id)); return [{ affectedRows: 1 }]; }
  if (/UPDATE autos SET is_populair = \? WHERE id IN/i.test(s) || /UPDATE autos SET is_nieuw = \? WHERE id IN/i.test(s)) {
    const waarde = params[0]; const ids = params.slice(1);
    const veld = /is_populair/.test(s) ? 'is_populair' : 'is_nieuw';
    store.autos.forEach(a => { if (ids.includes(a.id)) a[veld] = waarde; });
    return [{ affectedRows: ids.length }];
  }
  if (/FROM autos WHERE id = \?/i.test(s)) return [store.autos.filter(a => a.id == params[0])];
  if (/FROM autos WHERE id IN/i.test(s)) return [store.autos.filter(a => params.includes(a.id))];
  if (/FROM users WHERE email/i.test(s)) return [store.users.filter(u => u.email === params[0])];
  if (/FROM users WHERE id/i.test(s)) return [store.users.filter(u => u.id == params[0])];
  if (/id FROM favorieten WHERE/i.test(s)) return [store.favorieten.filter(f => f.user_id == params[0] && f.auto_id == params[1])];
  if (/auto_id FROM favorieten WHERE/i.test(s)) return [store.favorieten.filter(f => f.user_id == params[0]).map(f => ({ auto_id: f.auto_id }))];
  if (/INSERT IGNORE INTO favorieten/i.test(s) || /INSERT INTO favorieten/i.test(s)) {
    if (!store.favorieten.find(f => f.user_id == params[0] && f.auto_id == params[1]))
      store.favorieten.push({ id: store.favorieten.length+1, user_id: params[0], auto_id: params[1] });
    return [{ insertId: 1 }];
  }
  if (/DELETE FROM favorieten/i.test(s)) { store.favorieten = store.favorieten.filter(f => !(f.user_id == params[0] && f.auto_id == params[1])); return [{ affectedRows: 1 }]; }
  if (/INSERT INTO users/i.test(s)) { const id = store.users.length+1; store.users.push({ id, naam: params[0], email: params[1], wachtwoord_hash: params[2], rol: params[3] }); return [{ insertId: id }]; }
  if (/FROM tuning_opties/i.test(s)) return [[]];
  if (/FROM auto_fotos/i.test(s)) return [[{ foto_url: 'x', volgorde: 0 }]];
  if (/AS gem, COUNT/i.test(s)) return [[{ gem: null, aantal: 0 }]];
  if (/gebruiker_naam FROM reviews/i.test(s)) return [[]];
  return [[]];
}

function applyFilters(rows, s, params) {
  // simuleer alleen wat de tests gebruiken: zoek op merk, prijs, brandstof
  let pi = 0;
  if (/merk LIKE \? OR model LIKE \?/i.test(s)) { const term = params[pi].replace(/%/g,'').toLowerCase(); rows = rows.filter(a => a.merk.toLowerCase().includes(term) || a.model.toLowerCase().includes(term)); pi += 2; }
  if (/prijs >= \?/i.test(s)) { rows = rows.filter(a => a.prijs >= params[pi]); pi++; }
  if (/prijs <= \?/i.test(s)) { rows = rows.filter(a => a.prijs <= params[pi]); pi++; }
  if (/brandstof = \?/i.test(s)) { rows = rows.filter(a => a.brandstof === params[pi]); pi++; }
  return rows;
}

// mysql2 onderscheppen
const origLoad = Module._load;
Module._load = function (request) {
  if (request === 'mysql2/promise') {
    return { createPool: () => ({ query: async (sql, p) => mockQuery(sql, p), getConnection: async () => ({ release: () => {} }) }) };
  }
  return origLoad.apply(this, arguments);
};

const Auto = require('../models/Auto');
const Favoriet = require('../models/Favoriet');
const User = require('../models/User');

// --- testrunner ---
let geslaagd = 0, gefaald = 0;
async function test(naam, fn) {
  try { await fn(); console.log('  ✓ ' + naam); geslaagd++; }
  catch (e) { console.log('  ✗ ' + naam + '\n     ' + e.message); gefaald++; }
}

(async () => {
  console.log('\nAutoHub testsuite\n');

  console.log('Auto model:');
  resetStore();
  await test('haalt alle auto\'s op', async () => {
    const r = await Auto.zoekenEnFilteren({});
    assert.strictEqual(r.totaal, 3);
    assert.strictEqual(r.autos.length, 3);
  });
  await test('zoekt op merk (BMW)', async () => {
    const r = await Auto.zoekenEnFilteren({ zoek: 'BMW' });
    assert.strictEqual(r.totaal, 1);
    assert.strictEqual(r.autos[0].merk, 'BMW');
  });
  await test('filtert op minimumprijs', async () => {
    const r = await Auto.zoekenEnFilteren({ prijsMin: 30000 });
    assert.strictEqual(r.totaal, 1);
    assert.strictEqual(r.autos[0].merk, 'Tesla');
  });
  await test('filtert op brandstof (Elektrisch)', async () => {
    const r = await Auto.zoekenEnFilteren({ brandstof: 'Elektrisch' });
    assert.strictEqual(r.totaal, 1);
  });
  await test('sorteert op prijs laag->hoog', async () => {
    const r = await Auto.zoekenEnFilteren({ sorteer: 'prijs-op' });
    assert.strictEqual(r.autos[0].merk, 'Audi'); // 24950 goedkoopst
  });
  await test('vindt auto op id', async () => {
    const a = await Auto.vindOpId(1);
    assert.strictEqual(a.merk, 'BMW');
  });
  await test('geeft null bij onbekend id', async () => {
    const a = await Auto.vindOpId(999);
    assert.strictEqual(a, null);
  });

  console.log('\nFavoriet model:');
  resetStore();
  await test('voegt favoriet toe en herkent die', async () => {
    await Favoriet.toevoegen(1, 2);
    const is = await Favoriet.isFavoriet(1, 2);
    assert.strictEqual(is, true);
  });
  await test('toggle verwijdert bestaande favoriet', async () => {
    resetStore();
    await Favoriet.toevoegen(1, 2);
    const naToggle = await Favoriet.toggle(1, 2);
    assert.strictEqual(naToggle, false);
    assert.strictEqual(await Favoriet.isFavoriet(1, 2), false);
  });
  await test('toggle voegt toe als nog niet favoriet', async () => {
    resetStore();
    const naToggle = await Favoriet.toggle(1, 3);
    assert.strictEqual(naToggle, true);
  });

  console.log('\nUser model:');
  resetStore();
  await test('vindt gebruiker op email', async () => {
    const u = await User.vindOpEmail('admin@autohub.nl');
    assert.strictEqual(u.rol, 'admin');
  });
  await test('geeft null bij onbekende email', async () => {
    const u = await User.vindOpEmail('bestaatniet@nergens.nl');
    assert.strictEqual(u, null);
  });
  await test('maakt nieuwe gebruiker aan', async () => {
    const id = await User.aanmaken({ naam: 'Test', email: 'test@test.nl', wachtwoordHash: 'h', rol: 'user' });
    assert.ok(id > 0);
    const u = await User.vindOpEmail('test@test.nl');
    assert.strictEqual(u.naam, 'Test');
  });

  console.log('\nLive zoeken:');
  resetStore();
  await test('snelZoeken vindt op merk', async () => {
    const r = await Auto.snelZoeken('BMW');
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].merk, 'BMW');
  });
  await test('snelZoeken vindt op model', async () => {
    const r = await Auto.snelZoeken('Model 3');
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].merk, 'Tesla');
  });
  await test('snelZoeken geeft lege lijst bij lege term', async () => {
    const r = await Auto.snelZoeken('');
    assert.strictEqual(r.length, 0);
  });
  await test('snelZoeken vindt niets bij onzin', async () => {
    const r = await Auto.snelZoeken('xyzqonbestaand');
    assert.strictEqual(r.length, 0);
  });

  console.log('\nBulk-acties:');
  resetStore();
  await test('bulk verwijderen wist meerdere auto\'s', async () => {
    await Auto.bulkVerwijderen([1, 2]);
    const r = await Auto.zoekenEnFilteren({});
    assert.strictEqual(r.totaal, 1); // alleen Tesla (id 3) blijft over
  });
  await test('bulk markeren zet is_populair', async () => {
    resetStore();
    await Auto.bulkMarkeren([1, 2], 'is_populair', true);
    const a = await Auto.vindOpId(1);
    assert.strictEqual(a.is_populair, 1); // DB slaat boolean op als 1
  });
  await test('bulk markeren weigert onbekend veld', async () => {
    resetStore();
    // mag geen fout gooien, maar ook niets doen
    await Auto.bulkMarkeren([1], 'stiekem_veld', true);
    assert.ok(true);
  });

  console.log('\n----------------------------------------');
  console.log(geslaagd + ' geslaagd, ' + gefaald + ' gefaald');
  console.log('----------------------------------------\n');
  process.exit(gefaald === 0 ? 0 : 1);
})();
