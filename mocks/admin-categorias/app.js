/* Mock admin: Cartas → Carta (categorías + productos) → Drawer de edición.
   Sin dependencias. Los datos viven en memoria; recargar los restablece. */
(function () {
  'use strict';

  /* ---------- Iconos ---------- */
  var I = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 011-1h10"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>',
    grip: '<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    store: '<svg viewBox="0 0 24 24"><path d="M3 9l1.5-5h15L21 9M4 9v11h16V9M4 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3M9 20v-6h6v6"/></svg>',
    cog: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
    plate: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="3.2"/><path d="M3.5 3v5M5.5 3v5M3 8h3M20.5 3c-1.2 1.2-1.8 3-1.8 5.2 0 1.2.6 2 1.8 2V21"/></svg>'
  };

  /* ---------- Datos de ejemplo ---------- */
  var uid = 100;
  function nid() { return ++uid; }
  // estado: v = visible, o = oculto, a = agotado
  function P(name, price, st, o) { o = o || {}; return { id: nid(), name: name, price: price, st: st || 'v', rec: !!o.rec, nw: !!o.nw, img: o.img, desc: o.desc || '' }; }
  function C(name, prods, o) { o = o || {}; return { id: nid(), name: name, parent: o.parent || null, visible: o.visible !== false, style: o.style || 'WITH_IMAGES', cols: o.cols || 2, nav: o.nav || 'VERTICAL', hideTitle: !!o.hideTitle, open: true, prods: prods }; }

  var F4 = '../assets/foto-4.png', F5 = '../assets/foto-5.jpeg';
  var bebidas = C('Bebidas', [P('Limonada de coco', 14000, 'v', { img: F5 })]);
  var cartas = [
    { id: 1, name: 'Carta Principal', sede: 'Sede Principal', pub: true, cats: [
      C('Entradas', [
        P('Patacón pisao', 35000, 'v', { rec: true, img: F4, desc: 'Patacón crujiente con hogao y queso costeño.' }),
        P('Paté de la casa', 28000, 'v', { img: F5 }),
        P('Rollito de plátano', 24000, 'v', { nw: true }),
        P('Carpaccio de res', 38000, 'a', { img: F4, desc: 'Láminas de lomo fino, alcaparras, parmesano y aceite de oliva.' }),
        P('Empanadas de la casa (x4)', 22000, 'v'),
        P('Ceviche de camarón con leche de tigre y chips de yuca', 42000, 'o')
      ]),
      C('Sopas', [P('Ajiaco santafereño', 36000, 'v', { rec: true, img: F5 }), P('Crema de champiñones', 26000, 'v'), P('Sancocho de gallina', 38000, 'v'), P('Caldo de costilla', 24000, 'o')]),
      C('Ensaladas', [P('César con pollo', 32000, 'v', { img: F4 }), P('Ensalada de la huerta', 24000, 'v'), P('Capresse', 28000, 'v', { nw: true }), P('Ensalada de quinoa', 30000, 'v')]),
      C('Pescados', [P('Trucha a la plancha', 46000, 'v', { img: F5 }), P('Salmón al grill', 62000, 'v', { rec: true, img: F4 }), P('Mojarra frita', 44000, 'v'), P('Filete de robalo', 58000, 'a'), P('Arroz con mariscos', 56000, 'v')]),
      C('Carnes', [P('Lomo fino a la parrilla', 68000, 'v', { rec: true, img: F4 }), P('Punta de anca', 58000, 'v', { img: F5 }), P('Costillas BBQ', 54000, 'v'), P('Churrasco', 62000, 'v'), P('Medallones de cerdo', 48000, 'v', { nw: true }), P('Bandeja paisa', 52000, 'o')]),
      C('Postres', [P('Tres leches', 18000, 'v', { rec: true }), P('Brownie con helado', 20000, 'v', { img: F5 }), P('Cheesecake de maracuyá', 22000, 'v'), P('Flan de caramelo', 16000, 'a')], { style: 'LIST', cols: 1 }),
      bebidas,
      C('Calientes', [P('Café americano', 7000, 'v'), P('Chocolate santafereño', 12000, 'v'), P('Té de frutos rojos', 9000, 'v')], { parent: bebidas.id }),
      C('Licores', [P('Margarita', 28000, 'v'), P('Old fashioned', 32000, 'v', { nw: true }), P('Copa de vino tinto', 26000, 'v')], { parent: bebidas.id })
    ] },
    { id: 2, name: 'Carta de Eventos', sede: 'Sede Principal', pub: true, cats: [C('Cócteles de bienvenida', [P('Mimosa', 24000), P('Aperol Spritz', 28000)]), C('Platos fuertes', [P('Lomo en salsa de vino', 64000), P('Pollo relleno', 48000)])] },
    { id: 3, name: 'Menú Infantil', sede: 'Sede Principal', pub: false, cats: [C('Platos', [P('Nuggets con papas', 22000), P('Mini hamburguesa', 24000), P('Pasta con mantequilla', 20000)])] },
    { id: 4, name: 'Carta de Vinos', sede: 'Sede Principal', pub: true, cats: [C('Tintos', [P('Malbec reserva', 120000), P('Cabernet Sauvignon', 110000)]), C('Blancos', [P('Chardonnay', 98000), P('Sauvignon Blanc', 92000)])] },
    { id: 5, name: 'Carta Principal', sede: 'Sede Norte', pub: true, cats: [C('Entradas', [P('Bruschetta', 26000), P('Tabla de quesos', 52000)]), C('Fuertes', [P('Pasta al pesto', 38000), P('Risotto de hongos', 44000)])] },
    { id: 6, name: 'Almuerzo Ejecutivo', sede: 'Sede Norte', pub: true, cats: [C('Menú del día', [P('Sopa y seco', 32000), P('Plato del día', 28000)])] }
  ];
  cartas.forEach(function (c) { c.cats.forEach(function (k) { if (c.id !== 1) k.cols = 1; }); });

  /* ---------- Estado ---------- */
  var S = { menuView: 'root', carta: null, catId: null, q: '', filter: 'all', sort: 'manual', sel: {}, trash: [], quick: false, menuFor: null, catq: '' };
  var drag = null; // {type:'prod'|'cat', id}

  /* ---------- Utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '$' + Number(n).toLocaleString('es-CO'); }
  function cartaById(id) { return cartas.filter(function (c) { return c.id === +id; })[0]; }
  function cat(id) { return S.carta.cats.filter(function (c) { return c.id === +id; })[0]; }
  function roots() { return S.carta.cats.filter(function (c) { return !c.parent; }); }
  function kids(id) { return S.carta.cats.filter(function (c) { return c.parent === id; }); }
  function allProds(k) { var r = k.prods.slice(); kids(k.id).forEach(function (s) { r = r.concat(s.prods); }); return r; }
  function findProd(id) { var out = null; S.carta.cats.forEach(function (k) { k.prods.forEach(function (p) { if (p.id === +id) out = { p: p, c: k }; }); }); return out; }
  function stLabel(s) { return { v: 'Visible', o: 'Oculto', a: 'Agotado' }[s]; }
  function selIds() { return Object.keys(S.sel).filter(function (k) { return S.sel[k]; }).map(Number); }

  function toast(msg, undo) {
    var t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button">Deshacer</button>' : '');
    if (undo) $('button', t).onclick = function () { undo(); t.remove(); };
    $('#toasts').appendChild(t);
    setTimeout(function () { t.remove(); }, 5000);
  }
  /* ---------- Sedes ---------- */
  var SEDES = [
    { slug: 'principal', name: 'Sede Principal', addr: 'Calle 5 # 38-20, Cali', hor: 'Lunes a domingo · 11:00 a.m. – 10:00 p.m.', img: F4, pos: '30% 50%', active: true },
    { slug: 'norte', name: 'Sede Norte', addr: 'Avenida 6N # 28-45, Cali', hor: 'Martes a domingo · 12:00 m. – 8:30 p.m.', img: F5, pos: '60% 60%', active: true },
    { slug: 'san-fernando', name: 'Sede San Fernando', addr: 'Carrera 36 # 4-12, Cali', hor: 'Sin horario configurado', img: null, pos: '50% 50%', active: false }
  ];
  function sedeBySlug(s) { return SEDES.filter(function (x) { return x.slug === s; })[0]; }
  function sedeByName(n) { return SEDES.filter(function (x) { return x.name === n; })[0]; }
  function sedeStats(s) {
    var cs = cartas.filter(function (c) { return c.sede === s.name; }), np = 0;
    cs.forEach(function (c) { c.cats.forEach(function (k) { np += k.prods.length; }); });
    return { cartas: cs.length, pub: cs.filter(function (c) { return c.pub; }).length, prods: np, list: cs };
  }
  function thumb(s, cls) { return '<div class="' + cls + '">' + (s.img ? '<img src="' + s.img + '" alt="" style="object-position:' + s.pos + '">' : '<span class="ph">' + I.store + '</span>') + '</div>'; }

  /* ---------- Barra lateral ---------- */
  var NAVI = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z"/></svg>',
    brush: '<svg viewBox="0 0 24 24"><path d="M4 20c3 0 5-1 5-3.5S7.5 14 6 15s-2 5-2 5zM9 14l9-9 2 2-9 9"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM5 17a3 3 0 013-3h11"/></svg>',
    mega: '<svg viewBox="0 0 24 24"><path d="M4 10v4h3l8 4V6L7 10H4zM18 9a4 4 0 010 6"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    ext: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/></svg>'
  };
  function setNav(key) {
    var items = [
      ['Espacio de trabajo'],
      ['dash', '#/vista-general', 'Vista general', NAVI.home],
      ['rest', '#/restaurante', 'Restaurante y diseño', NAVI.brush],
      ['sedes', '#/', 'Sedes y cartas', NAVI.book, String(cartas.length)],
      ['Herramientas'],
      ['ads', '#/anuncios', 'Anuncios', NAVI.mega, String(ADS.filter(function (a) { return adStatus(a) === 'on'; }).length)],
      ['hist', '#/historial', 'Historial', NAVI.clock]
    ];
    $('#nav').innerHTML = '<a class="nav__brand" href="#/"><span class="logo">PP</span><span><b>Restaurante PP</b><small>Administración</small></span></a>' +
      '<div class="nav__scroll"><nav>' + items.map(function (it) {
        if (it.length === 1) return '<p class="nav__sec">' + it[0] + '</p>';
        return '<a class="nav__link" href="' + it[1] + '"' + (it[0] === key ? ' aria-current="page"' : '') + '>' + it[3] + '<span>' + it[2] + '</span>' + (it[4] ? '<span class="pill">' + it[4] + '</span>' : '') + '</a>';
      }).join('') + '</nav></div>' +
      '<div class="nav__foot"><a class="view" href="../variante-1/index.html" target="_blank" rel="noopener">' + NAVI.ext + ' Ver sitio del cliente</a>' +
      '<div class="nav__user"><span class="av">AD</span><span>Administrador<small>Sesión activa</small></span></div></div>';
    closeNav();
  }
  function openNav() { $('#nav').classList.add('open'); $('#navscrim').hidden = false; }
  function closeNav() { $('#nav').classList.remove('open'); $('#navscrim').hidden = true; }
  $('#navopen').onclick = openNav;
  $('#navscrim').onclick = closeNav;

  /* ---------- Anuncios ---------- */
  var TODAY = '2026-11-17';
  var ADT = {
    STORY: { l: 'Historia', d: 'Imagen y texto', i: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 15l4-4 4 4 3-3 3 3"/></svg>' },
    LINK: { l: 'Enlace', d: 'Botón a una web', i: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>' },
    SUBSCRIBE: { l: 'Suscríbete', d: 'Pide el correo', i: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>' },
    PRODUCT: { l: 'Producto', d: 'Destaca un plato', i: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="3.2"/><path d="M3.5 3v5M5.5 3v5M3 8h3M20.5 3c-1.2 1.2-1.8 3-1.8 5.2 0 1.2.6 2 1.8 2V21"/></svg>' }
  };
  var ADS = [
    { id: 1, type: 'STORY', name: 'Noche de jazz en la terraza', title: 'Noche de jazz', text: 'Todos los viernes desde las 7:00 p.m., música en vivo con carta de temporada.', btn: '', url: '', product: '', img: F4, secs: 3, start: '2026-11-01', end: '2026-12-31', sedes: ['principal', 'norte'], active: true },
    { id: 2, type: 'PRODUCT', name: 'Plato de la semana', title: 'Lomo fino a la parrilla', text: 'Disponible solo esta semana en la carta.', btn: 'Ver en la carta', url: '', product: 'Lomo fino a la parrilla', img: null, secs: 5, start: '2026-11-10', end: '2026-11-24', sedes: ['principal'], active: true },
    { id: 3, type: 'SUBSCRIBE', name: 'Boletín de fin de año', title: 'Reciba nuestras novedades', text: 'Inscriba su correo y conozca primero los eventos de la temporada.', btn: 'Suscribirme', url: '', product: '', img: F5, secs: 8, start: '2026-12-01', end: '2027-01-15', sedes: ['principal', 'norte'], active: true },
    { id: 4, type: 'LINK', name: 'Reserva de eventos', title: 'Celebre con nosotros', text: 'Conozca nuestros paquetes para reuniones y celebraciones.', btn: 'Ver paquetes', url: 'https://ejemplo.com/eventos', product: '', img: null, secs: 4, start: '2026-09-01', end: '2026-10-31', sedes: ['principal'], active: true },
    { id: 5, type: 'STORY', name: 'Menú de temporada (borrador)', title: 'Nueva temporada', text: '', btn: '', url: '', product: '', img: null, secs: 3, start: '', end: '', sedes: [], active: false }
  ];
  var adUid = 10;
  function adStatus(a) {
    if (!a.active) return 'off';
    if (a.start && a.start > TODAY) return 'sched';
    if (a.end && a.end < TODAY) return 'exp';
    return 'on';
  }
  var ADS_LBL = { on: ['Activo', 'badge--ok'], sched: ['Programado', 'badge--sched'], exp: ['Vencido', 'badge--exp'], off: ['Pausado', 'badge--off'] };
  function dshort(iso) { if (!iso) return ''; var p = iso.split('-'); return ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][+p[1] - 1] + ' ' + (+p[2]) + (p[0] !== TODAY.slice(0, 4) ? ' ' + p[0] : ''); }
  function period(a) { if (!a.start && !a.end) return 'Sin fechas'; if (!a.end) return 'Desde ' + dshort(a.start); if (!a.start) return 'Hasta ' + dshort(a.end); return dshort(a.start) + ' – ' + dshort(a.end); }
  function sedeName(slug) { return (sedeBySlug(slug) || {}).name || slug; }
  function prodNames() { var r = []; cartas[0].cats.forEach(function (k) { k.prods.forEach(function (p) { r.push(p); }); }); return r; }
  function prodByName(n) { return prodNames().filter(function (p) { return p.name === n; })[0]; }
  function adImage(a) { if (a.type === 'PRODUCT') { var p = prodByName(a.product); return p && p.img; } return a.img; }

  var AF = { q: '', st: 'all', type: 'all', sede: 'all' };
  function renderAds() {
    var cnt = { on: 0, sched: 0, exp: 0, off: 0 }; ADS.forEach(function (a) { cnt[adStatus(a)]++; });
    $('#page').innerHTML =
      '<section class="screen"><div class="pagehead"><div><h1>Anuncios</h1><p>Ventanas emergentes que ven sus clientes al entrar a una sede: historias, enlaces, suscripciones y productos.</p></div>' +
      '<a class="btn btn--primary" href="#/anuncios/nuevo">' + I.plus + ' Nuevo anuncio</a></div>' +
      '<div class="card head" style="padding:14px 16px;margin-bottom:16px"><div class="stats" style="margin:0"><div class="stat"><span>Activos</span><b>' + cnt.on + '</b></div><div class="stat"><span>Programados</span><b>' + cnt.sched + '</b></div><div class="stat"><span>Vencidos</span><b>' + cnt.exp + '</b></div></div></div>' +
      '<div class="filters"><div class="search">' + I.search + '<input class="input" id="aq" placeholder="Buscar anuncio" value="' + esc(AF.q) + '" aria-label="Buscar anuncio"></div>' +
      '<div class="seg" id="ast" role="group" aria-label="Estado">' + [['all', 'Todos'], ['on', 'Activos'], ['sched', 'Programados'], ['exp', 'Vencidos'], ['off', 'Pausados']].map(function (o) { return '<button type="button" class="s-all" data-ast="' + o[0] + '" aria-pressed="' + (AF.st === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<select class="select" id="at" aria-label="Tipo"><option value="all">Todos los tipos</option>' + Object.keys(ADT).map(function (k) { return '<option value="' + k + '"' + (AF.type === k ? ' selected' : '') + '>' + ADT[k].l + '</option>'; }).join('') + '</select>' +
      '<select class="select" id="as" aria-label="Sede"><option value="all">Todas las sedes</option>' + SEDES.map(function (s) { return '<option value="' + s.slug + '"' + (AF.sede === s.slug ? ' selected' : '') + '>' + s.name + '</option>'; }).join('') + '</select></div>' +
      '<div class="adlist" id="al"></div></section>';
    $('#aq').oninput = function () { AF.q = this.value; adsList(); };
    $('#at').onchange = function () { AF.type = this.value; adsList(); };
    $('#as').onchange = function () { AF.sede = this.value; adsList(); };
    adsList();
  }
  function adsList() {
    $$('#ast button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ast') === AF.st); });
    var l = ADS.filter(function (a) {
      return (AF.st === 'all' || adStatus(a) === AF.st) && (AF.type === 'all' || a.type === AF.type) && (AF.sede === 'all' || a.sedes.indexOf(AF.sede) >= 0) && (a.name.toLowerCase().indexOf(AF.q.toLowerCase()) >= 0);
    });
    if (!l.length) { $('#al').innerHTML = '<div class="card empty"><h3>' + (ADS.length ? 'Ningún anuncio coincide' : 'Aún no tiene anuncios') + '</h3><p>' + (ADS.length ? 'Pruebe con otros filtros.' : 'Cree el primero para destacar una novedad.') + '</p></div>'; return; }
    $('#al').innerHTML = l.map(function (a) {
      var st = adStatus(a), img = adImage(a), lbl = ADS_LBL[st];
      return '<div class="card ad"><div class="ad__thumb">' + (img ? '<img src="' + img + '" alt="">' : ADT[a.type].i) + '</div>' +
        '<div><div class="ad__name">' + esc(a.name) + '</div><div class="ad__meta"><span class="badge badge--type">' + ADT[a.type].l + '</span>' +
        (a.sedes.length ? a.sedes.map(function (s) { return '<span class="sedechip">' + esc(sedeName(s)) + '</span>'; }).join('') : '<span class="sedechip">Sin sedes</span>') +
        '<span>' + period(a) + '</span></div></div>' +
        '<div class="ad__state"><span class="badge ' + lbl[1] + '">' + lbl[0] + '</span><button class="switch" type="button" role="switch" aria-checked="' + a.active + '" data-ad="toggle" data-id="' + a.id + '" aria-label="Activar o pausar ' + esc(a.name) + '"></button></div>' +
        '<div class="ad__actions"><a class="iconbtn" href="#/anuncios/' + a.id + '" aria-label="Editar" title="Editar">' + I.edit + '</a>' +
        '<button class="iconbtn" type="button" data-ad="dup" data-id="' + a.id + '" aria-label="Duplicar" title="Duplicar">' + I.copy + '</button>' +
        '<button class="iconbtn" type="button" data-ad="del" data-id="' + a.id + '" aria-label="Eliminar" title="Eliminar">' + I.trash + '</button></div></div>';
    }).join('');
  }

  var AE = null, AEnew = false, AEerr = {};
  function renderAdEditor(id) {
    var src = id ? ADS.filter(function (a) { return a.id === +id; })[0] : null;
    AEnew = !src; AEerr = {};
    AE = src ? JSON.parse(JSON.stringify(src)) : { id: null, type: 'STORY', name: '', title: '', text: '', btn: '', url: '', product: '', img: null, secs: 3, start: TODAY, end: '', sedes: [], active: true };
    $('#page').innerHTML =
      '<section class="screen"><div class="pagehead"><div><nav class="crumbs" aria-label="Ruta"><a href="#/anuncios">Anuncios</a><span class="sep">›</span><span>' + (AEnew ? 'Nuevo anuncio' : esc(src.name)) + '</span></nav><h1>' + (AEnew ? 'Nuevo anuncio' : 'Editar anuncio') + '</h1></div>' +
      '<div style="display:flex;gap:8px"><a class="btn" href="#/anuncios">Cancelar</a><button class="btn btn--primary" type="button" data-ad="save">Guardar anuncio</button></div></div>' +
      '<div class="editor"><div class="card formcard" id="adform"></div>' +
      '<aside class="previewcol" aria-label="Vista previa"><div class="previewhead"><h2>Vista previa</h2><span class="hint" id="adsecs"></span></div><div class="stage" id="adprev"></div>' +
      '<p class="hint">Así verá el cliente la ventana emergente al entrar a la sede.</p></aside></div></section>';
    adForm(); adPrev();
  }
  function fld(lbl, id, input, extra) { return '<div class="field"><label for="' + id + '">' + lbl + '</label>' + input + (extra || '') + '</div>'; }
  function adForm() {
    var a = AE, h = '';
    h += '<div class="field"><span class="lab">Tipo de anuncio</span><div class="typegrid" role="group" aria-label="Tipo de anuncio">' + Object.keys(ADT).map(function (k) { return '<button type="button" class="typebtn" data-ad="type" data-v="' + k + '" aria-pressed="' + (a.type === k) + '">' + ADT[k].i + ADT[k].l + '<small>' + ADT[k].d + '</small></button>'; }).join('') + '</div></div>';
    h += fld('Nombre interno', 'a-name', '<input class="input' + (AEerr.name ? ' invalid' : '') + '" id="a-name" value="' + esc(a.name) + '" placeholder="Para reconocerlo en la lista">', AEerr.name ? '<div class="err">' + AEerr.name + '</div>' : '<div class="hint">No lo ve el cliente.</div>');
    if (a.type === 'PRODUCT') {
      h += fld('Producto destacado', 'a-prod', '<select class="select" id="a-prod"><option value="">Elija un producto…</option>' + prodNames().map(function (p) { return '<option' + (a.product === p.name ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select>', AEerr.product ? '<div class="err">' + AEerr.product + '</div>' : '');
    }
    h += fld('Título', 'a-title', '<input class="input' + (AEerr.title ? ' invalid' : '') + '" id="a-title" maxlength="40" value="' + esc(a.title) + '">', AEerr.title ? '<div class="err">' + AEerr.title + '</div>' : '');
    h += fld('Texto', 'a-text', '<textarea id="a-text" maxlength="160">' + esc(a.text) + '</textarea>', '<div class="hint">Máximo 160 caracteres.</div>');
    if (a.type !== 'PRODUCT') {
      h += '<div class="field"><span class="lab">Imagen</span><div class="imgpick" role="group" aria-label="Imagen"><button type="button" data-ad="img" data-v="" aria-pressed="' + !a.img + '">Sin imagen</button>' + [F4, F5].map(function (f, i) { return '<button type="button" data-ad="img" data-v="' + f + '" aria-pressed="' + (a.img === f) + '" aria-label="Foto ' + (i + 1) + '"><img src="' + f + '" alt=""></button>'; }).join('') + '</div><div class="hint">En la versión real: subir desde su equipo.</div></div>';
    }
    if (a.type === 'LINK') h += '<div class="two">' + fld('Texto del botón', 'a-btn', '<input class="input" id="a-btn" value="' + esc(a.btn) + '" placeholder="Ver más">') + fld('Enlace', 'a-url', '<input class="input' + (AEerr.url ? ' invalid' : '') + '" id="a-url" value="' + esc(a.url) + '" placeholder="https://">', AEerr.url ? '<div class="err">' + AEerr.url + '</div>' : '') + '</div>';
    if (a.type === 'SUBSCRIBE' || a.type === 'PRODUCT') h += fld('Texto del botón', 'a-btn', '<input class="input" id="a-btn" value="' + esc(a.btn) + '" placeholder="' + (a.type === 'PRODUCT' ? 'Ver en la carta' : 'Suscribirme') + '">');
    h += '<div class="field"><span class="lab">Dónde se publica</span><div class="chips" role="group" aria-label="Sedes">' + SEDES.map(function (s) { return '<button type="button" class="chipbtn" data-ad="sede" data-v="' + s.slug + '" aria-pressed="' + (a.sedes.indexOf(s.slug) >= 0) + '">' + s.name + '</button>'; }).join('') + '<button type="button" class="chipbtn" data-ad="allsedes">Todas</button></div>' + (AEerr.sedes ? '<div class="err">' + AEerr.sedes + '</div>' : '<div class="hint">Puede publicarse en varias sedes a la vez.</div>') + '</div>';
    h += '<div class="two">' + fld('Inicia', 'a-start', '<input class="input" id="a-start" type="date" value="' + a.start + '">') + fld('Termina', 'a-end', '<input class="input" id="a-end" type="date" value="' + a.end + '">', AEerr.end ? '<div class="err">' + AEerr.end + '</div>' : '<div class="hint">Vacío = sin fecha de fin.</div>') + '</div>';
    h += '<div class="two">' + fld('Aparece después de (segundos)', 'a-secs', '<input class="input" id="a-secs" type="number" min="0" max="30" value="' + a.secs + '">') +
      '<div class="field"><span class="lab">Estado</span><span class="pubtoggle"><button class="switch" type="button" role="switch" id="a-act" data-ad="act" aria-checked="' + a.active + '" aria-label="Anuncio activo"></button><span id="a-actl">' + (a.active ? 'Activo' : 'Pausado') + '</span></span></div></div>';
    $('#adform').innerHTML = h;
    $$('#adform input, #adform textarea, #adform select').forEach(function (el) {
      el.addEventListener('input', adRead); el.addEventListener('change', adRead);
    });
  }
  function adRead() {
    var g = function (id) { var e = $('#' + id); return e ? e.value : null; };
    var a = AE;
    if (g('a-name') !== null) a.name = g('a-name');
    if (g('a-title') !== null) a.title = g('a-title');
    if (g('a-text') !== null) a.text = g('a-text');
    if (g('a-btn') !== null) a.btn = g('a-btn');
    if (g('a-url') !== null) a.url = g('a-url');
    if (g('a-prod') !== null) a.product = g('a-prod');
    a.start = g('a-start') || ''; a.end = g('a-end') || ''; a.secs = Math.max(0, Math.min(30, parseInt(g('a-secs'), 10) || 0));
    adPrev();
  }
  function adPrev() {
    var a = AE, img = adImage(a), p = a.type === 'PRODUCT' ? prodByName(a.product) : null, h = '<div class="pop"><button class="pop__x" type="button" tabindex="-1" aria-label="Cerrar">' + I.close + '</button>';
    if (a.type !== 'PRODUCT' || !p) h += '<div class="pop__img">' + (a.img && a.type !== 'PRODUCT' ? '<img src="' + a.img + '" alt="" style="object-position:30% 50%">' : ADT[a.type].i) + '</div>';
    else if (img) h += '<div class="pop__img"><img src="' + img + '" alt=""></div>';
    h += '<div class="pop__body">' + (a.title || a.type !== 'PRODUCT' ? '<h3>' + (esc(a.title) || '<span style="opacity:.4">Título del anuncio</span>') + '</h3>' : '') + (a.text ? '<p>' + esc(a.text) + '</p>' : '');
    if (a.type === 'LINK') h += '<span class="pop__btn">' + (esc(a.btn) || 'Ver más') + '</span>';
    if (a.type === 'SUBSCRIBE') h += '<div class="pop__field">correo@ejemplo.com</div><span class="pop__btn">' + (esc(a.btn) || 'Suscribirme') + '</span>';
    if (a.type === 'PRODUCT') h += (p ? '<div class="pop__prod"><div class="t">' + (p.img ? '<img src="' + p.img + '" alt="">' : I.plate.replace('<svg', '<svg width="26" height="26" style="stroke:#8D9590;fill:none;stroke-width:1.2"')) + '</div><b>' + esc(p.name) + '</b><span class="pr">' + money(p.price) + '</span></div>' : '<p style="opacity:.6">Elija un producto para ver la tarjeta.</p>') + '<span class="pop__btn">' + (esc(a.btn) || 'Ver en la carta') + '</span>';
    h += '<span class="pop__time">Se muestra ' + (a.secs ? 'a los ' + a.secs + ' s de entrar' : 'al entrar') + ' a la sede</span></div></div>';
    $('#adprev').innerHTML = h;
  }
  function adSave() {
    adRead(); var a = AE; AEerr = {};
    if (!a.name.trim()) AEerr.name = 'Escriba un nombre para reconocerlo.';
    if (a.type === 'PRODUCT' ? !a.product : !a.title.trim()) { if (a.type === 'PRODUCT') AEerr.product = 'Elija el producto a destacar.'; else AEerr.title = 'El título es obligatorio.'; }
    if (a.type !== 'PRODUCT' && !a.title.trim()) AEerr.title = 'El título es obligatorio.';
    if (a.type === 'LINK' && !/^https?:\/\/.+\..+/.test(a.url.trim())) AEerr.url = 'Escriba un enlace válido que empiece por https://';
    if (!a.sedes.length && a.active) AEerr.sedes = 'Elija al menos una sede o pause el anuncio.';
    if (a.start && a.end && a.end < a.start) AEerr.end = 'La fecha de fin debe ser posterior al inicio.';
    if (Object.keys(AEerr).length) { adForm(); var bad = $('#adform .invalid, #adform .err'); if (bad) bad.scrollIntoView({ block: 'center', behavior: 'smooth' }); toast('Revise los campos marcados'); return; }
    if (AEnew) { a.id = ++adUid; ADS.unshift(a); } else { ADS[ADS.map(function (x) { return x.id; }).indexOf(a.id)] = a; }
    location.hash = '#/anuncios'; toast(AEnew ? 'Anuncio creado' : 'Anuncio guardado');
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-ad]'); if (!t) { var fb = e.target.closest('#ast [data-ast]'); if (fb) { AF.st = fb.getAttribute('data-ast'); adsList(); } return; }
    var k = t.getAttribute('data-ad'), id = +t.getAttribute('data-id'), v = t.getAttribute('data-v');
    var ad = ADS.filter(function (x) { return x.id === id; })[0];
    if (k === 'toggle') { ad.active = !ad.active; adsList(); setNav('ads'); toast(ad.active ? 'Anuncio activado' : 'Anuncio pausado'); }
    else if (k === 'dup') { var c = JSON.parse(JSON.stringify(ad)); c.id = ++adUid; c.name += ' (copia)'; c.active = false; ADS.splice(ADS.indexOf(ad) + 1, 0, c); adsList(); toast('Anuncio duplicado en pausa'); }
    else if (k === 'del') { var i = ADS.indexOf(ad); ADS.splice(i, 1); adsList(); setNav('ads'); toast('Anuncio eliminado', function () { ADS.splice(i, 0, ad); adsList(); setNav('ads'); }); }
    else if (k === 'type') { adRead(); AE.type = v; AEerr = {}; adForm(); adPrev(); }
    else if (k === 'img') { adRead(); AE.img = v || null; adForm(); adPrev(); }
    else if (k === 'sede') { adRead(); var ix = AE.sedes.indexOf(v); if (ix >= 0) AE.sedes.splice(ix, 1); else AE.sedes.push(v); adForm(); }
    else if (k === 'allsedes') { adRead(); AE.sedes = SEDES.map(function (s) { return s.slug; }); adForm(); }
    else if (k === 'act') { adRead(); AE.active = !AE.active; t.setAttribute('aria-checked', AE.active); $('#a-actl').textContent = AE.active ? 'Activo' : 'Pausado'; }
    else if (k === 'save') adSave();
  });

  /* ---------- Pantallas fuera del alcance ---------- */
  function renderPlaceholder(title, msg) {
    $('#page').innerHTML = '<section class="screen placeholder"><div class="pagehead"><div><h1>' + title + '</h1></div></div><div class="card empty"><h3>Fuera del alcance de este mock</h3><p>' + msg + '</p><a class="btn" href="#/">Ir a Sedes y cartas</a></div></section>';
  }

  /* ---------- Router ---------- */
  function route() {
    closeDrawer(true);
    var h = location.hash, m = h.match(/^#\/carta\/(\d+)(?:\/cat\/(\d+))?/), ms = h.match(/^#\/sede\/([\w-]+)/), ma = h.match(/^#\/anuncios(?:\/(nuevo|\d+))?$/);
    setNav(ma ? 'ads' : h === '#/vista-general' ? 'dash' : h === '#/restaurante' ? 'rest' : h === '#/historial' ? 'hist' : 'sedes');
    if (ma) { S.carta = null; if (!ma[1]) renderAds(); else renderAdEditor(ma[1] === 'nuevo' ? null : ma[1]); }
    else if (h === '#/vista-general') renderPlaceholder('Vista general', 'El panel de resumen no forma parte de esta prueba. Aquí se evalúa el flujo Sedes → Cartas → Categorías y productos, y los Anuncios.');
    else if (h === '#/restaurante') renderPlaceholder('Restaurante y diseño', 'La edición de la identidad y el diseño del restaurante no forma parte de esta prueba.');
    else if (h === '#/historial') renderPlaceholder('Historial', 'El historial de cambios no forma parte de esta prueba.');
    else if (m && cartaById(m[1])) {
      if (!S.carta || S.carta.id !== +m[1]) { S.carta = cartaById(m[1]); S.sel = {}; S.q = ''; S.filter = 'all'; S.catId = null; S.trash = []; }
      S.catId = m[2] ? +m[2] : (S.catId && cat(S.catId) ? S.catId : (roots()[0] || {}).id);
      renderCarta();
    } else if (ms && sedeBySlug(ms[1])) { S.carta = null; renderSede(sedeBySlug(ms[1])); }
    else { S.carta = null; renderSedes(); }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- Pantalla 1: sedes ---------- */
  var sq = '';
  function renderSedes() {
    $('#page').innerHTML =
      '<section class="screen"><div class="pagehead"><div><h1>Sedes</h1><p>Elija una sede para administrar sus cartas, categorías y productos.</p></div>' +
      '<button class="btn btn--primary" type="button" data-a="newsede">' + I.plus + ' Nueva sede</button></div>' +
      '<div class="filters"><div class="search">' + I.search + '<input class="input" id="sq" placeholder="Buscar sede" value="' + esc(sq) + '" aria-label="Buscar sede"></div></div><div id="sl"></div></section>';
    $('#sq').oninput = function () { sq = this.value; sedesList(); };
    sedesList();
  }
  function sedesList() {
    var list = SEDES.filter(function (s) { return s.name.toLowerCase().indexOf(sq.toLowerCase()) >= 0; });
    if (!list.length) { $('#sl').innerHTML = '<div class="card empty"><h3>Sin resultados</h3><p>Ninguna sede coincide con “' + esc(sq) + '”.</p></div>'; return; }
    $('#sl').innerHTML = '<div class="sedes">' + list.map(function (s) {
      var st = sedeStats(s);
      return '<a class="card sedecard" href="#/sede/' + s.slug + '">' + thumb(s, 'sedecard__img') +
        '<div class="sedecard__body"><div class="row"><h2>' + esc(s.name) + '</h2><span class="badge ' + (s.active ? 'badge--ok' : 'badge--off') + '">' + (s.active ? 'Activa' : 'Sin publicar') + '</span></div>' +
        '<p class="meta">' + esc(s.addr) + '</p>' +
        '<div class="stats"><span><b>' + st.cartas + '</b>' + (st.cartas === 1 ? 'carta' : 'cartas') + '</span><span><b>' + st.pub + '</b>publicadas</span><span><b>' + st.prods + '</b>productos</span></div>' +
        '<span class="meta go">Administrar sede →</span></div></a>';
    }).join('') + '</div>';
  }

  /* ---------- Pantalla 2: cartas de una sede ---------- */
  var cq = '';
  function renderSede(s) {
    var st = sedeStats(s);
    $('#page').innerHTML =
      '<section class="screen"><div class="card head"><div class="head__top"><div><nav class="crumbs" aria-label="Ruta"><a href="#/">Sedes</a><span class="sep">›</span><span>' + esc(s.name) + '</span></nav><h1>' + esc(s.name) + '</h1>' +
      '<p class="meta" style="margin:4px 0 0">' + esc(s.addr) + ' · ' + esc(s.hor) + '</p></div>' +
      '<div class="head__actions"><button class="btn" type="button" data-a="editsede">' + I.cog + ' Datos de la sede</button><button class="btn btn--primary" type="button" data-a="newcarta">' + I.plus + ' Nueva carta</button></div></div>' +
      '<div class="stats"><div class="stat"><span>Cartas</span><b>' + st.cartas + '</b></div><div class="stat"><span>Publicadas</span><b>' + st.pub + '</b></div><div class="stat"><span>Productos</span><b>' + st.prods + '</b></div></div></div>' +
      '<div class="filters"><div class="search">' + I.search + '<input class="input" id="cq" placeholder="Buscar carta en esta sede" value="' + esc(cq) + '" aria-label="Buscar carta"></div></div><div id="cl"></div></section>';
    $('#cq').oninput = function () { cq = this.value; cartasList(s); };
    cartasList(s);
  }
  function cartasList(s) {
    var list = sedeStats(s).list.filter(function (c) { return c.name.toLowerCase().indexOf(cq.toLowerCase()) >= 0; });
    if (!list.length) {
      $('#cl').innerHTML = '<div class="card empty"><h3>' + (cq ? 'Sin resultados' : 'Esta sede aún no tiene cartas') + '</h3><p>' + (cq ? 'Pruebe con otro nombre.' : 'Cree la primera carta para que sus clientes puedan verla.') + '</p>' +
        (cq ? '' : '<button class="btn btn--primary" type="button" data-a="newcarta">' + I.plus + ' Crear carta</button>') + '</div>'; return;
    }
    $('#cl').innerHTML = '<div class="cartas">' + list.map(function (c) {
      var np = 0; c.cats.forEach(function (k) { np += k.prods.length; });
      return '<button type="button" class="card cartacard" data-a="open" data-id="' + c.id + '"><div class="row"><h2>' + esc(c.name) + '</h2><span class="badge ' + (c.pub ? 'badge--ok' : 'badge--off') + '">' + (c.pub ? 'Publicada' : 'Borrador') + '</span></div>' +
        '<div class="stats"><span><b>' + c.cats.length + '</b>categorías</span><span><b>' + np + '</b>productos</span></div><span class="meta">Abrir y administrar →</span></button>';
    }).join('') + '</div>';
  }

  /* ---------- Pantalla 2: carta ---------- */
  function renderCarta() {
    var c = S.carta;
    $('#page').innerHTML =
      '<section class="screen">' +
      '<div class="card head"><div class="head__top"><div><nav class="crumbs" aria-label="Ruta"><a href="#/">Sedes</a><span class="sep">›</span><a href="#/sede/' + sedeByName(c.sede).slug + '">' + esc(c.sede) + '</a><span class="sep">›</span><span>' + esc(c.name) + '</span></nav><h1>' + esc(c.name) + '</h1></div>' +
      '<div class="head__actions"><span class="pubtoggle"><button class="switch" id="pub" role="switch" aria-checked="' + c.pub + '" aria-label="Carta publicada"></button><span id="publbl"></span></span>' +
      '<button class="btn" type="button" data-a="trash">' + I.trash + ' Papelera <span class="count" id="trashn">0</span></button>' +
      '<a class="btn" href="../variante-1/index.html#/carta/1" target="_blank" rel="noopener">' + I.eye + ' Vista previa</a></div></div>' +
      '<div class="stats" id="stats"></div></div>' +
      '<div class="work"><aside class="card side" aria-label="Categorías"><div class="side__head"><h2>Categorías</h2><button class="iconbtn" type="button" data-a="focusnewcat" aria-label="Nueva categoría">' + I.plus + '</button></div>' +
      '<div class="side__search"><div class="search">' + I.search + '<input class="input" id="catq" placeholder="Buscar categoría" aria-label="Buscar categoría"></div>' +
      '<p class="side__hint" id="dragtip" role="status">Arrastre para ordenar. Suelte en el centro de otra para hacerla su subcategoría.</p></div>' +
      '<div class="side__list" id="cats"></div>' +
      '<div class="side__foot"><button class="btn" type="button" data-a="focusnewcat" style="width:100%;justify-content:center">' + I.plus + ' Nueva categoría</button></div></aside>' +
      '<section class="card main" aria-label="Productos"><div class="catselect"><label class="lab" for="catsel">Categoría</label><select class="select" id="catsel"></select><button class="btn btn--sm" type="button" data-a="focusnewcat" style="margin-top:8px">' + I.plus + ' Nueva categoría</button></div><div id="mainhead"></div>' +
      '<div class="toolbar">' +
      '<div class="search" style="flex:1;min-width:160px">' + I.search + '<input class="input" id="pq" placeholder="Buscar producto" aria-label="Buscar producto"></div>' +
      '<div class="seg" id="flt" role="group" aria-label="Filtrar por estado"><button type="button" class="s-all" data-f="all">Todos</button><button type="button" class="s-v" data-f="v">Visibles</button><button type="button" class="s-o" data-f="o">Ocultos</button><button type="button" class="s-a" data-f="a">Agotados</button></div>' +
      '<select class="select" id="sort" aria-label="Ordenar"><option value="manual">Orden manual</option><option value="name">Nombre A–Z</option><option value="price">Precio ↑</option></select>' +
      '<button class="btn btn--primary" type="button" data-a="quick">' + I.plus + ' Nuevo producto</button></div>' +
      '<div id="bulk"></div><div class="list" id="list"></div></section></div></section>';
    $('#pub').onclick = function () { c.pub = !c.pub; paintHead(); toast(c.pub ? 'Carta publicada' : 'Carta pasada a borrador'); };
    $('#catq').oninput = function () { S.catq = this.value; paintCats(); };
    $('#pq').oninput = function () { S.q = this.value; paintList(); };
    $('#sort').onchange = function () { S.sort = this.value; paintList(); };
    $('#catsel').onchange = function () { selectCat(+this.value); };
    paintAll();
  }
  function paintAll() { paintHead(); paintCats(); paintMain(); }
  function paintHead() {
    var c = S.carta, np = 0, vis = 0;
    c.cats.forEach(function (k) { k.prods.forEach(function (p) { np++; if (p.st === 'v') vis++; }); });
    $('#stats').innerHTML = '<div class="stat"><span>Categorías</span><b>' + c.cats.length + '</b></div><div class="stat"><span>Productos</span><b>' + np + '</b></div><div class="stat"><span>Visibles</span><b>' + vis + '</b></div>';
    $('#pub').setAttribute('aria-checked', c.pub);
    $('#publbl').innerHTML = '<span class="badge ' + (c.pub ? 'badge--ok' : 'badge--off') + '">' + (c.pub ? 'Publicada' : 'Borrador') + '</span>';
    $('#trashn').textContent = S.trash.length;
  }
  function catWarn(k) { return allProds(k).some(function (p) { return p.st === 'a'; }); }
  function paintCats() {
    var q = S.catq.toLowerCase(), h = '', sc = $('#cats') && $('#cats').scrollTop;
    roots().forEach(function (k) {
      var ks = kids(k.id), match = k.name.toLowerCase().indexOf(q) >= 0 || ks.some(function (s) { return s.name.toLowerCase().indexOf(q) >= 0; });
      if (q && !match) return;
      h += catRow(k, ks.length > 0);
      if (ks.length && (k.open || q)) ks.forEach(function (s) { h += catRow(s, false); });
    });
    if (!h) h = '<p class="hint" style="padding:12px">Sin resultados para “' + esc(S.catq) + '”.</p>';
    $('#cats').innerHTML = h;
    if (sc) $('#cats').scrollTop = sc;
    var sel = $('#catsel');
    sel.innerHTML = S.carta.cats.map(function (k) { return '<option value="' + k.id + '"' + (k.id === S.catId ? ' selected' : '') + '>' + (k.parent ? '— ' : '') + esc(k.name) + ' (' + allProds(k).length + ')</option>'; }).join('');
  }
  function catRow(k, hasKids) {
    var n = allProds(k).length, state = !k.visible ? 'hidden' : catWarn(k) ? 'warn' : '';
    return '<div class="cat' + (k.parent ? ' sub' : '') + '" draggable="true" data-cat="' + k.id + '" aria-current="' + (k.id === S.catId) + '">' +
      '<span class="cat__grip" title="Arrastre para reordenar">' + I.grip + '</span>' +
      (hasKids ? '<button class="cat__chev" type="button" data-a="toggle" data-id="' + k.id + '" aria-expanded="' + k.open + '" aria-label="Mostrar subcategorías">' + I.chev + '</button>' : (k.parent ? '' : '<span class="cat__spacer"></span>')) +
      '<button class="cat__body" type="button" data-a="selcat" data-id="' + k.id + '"><span class="cat__name">' + esc(k.name) + '</span><span class="cat__count">' + n + (n === 1 ? ' producto' : ' productos') + (!k.visible ? ' · oculta' : '') + '</span></button>' +
      '<span class="cat__state ' + state + '" title="' + (!k.visible ? 'Categoría oculta' : catWarn(k) ? 'Tiene productos agotados' : 'Visible') + '"></span></div>';
  }
  function selectCat(id) {
    S.catId = id; S.sel = {}; S.quick = false; S.q = ''; var pq = $('#pq'); if (pq) pq.value = '';
    history.replaceState(null, '', '#/carta/' + S.carta.id + '/cat/' + id);
    paintCats(); paintMain();
  }
  function paintMain() {
    var k = cat(S.catId); if (!k) { $('#mainhead').innerHTML = ''; $('#list').innerHTML = '<div class="empty"><h3>Esta carta no tiene categorías</h3><p>Cree la primera con el campo “Nueva categoría”.</p></div>'; return; }
    var n = allProds(k).length;
    $('#mainhead').innerHTML = '<div class="main__head"><h2>' + esc(k.name) + ' <span class="count">' + n + ' productos</span>' + (!k.visible ? ' <span class="badge badge--off">Oculta</span>' : '') + '</h2>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--sm" type="button" data-a="editcat" data-id="' + k.id + '">' + I.cog + ' Configurar categoría</button>' +
      '<button class="btn btn--sm" type="button" data-a="togglecat" data-id="' + k.id + '">' + I.eye + (k.visible ? ' Ocultar' : ' Mostrar') + '</button></div></div>';
    $$('#flt button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === S.filter); });
    paintList(); paintBulk();
  }
  function visibleProds(k) {
    var q = S.q.toLowerCase();
    var r = k.prods.filter(function (p) { return (S.filter === 'all' || p.st === S.filter) && (!q || p.name.toLowerCase().indexOf(q) >= 0); });
    if (S.sort === 'name') r = r.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
    if (S.sort === 'price') r = r.slice().sort(function (a, b) { return a.price - b.price; });
    return r;
  }
  function prodRow(p) {
    var thumb = p.img ? '<img src="' + p.img + '" alt="" style="object-position:' + ((p.id * 17) % 80 + 10) + '% 50%">' : I.plate;
    return '<div class="prod' + (S.sel[p.id] ? ' sel' : '') + (p.st !== 'v' ? ' off' : '') + '" draggable="true" data-prod="' + p.id + '">' +
      '<span class="grip" title="Arrastre para reordenar o moverlo a otra categoría">' + I.grip + '</span>' +
      '<input class="chk" type="checkbox" data-a="selprod" data-id="' + p.id + '"' + (S.sel[p.id] ? ' checked' : '') + ' aria-label="Seleccionar ' + esc(p.name) + '">' +
      '<div class="prod__thumb">' + thumb + '</div>' +
      '<div class="prod__info"><div class="prod__name">' + esc(p.name) + '</div><div class="prod__sub"><span class="price">' + (p.hidePrices ? 'Precio oculto' : money(p.price)) + '</span>' + (p.prices && p.prices.length > 1 ? '<span class="badge badge--type">' + p.prices.length + ' precios</span>' : '') + (p.mods && p.mods.length ? '<span class="badge badge--type">' + p.mods.length + ' modificadores</span>' : '') + (p.combo ? '<span class="badge badge--rec">Combo · ' + p.combo.items.length + ' productos</span>' : '') + (p.sched ? '<span class="badge badge--sched" title="' + esc(schedText(p.sched)) + '">Programado</span>' : '') +
      (p.rec ? '<span class="badge badge--rec">Recomendado</span>' : '') + (p.nw ? '<span class="badge badge--new">Nuevo</span>' : '') + '</div></div>' +
      '<div class="seg" role="group" aria-label="Estado de ' + esc(p.name) + '">' +
      ['v', 'o', 'a'].map(function (s) { return '<button type="button" class="s-' + s + '" data-a="st" data-id="' + p.id + '" data-s="' + s + '" aria-pressed="' + (p.st === s) + '">' + stLabel(s) + '</button>'; }).join('') + '</div>' +
      '<div class="prod__actions"><button class="iconbtn" type="button" data-a="dup" data-id="' + p.id + '" aria-label="Duplicar" title="Duplicar">' + I.copy + '</button>' +
      '<button class="iconbtn" type="button" data-a="editprod" data-id="' + p.id + '" aria-label="Editar" title="Editar">' + I.edit + '</button>' +
      '<button class="iconbtn" type="button" data-a="menu" data-id="' + p.id + '" aria-label="Más acciones" aria-haspopup="menu">' + I.more + '</button>' +
      (S.menuFor === p.id ? menuHtml(p) : '') + '</div></div>';
  }
  function paintList() {
    var k = cat(S.catId); if (!k) return;
    var h = '';
    if (S.quick) h += '<div class="quick"><input class="input" id="qn" placeholder="Nombre del producto" aria-label="Nombre"><input class="input" id="qp" inputmode="numeric" placeholder="Precio" aria-label="Precio"><button class="btn btn--primary" type="button" data-a="quickadd">Agregar</button><button class="btn" type="button" data-a="quickclose">Cerrar</button></div>';
    var own = visibleProds(k);
    h += own.map(prodRow).join('');
    kids(k.id).forEach(function (s) {
      var l = visibleProds(s);
      h += '<h3 class="groupttl">' + esc(s.name) + ' · ' + s.prods.length + '</h3>';
      h += l.length ? l.map(prodRow).join('') : '<p class="hint">Sin productos en esta subcategoría.</p>';
    });
    if (!own.length && !kids(k.id).length) {
      h += (k.prods.length ? '<div class="empty"><h3>Nada coincide</h3><p>Pruebe con otro filtro o búsqueda.</p></div>' : '<div class="empty"><h3>Categoría vacía</h3><p>Agregue el primer producto con “Nuevo producto”.</p></div>');
    }
    $('#list').innerHTML = h;
    if (S.quick) { var qn = $('#qn'); if (qn) qn.focus(); }
  }
  function paintBulk() {
    var ids = selIds(), el = $('#bulk');
    if (!ids.length) { el.innerHTML = ''; return; }
    el.innerHTML = '<div class="bulk" role="toolbar" aria-label="Acciones masivas"><b>' + ids.length + ' seleccionado' + (ids.length > 1 ? 's' : '') + '</b>' +
      '<button class="btn btn--sm" type="button" data-a="bst" data-s="v">Mostrar</button><button class="btn btn--sm" type="button" data-a="bst" data-s="o">Ocultar</button><button class="btn btn--sm" type="button" data-a="bst" data-s="a">Agotado</button>' +
      '<select class="select" id="bmove" aria-label="Mover a otra categoría"><option value="">Mover a…</option>' + S.carta.cats.map(function (k) { return '<option value="' + k.id + '">' + esc(k.name) + '</option>'; }).join('') + '</select>' +
      '<button class="btn btn--sm" type="button" data-a="bdel">' + I.trash + ' Eliminar</button><button class="btn btn--sm btn--ghost" type="button" data-a="bclear" style="margin-left:auto">Cancelar</button></div>';
    $('#bmove').onchange = function () { if (this.value) moveMany(selIds(), +this.value); };
  }

  /* ---------- Acciones de datos ---------- */
  function setState(id, st) { var f = findProd(id); if (!f) return; f.p.st = st; paintHead(); paintCats(); paintList(); }
  function removeProds(ids) {
    var removed = [];
    ids.forEach(function (id) { var f = findProd(id); if (!f) return; var i = f.c.prods.indexOf(f.p); f.c.prods.splice(i, 1); removed.push({ p: f.p, c: f.c, i: i }); });
    S.trash = S.trash.concat(removed); S.sel = {}; S.menuFor = null;
    paintHead(); paintCats(); paintMain();
    toast(removed.length + (removed.length > 1 ? ' productos enviados a la papelera' : ' producto enviado a la papelera'), function () {
      removed.reverse().forEach(function (r) { r.c.prods.splice(r.i, 0, r.p); S.trash = S.trash.filter(function (t) { return t.p !== r.p; }); });
      paintHead(); paintCats(); paintMain();
    });
  }
  function moveMany(ids, to) {
    var dest = cat(to), n = 0;
    ids.forEach(function (id) { var f = findProd(id); if (f && f.c !== dest) { f.c.prods.splice(f.c.prods.indexOf(f.p), 1); dest.prods.push(f.p); n++; } });
    S.sel = {}; S.menuFor = null; paintHead(); paintCats(); paintMain();
    toast(n + (n === 1 ? ' producto movido a ' : ' productos movidos a ') + dest.name);
  }
  function quickAdd() {
    var n = $('#qn').value.trim(), pr = parseInt(($('#qp').value || '0').replace(/\D/g, ''), 10) || 0;
    if (!n) { $('#qn').focus(); return; }
    cat(S.catId).prods.push(P(n, pr, 'v')); paintHead(); paintCats(); paintList();
    toast('“' + n + '” agregado'); // el campo queda abierto para seguir cargando
  }

  /* ---------- Drawer ---------- */
  var dr = { type: null, id: null, dirty: false, data: null };
  function openDrawer(html, type, id) {
    dr.type = type; dr.id = id; dr.dirty = false;
    var d = $('#drawer'); d.innerHTML = html; d.hidden = false; $('#scrim').hidden = false; d.classList.toggle('drawer--wide', type === 'prod');
    document.body.style.overflow = 'hidden';
    var f = $('input,select,textarea', d); if (f) f.focus();
    $$('input,select,textarea', d).forEach(function (el) { el.addEventListener('input', markDirty); el.addEventListener('change', markDirty); });
  }
  function markDirty() { if (dr.dirty) return; dr.dirty = true; var f = $('#drawerFoot .dirty'); if (f) f.hidden = false; }
  function closeDrawer(force) {
    if (!$('#drawer') || $('#drawer').hidden) return;
    if (dr.dirty && !force) { var b = $('#dirtybanner'); if (b) b.hidden = false; return; }
    $('#drawer').hidden = true; $('#scrim').hidden = true; $('#drawer').innerHTML = ''; dr.dirty = false; document.body.style.overflow = '';
  }
  function head(title, sub) {
    return '<div class="drawer__head"><div><h2 id="drawerTitle">' + title + '</h2><p>' + sub + '</p></div><button class="iconbtn" type="button" data-a="dclose" aria-label="Cerrar">' + I.close + '</button></div>' +
      '<div class="banner" id="dirtybanner" hidden style="margin:12px 20px 0"><span>Tiene cambios sin guardar.</span><span><button class="btn btn--sm" type="button" data-a="dstay">Seguir editando</button> <button class="btn btn--sm btn--danger" type="button" data-a="ddiscard">Descartar</button></span></div>';
  }
  /* ---------- Editor completo de producto (drawer con pestañas) ---------- */
  var GAL = ['../assets/foto-4.png', '../assets/foto-5.jpeg', '../assets/foto-1.png', '../assets/foto-2.png', '../assets/foto-3.png', '../assets/foto-6.png', '../assets/foto-7.png', '../assets/foto-8.png'];
  var TAGS_SUG = ['Sin gluten', 'Vegano', 'Picante', 'Para compartir', 'Mariscos', 'Casero'];
  var SEEDX = {
    'Patacón pisao': { prices: [{ name: 'Individual', value: 35000 }, { name: 'Para compartir', value: 62000 }], tags: ['Casero', 'Para compartir'], prep: 12, code: 'ENT-001' },
    'Lomo fino a la parrilla': { prep: 25, code: 'CAR-001', tags: ['Parrilla'], types: ['Carne', 'Plato fuerte', '', ''], link: 'https://ejemplo.com/lomo',
      mods: [{ name: 'Punto de cocción', type: 'OPTION', required: true, min: 1, max: 1, options: [{ name: 'Término medio', price: 0 }, { name: 'Tres cuartos', price: 0 }, { name: 'Bien cocido', price: 0 }] },
             { name: 'Acompañantes extra', type: 'ADDITION', required: false, min: 0, max: 2, options: [{ name: 'Papa criolla', price: 4000 }, { name: 'Queso gratinado', price: 3000 }] }] },
    'Salmón al grill': { prep: 20, code: 'PES-002', tags: ['Sin gluten'] }
  };
  function ens(p) {
    if (p.ens) return p;
    p.ens = true; p.code = p.code || ''; p.images = p.img ? [p.img] : []; p.prices = [{ name: '', value: p.price }]; p.tags = []; p.hidePrices = false;
    p.prep = null; p.perUnit = false; p.types = ['', '', '', '']; p.link = ''; p.mods = [];
    var x = SEEDX[p.name]; if (x) Object.keys(x).forEach(function (k) { p[k] = JSON.parse(JSON.stringify(x[k])); }); if (x && x.prices) p.price = x.prices[0].value;
    if (p.desc && !/<[a-z][\s\S]*>/i.test(p.desc)) p.desc = esc(p.desc);
    p.hist = [];
    if (p.price > 0 && p.name === 'Patacón pisao') p.hist.push({ title: 'Precio actualizado', detail: '$32.000 → $35.000', when: '12 de noviembre · 4:20 p. m.' });
    p.hist.push({ title: 'Producto creado', detail: '', when: '3 de noviembre · 9:14 a. m.' });
    return p;
  }
  var PD = { tab: 'basicos', gal: null, mod: null, help: false, err: {} };
  var FL = { name: 'Nombre', code: 'Código', price: 'Precio', st: 'Estado', hidePrices: 'Esconder precios', rec: 'Recomendado', nw: 'Nuevo', prep: 'Tiempo de preparación', perUnit: 'Tiempo por unidad', link: 'Link', desc: 'Descripción', tags: 'Etiquetas', images: 'Imágenes', mods: 'Modificadores', cat: 'Categoría' };

  function editProd(id) {
    var f = findProd(id); if (!f) return; var p = ens(f.p);
    PD = { tab: 'basicos', gal: null, mod: null, help: false, err: {} };
    var d = JSON.parse(JSON.stringify({ name: p.name, code: p.code, desc: p.desc || '', images: p.images, prices: p.prices, tags: p.tags, hidePrices: p.hidePrices, rec: p.rec, nw: p.nw, st: p.st, cat: f.c.id, prep: p.prep, perUnit: p.perUnit, types: p.types, link: p.link, mods: p.mods }));
    openDrawer(pdShell(p, d, f), 'prod', id);
    dr.data = d; dr.orig = JSON.parse(JSON.stringify(d)); dr.dirty = false;
    pdTab();
  }
  function pdShell(p, d, f) {
    return '<div class="drawer__head"><div style="min-width:0"><h2 id="drawerTitle">' + esc(p.name) + '</h2><p>' + esc(S.carta.name) + ' › ' + esc(f.c.name) + '</p></div>' +
      '<div style="display:flex;gap:8px;align-items:center"><select class="select" id="pd-st" aria-label="Visibilidad"><option value="v">Visible</option><option value="o">Oculto</option><option value="a">Agotado</option></select>' +
      '<button class="iconbtn" type="button" data-a="dclose" aria-label="Cerrar">' + I.close + '</button></div></div>' +
      '<div class="banner" id="dirtybanner" hidden style="margin:12px 20px 0"><span>Tiene cambios sin guardar.</span><span><button class="btn btn--sm" type="button" data-a="dstay">Seguir editando</button> <button class="btn btn--sm btn--danger" type="button" data-a="ddiscard">Descartar</button></span></div>' +
      '<div class="tabs" role="tablist">' + [['basicos', 'Datos básicos'], ['mods', 'Modificadores'], ['extras', 'Extras'], ['hist', 'Historial']].map(function (t) { return '<button type="button" class="tab" role="tab" data-pd="tab" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="drawer__body" id="pdbody"></div>' +
      '<div class="drawer__foot" id="drawerFoot"><span class="dirty" hidden>● Cambios sin guardar</span><button class="btn" type="button" data-a="dclose">Cancelar</button><button class="btn btn--primary" type="button" data-pd="save">Guardar</button></div>';
  }
  function pdTab() {
    var d = dr.data; $('#pd-st').value = d.st;
    $$('.tab').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-v') === PD.tab); });
    var el = $('#pdbody');
    el.innerHTML = PD.tab === 'basicos' ? pdBasic(d) : PD.tab === 'mods' ? pdMods(d) : PD.tab === 'extras' ? pdExtras(d) : pdHist();
    el.scrollTop = 0;
    if (PD.tab === 'basicos') { var rt = $('#rt'); if (rt) rt.innerHTML = d.desc; pdCount(); }
  }
  function toggleRow(key, label, val, help) {
    return '<div class="trow"><div><span class="tlabel">' + label + '</span>' + (help ? ' <button type="button" class="helpbtn" data-pd="help" aria-label="Ayuda" title="Ayuda">?</button>' : '') + '</div><button class="switch" type="button" role="switch" data-pd="tg" data-k="' + key + '" aria-checked="' + !!val + '" aria-label="' + label + '"></button></div>';
  }
  function pdBasic(d) {
    var h = '<section><span class="lab">Imágenes</span><div class="slots">';
    for (var i = 0; i < 3; i++) {
      var im = d.images[i];
      if (im) h += '<div class="slot"><img src="' + im + '" alt=""><div class="slot__ov"><a class="rb" href="' + im + '" target="_blank" rel="noopener" aria-label="Ver imagen">' + I.eye + '</a><button type="button" class="rb" data-pd="imgchg" data-i="' + i + '" aria-label="Cambiar imagen">' + I.edit + '</button><button type="button" class="rb red" data-pd="imgdel" data-i="' + i + '" aria-label="Quitar imagen">' + I.trash + '</button></div></div>';
      else h += '<button type="button" class="slot slot--empty" data-pd="imgadd" data-i="' + i + '"' + (i === d.images.length ? '' : ' disabled') + ' aria-label="Agregar imagen">' + (i === d.images.length ? I.plus : '') + '</button>';
    }
    h += '</div>';
    if (PD.gal !== null) h += '<div class="gal" role="group" aria-label="Galería de muestra"><span class="hint">Elija una imagen (en la versión real: subir desde su equipo).</span><div class="gal__row">' + GAL.map(function (g, i) { return '<button type="button" data-pd="imgset" data-v="' + g + '"><img src="' + g + '" alt="Imagen de muestra ' + (i + 1) + '"></button>'; }).join('') + '</div></div>';
    h += '<p class="hint">720x720px · JPG, PNG o WebP, máx. 2 MB</p></section>';
    h += '<section class="field"><label for="pd-name" class="lab">Nombre</label><input class="input' + (PD.err.name ? ' invalid' : '') + '" id="pd-name" data-k="name" maxlength="40" value="' + esc(d.name) + '">' + (PD.err.name ? '<div class="err">' + PD.err.name + '</div>' : '') + '<div class="counter" id="cnt-name"></div></section>';
    h += '<div class="two"><section class="field"><label for="pd-code" class="lab">Código de producto</label><input class="input" id="pd-code" data-k="code" maxlength="30" placeholder="Ej: CEV-001" value="' + esc(d.code) + '"></section>' +
      '<section class="field"><label for="pd-cat" class="lab">Categoría</label><select class="select" id="pd-cat" data-k="cat">' + S.carta.cats.map(function (k) { return '<option value="' + k.id + '"' + (k.id === +d.cat ? ' selected' : '') + '>' + (k.parent ? '— ' : '') + esc(k.name) + '</option>'; }).join('') + '</select></section></div>';
    h += '<section><span class="lab">Descripción</span><div class="rte"><div class="rte__bar" role="toolbar" aria-label="Formato de descripción">' +
      [['bold', '<b>B</b>', 'Negrita'], ['italic', '<i>I</i>', 'Cursiva'], ['underline', '<u>U</u>', 'Subrayado'], ['strikeThrough', '<s>S</s>', 'Tachado']].map(function (b) { return '<button type="button" data-pd="fmt" data-cmd="' + b[0] + '" title="' + b[2] + '" aria-label="' + b[2] + '">' + b[1] + '</button>'; }).join('') +
      '</div><div class="rte__area" id="rt" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Descripción"></div></div><div class="counter" id="cnt-desc"></div></section>';
    h += '<section><span class="lab">Precios</span><div class="pricebox">' + d.prices.map(function (pr, i) {
      return '<div class="prow"><input class="input" placeholder="Nombre" aria-label="Nombre del precio ' + (i + 1) + '" data-pi="' + i + '" data-pf="name" value="' + esc(pr.name) + '"><div class="money"><span>$</span><input class="input" type="number" min="0" step="1" aria-label="Valor del precio ' + (i + 1) + '" data-pi="' + i + '" data-pf="value" value="' + pr.value + '"></div>' +
        '<button class="iconbtn" type="button" data-pd="pdel" data-i="' + i + '" aria-label="Quitar precio ' + (i + 1) + '">' + I.close + '</button></div>';
    }).join('') + '<button type="button" class="addrow" data-pd="padd">Agregar más precios ' + I.plus + '</button></div></section>';
    h += '<section><span class="lab">Etiquetas</span><div class="tagbox">' + d.tags.map(function (t, i) { return '<span class="tagchip">' + esc(t) + '<button type="button" data-pd="tagdel" data-i="' + i + '" aria-label="Quitar etiqueta ' + esc(t) + '">×</button></span>'; }).join('') +
      '<input id="tag-in" class="taginput" placeholder="Escriba y presione Enter" aria-label="Agregar etiqueta"></div><div class="sug"><span class="hint">Sugeridas:</span>' + TAGS_SUG.filter(function (t) { return d.tags.indexOf(t) < 0; }).map(function (t) { return '<button type="button" class="chipbtn" data-pd="tagadd" data-v="' + t + '">+ ' + t + '</button>'; }).join('') + '</div></section>';
    h += '<section><span class="lab">Acciones</span><div class="trows">' + toggleRow('hidePrices', 'Esconder precios', d.hidePrices) + '<div class="hint" style="margin:-4px 0 6px">Oculta los precios de este producto en la carta pública.</div>' + toggleRow('rec', 'Recomendado', d.rec) + toggleRow('nw', 'Nuevo', d.nw) + '</div></section>';
    return h;
  }
  function pdCount() {
    var d = dr.data, a = $('#cnt-name'), b = $('#cnt-desc'); if (a) a.textContent = d.name.length + ' / 40';
    if (b) { var rt = $('#rt'); b.textContent = (rt ? rt.textContent.length : 0) + ' / 10000'; }
  }
  function pdExtras(d) {
    var h = '<section class="field"><label class="lab" for="pd-prep">Tiempo de preparación</label><div class="unit"><input class="input" id="pd-prep" type="number" min="0" data-k="prep" value="' + (d.prep == null ? '' : d.prep) + '"><span>Minutos</span></div></section>';
    h += '<div class="trows">' + toggleRow('perUnit', 'Tiempo de preparación por unidad', d.perUnit, true) + '</div>';
    if (PD.help) h += '<div class="helpbubble">El tiempo de preparación por unidad es el tiempo que se necesita para preparar una unidad del producto.</div>';
    for (var i = 0; i < 4; i++) h += '<section class="field"><label class="lab" for="pd-t' + i + '">Tipo de producto ' + (i + 1) + '</label><input class="input" id="pd-t' + i + '" data-ti="' + i + '" value="' + esc(d.types[i] || '') + '"></section>';
    h += '<section class="field"><label class="lab" for="pd-link">Link</label><input class="input" id="pd-link" type="url" data-k="link" placeholder="https://" value="' + esc(d.link || '') + '"></section>';
    return h;
  }
  function modSummary(m) { return (m.type === 'ADDITION' ? 'Adición' : 'Opción') + ' · ' + (m.required ? 'Obligatorio' : 'Opcional') + ' · ' + m.min + '–' + m.max + ' · ' + m.options.length + (m.options.length === 1 ? ' opción' : ' opciones'); }
  function pdMods(d) {
    if (PD.mod) {
      var m = PD.mod.draft;
      return '<h3 class="subttl">' + (PD.mod.index === null ? 'Nuevo modificador' : 'Editar modificador') + '</h3>' +
        '<section class="field"><label class="lab" for="m-name">Nombre</label><input class="input' + (PD.err.mod ? ' invalid' : '') + '" id="m-name" data-mk="name" maxlength="40" placeholder="Ej: Punto de cocción" value="' + esc(m.name) + '">' + (PD.err.mod ? '<div class="err">' + PD.err.mod + '</div>' : '') + '</section>' +
        '<section><span class="lab">Tipo</span><div class="two">' + [['ADDITION', 'Adición', 'Cobro extra por cada opción elegida'], ['OPTION', 'Opción', 'El cliente elige entre las opciones sin cargo extra']].map(function (t) { return '<button type="button" class="typeopt" data-pd="mtype" data-v="' + t[0] + '" aria-pressed="' + (m.type === t[0]) + '"><b>' + t[1] + '</b><small>' + t[2] + '</small></button>'; }).join('') + '</div></section>' +
        '<div class="trows">' + toggleRow('m-required', 'Obligatorio', m.required) + '</div>' +
        '<div class="two"><section class="field"><label class="lab" for="m-min">Mínimo</label><input class="input" id="m-min" type="number" min="0" data-mk="min" value="' + m.min + '"></section><section class="field"><label class="lab" for="m-max">Máximo</label><input class="input" id="m-max" type="number" min="1" data-mk="max" value="' + m.max + '"></section></div>' +
        '<section><span class="lab">Opciones</span><div class="pricebox">' + m.options.map(function (o, i) { return '<div class="prow"><input class="input" placeholder="Nombre" aria-label="Nombre de la opción ' + (i + 1) + '" data-oi="' + i + '" data-of="name" value="' + esc(o.name) + '"><div class="money"><span>$</span><input class="input" type="number" min="0" aria-label="Precio de la opción ' + (i + 1) + '" data-oi="' + i + '" data-of="price" value="' + o.price + '"></div><button class="iconbtn" type="button" data-pd="odel" data-i="' + i + '" aria-label="Quitar opción ' + (i + 1) + '">' + I.close + '</button></div>'; }).join('') +
        '<button type="button" class="addrow" data-pd="oadd">Agregar opción ' + I.plus + '</button></div></section>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" type="button" data-pd="mcancel">Cancelar</button><button class="btn btn--primary" type="button" data-pd="msave">Guardar modificador</button></div>';
    }
    var h = '<div class="pagehead" style="margin:0"><h3 class="subttl">Adiciones y opciones</h3><button class="btn btn--sm" type="button" data-pd="mnew">' + I.plus + ' Nuevo modificador</button></div>';
    if (!d.mods.length) return h + '<div class="empty" style="padding:28px 8px"><h3>Sin modificadores</h3><p>Agregue adiciones (con costo) u opciones (sin costo), como punto de cocción o acompañantes.</p></div>';
    return h + d.mods.map(function (m, i) {
      return '<div class="modcard"><div style="min-width:0"><b>' + esc(m.name) + '</b><div class="hint">' + modSummary(m) + '</div><div class="hint">' + m.options.map(function (o) { return esc(o.name) + (o.price ? ' (+' + money(o.price) + ')' : ''); }).join(', ') + '</div></div>' +
        '<div style="display:flex;gap:2px"><button class="iconbtn" type="button" data-pd="medit" data-i="' + i + '" aria-label="Editar modificador">' + I.edit + '</button><button class="iconbtn" type="button" data-pd="mdel" data-i="' + i + '" aria-label="Eliminar modificador">' + I.trash + '</button></div></div>';
    }).join('');
  }
  function pdHist() {
    var f = findProd(dr.id), hs = f ? f.p.hist : [];
    if (!hs.length) return '<p class="empty">Guarde el producto para ver su historial</p>';
    return '<ol class="tl">' + hs.map(function (e) { return '<li><span class="dot"></span><div><b>' + esc(e.title) + '</b>' + (e.detail ? '<div class="hint">' + esc(e.detail) + '</div>' : '') + '<div class="hint">' + esc(e.when) + ' · Administrador</div></div></li>'; }).join('') + '</ol>';
  }
  function plain(h) { var t = document.createElement('div'); t.innerHTML = h; return t.textContent; }
  function saveProd() {
    var d = dr.data, f = findProd(dr.id), p = f.p; PD.err = {};
    if (!d.name.trim()) { PD.err.name = 'El nombre es obligatorio.'; PD.tab = 'basicos'; pdTab(); var n = $('#pd-name'); if (n) n.focus(); return; }
    var now = new Date(), when = 'Hoy · ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }), o = dr.orig, add = [];
    function chg(k, a, b) { if (a !== b) add.push({ title: (FL[k] || k) + (k === 'desc' || k === 'cat' ? ' actualizada' : ' actualizado'), detail: (a === '' || a == null ? '—' : String(a)) + ' → ' + (b === '' || b == null ? '—' : String(b)), when: when }); }
    function yn(v) { return v ? 'Sí' : 'No'; }
    chg('name', o.name, d.name); chg('code', o.code, d.code); chg('st', stLabel(o.st), stLabel(d.st));
    var op = o.prices.map(function (x) { return x.name + ' ' + money(x.value); }).join(', '), np = d.prices.map(function (x) { return x.name + ' ' + money(x.value); }).join(', ');
    if (op !== np) add.push({ title: 'Precio actualizado', detail: np, when: when });
    chg('hidePrices', yn(o.hidePrices), yn(d.hidePrices)); chg('rec', yn(o.rec), yn(d.rec)); chg('nw', yn(o.nw), yn(d.nw));
    chg('prep', o.prep, d.prep); chg('link', o.link, d.link); chg('desc', plain(o.desc), plain(d.desc));
    if (o.tags.join() !== d.tags.join()) add.push({ title: 'Etiquetas actualizadas', detail: d.tags.join(', ') || '—', when: when });
    if (o.images.join() !== d.images.join()) add.push({ title: 'Imágenes actualizadas', detail: d.images.length + (d.images.length === 1 ? ' imagen' : ' imágenes'), when: when });
    if (JSON.stringify(o.mods) !== JSON.stringify(d.mods)) add.push({ title: 'Modificadores actualizados', detail: d.mods.length + (d.mods.length === 1 ? ' modificador' : ' modificadores'), when: when });
    p.name = d.name.trim(); p.code = d.code; p.desc = d.desc; p.images = d.images; p.img = d.images[0] || null; p.prices = d.prices; p.price = Number(d.prices[0] ? d.prices[0].value : 0) || 0;
    p.tags = d.tags; p.hidePrices = d.hidePrices; p.rec = d.rec; p.nw = d.nw; p.st = d.st; p.prep = d.prep; p.perUnit = d.perUnit; p.types = d.types; p.link = d.link; p.mods = d.mods;
    p.hist = add.reverse().concat(p.hist);
    var to = +d.cat; if (to !== f.c.id) { f.c.prods.splice(f.c.prods.indexOf(p), 1); cat(to).prods.push(p); }
    dr.dirty = false; closeDrawer(true); paintHead(); paintCats(); paintMain(); toast('Producto guardado' + (add.length ? ' · ' + add.length + (add.length === 1 ? ' cambio registrado' : ' cambios registrados') : ''));
  }

  /* Eventos del editor de producto */
  function pdActive() { return dr.type === 'prod' && !$('#drawer').hidden; }
  document.addEventListener('input', function (e) {
    if (!pdActive()) return; var t = e.target, d = dr.data;
    if (t.id === 'rt') { d.desc = t.innerHTML; pdCount(); markDirty(); return; }
    if (t.id === 'pd-st') { d.st = t.value; markDirty(); return; }
    if (t.hasAttribute('data-k')) { var k = t.getAttribute('data-k'); d[k] = k === 'prep' ? (t.value === '' ? null : Number(t.value)) : t.value; if (k === 'name') pdCount(); markDirty(); }
    else if (t.hasAttribute('data-pi')) { var pr = d.prices[+t.getAttribute('data-pi')], pf = t.getAttribute('data-pf'); pr[pf] = pf === 'value' ? Number(t.value) : t.value; markDirty(); }
    else if (t.hasAttribute('data-ti')) { d.types[+t.getAttribute('data-ti')] = t.value; markDirty(); }
    else if (t.hasAttribute('data-mk') && PD.mod) { var mk = t.getAttribute('data-mk'); PD.mod.draft[mk] = (mk === 'min' || mk === 'max') ? Number(t.value) : t.value; }
    else if (t.hasAttribute('data-oi') && PD.mod) { var of = t.getAttribute('data-of'); PD.mod.draft.options[+t.getAttribute('data-oi')][of] = of === 'price' ? Number(t.value) : t.value; }
  });
  document.addEventListener('paste', function (e) { if (e.target.id === 'rt') { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text')); } });
  document.addEventListener('mousedown', function (e) { if (e.target.closest('[data-pd="fmt"]')) e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    if (pdActive() && e.target.id === 'tag-in' && (e.key === 'Enter' || e.key === ',')) { e.preventDefault(); addTag(e.target.value); }
    if (pdActive() && e.target.id === 'tag-in' && e.key === 'Backspace' && !e.target.value && dr.data.tags.length) { dr.data.tags.pop(); markDirty(); pdTab(); $('#tag-in').focus(); }
  });
  function addTag(v) { v = (v || '').trim().replace(/,$/, ''); if (!v) return; if (dr.data.tags.indexOf(v) < 0 && dr.data.tags.length < 10) { dr.data.tags.push(v); markDirty(); } pdTab(); var i = $('#tag-in'); if (i) i.focus(); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-pd]'); if (!t || !pdActive()) return;
    var k = t.getAttribute('data-pd'), d = dr.data, i = +t.getAttribute('data-i'), v = t.getAttribute('data-v');
    if (k === 'tab') { PD.tab = v; PD.mod = null; pdTab(); }
    else if (k === 'save') saveProd();
    else if (k === 'fmt') { document.execCommand(t.getAttribute('data-cmd')); var rt = $('#rt'); d.desc = rt.innerHTML; markDirty(); }
    else if (k === 'imgadd') { PD.gal = i; pdTab(); }
    else if (k === 'imgchg') { PD.gal = i; pdTab(); }
    else if (k === 'imgdel') { d.images.splice(i, 1); PD.gal = null; markDirty(); pdTab(); }
    else if (k === 'imgset') { if (PD.gal < d.images.length) d.images[PD.gal] = v; else d.images.push(v); PD.gal = null; markDirty(); pdTab(); }
    else if (k === 'padd') { d.prices.push({ name: '', value: 0 }); markDirty(); pdTab(); }
    else if (k === 'pdel') { d.prices.splice(i, 1); if (!d.prices.length) d.prices.push({ name: '', value: 0 }); markDirty(); pdTab(); }
    else if (k === 'tagdel') { d.tags.splice(i, 1); markDirty(); pdTab(); }
    else if (k === 'tagadd') addTag(v);
    else if (k === 'tg') { var key = t.getAttribute('data-k'), on = t.getAttribute('aria-checked') !== 'true'; if (key === 'm-required') PD.mod.draft.required = on; else { d[key] = on; markDirty(); } t.setAttribute('aria-checked', on); }
    else if (k === 'help') { PD.help = !PD.help; pdTab(); }
    else if (k === 'mnew') { PD.mod = { index: null, draft: { name: '', type: 'OPTION', required: false, min: 0, max: 1, options: [{ name: '', price: 0 }] } }; PD.err = {}; pdTab(); }
    else if (k === 'medit') { PD.mod = { index: i, draft: JSON.parse(JSON.stringify(d.mods[i])) }; PD.err = {}; pdTab(); }
    else if (k === 'mdel') { var gone = d.mods.splice(i, 1)[0]; markDirty(); pdTab(); toast('Modificador “' + gone.name + '” quitado (se aplica al guardar)', function () { d.mods.splice(i, 0, gone); if (pdActive()) pdTab(); }); }
    else if (k === 'mtype') { PD.mod.draft.type = v; pdTab(); }
    else if (k === 'oadd') { PD.mod.draft.options.push({ name: '', price: 0 }); pdTab(); }
    else if (k === 'odel') { PD.mod.draft.options.splice(i, 1); if (!PD.mod.draft.options.length) PD.mod.draft.options.push({ name: '', price: 0 }); pdTab(); }
    else if (k === 'mcancel') { PD.mod = null; PD.err = {}; pdTab(); }
    else if (k === 'msave') {
      var m = PD.mod.draft; if (!m.name.trim()) { PD.err.mod = 'Escriba un nombre para el modificador.'; pdTab(); return; }
      m.options = m.options.filter(function (o) { return o.name.trim(); }); if (!m.options.length) { PD.err.mod = 'Agregue al menos una opción con nombre.'; m.options = [{ name: '', price: 0 }]; pdTab(); return; }
      if (m.max < 1) m.max = 1; if (m.min > m.max) m.min = m.max;
      if (PD.mod.index === null) d.mods.push(m); else d.mods[PD.mod.index] = m;
      PD.mod = null; PD.err = {}; markDirty(); pdTab();
    }
  });

  /* ---------- Menú "···" del producto ---------- */
  var MI = {
    move: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    copyto: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="12" height="13" rx="2"/><path d="M9 4h10a2 2 0 012 2v10M7 12h4M9 10v4"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    combo: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="M17 14v6M14 17h6"/></svg>',
    layers: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/></svg>'
  };
  function mi(label, attrs, icon, cls) { return '<button type="button" role="menuitem"' + (cls ? ' class="' + cls + '"' : '') + ' ' + attrs + '>' + icon + '<span>' + label + '</span></button>'; }
  function menuHtml(p) {
    var f = findProd(p.id), id = ' data-id="' + p.id + '"';
    if (S.menuView === 'move') {
      var others = S.carta.cats.filter(function (k) { return k.id !== f.c.id; });
      return '<div class="menu" role="menu"><button type="button" class="back" data-pm="menuview" data-v="root">← Mover a…</button>' +
        (others.length ? others.map(function (k) { return '<button type="button" role="menuitem" data-a="move"' + id + ' data-to="' + k.id + '"><span>' + (k.parent ? '— ' : '') + esc(k.name) + '</span></button>'; }).join('') : '<p class="hint" style="padding:8px 10px">No hay otras categorías.</p>') + '</div>';
    }
    return '<div class="menu" role="menu">' +
      mi('Mover a…', 'data-pm="menuview" data-v="move"' + id, MI.move) +
      mi('Copiar a…', 'data-pm="copydlg"' + id, MI.copyto) +
      '<hr><div class="lbl">Configuración</div>' +
      mi('Agregar presentaciones', 'data-pm="presdlg"' + id, MI.layers) +
      mi('Programar visibilidad', 'data-pm="scheddlg"' + id, MI.clock) +
      mi(p.combo ? 'Volver producto único' : 'Volver combo', 'data-pm="combo"' + id, MI.combo) +
      '<hr>' + mi('Eliminar', 'data-a="del"' + id, I.trash, 'btn--danger') + '</div>';
  }

  /* ---------- Diálogos del menú (Copiar, Programar, Combo) ---------- */
  var DG = null;
  function dlg(title, sub, body, foot) {
    openDrawer(head(title, sub) + '<div class="drawer__body">' + body + '</div><div class="drawer__foot" id="drawerFoot"><span class="dirty" hidden>● Cambios sin guardar</span><button class="btn" type="button" data-a="dclose">Cancelar</button>' + foot + '</div>', 'dlg', DG.id);
  }
  function catOptions(c, sel) { return c.cats.map(function (k) { return '<option value="' + k.id + '"' + (k.id === sel ? ' selected' : '') + '>' + (k.parent ? '— ' : '') + esc(k.name) + '</option>'; }).join(''); }
  function copyDlg(id) {
    var f = findProd(id); DG = { id: id };
    dlg('Copiar producto', '“' + esc(f.p.name) + '” se copia con sus imágenes, precios y modificadores.',
      '<div class="field"><label class="lab" for="cp-carta">Carta de destino</label><select class="select" id="cp-carta">' + cartas.map(function (c) { return '<option value="' + c.id + '"' + (c === S.carta ? ' selected' : '') + '>' + esc(c.sede) + ' · ' + esc(c.name) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label class="lab" for="cp-cat">Categoría de destino</label><select class="select" id="cp-cat">' + catOptions(S.carta, f.c.id) + '</select><div class="hint">Si copia en la misma categoría, el nombre llevará “(copia)”.</div></div>',
      '<button class="btn btn--primary" type="button" data-pm="cpdo">Copiar</button>');
  }
  function copyDo() {
    var f = findProd(DG.id), c2 = cartaById($('#cp-carta').value), k = c2.cats.filter(function (x) { return x.id === +$('#cp-cat').value; })[0];
    if (!k) return;
    var cp = JSON.parse(JSON.stringify(ens(f.p))); cp.id = nid(); if (k === f.c) cp.name += ' (copia)';
    cp.hist = [{ title: 'Producto creado', detail: 'Copiado de ' + f.p.name, when: 'Hoy' }]; k.prods.push(cp);
    closeDrawer(true); paintHead(); paintCats(); paintMain();
    toast('Copiado a ' + c2.sede + ' › ' + k.name, function () { k.prods.splice(k.prods.indexOf(cp), 1); paintHead(); paintCats(); paintMain(); });
  }
  var DAYS = [[1, 'L', 'Lunes'], [2, 'M', 'Martes'], [3, 'X', 'Miércoles'], [4, 'J', 'Jueves'], [5, 'V', 'Viernes'], [6, 'S', 'Sábado'], [7, 'D', 'Domingo']];
  function schedDlg(id) {
    var f = findProd(id), p = ens(f.p); DG = { id: id, days: (p.sched && p.sched.days.slice()) || [1, 2, 3, 4, 5, 6, 7] }; var s = p.sched || { start: '', end: '', from: '', to: '' };
    dlg('Programar visibilidad', '“' + esc(p.name) + '” solo se mostrará al cliente en las fechas y horas que elija.',
      '<div class="two"><div class="field"><label class="lab" for="sc-s">Desde</label><input class="input" id="sc-s" type="date" value="' + s.start + '"></div><div class="field"><label class="lab" for="sc-e">Hasta</label><input class="input" id="sc-e" type="date" value="' + s.end + '"></div></div>' +
      '<div class="field"><span class="lab">Días de la semana</span><div class="chips" role="group" aria-label="Días">' + DAYS.map(function (d) { return '<button type="button" class="chipbtn" data-pm="sday" data-v="' + d[0] + '" aria-pressed="' + (DG.days.indexOf(d[0]) >= 0) + '" title="' + d[2] + '">' + d[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="two"><div class="field"><label class="lab" for="sc-f">Hora de inicio</label><input class="input" id="sc-f" type="time" value="' + s.from + '"></div><div class="field"><label class="lab" for="sc-t">Hora de fin</label><input class="input" id="sc-t" type="time" value="' + s.to + '"></div></div>' +
      '<div class="hint" id="sc-err" style="color:var(--sold)"></div><p class="hint">Fuera de esta programación el producto se oculta solo; no cambia su estado de Visible/Oculto.</p>',
      (p.sched ? '<button class="btn btn--danger" type="button" data-pm="sclear" style="margin-right:auto">Quitar programación</button>' : '') + '<button class="btn btn--primary" type="button" data-pm="ssave">Guardar programación</button>');
  }
  function histPush(p, title, detail) { p.hist.unshift({ title: title, detail: detail || '', when: 'Hoy · ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }); }
  function schedSave() {
    var f = findProd(DG.id), p = f.p, s = $('#sc-s').value, e = $('#sc-e').value, fr = $('#sc-f').value, to = $('#sc-t').value, er = $('#sc-err');
    if (s && e && e < s) { er.textContent = 'La fecha final debe ser posterior a la inicial.'; return; }
    if (fr && to && to <= fr) { er.textContent = 'La hora de fin debe ser posterior a la de inicio.'; return; }
    if (!DG.days.length) { er.textContent = 'Elija al menos un día.'; return; }
    if (!s && !e && !fr && !to && DG.days.length === 7) { er.textContent = 'Defina fechas u horario; de lo contrario no hay nada que programar.'; return; }
    p.sched = { start: s, end: e, from: fr, to: to, days: DG.days.slice().sort() };
    histPush(p, 'Visibilidad programada', schedText(p.sched)); closeDrawer(true); paintList(); toast('Programación guardada');
  }
  function schedText(s) {
    var d = s.days.length === 7 ? 'todos los días' : s.days.map(function (n) { return DAYS[n - 1][2].slice(0, 3); }).join(', ');
    return d + (s.from ? ' · ' + s.from + (s.to ? '–' + s.to : '') : '') + (s.start ? ' · desde ' + dshort(s.start) : '') + (s.end ? ' hasta ' + dshort(s.end) : '');
  }
  function comboDlg(id) {
    var f = findProd(id), p = ens(f.p); DG = { id: id };
    var list = []; S.carta.cats.forEach(function (k) { k.prods.forEach(function (x) { if (x !== p && !x.combo) list.push({ p: x, c: k }); }); });
    dlg('Volver combo', '“' + esc(p.name) + '” agrupará varios productos de esta carta a un solo precio.',
      '<div class="search">' + I.search + '<input class="input" id="cb-q" placeholder="Buscar producto" aria-label="Buscar producto"></div>' +
      '<div class="cblist" id="cb-list">' + list.map(function (x) { return '<label class="cbitem" data-n="' + esc(x.p.name.toLowerCase()) + '"><input type="checkbox" class="chk" data-cb="' + x.p.id + '" data-price="' + x.p.price + '"><span class="cbn">' + esc(x.p.name) + '<small>' + esc(x.c.name) + '</small></span><span class="price">' + money(x.p.price) + '</span></label>'; }).join('') + '</div>' +
      '<div class="sumrow"><span>Suma de componentes</span><b id="cb-sum">$0</b></div>' +
      '<div class="field"><label class="lab" for="cb-price">Precio del combo (COP)</label><input class="input" id="cb-price" type="number" min="0" value="' + p.price + '"><div class="hint" id="cb-save"></div></div><div class="err" id="cb-err"></div>',
      '<button class="btn btn--primary" type="button" data-pm="cbsave">Volver combo</button>');
  }
  function comboSum() {
    var tot = 0, n = 0; $$('#cb-list [data-cb]').forEach(function (c) { if (c.checked) { tot += +c.getAttribute('data-price'); n++; } });
    $('#cb-sum').textContent = money(tot) + ' · ' + n + (n === 1 ? ' producto' : ' productos');
    var pr = +$('#cb-price').value, s = $('#cb-save'); s.textContent = tot && pr && pr < tot ? 'El cliente ahorra ' + money(tot - pr) + ' (' + Math.round((1 - pr / tot) * 100) + ' %).' : '';
  }
  function comboSave() {
    var f = findProd(DG.id), p = f.p, ids = $$('#cb-list [data-cb]').filter(function (c) { return c.checked; }).map(function (c) { return +c.getAttribute('data-cb'); });
    if (ids.length < 2) { $('#cb-err').textContent = 'Elija al menos dos productos para el combo.'; return; }
    p.combo = { items: ids.map(function (i) { return findProd(i).p.name; }) }; p.price = +$('#cb-price').value || p.price; if (p.prices && p.prices[0]) p.prices[0].value = p.price;
    histPush(p, 'Convertido en combo', p.combo.items.length + ' productos'); closeDrawer(true); paintList(); toast('“' + p.name + '” ahora es un combo');
  }
  function presDlg(id) {
    editProd(id); dr.data.prices.push({ name: '', value: 0 }); markDirty(); pdTab();
    var last = $('[data-pi="' + (dr.data.prices.length - 1) + '"][data-pf="name"]'); if (last) { last.scrollIntoView({ block: 'center' }); last.focus(); }
    toast('Agregue nombre y precio de cada presentación (p. ej. Individual, Para compartir)');
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-pm]'); if (!t) return;
    var k = t.getAttribute('data-pm'), id = +t.getAttribute('data-id'), v = t.getAttribute('data-v');
    if (k === 'menuview') { S.menuView = v; paintList(); e.stopPropagation(); return; }
    if (['copydlg', 'scheddlg', 'presdlg', 'combo'].indexOf(k) >= 0) {
      S.menuFor = null; S.menuView = 'root';
      var f = findProd(id); if (!f) return;
      if (k === 'combo' && f.p.combo) { var old = f.p.combo; f.p.combo = null; paintList(); toast('“' + f.p.name + '” vuelve a ser un producto único', function () { f.p.combo = old; paintList(); }); return; }
      paintList();
      if (k === 'copydlg') copyDlg(id); else if (k === 'scheddlg') schedDlg(id); else if (k === 'presdlg') presDlg(id); else comboDlg(id);
      return;
    }
    if (k === 'cpdo') copyDo();
    else if (k === 'ssave') schedSave();
    else if (k === 'sclear') { var p = findProd(DG.id).p; p.sched = null; histPush(p, 'Programación quitada'); closeDrawer(true); paintList(); toast('Programación quitada'); }
    else if (k === 'sday') { var n = +v, i = DG.days.indexOf(n); if (i >= 0) DG.days.splice(i, 1); else DG.days.push(n); t.setAttribute('aria-pressed', i < 0); markDirty(); }
    else if (k === 'cbsave') comboSave();
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'cp-carta') { $('#cp-cat').innerHTML = catOptions(cartaById(e.target.value), 0); }
    if (e.target.matches && e.target.matches('[data-cb]')) comboSum();
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'cb-q') { var q = e.target.value.toLowerCase(); $$('#cb-list .cbitem').forEach(function (r) { r.hidden = r.getAttribute('data-n').indexOf(q) < 0; }); }
    if (e.target.id === 'cb-price') comboSum();
  });

  /* ---------- Editor de categoría (nueva y existente) ---------- */
  var CE = null;
  var IL = {
    WITH_IMAGES: '<svg viewBox="0 0 64 44"><rect x="4" y="4" width="26" height="16" rx="3"/><rect x="34" y="4" width="26" height="16" rx="3"/><path d="M6 26h22M6 31h14M36 26h22M36 31h14"/><path d="M6 38h22M36 38h22" opacity=".4"/></svg>',
    LIST: '<svg viewBox="0 0 64 44"><path d="M6 8h34M6 14h22M6 24h34M6 30h22M6 38h34" /><path d="M50 8h8M50 24h8M50 38h8" opacity=".6"/></svg>',
    BANNER: '<svg viewBox="0 0 64 44"><rect x="4" y="4" width="56" height="17" rx="3"/><path d="M10 15h22" stroke-width="2.4"/><rect x="4" y="25" width="56" height="15" rx="3" opacity=".5"/></svg>',
    C1: '<svg viewBox="0 0 64 44"><rect x="12" y="4" width="40" height="10" rx="2"/><rect x="12" y="17" width="40" height="10" rx="2"/><rect x="12" y="30" width="40" height="10" rx="2"/></svg>',
    C2: '<svg viewBox="0 0 64 44"><rect x="5" y="4" width="25" height="16" rx="2"/><rect x="34" y="4" width="25" height="16" rx="2"/><rect x="5" y="24" width="25" height="16" rx="2"/><rect x="34" y="24" width="25" height="16" rx="2"/></svg>',
    C3: '<svg viewBox="0 0 64 44"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="24" y="4" width="16" height="16" rx="2"/><rect x="44" y="4" width="16" height="16" rx="2"/><rect x="4" y="24" width="16" height="16" rx="2"/><rect x="24" y="24" width="16" height="16" rx="2"/><rect x="44" y="24" width="16" height="16" rx="2"/></svg>',
    VERTICAL: '<svg viewBox="0 0 64 44"><rect x="6" y="5" width="52" height="10" rx="3"/><rect x="6" y="18" width="52" height="10" rx="3"/><rect x="6" y="31" width="52" height="10" rx="3"/><path d="M50 10l3 0M50 23l3 0" opacity=".5"/></svg>',
    HORIZONTAL: '<svg viewBox="0 0 64 44"><rect x="5" y="5" width="14" height="7" rx="3.5"/><rect x="22" y="5" width="14" height="7" rx="3.5" opacity=".45"/><rect x="39" y="5" width="14" height="7" rx="3.5" opacity=".45"/><rect x="5" y="17" width="54" height="10" rx="3"/><rect x="5" y="30" width="54" height="10" rx="3"/></svg>'
  };
  function optCard(group, val, label, svg, on) {
    return '<button type="button" class="optcard" data-ce="opt" data-g="' + group + '" data-v="' + val + '" aria-pressed="' + on + '">' + svg + '<span>' + label + '</span></button>';
  }
  function openNewCat(parentId) {
    CE = { id: null, gal: false, err: null, d: { name: '', desc: '', img: null, parent: parentId || 0, visible: true, style: 'WITH_IMAGES', cols: 2, nav: 'VERTICAL', centerContent: false, hideTitle: false, hideProductTitles: false, ellipsis: false } };
    ceOpen();
  }
  function editCat(id) {
    var k = cat(id); if (!k) return;
    CE = { id: id, gal: false, err: null, d: { name: k.name, desc: k.desc || '', img: k.img || null, parent: k.parent || 0, visible: k.visible, style: k.style, cols: k.cols, nav: k.nav, centerContent: !!k.centerContent, hideTitle: !!k.hideTitle, hideProductTitles: !!k.hideProductTitles, ellipsis: !!k.ellipsis } };
    ceOpen();
  }
  function ceOpen() {
    var isNew = CE.id === null, k = isNew ? null : cat(CE.id);
    openDrawer('<div class="drawer__head"><div style="min-width:0"><h2 id="drawerTitle">' + (isNew ? 'Nueva categoría' : esc(k.name)) + '</h2><p>' + esc(S.carta.name) + (isNew ? ' · Defina cómo se verá para el cliente.' : ' · Lo que defina aquí cambia cómo ve el cliente esta categoría.') + '</p></div>' +
      '<div style="display:flex;gap:8px;align-items:center"><select class="select" id="ce-vis" aria-label="Visibilidad"><option value="1">Visible</option><option value="0">Oculta</option></select><button class="iconbtn" type="button" data-a="dclose" aria-label="Cerrar">' + I.close + '</button></div></div>' +
      '<div class="banner" id="dirtybanner" hidden style="margin:12px 20px 0"><span>Tiene cambios sin guardar.</span><span><button class="btn btn--sm" type="button" data-a="dstay">Seguir editando</button> <button class="btn btn--sm btn--danger" type="button" data-a="ddiscard">Descartar</button></span></div>' +
      '<div class="drawer__body" id="cebody"></div>' +
      '<div class="drawer__foot" id="drawerFoot"><span class="dirty" hidden>● Cambios sin guardar</span><button class="btn" type="button" data-a="dclose">Cancelar</button><button class="btn btn--primary" type="button" data-ce="save">' + (isNew ? 'Crear categoría' : 'Guardar') + '</button></div>', 'cat', CE.id);
    dr.dirty = false; $('#ce-vis').value = CE.d.visible ? '1' : '0'; ceBody();
    if (isNew) { var n = $('#ce-name'); if (n) n.focus(); }
  }
  function ceBody() {
    var d = CE.d, k = CE.id ? cat(CE.id) : null, hasKids = k && kids(k.id).length, h = '';
    h += '<section><span class="lab">Imagen</span>';
    if (d.img) h += '<div class="cimg"><img src="' + d.img + '" alt=""><div class="slot__ov"><a class="rb" href="' + d.img + '" target="_blank" rel="noopener" aria-label="Ver imagen">' + I.eye + '</a><button type="button" class="rb" data-ce="imgchg" aria-label="Cambiar imagen">' + I.edit + '</button><button type="button" class="rb red" data-ce="imgdel" aria-label="Quitar imagen">' + I.trash + '</button></div></div>';
    else h += '<button type="button" class="cimg cimg--empty" data-ce="imgchg" aria-label="Subir imagen de la categoría">' + I.plus + '<span>Subir imagen</span></button>';
    if (CE.gal) h += '<div class="gal" role="group" aria-label="Galería de muestra"><span class="hint">Elija una imagen (en la versión real: subir desde su equipo).</span><div class="gal__row">' + GAL.map(function (g, i) { return '<button type="button" data-ce="imgset" data-v="' + g + '"><img src="' + g + '" alt="Imagen de muestra ' + (i + 1) + '"></button>'; }).join('') + '</div></div>';
    h += '<p class="hint">Proporción 3:1 · JPG, PNG o WebP, máx. 2 MB. Se muestra en la lista de categorías de la carta.</p></section>';
    h += '<section class="field"><label class="lab" for="ce-name">Nombre</label><input class="input' + (CE.err ? ' invalid' : '') + '" id="ce-name" data-cn="name" maxlength="40" value="' + esc(d.name) + '">' + (CE.err ? '<div class="err">' + CE.err + '</div>' : '') + '<div class="counter" id="ce-cnt">' + d.name.length + ' / 40</div></section>';
    h += '<section class="field"><label class="lab" for="ce-parent">Ubicación</label><select class="select" id="ce-parent" data-cn="parent"' + (hasKids ? ' disabled' : '') + '><option value="0">Categoría principal</option>' + roots().filter(function (r) { return !k || r.id !== k.id; }).map(function (r) { return '<option value="' + r.id + '"' + (+d.parent === r.id ? ' selected' : '') + '>Subcategoría de “' + esc(r.name) + '”</option>'; }).join('') + '</select>' + (hasKids ? '<div class="hint">Tiene subcategorías, por eso no puede anidarse.</div>' : '<div class="hint">También puede arrastrarla en el panel de categorías.</div>') + '</section>';
    h += '<section><span class="lab">Descripción</span><div class="rte"><div class="rte__bar" role="toolbar" aria-label="Formato de descripción">' +
      [['bold', '<b>B</b>', 'Negrita'], ['italic', '<i>I</i>', 'Cursiva'], ['underline', '<u>U</u>', 'Subrayado'], ['strikeThrough', '<s>S</s>', 'Tachado']].map(function (b) { return '<button type="button" data-ce="fmt" data-cmd="' + b[0] + '" title="' + b[2] + '" aria-label="' + b[2] + '">' + b[1] + '</button>'; }).join('') +
      '</div><div class="rte__area" id="ce-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Descripción de la categoría"></div></div><div class="counter" id="ce-dcnt"></div></section>';
    h += '<section><span class="lab">Estilos</span><div class="optgrid">' + [['WITH_IMAGES', 'Con imágenes'], ['LIST', 'En lista'], ['BANNER', 'Banner']].map(function (o) { return optCard('style', o[0], o[1], IL[o[0]], d.style === o[0]); }).join('') + '</div></section>';
    h += '<section><span class="lab">Columnas</span><div class="optgrid">' + [1, 2, 3].map(function (n) { return optCard('cols', n, String(n), IL['C' + n], +d.cols === n); }).join('') + '</div></section>';
    h += '<section><span class="lab">Navegación</span><div class="optgrid optgrid--2">' + [['VERTICAL', 'Vertical'], ['HORIZONTAL', 'Horizontal']].map(function (o) { return optCard('nav', o[0], o[1], IL[o[0]], d.nav === o[0]); }).join('') + '</div></section>';
    var tg = function (key, label, help) { return '<div class="trow"><div><span class="tlabel">' + label + '</span><div class="hint">' + help + '</div></div><button class="switch" type="button" role="switch" data-ce="tg" data-k="' + key + '" aria-checked="' + !!d[key] + '" aria-label="' + label + '"></button></div>'; };
    h += '<section><span class="lab">Acciones</span><div class="trows">' + tg('centerContent', 'Centrar contenido', 'Centra los productos dentro de la categoría') + tg('hideTitle', 'Esconder título categoría', 'Oculta el nombre de la categoría en la carta') + tg('hideProductTitles', 'Esconder títulos de productos', 'Oculta el nombre de cada producto') + tg('ellipsis', 'Agregar elipsis (...) a descripciones de productos largas', 'Corta las descripciones largas con puntos suspensivos') + '</div></section>';
    if (k) h += '<section><button class="btn btn--danger" type="button" data-a="delcat" data-id="' + k.id + '">' + I.trash + ' Eliminar categoría</button><div class="hint">Sus ' + allProds(k).length + ' productos pasan a la papelera.</div></section>';
    var body = $('#cebody'), sc = body.scrollTop; body.innerHTML = h; body.scrollTop = sc;
    var ds = $('#ce-desc'); ds.innerHTML = d.desc; ceCount();
  }
  function ceCount() { var n = $('#ce-cnt'), c = $('#ce-dcnt'), ds = $('#ce-desc'); if (n) n.textContent = CE.d.name.length + ' / 40'; if (c && ds) c.textContent = ds.textContent.length + ' / 10000'; }
  function ceActive() { return dr.type === 'cat' && CE && !$('#drawer').hidden; }
  function saveCat() {
    var d = CE.d, name = d.name.trim();
    if (!name) { CE.err = 'El nombre es obligatorio.'; ceBody(); $('#ce-name').focus(); return; }
    var isNew = CE.id === null, k = isNew ? C(name, []) : cat(CE.id);
    k.name = name; k.desc = d.desc; k.img = d.img; k.visible = d.visible; k.style = d.style; k.cols = +d.cols; k.nav = d.nav;
    k.centerContent = d.centerContent; k.hideTitle = d.hideTitle; k.hideProductTitles = d.hideProductTitles; k.ellipsis = d.ellipsis;
    var arr = S.carta.cats, par = +d.parent || null;
    if (isNew) {
      k.parent = par;
      if (par) { var last = kids(par).pop() || cat(par); arr.splice(arr.indexOf(last) + 1, 0, k); cat(par).open = true; } else arr.push(k);
    } else if ((k.parent || null) !== par) {
      arr.splice(arr.indexOf(k), 1); k.parent = par;
      if (par) { var l2 = kids(par).pop() || cat(par); arr.splice(arr.indexOf(l2) + 1, 0, k); cat(par).open = true; } else arr.push(k);
    }
    dr.dirty = false; closeDrawer(true); S.catq = ''; var q = $('#catq'); if (q) q.value = '';
    selectCat(k.id); paintHead();
    toast(isNew ? 'Categoría “' + name + '” creada' : 'Categoría guardada');
    if (isNew) { var cc = $('#cats'); var cur = cc.querySelector('[aria-current="true"]'); if (cur) cur.scrollIntoView({ block: 'nearest' }); }
  }
  document.addEventListener('input', function (e) {
    if (!ceActive()) return; var t = e.target;
    if (t.id === 'ce-desc') { CE.d.desc = t.innerHTML; ceCount(); markDirty(); }
    else if (t.getAttribute && t.getAttribute('data-cn') === 'name') { CE.d.name = t.value; CE.err = null; ceCount(); markDirty(); }
  });
  document.addEventListener('change', function (e) {
    if (!ceActive()) return; var t = e.target;
    if (t.id === 'ce-vis') { CE.d.visible = t.value === '1'; markDirty(); }
    else if (t.id === 'ce-parent') { CE.d.parent = +t.value; markDirty(); }
  });
  document.addEventListener('paste', function (e) { if (e.target.id === 'ce-desc') { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text')); } });
  document.addEventListener('mousedown', function (e) { if (e.target.closest('[data-ce="fmt"]')) e.preventDefault(); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-ce]'); if (!t || !ceActive()) return;
    var a = t.getAttribute('data-ce'), v = t.getAttribute('data-v');
    if (a === 'save') saveCat();
    else if (a === 'fmt') { document.execCommand(t.getAttribute('data-cmd')); CE.d.desc = $('#ce-desc').innerHTML; markDirty(); }
    else if (a === 'opt') { CE.d[t.getAttribute('data-g')] = t.getAttribute('data-g') === 'cols' ? +v : v; markDirty(); ceBody(); }
    else if (a === 'tg') { var key = t.getAttribute('data-k'); CE.d[key] = !CE.d[key]; t.setAttribute('aria-checked', CE.d[key]); markDirty(); }
    else if (a === 'imgchg') { CE.gal = !CE.gal; ceBody(); }
    else if (a === 'imgdel') { CE.d.img = null; CE.gal = false; markDirty(); ceBody(); }
    else if (a === 'imgset') { CE.d.img = v; CE.gal = false; markDirty(); ceBody(); }
  });
  function openTrash() {
    var h = head('Papelera', 'Los productos eliminados se pueden restaurar.') + '<div class="drawer__body">' +
      (S.trash.length ? S.trash.map(function (t, i) { return '<div class="trashrow"><div><b>' + esc(t.p.name) + '</b><div class="hint">' + esc(t.c.name) + ' · ' + money(t.p.price) + '</div></div><button class="btn btn--sm" type="button" data-a="restore" data-i="' + i + '">Restaurar</button></div>'; }).join('') : '<div class="empty"><h3>Papelera vacía</h3><p>Los productos que elimine aparecerán aquí.</p></div>') +
      '</div><div class="drawer__foot" id="drawerFoot"><button class="btn" type="button" data-a="dclose">Cerrar</button></div>';
    openDrawer(h, 'trash', null);
  }

  /* ---------- Eventos (delegación) ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-a]');
    if (!t) {
      if (S.menuFor && !e.target.closest('.menu')) { S.menuFor = null; if (S.carta) paintList(); }
      if (e.target.id === 'scrim') closeDrawer();
      var fb = e.target.closest('#flt [data-f]');
      if (fb) { S.filter = fb.getAttribute('data-f'); S.sel = {}; paintMain(); }
      return;
    }
    var a = t.getAttribute('data-a'), id = +t.getAttribute('data-id');
    switch (a) {
      case 'open': location.hash = '#/carta/' + id; break;
      case 'newcarta': toast('En la versión real: asistente para crear una carta'); break;
      case 'newsede': toast('En la versión real: formulario para crear una sede'); break;
      case 'editsede': toast('En la versión real: datos, diseño y anuncios de la sede'); break;
      case 'selcat': selectCat(id); break;
      case 'toggle': cat(id).open = !cat(id).open; paintCats(); break;
      case 'focusnewcat': openNewCat(); break;
      case 'editcat': editCat(id); break;
      case 'togglecat': var k = cat(id); k.visible = !k.visible; paintCats(); paintMain(); toast(k.visible ? 'Categoría visible' : 'Categoría oculta'); break;
      case 'quick': S.quick = !S.quick; paintList(); break;
      case 'quickadd': quickAdd(); break;
      case 'quickclose': S.quick = false; paintList(); break;
      case 'st': setState(id, t.getAttribute('data-s')); break;
      case 'selprod': S.sel[id] = t.checked; paintBulk(); t.closest('.prod').classList.toggle('sel', t.checked); break;
      case 'dup': S.menuFor = null; var f = findProd(id); var cp = JSON.parse(JSON.stringify(f.p)); cp.id = nid(); cp.name = f.p.name + ' (copia)'; cp.hist = [{ title: 'Producto creado', detail: 'Duplicado de ' + f.p.name, when: 'Hoy' }]; f.c.prods.splice(f.c.prods.indexOf(f.p) + 1, 0, cp); paintHead(); paintCats(); paintList(); toast('Producto duplicado'); break;
      case 'editprod': S.menuFor = null; paintList(); editProd(id); break;
      case 'menu': S.menuFor = S.menuFor === id ? null : id; S.menuView = 'root'; paintList(); e.stopPropagation(); break;
      case 'move': moveMany([id], +t.getAttribute('data-to')); break;
      case 'del': removeProds([id]); break;
      case 'bst': selIds().forEach(function (i) { var ff = findProd(i); if (ff) ff.p.st = t.getAttribute('data-s'); }); toast('Estado actualizado en ' + selIds().length + ' productos'); S.sel = {}; paintHead(); paintCats(); paintMain(); break;
      case 'bdel': removeProds(selIds()); break;
      case 'bclear': S.sel = {}; paintMain(); break;
      case 'trash': openTrash(); break;
      case 'restore': var tr = S.trash[+t.getAttribute('data-i')]; tr.c.prods.splice(Math.min(tr.i, tr.c.prods.length), 0, tr.p); S.trash.splice(+t.getAttribute('data-i'), 1); paintHead(); paintCats(); paintMain(); openTrash(); toast('Producto restaurado'); break;
      case 'dclose': closeDrawer(); break;
      case 'dstay': $('#dirtybanner').hidden = true; break;
      case 'ddiscard': closeDrawer(true); break;
      case 'dst': dr.data.st = t.getAttribute('data-s'); $$('#f-st button').forEach(function (b) { b.setAttribute('aria-pressed', b === t); }); markDirty(); break;
      case 'dchip': t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') !== 'true'); markDirty(); break;
      case 'dsaveprod': saveProd(); break;
      case 'delcat':
        var dk = cat(id), nprods = dk.prods.length; closeDrawer(true);
        S.carta.cats = S.carta.cats.filter(function (c) { return c.id !== id && c.parent !== id; });
        S.catId = (roots()[0] || {}).id; paintAll(); toast('Categoría “' + dk.name + '” eliminada (' + nprods + ' productos)'); break;
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!$('#drawer').hidden) closeDrawer(); else if (S.menuFor) { S.menuFor = null; paintList(); } else if (S.quick) { S.quick = false; paintList(); } }
    if (e.key === 'Enter' && (e.target.id === 'qn' || e.target.id === 'qp')) quickAdd();
  });

  /* ---------- Arrastrar y soltar ---------- */
  document.addEventListener('dragstart', function (e) {
    var p = e.target.closest && e.target.closest('[data-prod]'), c = e.target.closest && e.target.closest('[data-cat]');
    if (p) { drag = { type: 'prod', id: +p.getAttribute('data-prod') }; p.classList.add('dragging'); }
    else if (c) { drag = { type: 'cat', id: +c.getAttribute('data-cat') }; }
    else return;
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'x');
  });
  var TIP0 = 'Arrastre para ordenar. Suelte en el centro de otra para hacerla su subcategoría.';
  var CLS = 'dragging over-top over-bottom dropok zone-before zone-after zone-nest zone-bad';
  function clearMarks() { $$('.dragging,.over-top,.over-bottom,.dropok,.zone-before,.zone-after,.zone-nest,.zone-bad').forEach(function (n) { CLS.split(' ').forEach(function (k) { n.classList.remove(k); }); }); var h = $('#dragtip'); if (h) { h.textContent = TIP0; h.className = 'side__hint'; } }
  /* Zona de soltado sobre una categoría: arriba = antes, centro = subcategoría, abajo = después. */
  function catZone(el, y) {
    var r = el.getBoundingClientRect(), t = (y - r.top) / r.height;
    var target = cat(el.getAttribute('data-cat')), src = cat(drag.id);
    if (t < 0.28) return 'before';
    if (t > 0.72) return 'after';
    // Centro: anidar. No se puede anidar una categoría que ya tiene subcategorías, ni bajo una subcategoría.
    if (kids(src.id).length || target.parent) return 'bad';
    return 'nest';
  }
  document.addEventListener('dragend', function () { drag = null; clearMarks(); });
  document.addEventListener('dragover', function (e) {
    if (!drag) return;
    var p = e.target.closest('[data-prod]'), c = e.target.closest('[data-cat]');
    clearMarks(); if (drag.type === 'prod') { var s0 = findProd(drag.id); if (s0) { var dl = document.querySelector('[data-prod="' + drag.id + '"]'); if (dl) dl.classList.add('dragging'); } }
    if (drag.type === 'prod' && p && +p.getAttribute('data-prod') !== drag.id) { e.preventDefault(); var r = p.getBoundingClientRect(); p.classList.add(e.clientY < r.top + r.height / 2 ? 'over-top' : 'over-bottom'); }
    else if (drag.type === 'prod' && c) { e.preventDefault(); c.classList.add('dropok'); }
    else if (drag.type === 'cat' && c && +c.getAttribute('data-cat') !== drag.id) {
      var z = catZone(c, e.clientY), tgt = cat(c.getAttribute('data-cat'));
      c.classList.add('zone-' + z);
      var tip = $('#dragtip');
      if (tip) {
        tip.textContent = z === 'nest' ? 'Soltar para convertirla en subcategoría de “' + tgt.name + '”'
          : z === 'bad' ? (kids(drag.id).length ? 'No se puede: tiene subcategorías' : 'Solo se permite un nivel de subcategorías')
          : (tgt.parent ? 'Soltar para ubicarla dentro de “' + cat(tgt.parent).name + '”' : 'Soltar para ubicarla como categoría principal') + (z === 'before' ? ' (antes de “' : ' (después de “') + tgt.name + '”)';
        tip.className = 'side__hint active' + (z === 'bad' ? ' bad' : '');
      }
      if (z !== 'bad') e.preventDefault();
    }
  });
  document.addEventListener('drop', function (e) {
    if (!drag) return; e.preventDefault();
    var p = e.target.closest('[data-prod]'), c = e.target.closest('[data-cat]');
    if (drag.type === 'prod' && c && !(p && !c)) { if (!p || e.target.closest('.side')) { moveMany([drag.id], +c.getAttribute('data-cat')); drag = null; return; } }
    if (drag.type === 'prod' && p) {
      var src = findProd(drag.id), dst = findProd(p.getAttribute('data-prod'));
      if (src && dst) {
        var before = e.clientY < p.getBoundingClientRect().top + p.getBoundingClientRect().height / 2;
        src.c.prods.splice(src.c.prods.indexOf(src.p), 1);
        var idx = dst.c.prods.indexOf(dst.p) + (before ? 0 : 1); dst.c.prods.splice(idx, 0, src.p);
        S.sort = 'manual'; $('#sort').value = 'manual'; paintHead(); paintCats(); paintList(); toast('Orden actualizado');
      }
    } else if (drag.type === 'cat' && c) {
      var a = cat(drag.id), b = cat(c.getAttribute('data-cat')), arr = S.carta.cats;
      var zone = catZone(c, e.clientY);
      if (a === b || zone === 'bad') { drag = null; clearMarks(); return; }
      var prevParent = a.parent, prevIdx = arr.indexOf(a), prevOpen = b.open;
      arr.splice(arr.indexOf(a), 1);
      if (zone === 'nest') {
        // Pasa a ser subcategoría: va al final de las subcategorías de la destino.
        a.parent = b.id; b.open = true;
        var last = kids(b.id).pop(); arr.splice(arr.indexOf(last || b) + 1, 0, a);
      } else {
        // Antes/después: toma el mismo nivel que la categoría sobre la que se suelta.
        a.parent = b.parent || null;
        arr.splice(arr.indexOf(b) + (zone === 'after' ? 1 : 0), 0, a);
      }
      S.catId = a.id;
      var msg = zone === 'nest' ? '“' + a.name + '” ahora es subcategoría de “' + b.name + '”' : (prevParent && !a.parent ? '“' + a.name + '” ahora es categoría principal' : 'Categoría reordenada');
      paintCats(); paintMain();
      toast(msg, function () { arr.splice(arr.indexOf(a), 1); a.parent = prevParent; arr.splice(prevIdx, 0, a); b.open = prevOpen; paintCats(); paintMain(); });
    }
    drag = null; clearMarks();
  });

  route();
})();
