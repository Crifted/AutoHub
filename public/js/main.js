(function(){ if(localStorage.getItem('autohub-thema')==='licht') document.documentElement.classList.add('light'); })();

// ---- Vergelijking (localStorage) ----
var CMP_KEY = 'autohub-vergelijk';
var CMP_MAX = 4;

function getCmpList() {
  try { return JSON.parse(localStorage.getItem(CMP_KEY) || '[]'); } catch(e) { return []; }
}
function setCmpList(list) {
  localStorage.setItem(CMP_KEY, JSON.stringify(list));
}
function cmpToggle(id, merk, model) {
  var list = getCmpList();
  var idx = list.findIndex(function(x){ return x.id === id; });
  if (idx > -1) {
    list.splice(idx, 1);
    setCmpList(list);
    return true;
  }
  if (list.length >= CMP_MAX) {
    alert('Je kunt maximaal ' + CMP_MAX + " auto's tegelijk vergelijken.");
    return false;
  }
  list.push({ id: id, merk: merk, model: model });
  setCmpList(list);
  return true;
}
function syncCmpButtons() {
  var ids = getCmpList().map(function(x){ return x.id; });
  document.querySelectorAll('.car-cmp').forEach(function(btn){
    btn.classList.toggle('active', ids.indexOf(parseInt(btn.dataset.id)) > -1);
  });
  var detailBtn = document.getElementById('detailCmpBtn');
  if (detailBtn) {
    var inList = ids.indexOf(parseInt(detailBtn.dataset.id)) > -1;
    detailBtn.classList.toggle('active', inList);
    detailBtn.textContent = inList ? 'Uit vergelijking' : 'Vergelijk';
  }
}
function renderCmpBar() {
  var bar = document.getElementById('cmpBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'cmpBar';
    bar.className = 'cmp-bar';
    document.body.appendChild(bar);
  }
  var list = getCmpList();
  if (list.length === 0) { bar.classList.remove('show'); return; }
  var pills = list.map(function(x){
    return '<span class="cmp-pill">' + x.merk + ' ' + x.model +
      '<button class="cmp-pill-rm" data-id="' + x.id + '">&times;</button></span>';
  }).join('');
  var vergelijkLink = list.length >= 2
    ? '<a href="/vergelijken?ids=' + list.map(function(x){ return x.id; }).join(',') + '" class="btn btn-primary btn-sm">Vergelijk nu</a>'
    : '<span class="btn btn-primary btn-sm" style="opacity:.4;cursor:default;pointer-events:none;">Vergelijk nu</span>';
  bar.innerHTML =
    '<div class="cmp-bar-inner">' +
      '<div class="cmp-bar-cars">' + pills + '</div>' +
      '<div class="cmp-bar-actions">' +
        '<span class="muted" style="font-size:13px;">' + list.length + ' geselecteerd</span>' +
        vergelijkLink +
        '<button id="cmpClear" class="btn btn-ghost btn-sm">Wis</button>' +
      '</div>' +
    '</div>';
  bar.classList.add('show');
  bar.querySelectorAll('.cmp-pill-rm').forEach(function(btn){
    btn.addEventListener('click', function(){
      var newList = getCmpList().filter(function(x){ return x.id !== parseInt(btn.dataset.id); });
      setCmpList(newList);
      syncCmpButtons();
      renderCmpBar();
    });
  });
  var clearBtn = document.getElementById('cmpClear');
  if (clearBtn) clearBtn.addEventListener('click', function(){
    setCmpList([]);
    syncCmpButtons();
    renderCmpBar();
  });
}

document.addEventListener('DOMContentLoaded', function(){

  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  const tb = document.getElementById('themeBtn');
  if (tb) {
    const moon = tb.querySelector('.moon'), sun = tb.querySelector('.sun');
    const sync = () => { const l = document.documentElement.classList.contains('light'); if(moon)moon.style.display=l?'none':'block'; if(sun)sun.style.display=l?'block':'none'; };
    sync();
    tb.addEventListener('click', () => {
      document.documentElement.classList.toggle('light');
      localStorage.setItem('autohub-thema', document.documentElement.classList.contains('light')?'licht':'donker');
      sync();
    });
  }

  // Favorieten AJAX — incl. kaart-verwijdering op /favorieten en detail-knop update
  var isFavPage = window.location.pathname === '/favorieten';
  document.querySelectorAll('.fav-form').forEach(function(form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      var cardBtn = form.querySelector('.car-fav');
      var detailBtn = form.querySelector('.fav-detail-btn');
      try {
        const res = await fetch(form.action, { method:'POST', headers:{'Accept':'application/json'} });
        if(!res.ok){ form.submit(); return; }
        const data = await res.json();
        if (cardBtn) {
          cardBtn.classList.toggle('active', data.favoriet);
          if (!data.favoriet && isFavPage) {
            var card = form.closest('article.car');
            if (card) {
              card.style.transition = 'opacity .3s, transform .3s';
              card.style.opacity = '0';
              card.style.transform = 'scale(.95)';
              setTimeout(function(){
                card.remove();
                var grid = document.querySelector('.grid');
                if (grid && !grid.querySelector('article.car')) {
                  grid.outerHTML = '<div class="empty"><p>Je hebt nog geen favorieten opgeslagen.</p><a href="/aanbod" class="btn btn-primary">Bekijk aanbod</a></div>';
                }
              }, 300);
            }
          }
        } else if (detailBtn) {
          detailBtn.classList.toggle('active', data.favoriet);
          var svg = detailBtn.querySelector('svg');
          if (svg) {
            svg.style.fill = data.favoriet ? 'var(--hot)' : 'none';
            svg.style.stroke = data.favoriet ? 'var(--hot)' : 'currentColor';
          }
          var label = detailBtn.querySelector('span');
          if (label) label.textContent = data.favoriet ? 'In favorieten' : 'Bewaar favoriet';
        } else {
          form.submit();
        }
      } catch(err){ form.submit(); }
    });
  });

  const basis = document.getElementById('basisPrijs'), totaal = document.getElementById('totaalPrijs');
  if (basis && totaal) {
    const p = parseFloat(basis.dataset.prijs);
    const checks = document.querySelectorAll('.tuning-check');
    const herbereken = () => { let t=p; checks.forEach(c=>{if(c.checked)t+=parseFloat(c.dataset.prijs);}); totaal.textContent='€ '+t.toLocaleString('nl-NL'); updateFinance(); };
    checks.forEach(c=>c.addEventListener('change', herbereken));
  }

  const fin = document.getElementById('finance');
  function updateFinance() {
    if (!fin) return;
    const basisPrijs = parseFloat(fin.dataset.prijs);
    let prijs = basisPrijs;
    const tEl = document.getElementById('totaalPrijs');
    if (tEl) { const n = parseFloat(tEl.textContent.replace(/[^0-9]/g,'')); if(!isNaN(n)) prijs = n; }
    const aanbetaling = parseFloat(document.getElementById('finAanbetaal').value);
    const maanden = parseFloat(document.getElementById('finLooptijd').value);
    const teFinancieren = Math.max(0, prijs - aanbetaling);
    const jaarRente = 0.069, m = jaarRente / 12;
    const maandbedrag = m === 0 ? teFinancieren / maanden : (teFinancieren * m) / (1 - Math.pow(1 + m, -maanden));
    document.getElementById('finAanbetaalVal').textContent = '€ ' + aanbetaling.toLocaleString('nl-NL');
    document.getElementById('finLooptijdVal').textContent = maanden + ' maanden';
    document.getElementById('finBedrag').textContent = '€ ' + Math.round(teFinancieren).toLocaleString('nl-NL');
    document.getElementById('finMaand').textContent = '€ ' + (isFinite(maandbedrag) ? Math.round(maandbedrag).toLocaleString('nl-NL') : '0');
  }
  if (fin) {
    document.getElementById('finAanbetaal').addEventListener('input', updateFinance);
    document.getElementById('finLooptijd').addEventListener('input', updateFinance);
    updateFinance();
  }

  const obs = new IntersectionObserver(function(entries){
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); obs.unobserve(en.target);} });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

  // Vergelijk-knoppen op kaartjes
  document.querySelectorAll('.car-cmp').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      cmpToggle(parseInt(btn.dataset.id), btn.dataset.merk, btn.dataset.model);
      syncCmpButtons();
      renderCmpBar();
    });
  });

  // Vergelijk-knop op detailpagina
  var detailCmpBtn = document.getElementById('detailCmpBtn');
  if (detailCmpBtn) {
    detailCmpBtn.addEventListener('click', function(){
      var ok = cmpToggle(parseInt(detailCmpBtn.dataset.id), detailCmpBtn.dataset.merk, detailCmpBtn.dataset.model);
      if (ok !== false) { syncCmpButtons(); renderCmpBar(); }
    });
  }

  // Vergelijkenpagina — verwijder per auto + wis alles
  var vergelijkTbl = document.getElementById('vergelijkTbl');
  if (vergelijkTbl) {
    var currentIds = (vergelijkTbl.dataset.ids || '').split(',').map(Number).filter(Boolean);
    vergelijkTbl.querySelectorAll('.cmp-rm-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var removeId = parseInt(btn.dataset.id);
        setCmpList(getCmpList().filter(function(x){ return x.id !== removeId; }));
        var newIds = currentIds.filter(function(id){ return id !== removeId; });
        window.location.href = newIds.length ? '/vergelijken?ids=' + newIds.join(',') : '/vergelijken';
      });
    });
  }

  var vergelijkClear = document.getElementById('vergelijkClear');
  if (vergelijkClear) {
    vergelijkClear.addEventListener('click', function(){
      setCmpList([]);
      window.location.href = '/vergelijken';
    });
  }

  syncCmpButtons();
  renderCmpBar();
});

function wisselFoto(url, btn){
  const m = document.getElementById('mainImg');
  if(m) m.src = url;
  document.querySelectorAll('.gthumb').forEach(t=>t.classList.remove('active'));
  if(btn) btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function(){
  const checkAll = document.getElementById('checkAll');
  const rowChks = document.querySelectorAll('.row-chk');
  const bulkBar = document.getElementById('bulkBar');
  const bulkN = document.getElementById('bulkN');
  if (rowChks.length) {
    const sync = () => {
      const aantal = document.querySelectorAll('.row-chk:checked').length;
      if (bulkN) bulkN.textContent = aantal;
      if (bulkBar) bulkBar.classList.toggle('show', aantal > 0);
      if (checkAll) checkAll.checked = aantal === rowChks.length && aantal > 0;
    };
    if (checkAll) checkAll.addEventListener('change', () => { rowChks.forEach(c => c.checked = checkAll.checked); sync(); });
    rowChks.forEach(c => c.addEventListener('change', sync));
  }

  const input = document.getElementById('liveSearch');
  const box = document.getElementById('liveResults');
  if (!input || !box) return;
  let timer = null;

  const verberg = () => { box.classList.remove('show'); box.innerHTML = ''; };

  input.addEventListener('input', function(){
    const term = input.value.trim();
    clearTimeout(timer);
    if (term.length < 1) { verberg(); return; }
    timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/zoek?q=' + encodeURIComponent(term));
        const data = await res.json();
        if (!data.length) {
          box.innerHTML = '<div class="live-empty">Geen auto\'s gevonden voor "' + term + '"</div>';
          box.classList.add('show');
          return;
        }
        box.innerHTML = data.map(a =>
          '<a href="/auto/' + a.id + '" class="live-item">' +
            '<div class="live-thumb"><img src="' + a.afbeelding_url + '" onerror="this.onerror=null;this.src=\'/img/auto-placeholder.svg\';"></div>' +
            '<div class="live-info"><div class="live-name">' + a.merk + ' ' + a.model + '</div>' +
            '<div class="live-meta">' + a.bouwjaar + ' · ' + a.vermogen_pk + ' pk · ' + a.brandstof + '</div></div>' +
            '<div class="live-price">€ ' + Number(a.prijs).toLocaleString('nl-NL') + '</div>' +
          '</a>'
        ).join('');
        box.classList.add('show');
      } catch (e) { verberg(); }
    }, 220);
  });

  document.addEventListener('click', function(e){
    if (!input.contains(e.target) && !box.contains(e.target)) verberg();
  });
  input.addEventListener('focus', function(){ if (box.innerHTML) box.classList.add('show'); });
});
