(function () {
  'use strict';

  /* ---------- Iconos ---------- */
  var I = {
    local: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10l1.5-5h15L21 10"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12.5V20h14v-7.5"/><path d="M10 20v-4.5h4V20"/></svg>',
    plato: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="6"/><circle cx="12" cy="13" r="3"/><path d="M3.5 4v5.5a1.5 1.5 0 0 0 3 0V4M5 4v16"/><path d="M20.5 4c-1.7 1-2.5 3-2.5 5.5h2.5V20"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------- Datos ---------- */
  var IMG = { f4: '../assets/foto-4.png', f5: '../assets/foto-5.jpeg' };
  var SEDES = [
    { slug: 'principal', nombre: 'Sede Principal', img: 'f4', pos: '30% 50%', dir: 'Carrera 10 # 15-20, Piso 1', hor: 'Lunes a domingo · 11:30 a.m. a 9:00 p.m.', tel: '(602) 555 0101', desc: 'Salón principal con terraza sobre el jardín. Servicio de almuerzo y cena, y reservas para eventos del club.' },
    { slug: 'norte', nombre: 'Sede Norte', img: 'f5', pos: '50% 60%', dir: 'Avenida 6N # 28-45', hor: 'Martes a domingo · 12:00 m. a 8:30 p.m.', tel: '(602) 555 0102', desc: 'Ambiente tranquilo con vista a la cancha. Carta reducida con platos de la casa.' },
    { slug: 'sanfernando', nombre: 'Sede San Fernando', img: null, pos: '50% 50%', dir: 'Calle 5 # 38-12', hor: 'Lunes a sábado · 7:00 a.m. a 6:00 p.m.', tel: '(602) 555 0103', desc: 'Cafetería y almuerzo ejecutivo para socios y visitantes.' }
  ];

  function pr(a) { return a.map(function (x) { return { l: x[0], v: x[1] }; }); }
  function P(n, d, prices, o) { o = o || {}; return { n: n, d: d, p: pr(prices), t: o.t || '', img: o.img || null, pos: o.pos || '50% 50%', sub: o.sub || '' }; }
  var LARGA = 'Lomo fino de res madurado durante veintiocho días, sellado a la parrilla de carbón y terminado al horno, acompañado de puré rústico de papa criolla, vegetales asados de temporada, reducción de vino tinto con tomillo fresco, mantequilla de hierbas y un toque de sal marina ahumada. Se sirve al término que usted prefiera; consulte con su mesero por las opciones de guarnición y por el tiempo de preparación.';

  var CATS = [
    { id: 1, n: 'Entradas', img: 'f4', pos: '15% 30%', prods: [
      P('Empanadas de pipián', 'Masa crocante de maíz rellena de papa criolla y pipián, con ají de maní.', [['Media docena', 22000]], { t: 'r', img: 'f5', pos: '40% 70%' }),
      P('Ceviche de camarón', 'Camarones frescos, leche de tigre suave, cebolla morada y cilantro.', [['Individual', 28000], ['Para compartir', 52000]], { t: 'n' }),
      P('Carpaccio de res', 'Láminas finas de lomo con alcaparras, parmesano y aceite de oliva.', [['Individual', 30000]]),
      P('Tabla de quesos y embutidos de la casa con frutos secos y mermelada de la temporada', 'Selección de cuatro quesos, tres embutidos, nueces, uvas y pan artesanal.', [['Para dos', 58000], ['Para cuatro', 98000]]),
      P('Ensalada de la huerta', 'Hojas verdes, tomates cherry, aguacate y vinagreta de limón.', [['Individual', 24000]], { t: 'a' }),
      P('Patacones con hogao', 'Plátano verde frito, hogao casero y queso costeño.', [['Individual', 18000]])
    ] },
    { id: 2, n: 'Sopas y Cremas', img: null, prods: [
      P('Ajiaco santafereño', 'Tres tipos de papa, pollo desmechado, mazorca, crema de leche y alcaparras.', [['Plato', 34000]], { t: 'r', img: 'f4', pos: '60% 80%' }),
      P('Crema de auyama', 'Auyama asada, jengibre y crema ligera, con semillas tostadas.', [['Taza', 18000], ['Plato', 26000]]),
      P('Sancocho de gallina', 'Gallina criolla, yuca, plátano y mazorca. Se sirve con arroz y aguacate.', [['Plato', 36000]]),
      P('Consomé de res', 'Caldo clarificado con vegetales y hierbas finas.', [['Taza', 16000]], { t: 'n' }),
      P('Crema de champiñones', 'Champiñones salteados con tomillo y un toque de vino blanco.', [['Taza', 18000], ['Plato', 26000]], { t: 'a' }),
      P('Cazuela de mariscos', 'Camarón, calamar y pescado en leche de coco y sofrito criollo, con arroz de coco.', [['Individual', 48000], ['Para compartir', 88000]])
    ] },
    { id: 3, n: 'Carnes y Parrilla', img: 'f5', pos: '50% 65%', prods: [
      P('Lomo fino a la parrilla', 'Doscientos cincuenta gramos de lomo con papa criolla y chimichurri.', [['250 g', 62000], ['400 g', 92000]], { t: 'r', img: 'f5', pos: '50% 70%' }),
      P('Churrasco argentino', 'Corte delgado a la brasa con ensalada fresca y papas rústicas.', [['Individual', 56000]]),
      P('Medallones de res en reducción de vino tinto', 'Tres medallones, puré de apio y vegetales salteados.', [['Individual', 64000]], { t: 'n', img: 'f4', pos: '70% 85%' }),
      P('Costillas BBQ', 'Costillas de cerdo glaseadas en salsa ahumada, con papas fritas y ensalada de col.', [['Media', 48000], ['Entera', 84000]]),
      P('Pechuga rellena', 'Pechuga con espinaca y queso, salsa de champiñones y arroz blanco.', [['Individual', 42000]], { t: 'a' }),
      P('Lomo del chef madurado', LARGA, [['Individual', 78000], ['Para dos', 148000], ['Para cuatro', 280000]]),
      P('Parrillada del club', 'Res, cerdo, pollo y chorizo con yuca, papa criolla y arepa.', [['Para dos', 124000], ['Para cuatro', 230000]])
    ] },
    { id: 4, n: 'Pescados y Mariscos', img: 'f4', pos: '85% 80%', prods: [
      P('Trucha al ajillo', 'Trucha entera con mantequilla de ajo, patacón y ensalada.', [['Individual', 46000]], { t: 'r' }),
      P('Salmón a la plancha', 'Salmón con puré de coliflor y espárragos salteados.', [['Individual', 68000]], { t: 'n' }),
      P('Arroz con camarones', 'Arroz cremoso con camarones, pimentón y cilantro.', [['Individual', 52000], ['Para compartir', 96000]]),
      P('Mojarra frita', 'Mojarra entera, arroz de coco, patacón y ensalada.', [['Individual', 44000]], { t: 'a' }),
      P('Pulpo a la gallega', 'Pulpo tierno con papa cocida, pimentón ahumado y aceite de oliva.', [['Individual', 72000]]),
      P('Filete de pargo', 'Filete de pargo rojo con salsa de mantequilla y limón.', [['Individual', 58000]])
    ] },
    { id: 5, n: 'Postres', img: null, prods: [
      P('Tarta de limón', 'Base crocante, crema de limón y merengue ligeramente tostado.', [['Porción', 16000]], { t: 'r' }),
      P('Brownie con helado', 'Brownie tibio de chocolate con helado de vainilla.', [['Individual', 18000]], { t: 'n' }),
      P('Flan de caramelo', 'Receta clásica de la casa con caramelo oscuro.', [['Porción', 14000]]),
      P('Tres leches', 'Bizcocho húmedo con crema chantilly y frutos rojos.', [['Porción', 16000]], { t: 'a' }),
      P('Arroz con leche', 'Con canela y panela, servido tibio.', [['Individual', 12000]])
    ] },
    { id: 6, n: 'Bebidas', img: null, prods: [
      P('Limonada de coco', 'Leche de coco, limón y hielo frappé.', [['Vaso', 12000], ['Jarra', 32000]], { t: 'r', sub: 'Jugos y limonadas' }),
      P('Jugo natural', 'Mora, maracuyá, lulo o mango, en agua o en leche.', [['Vaso', 9000]], { sub: 'Jugos y limonadas' }),
      P('Limonada cerezada', 'Limón, cereza y soda.', [['Vaso', 11000]], { t: 'n', sub: 'Jugos y limonadas' }),
      P('Mojito clásico', 'Ron blanco, hierbabuena, limón y soda.', [['Copa', 26000]], { sub: 'Cocteles' }),
      P('Vino de la casa', 'Tinto o blanco, copa de 150 ml.', [['Copa', 24000], ['Botella', 98000]], { sub: 'Cocteles', t: 'a' }),
      P('Café de origen', 'Café de la región preparado en prensa francesa.', [['Taza', 7000]], { sub: 'Café e infusiones' })
    ] }
  ];

  var ANUNCIO = { t: 'Noche de jazz en la terraza', d: 'Todos los viernes, desde las 7:00 p.m., música en vivo con carta de temporada. Reserve su mesa con anticipación.' };
  var STEPS = [
    { label: 'Restaurante', icon: 'home', href: '#/' },
    { label: 'Sede', icon: 'local', href: '#/sede/principal' },
    { label: 'Carta', icon: 'book', href: '#/carta/1' },
    { label: 'Productos', icon: 'list', href: '#/categoria/3' }
  ];

  /* ---------- Estado / ajustes ---------- */
  var DEF = { style: 'lista', cols: '2', nav: 'vertical', shape: 'redondeado', size: 'm', motion: 'on', nophotos: 'off' };
  var S = {};
  (function () {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('mv5') || '{}') || {}; } catch (e) {}
    for (var k in DEF) S[k] = saved[k] || DEF[k];
  })();
  function save() { try { localStorage.setItem('mv5', JSON.stringify(S)); } catch (e) {} }
  function applyAttrs() {
    var h = document.documentElement;
    ['style', 'cols', 'nav', 'shape', 'size', 'motion'].forEach(function (k) { h.setAttribute('data-' + k, S[k]); });
  }

  /* ---------- Utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cop(v) { return '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function media(kind, key, pos, alt, phIcon) {
    var has = key && S.nophotos !== 'on';
    var inner = has
      ? '<img src="' + IMG[key] + '" alt="' + esc(alt || '') + '" loading="lazy" style="object-position:' + pos + '">'
      : '<div class="ph" role="img" aria-label="Sin imagen">' + I[phIcon] + '</div>';
    return '<div class="media media--' + kind + '">' + inner + '</div>';
  }
  function findSede(slug) { return SEDES.filter(function (s) { return s.slug === slug; })[0] || SEDES[0]; }
  function findCat(id) { return CATS.filter(function (c) { return String(c.id) === String(id); })[0] || CATS[0]; }
  function plural(n) { return n + (n === 1 ? ' plato' : ' platos'); }

  /* ---------- Vistas ---------- */
  function head(kicker, title, sub) {
    return '<div class="head">' + (kicker ? '<p class="head__kicker">' + esc(kicker) + '</p>' : '') + '<h1>' + esc(title) + '</h1>' + (sub ? '<p class="head__sub">' + esc(sub) + '</p>' : '') + '</div>';
  }

  function viewHome() {
    var cards = SEDES.map(function (s) {
      return '<article class="card sede">' + media('sede', s.img, s.pos, 'Vista de ' + s.nombre, 'local') +
        '<div class="sede__body"><h2>' + esc(s.nombre) + '</h2><div class="meta"><div>' + I.pin + '<span>' + esc(s.dir) + '</span></div><div>' + I.clock + '<span>' + esc(s.hor) + '</span></div></div>' +
        '<div class="sede__cta"><a class="btn" href="#/sede/' + s.slug + '">Ver carta</a></div></div></article>';
    }).join('');
    return head('Bienvenido', 'Nuestra Gastronomía', 'Seleccione una sede para conocer su carta') + '<div class="sedes">' + cards + '</div>';
  }

  function viewSede(slug) {
    var s = findSede(slug);
    return head('Sede', s.nombre, 'Una mesa pensada para el club') +
      '<div class="detail"><article class="card">' + media('sede', s.img, s.pos, 'Vista de ' + s.nombre, 'local') +
      '<div class="detail__body"><p>' + esc(s.desc) + '</p><div class="meta"><div>' + I.pin + '<span>' + esc(s.dir) + '</span></div><div>' + I.clock + '<span>' + esc(s.hor) + '</span></div><div>' + I.phone + '<span>' + esc(s.tel) + '</span></div></div></div></article>' +
      '<aside class="card"><div class="detail__body"><div class="cartas"><h3>Cartas disponibles</h3><p>1 carta · ' + CATS.length + ' categorías</p></div>' +
      '<div class="detail__cta"><a class="btn" href="#/carta/1">Ver carta</a><a class="btn btn--outline" href="#/">Cambiar de sede</a></div></div></aside></div>';
  }

  function viewCartaVertical() {
    var rows = CATS.map(function (c) {
      return '<a class="cat" href="#/categoria/' + c.id + '">' + media('cat', c.img, c.pos || '50% 50%', '', 'plato') +
        '<div class="cat__txt"><div class="cat__name">' + esc(c.n) + '</div><div class="cat__n">' + plural(c.prods.length) + (c.id === 6 ? ' · 3 subcategorías' : '') + '</div></div>' + I.chev + '</a>';
    }).join('');
    return head('Carta Principal', 'Categorías', 'Elija una categoría para ver sus platos') + '<div class="cats">' + rows + '</div>';
  }

  function prodCard(p) {
    var out = p.t === 'a';
    var tags = '';
    if (p.t === 'r') tags = '<span class="tag tag--r">Recomendado</span>';
    if (p.t === 'n') tags = '<span class="tag tag--n">Nuevo</span>';
    if (out) tags = '<span class="tag tag--a">Agotado</span>';
    var prices = p.p.map(function (x) { return '<div class="price">' + (x.l ? '<small>' + esc(x.l) + '</small>' : '') + '<b>' + cop(x.v) + '</b></div>'; }).join('');
    return '<article class="prod' + (out ? ' prod--out' : '') + '">' + media('prod', p.img, p.pos, p.n, 'plato') +
      '<div class="prod__body"><div class="prod__top">' + (tags ? '<div class="tags">' + tags + '</div>' : '') +
      '<h3 class="prod__name">' + esc(p.n) + '</h3><p class="prod__desc">' + esc(p.d) + '</p></div><div class="prices">' + prices + '</div></div></article>';
  }

  function plistHtml(cat) {
    var out = '', last = null;
    cat.prods.forEach(function (p) {
      if (p.sub && p.sub !== last) { out += '<h2 class="subhead">' + esc(p.sub) + '</h2>'; last = p.sub; }
      out += prodCard(p);
    });
    return '<div class="plist anim-in">' + out + '</div>';
  }

  function viewProductos(id) {
    var c = findCat(id);
    return head('Carta Principal', c.n, plural(c.prods.length)) + plistHtml(c);
  }

  function viewMenuHorizontal(id) {
    var c = findCat(id);
    var chips = CATS.map(function (x) {
      return '<a class="chip" href="#/categoria/' + x.id + '"' + (x.id === c.id ? ' aria-current="true"' : '') + '>' + esc(x.n) + '</a>';
    }).join('');
    return head('Carta Principal', 'Nuestra carta', 'Deslice para elegir una categoría') +
      '<div class="chips-wrap"><nav class="chips" aria-label="Categorías">' + chips + '</nav></div>' +
      '<div id="plist-host"><h2 class="subhead" style="border:0;padding:0 0 8px;margin:0;font-size:26px;color:var(--brand-navy);font-style:normal;font-weight:700">' + esc(c.n) + ' <span style="font:400 14px var(--sans);color:var(--ink-soft)">· ' + plural(c.prods.length) + '</span></h2>' + plistHtml(c) + '</div>';
  }

  /* ---------- Router ---------- */
  var screen = $('#screen'), lastKey = null, modalFor = null;

  function parse() {
    var h = (location.hash || '#/').replace(/^#/, '');
    var parts = h.split('/').filter(Boolean);
    return { name: parts[0] || 'home', arg: parts[1] };
  }

  function render() {
    var r = parse(), key, html, back = null, step = 0, title = 'Restaurante PP';
    var horiz = S.nav === 'horizontal';
    if (r.name === 'sede') { key = 'sede:' + r.arg; html = viewSede(r.arg); back = '#/'; step = 1; }
    else if (r.name === 'carta' || r.name === 'categoria') {
      if (horiz) { key = 'menu'; html = viewMenuHorizontal(r.arg || 1); back = '#/sede/principal'; step = r.name === 'carta' ? 2 : 3; }
      else if (r.name === 'carta') { key = 'carta'; html = viewCartaVertical(); back = '#/sede/principal'; step = 2; }
      else { key = 'cat:' + r.arg; html = viewProductos(r.arg); back = '#/carta/1'; step = 3; }
    } else { key = 'home'; html = viewHome(); step = 0; }

    var changed = key !== lastKey;
    var prevScroll = window.scrollY;
    screen.innerHTML = '<div class="view' + (changed ? ' enter' : '') + '">' + html + '</div>';
    if (changed) { window.scrollTo(0, 0); }
    else { window.scrollTo(0, prevScroll); }
    lastKey = key;

    var b = $('#back');
    b.hidden = !back; if (back) b.setAttribute('href', back);
    $('.topbar__in').classList.toggle('has-back', !!back);

    $('#steps').innerHTML = STEPS.map(function (s, i) {
      return '<a href="' + s.href + '"' + (i === step ? ' aria-current="step"' : '') + '>' + I[s.icon] + '<span>' + s.label + '</span></a>';
    }).join('');

    var act = $('.chip[aria-current="true"]');
    if (act) { var box = act.parentNode; box.scrollLeft = act.offsetLeft - (box.clientWidth - act.offsetWidth) / 2; }

    if (r.name === 'sede') { if (modalFor !== r.arg) { modalFor = r.arg; openModal(); } }
    else { modalFor = null; closeModal(true); }
    document.title = 'Restaurante PP — Variante 5';
  }

  /* ---------- Modal ---------- */
  var modal = $('#modal'), lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    modal.innerHTML = '<div class="modal__card">' + media('banner', 'f4', '50% 40%', '', 'local') +
      '<button class="modal__x" type="button" aria-label="Cerrar anuncio">' + I.x + '</button>' +
      '<div class="modal__body"><p class="head__kicker">Anuncio</p><h2 id="modal-title">' + esc(ANUNCIO.t) + '</h2><p>' + esc(ANUNCIO.d) + '</p><button class="btn" type="button" data-close>Entendido</button></div></div>';
    modal.hidden = false;
    var x = $('.modal__x', modal); if (x) x.focus();
  }
  function closeModal(silent) {
    if (modal.hidden) return;
    modal.hidden = true; modal.innerHTML = '';
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('.modal__x') || e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); setPanel(false); }
    if (e.key === 'Tab' && !modal.hidden) {
      var f = modal.querySelectorAll('button'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Panel ---------- */
  var panel = $('#panel'), gear = $('#gear');
  var CONTROLS = [
    { k: 'style', label: 'Estilo de categoría', o: [['lista', 'Lista'], ['imagenes', 'Con imágenes'], ['banner', 'Banner']] },
    { k: 'cols', label: 'Columnas', o: [['1', '1'], ['2', '2'], ['3', '3']] },
    { k: 'nav', label: 'Navegación', o: [['vertical', 'Vertical'], ['horizontal', 'Horizontal']] },
    { k: 'shape', label: 'Forma de botón', o: [['cuadrado', 'Cuadrado'], ['redondeado', 'Redondeado'], ['pildora', 'Píldora']] },
    { k: 'size', label: 'Tamaño de botón', o: [['s', 'S'], ['m', 'M'], ['l', 'L']] },
    { k: 'nophotos', label: 'Sin imagen', o: [['off', 'Mostrar fotos'], ['on', 'Quitar fotos']] },
    { k: 'motion', label: 'Animaciones', o: [['on', 'Activadas'], ['off', 'Reducidas']] }
  ];
  function buildPanel() {
    var h = '<h2>Configuración</h2>';
    CONTROLS.forEach(function (c) {
      h += '<div class="ctl"><span>' + c.label + '</span><div class="seg" role="group" aria-label="' + c.label + '">' +
        c.o.map(function (o) { return '<button type="button" data-k="' + c.k + '" data-v="' + o[0] + '" aria-pressed="' + (S[c.k] === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    });
    h += '<div class="ctl"><span>Ir a la pantalla</span><div class="jump">' +
      '<a href="#/">1 · Restaurante</a><a href="#/sede/principal">2 · Sede</a><a href="#/carta/1">3 · Categorías</a><a href="#/categoria/3">4 · Productos</a></div></div>' +
      '<p class="note">En móvil las columnas colapsan a 1 (tableta: máx. 2).</p>';
    panel.innerHTML = h;
  }
  function setPanel(open) {
    if (!open && panel.hidden) return;
    panel.hidden = !open; gear.setAttribute('aria-expanded', String(open));
    gear.setAttribute('aria-label', open ? 'Cerrar configuración' : 'Abrir configuración');
    if (open) buildPanel();
  }
  gear.addEventListener('click', function () { setPanel(panel.hidden); });
  panel.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]');
    if (b) {
      S[b.dataset.k] = b.dataset.v; save(); applyAttrs(); buildPanel();
      if (b.dataset.k === 'nav' || b.dataset.k === 'nophotos') render();
      return;
    }
    if (e.target.closest('.jump a')) { setTimeout(function () { setPanel(false); }, 0); }
  });

  window.addEventListener('hashchange', render);
  applyAttrs();
  render();
})();
