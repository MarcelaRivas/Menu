(function () {
  'use strict';

  /* ---------- Datos ---------- */
  var A = '../assets/';
  // Recortes de las 2 fotos aptas (foto-4 y foto-5, paisaje del club). Las demás son capturas/logos.
  var CROPS = [
    { src: A + 'foto-4.png', pos: '20% 30%' }, { src: A + 'foto-4.png', pos: '85% 70%' },
    { src: A + 'foto-4.png', pos: '50% 55%' }, { src: A + 'foto-5.jpeg', pos: '50% 45%' },
    { src: A + 'foto-5.jpeg', pos: '15% 60%' }, { src: A + 'foto-5.jpeg', pos: '85% 40%' }
  ];
  var SEDES = [
    { id: 'principal', nombre: 'Sede Principal', desc: 'Salón con vista a los jardines del club.', foto: CROPS[2] },
    { id: 'norte', nombre: 'Sede Norte', desc: 'Terraza junto al campo, ideal para el almuerzo.', foto: CROPS[3] },
    { id: 'sanfernando', nombre: 'Sede San Fernando', desc: 'Atención de jueves a domingo.', foto: null }
  ];
  var P = function (n, d, pr, o) { o = o || {}; return { n: n, d: d, pr: pr, f: o.f, rec: o.rec, nue: o.nue, ago: o.ago, sub: o.sub }; };
  var LONG = 'Selección de hongos silvestres salteados en mantequilla de hierbas, servidos tibios sobre un lecho de hojas verdes, queso de cabra gratinado, nueces caramelizadas, vinagreta de miel y mostaza antigua, acompañados de pan artesanal de masa madre tostado al momento y aceite de oliva extra virgen de primera prensada.';
  var CATS = [
    { id: 1, nombre: 'Entradas', foto: CROPS[0], prods: [
      P('Carpaccio de res', 'Láminas finas de lomo con rúcula, parmesano y aceite de oliva.', [['Individual', 28000], ['Para compartir', 52000]], { f: 0, rec: 1 }),
      P('Ceviche de camarón', 'Camarón fresco, limón, cilantro y cebolla morada.', [['Porción', 32000]], { f: 1, nue: 1 }),
      P('Empanadas de la casa', 'Masa de maíz crocante rellena de carne desmechada y hogao.', [['x4', 18000], ['x8', 34000]], { f: 3 }),
      P('Tostada de aguacate y burrata con tomates confitados y reducción balsámica', 'Pan artesanal, aguacate maduro y burrata cremosa.', [['Porción', 30000]], { f: 4 }),
      P('Ensalada tibia de hongos silvestres', LONG, [['Individual', 29000], ['Para compartir', 54000], ['Familiar', 78000]], { f: 5 }),
      P('Patacones con hogao', 'Plátano verde frito con hogao y queso costeño.', [['Porción', 19000]], { f: 2, ago: 1 }),
      P('Chicharrón crocante', 'Cerdo apanado con arepitas y limón.', [['Porción', 24000]])
    ] },
    { id: 2, nombre: 'Sopas y Cremas', foto: CROPS[3], prods: [
      P('Ajiaco santafereño', 'Tres tipos de papa, pollo, mazorca y guascas; con crema, alcaparras y aguacate.', [['Taza', 22000], ['Plato', 34000]], { f: 3, rec: 1 }),
      P('Crema de tomate asado', 'Tomates asados al horno con albahaca y crotones.', [['Taza', 16000], ['Plato', 24000]], { f: 1, nue: 1 }),
      P('Sancocho de gallina', 'Gallina criolla, yuca, plátano y mazorca.', [['Pequeño', 26000], ['Mediano', 36000], ['Para compartir', 62000]], { f: 4 }),
      P('Sopa de lentejas', 'Lentejas guisadas con tocineta y vegetales.', [['Plato', 20000]], { f: 0 }),
      P('Crema de champiñones', 'Champiñones frescos y un toque de vino blanco.', [['Plato', 22000]], { f: 5, ago: 1 }),
      P('Consomé de res', 'Caldo clarificado con vegetales finos.', [['Taza', 14000]])
    ] },
    { id: 3, nombre: 'Carnes y Parrilla', foto: CROPS[4], subs: ['Res', 'Cerdo y aves'], prods: [
      P('Lomo fino a la parrilla', 'Corte jugoso con papas rústicas y chimichurri.', [['250 g', 62000], ['350 g', 79000]], { f: 4, rec: 1, sub: 'Res' }),
      P('Churrasco argentino', 'Con papa criolla y ensalada fresca.', [['300 g', 58000]], { f: 0, sub: 'Res' }),
      P('T-Bone al carbón', 'Corte con hueso, mantequilla de ajo y vegetales.', [['450 g', 89000]], { f: 2, nue: 1, sub: 'Res' }),
      P('Punta de anca', 'Marinada con hierbas, servida con yuca frita.', [['300 g', 56000]], { sub: 'Res' }),
      P('Costillas BBQ', 'Costillas de cerdo glaseadas con salsa de la casa.', [['Media', 48000], ['Completa', 84000]], { f: 1, sub: 'Cerdo y aves' }),
      P('Pechuga rellena', 'Rellena de espinaca y queso, salsa de champiñones.', [['Plato', 41000]], { f: 3, sub: 'Cerdo y aves' }),
      P('Chuleta ahumada', 'Chuleta de cerdo ahumada con puré de manzana.', [['Plato', 44000]], { f: 5, ago: 1, sub: 'Cerdo y aves' }),
      P('Parrillada del club para dos o más comensales con chorizo, morcilla y res', 'Selección de res, cerdo, pollo, chorizo, morcilla, papa criolla, arepa y ensalada, para compartir en mesa.', [['Para 2', 118000], ['Para 4', 210000], ['Para 6', 295000]], { f: 2, sub: 'Res' })
    ] },
    { id: 4, nombre: 'Pescados y Mariscos', foto: CROPS[5], prods: [
      P('Trucha al ajillo', 'Trucha entera salteada con ajo, arroz de coco y patacón.', [['Plato', 46000]], { f: 4 }),
      P('Salmón en costra de hierbas', 'Con puré de apio y vegetales al vapor.', [['Plato', 68000]], { f: 0, rec: 1 }),
      P('Paella marinera', 'Arroz azafranado con camarones, calamares y mejillones.', [['Individual', 58000], ['Para compartir', 108000]], { f: 1, nue: 1 }),
      P('Arroz con camarones', 'Sofrito criollo y camarones tigre.', [['Plato', 49000]], { f: 5 }),
      P('Cazuela de mariscos al coco', 'Mariscos frescos en leche de coco con plátano maduro.', [['Plato', 62000]], { f: 3 }),
      P('Pargo rojo frito', 'Entero, con arroz de coco y ensalada.', [['Plato', 64000]], { ago: 1, f: 2 }),
      P('Tilapia a la plancha', 'Con arroz blanco y ensalada.', [['Plato', 38000]])
    ] },
    { id: 5, nombre: 'Postres', foto: CROPS[1], prods: [
      P('Torta tres leches', 'Bizcocho húmedo con crema chantilly.', [['Porción', 16000]], { f: 2 }),
      P('Brownie con helado', 'Chocolate tibio, helado de vainilla y salsa de arequipe.', [['Porción', 18000]], { f: 4, rec: 1 }),
      P('Cheesecake de maracuyá', 'Base de galleta y cobertura de maracuyá.', [['Porción', 17000]], { f: 1, nue: 1 }),
      P('Flan de coco', 'Con caramelo y coco tostado.', [['Porción', 14000]], { f: 5 }),
      P('Tiramisú', 'Clásico italiano con café y cacao.', [['Porción', 18000]], { f: 0, ago: 1 }),
      P('Helado artesanal', 'Tres bolas a elección.', [['Copa', 15000]])
    ] },
    { id: 6, nombre: 'Bebidas', foto: null, prods: [
      P('Limonada de coco', 'Cremosa y bien fría.', [['Vaso', 11000], ['Jarra', 32000]], { rec: 1 }),
      P('Jugo natural', 'En agua o en leche; mora, lulo, maracuyá o fresa.', [['Agua', 9000], ['Leche', 11000]]),
      P('Café de origen', 'Grano de la región, filtrado.', [['Taza', 7000]]),
      P('Cerveza artesanal del club', 'Rubia, ámbar o stout.', [['Botella', 14000], ['Jarra', 38000]], { nue: 1 }),
      P('Copa de vino tinto', 'Malbec, 150 ml.', [['Copa', 22000], ['Botella', 98000]]),
      P('Agua mineral', 'Con o sin gas.', [['Botella', 6000]], { ago: 1 })
    ] }
  ];
  var CARTA = { id: 1, nombre: 'Carta Principal' };

  /* ---------- Iconos ---------- */
  var IC = {
    local: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M6 20l3-11h30l3 11"/><path d="M6 20a6 6 0 0012 0 6 6 0 0012 0 6 6 0 0012 0"/><path d="M9 25v16h30V25"/><path d="M20 41V31h8v10"/></svg>',
    plato: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="5.5"/><path d="M7 8v10a3 3 0 003 3v19M13 8v13M10 8v13"/><path d="M41 8c-3 2-4.500 6-4.500 11 0 2 1.500 3 3 3H41v18"/></svg>',
    flecha: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    volver: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    carta: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M9 9h6M9 13h6"/></svg>',
    reloj: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--brand-navy)" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
  };

  /* ---------- Estado ---------- */
  var DEF = { estilo: 'imagenes', cols: 2, nav: 'vertical', forma: 'redondeado', tam: 'm', sinFotos: false, anim: true };
  var st = Object.assign({}, DEF);
  try { var sv = JSON.parse(localStorage.getItem('menuv2-v4') || 'null'); if (sv) st = Object.assign(st, sv); } catch (e) {}
  function save() { try { localStorage.setItem('menuv2-v4', JSON.stringify(st)); } catch (e) {} }

  var sedeActual = SEDES[0];
  var tabCat = 1, subSel = '';
  var lastName = '';
  var layerIdx = 0;
  var $ = function (s) { return document.querySelector(s); };
  var main = $('#main'), heroContent = $('#heroContent');

  /* ---------- Helpers de vista ---------- */
  function money(v) { return '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function media(foto, kind, cls, alt) {
    if (st.sinFotos || !foto) return '<div class="media ph ' + cls + '">' + IC[kind] + '</div>';
    return '<div class="media ' + cls + '"><img src="' + foto.src + '" alt="' + (alt || '') + '" style="object-position:' + foto.pos + '" loading="lazy"></div>';
  }
  function prodCard(p, i) {
    var foto = p.f != null ? CROPS[p.f] : null;
    var tags = (p.rec ? '<span class="tag tag-rec">Recomendado</span>' : '') + (p.nue ? '<span class="tag tag-new">Nuevo</span>' : '') + (p.ago ? '<span class="tag tag-out">Agotado</span>' : '');
    var prices = '<div class="prices">' + p.pr.map(function (x) { return '<span class="price"><em>' + x[0] + '</em><b>' + money(x[1]) + '</b></span>'; }).join('') + '</div>';
    var tagsH = tags ? '<div class="tags">' + tags + '</div>' : '';
    var top = '', body;
    if (st.estilo === 'imagenes') {
      top = media(foto, 'plato', 'm-prod');
      body = tagsH + '<h3 class="prod-name">' + p.n + '</h3><p class="prod-desc">' + p.d + '</p>' + prices;
    } else if (st.estilo === 'banner') {
      top = '<div style="position:relative">' + media(foto, 'plato', 'm-banner') + '<div class="banner-over"><h3 class="prod-name">' + p.n + '</h3></div></div>';
      body = tagsH + '<p class="prod-desc">' + p.d + '</p>' + prices;
    } else {
      body = tagsH + '<h3 class="prod-name">' + p.n + '</h3><p class="prod-desc">' + p.d + '</p>' + prices;
    }
    return '<article class="panel prod st-' + st.estilo + (p.ago ? ' out' : '') + '" style="--i:' + Math.min(i, 6) + '">' + top + '<div class="prod-body">' + body + '</div></article>';
  }
  function catById(id) { return CATS.filter(function (c) { return c.id === id; })[0] || CATS[0]; }
  function total() { return CATS.reduce(function (a, c) { return a + c.prods.length; }, 0); }

  function productsHTML(cat) {
    var list = cat.prods.filter(function (p) { return !subSel || p.sub === subSel; });
    var chips = cat.subs ? '<div class="chips" role="group" aria-label="Subcategorías">' +
      ['Todas'].concat(cat.subs).map(function (s) {
        var v = s === 'Todas' ? '' : s;
        return '<button type="button" class="chip" data-act="sub" data-v="' + v + '" aria-pressed="' + (subSel === v) + '">' + s + '</button>';
      }).join('') + '</div>' : '';
    return chips + '<div class="pgrid" data-cols="' + st.cols + '">' + list.map(prodCard).join('') + '</div>';
  }

  function segHTML(active) {
    return '<div class="seg-wrap"><div class="seg" role="tablist" aria-label="Categorías"><div class="seg-track" id="segTrack"><span class="seg-slider" id="segSlider"></span>' +
      CATS.map(function (c) { return '<button class="seg-btn" role="tab" type="button" data-act="tab" data-id="' + c.id + '" aria-selected="' + (c.id === active) + '">' + c.nombre + '</button>'; }).join('') +
      '</div></div></div>';
  }
  function moveSlider() {
    var t = $('#segTrack'); if (!t) return;
    var b = t.querySelector('[aria-selected="true"]'), s = $('#segSlider'); if (!b) return;
    s.style.left = b.offsetLeft + 'px'; s.style.width = b.offsetWidth + 'px';
    var sc = t.parentNode;
    sc.scrollTo({ left: b.offsetLeft - (sc.clientWidth - b.offsetWidth) / 2, behavior: st.anim ? 'smooth' : 'auto' });
  }

  /* ---------- Pantallas ---------- */
  function heroSet(photo, back, title, sub) {
    var nextL = $('#layer' + (1 - layerIdx)), curL = $('#layer' + layerIdx);
    nextL.className = 'hero-layer' + (photo && !st.sinFotos ? '' : ' plain');
    nextL.innerHTML = photo && !st.sinFotos ? '<img src="' + photo.src + '" alt="" style="object-position:' + photo.pos + '">' : '';
    // reinicia animación de zoom
    void nextL.offsetWidth;
    nextL.classList.add('on'); curL.classList.remove('on');
    layerIdx = 1 - layerIdx;
    heroContent.innerHTML = (back ? '<a class="btn btn-outline" href="' + back + '">' + IC.volver + 'Volver</a>' : '') + '<h1>' + title + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '');
    var kids = heroContent.children; for (var i = 0; i < kids.length; i++) kids[i].style.animationDelay = (i * 40) + 'ms';
  }

  function render(skipHero) {
    var h = location.hash || '#/';
    var m = h.match(/^#\/(sede|carta|categoria)\/([^/]+)/);
    var route = m ? m[1] : 'rest', arg = m ? m[2] : '';
    var html = '', hero;
    var horiz = st.nav === 'horizontal';

    if (route === 'sede') { sedeActual = SEDES.filter(function (s) { return s.id === arg; })[0] || SEDES[0]; }
    if (route === 'rest') {
      hero = [CROPS[2], '', 'Nuestra Gastronomía', 'Seleccione una sede para conocer su carta'];
      html = '<div class="grid g3">' + SEDES.map(function (s, i) {
        return '<a class="panel" style="--i:' + i + '" href="#/sede/' + s.id + '">' + media(s.foto, 'local', 'm-sede', s.nombre) +
          '<div class="sede-body"><h2>' + s.nombre + '</h2><p>' + s.desc + '</p><span class="btn btn-primary">Ver sede</span></div></a>';
      }).join('') + '</div>';
    } else if (route === 'sede') {
      hero = [sedeActual.foto, '#/', sedeActual.nombre, 'Seleccione una carta'];
      html = '<div class="stack"><a class="panel carta" style="--i:0" href="#/carta/1"><span class="carta-ico">' + IC.carta + '</span>' +
        '<span class="carta-body"><h2>' + CARTA.nombre + '</h2><p>' + CATS.length + ' categorías · ' + total() + ' platos</p></span><span class="btn btn-primary">Ver carta' + IC.flecha + '</span></a>' +
        '<div class="panel info" style="--i:1">' + IC.reloj + '<div><h3>Horario de servicio</h3><p>Lunes a domingo de 11:30 a. m. a 9:00 p. m. Servicio exclusivo para socios e invitados.</p></div></div></div>';
    } else if (route === 'carta' && !horiz) {
      hero = [sedeActual.foto, '#/sede/' + sedeActual.id, CARTA.nombre, sedeActual.nombre];
      html = '<div class="grid g3">' + CATS.map(function (c, i) {
        return '<a class="panel cat-card" style="--i:' + Math.min(i, 6) + '" href="#/categoria/' + c.id + '">' + media(c.foto, 'plato', 'm-cat', c.nombre) +
          '<span class="cat-strip"><span class="cat-name">' + c.nombre + '</span><span class="cat-count">' + c.prods.length + ' platos</span>' + IC.flecha + '</span></a>';
      }).join('') + '</div>';
    } else {
      // categoria (vertical) o carta/categoria en horizontal (misma pantalla)
      if (route === 'categoria') tabCat = catById(parseInt(arg, 10)).id;
      var cat = catById(tabCat);
      if (horiz) {
        hero = [sedeActual.foto, '#/sede/' + sedeActual.id, CARTA.nombre, cat.nombre];
        html = segHTML(cat.id) + '<div id="prods">' + productsHTML(cat) + '</div>';
      } else {
        hero = [sedeActual.foto, '#/carta/1', cat.nombre, CARTA.nombre + ' · ' + cat.prods.length + ' platos'];
        html = productsHTML(cat);
      }
    }
    if (!skipHero) heroSet.apply(null, hero);
    main.innerHTML = '<div class="view" id="view">' + html + '</div>';
    var key = route + arg;
    if (route === 'sede' && lastName !== 'sede' + arg) openModal();
    lastName = key;
    if (!skipHero) { window.scrollTo(0, 0); }
    if (horiz && (route === 'carta' || route === 'categoria')) { moveSlider(); }
    document.title = hero[2] + ' · Restaurante PP';
    var cl = $('#cfgBody'); if (cl) syncLinks();
  }

  /* ---------- Modal ---------- */
  var modal = $('#modal'), lastFocus = null;
  function openModal() { lastFocus = document.activeElement; modal.hidden = false; $('#modalClose').focus(); }
  function closeModal() { modal.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  /* ---------- Panel de configuración ---------- */
  var cfg = $('#cfg'), fab = $('#fab');
  var GROUPS = [
    ['estilo', 'Estilo de categoría', [['lista', 'Lista'], ['imagenes', 'Con imágenes'], ['banner', 'Banner']]],
    ['cols', 'Columnas', [[1, '1'], [2, '2'], [3, '3']]],
    ['nav', 'Navegación', [['vertical', 'Vertical'], ['horizontal', 'Horizontal']]],
    ['forma', 'Forma de botón', [['cuadrado', 'Cuadrado'], ['redondeado', 'Redondeado'], ['pildora', 'Píldora']]],
    ['tam', 'Tamaño de botón', [['s', 'S'], ['m', 'M'], ['l', 'L']]],
    ['sinFotos', 'Sin imagen', [[false, 'Mostrar fotos'], [true, 'Quitar fotos']]],
    ['anim', 'Animaciones', [[true, 'Activadas'], [false, 'Reducidas']]]
  ];
  function buildCfg() {
    $('#cfgBody').innerHTML = GROUPS.map(function (g) {
      return '<div class="cfg-row"><span>' + g[1] + '</span><div class="opts" role="group" aria-label="' + g[1] + '">' +
        g[2].map(function (o) { return '<button type="button" class="opt" data-k="' + g[0] + '" data-v="' + o[0] + '" aria-pressed="' + (st[g[0]] === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    }).join('') + '<div class="cfg-row"><span>Ir a pantalla</span><div class="cfg-links" id="cfgLinks"></div></div>';
    syncLinks();
  }
  function syncLinks() {
    var l = $('#cfgLinks'); if (!l) return;
    l.innerHTML = '<a href="#/">1 · Restaurante</a><a href="#/sede/' + sedeActual.id + '">2 · Sede</a><a href="#/carta/1">3 · Categorías</a><a href="#/categoria/3">4 · Productos</a>';
  }
  function applyBody() {
    document.body.dataset.forma = st.forma; document.body.dataset.tam = st.tam;
    document.body.classList.toggle('no-anim', !st.anim);
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act],.opt');
    if (!t) return;
    if (t.classList.contains('opt')) {
      var k = t.dataset.k, v = t.dataset.v;
      st[k] = (v === 'true') ? true : (v === 'false') ? false : (k === 'cols' ? parseInt(v, 10) : v);
      save(); applyBody(); buildCfg();
      var re = k === 'estilo' || k === 'cols' || k === 'nav' || k === 'sinFotos';
      if (re) {
        if (k === 'nav') { var mm = (location.hash || '').match(/^#\/categoria\/(\d+)/); if (mm) tabCat = parseInt(mm[1], 10); }
        render(k !== 'sinFotos' && k !== 'nav');
      }
      return;
    }
    var a = t.dataset.act;
    if (a === 'close-modal') closeModal();
    else if (a === 'tab') {
      tabCat = parseInt(t.dataset.id, 10); subSel = '';
      try { history.replaceState(null, '', '#/categoria/' + tabCat); } catch (x) {}
      var cat = catById(tabCat);
      document.querySelectorAll('.seg-btn').forEach(function (b) { b.setAttribute('aria-selected', String(b === t)); });
      moveSlider();
      $('#prods').innerHTML = productsHTML(cat);
      var sub = $('#heroContent .sub'); if (sub) sub.textContent = cat.nombre;
      syncLinks();
    } else if (a === 'sub') {
      subSel = t.dataset.v; ($('#prods') || $('#view')).innerHTML = productsHTML(catById(tabCat));
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!modal.hidden) closeModal(); else if (!cfg.hidden) toggleCfg(false); }
  });
  function toggleCfg(open) { cfg.hidden = !open; fab.setAttribute('aria-expanded', String(open)); }
  fab.addEventListener('click', function () { toggleCfg(cfg.hidden); });
  $('#cfgClose').addEventListener('click', function () { toggleCfg(false); fab.focus(); });
  window.addEventListener('hashchange', function () { subSel = ''; render(); });
  window.addEventListener('resize', moveSlider);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveSlider);

  applyBody(); buildCfg(); render();
})();
