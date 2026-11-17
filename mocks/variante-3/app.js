/* Variante 3 — Editorial de club. Datos, router por hash, render y panel. */
(function () {
  'use strict';

  var A = '../assets/';
  var F4 = A + 'foto-4.png', F5 = A + 'foto-5.jpeg';

  /* ---------- Datos ---------- */
  var REST = { nombre: 'Restaurante PP', titulo: 'Nuestra Gastronomía', desc: 'Seleccione una sede para conocer su carta' };
  var SEDES = [
    { id: 'principal', nombre: 'Sede Principal', foto: F4, pos: '30% 60%', desc: 'Salón principal con vista a los campos del club. Servicio de almuerzo y cena, todos los días.', horario: 'Lunes a domingo · 11:30 a. m. a 9:00 p. m.' },
    { id: 'norte', nombre: 'Sede Norte', foto: F5, pos: '40% 50%', desc: 'Terraza junto al green, ideal para encuentros después de la jornada deportiva.', horario: 'Martes a domingo · 12:00 m. a 8:00 p. m.' },
    { id: 'san-fernando', nombre: 'Sede San Fernando', foto: null, pos: '50% 50%', desc: 'Sede en preparación. Pronto publicaremos su carta y fotografías.', horario: 'Próximamente' }
  ];
  var CARTAS = [{ id: 1, nombre: 'Carta Principal', sub: 'Almuerzo y cena', sede: 'principal' }];

  function P(nombre, desc, precios, o) { o = o || {}; return { nombre: nombre, desc: desc, precios: precios, tag: o.t || null, foto: o.f || null, sub: o.s || null }; }
  var f4 = function (p) { return [F4, p || '50% 50%']; }, f5 = function (p) { return [F5, p || '50% 50%']; };

  var CATS = [
    { id: 1, nombre: 'Entradas', sub: 'Para abrir la mesa', foto: F4, pos: '20% 40%', items: [
      P('Ceviche de camarón', 'Camarón, limón, cilantro y cebolla morada.', [['Individual', 28000], ['Para compartir', 52000]], { t: 'rec', f: f4('20% 40%') }),
      P('Empanadas de la casa', 'Cuatro unidades con ají de maní.', [['', 22000]], { f: f5('30% 60%') }),
      P('Carpaccio de res', 'Láminas de lomo, alcaparras, parmesano y rúcula.', [['', 34000]], { t: 'new', f: f4('70% 70%') }),
      P('Tostadas de aguacate', 'Pan de masa madre, aguacate y huevo pochado.', [['', 24000]], { f: f5('60% 40%') }),
      P('Croquetas de jamón serrano', 'Bechamel cremosa, crujientes por fuera.', [['Media docena', 26000], ['Docena', 46000]], { t: 'out', f: f4('50% 80%') }),
      P('Tabla de quesos y embutidos', 'Selección de quesos madurados, embutidos artesanales, frutos secos, mermelada de la casa, uvas y pan tostado. Pensada para acompañar una copa de vino durante una conversación larga; se sirve fría y se prepara al momento con productos de proveedores locales del Valle del Cauca.', [['Individual', 38000], ['Para compartir', 69000], ['Familiar', 98000]], { f: f5('50% 60%') }),
      P('Ensalada de la huerta', 'Hojas verdes, tomate cherry y vinagreta de la casa.', [['', 21000]])
    ] },
    { id: 2, nombre: 'Sopas y Cremas', sub: 'Calientes y reconfortantes', foto: F5, pos: '70% 40%', items: [
      P('Crema de tomate asado', 'Con crotones de albahaca.', [['', 19000]], { f: f5('20% 40%') }),
      P('Ajiaco santafereño', 'Pollo, tres tipos de papa, mazorca, alcaparras y crema de leche.', [['Individual', 32000], ['Para compartir', 58000]], { t: 'rec', f: f4('60% 50%') }),
      P('Sopa de cebolla gratinada', 'Caldo de res y queso gruyer.', [['', 20000]], { f: f5('80% 30%') }),
      P('Crema de champiñones', 'Champiñones salteados y aceite de trufa.', [['', 21000]], { t: 'new' }),
      P('Sancocho de gallina', 'Receta tradicional del Valle, servido con arroz y aguacate.', [['', 34000]], { t: 'out', f: f4('40% 80%') }),
      P('Consomé de pollo con vegetales de temporada', 'Caldo claro cocinado lentamente.', [['', 18000]])
    ] },
    { id: 3, nombre: 'Carnes y Parrilla', sub: 'Del fuego a la mesa', foto: F5, pos: '50% 60%', items: [
      P('Lomo fino a la parrilla', '300 g de lomo con papas rústicas y chimichurri.', [['300 g', 62000], ['450 g', 86000]], { t: 'rec', f: f5('50% 70%') }),
      P('Costillas BBQ', 'Cocción lenta, salsa ahumada y ensalada de repollo.', [['Media', 54000], ['Entera', 92000]], { f: f4('30% 70%') }),
      P('Pechuga rellena', 'Rellena de espinaca y queso, con puré rústico.', [['', 42000]], { f: f5('70% 50%') }),
      P('Churrasco argentino', 'Corte delgado, chorizo criollo y arepa.', [['', 58000]], { t: 'new', f: f4('60% 40%') }),
      P('Medallones de cerdo en salsa de ciruela y tocineta ahumada con puré de plátano maduro', 'Tres medallones glaseados.', [['', 48000]], { f: f5('20% 60%') }),
      P('Parrillada del club', 'Lomo, costilla, chorizo, morcilla, pollo, papa criolla, yuca frita y arepa. Para disfrutar entre amigos y familia con tres salsas de la casa.', [['Para dos', 128000], ['Para cuatro', 230000], ['Para seis', 330000]], { f: f4('50% 85%') }),
      P('Bondiola glaseada', 'Salsa de panela y puré de papa criolla.', [['', 46000]], { t: 'out' })
    ] },
    { id: 4, nombre: 'Pescados y Mariscos', sub: 'Frescos del día', foto: F4, pos: '50% 70%', items: [
      P('Trucha al ajillo', 'Trucha entera, mantequilla de ajo y vegetales.', [['', 44000]], { f: f4('80% 60%') }),
      P('Salmón a la plancha', 'Con risotto de limón.', [['', 59000]], { t: 'rec', f: f5('40% 50%') }),
      P('Arroz con camarones', 'Arroz caldoso con camarones y sofrito.', [['Individual', 46000], ['Para compartir', 84000]], { f: f4('30% 30%') }),
      P('Cazuela de mariscos', 'Calamar, camarón, mejillón y pescado en leche de coco.', [['', 62000]], { t: 'new', f: f5('60% 70%') }),
      P('Filete de róbalo', 'Costra de hierbas y puré de yuca.', [['', 56000]], { t: 'out' }),
      P('Pulpo a la gallega', 'Papa cocida, pimentón y aceite de oliva.', [['', 64000]], { f: f4('50% 40%') })
    ] },
    { id: 5, nombre: 'Postres', sub: 'Un cierre dulce', foto: null, pos: '50% 50%', items: [
      P('Tarta de limón', 'Base de galleta y merengue ligero.', [['', 18000]], { f: f4('70% 30%') }),
      P('Brownie con helado', 'Chocolate oscuro, nueces y helado de vainilla.', [['', 20000]], { t: 'rec', f: f5('30% 70%') }),
      P('Flan de caramelo', 'Receta de la casa.', [['', 15000]]),
      P('Cheesecake de maracuyá', 'Frutos del Valle, base crujiente.', [['', 21000]], { t: 'new', f: f4('40% 60%') }),
      P('Tres leches', 'Bizcocho húmedo con crema chantilly.', [['', 17000]], { t: 'out', f: f5('60% 60%') }),
      P('Selección de helados artesanales de frutas colombianas', 'Tres bolas a elección.', [['', 16000]])
    ] },
    { id: 6, nombre: 'Bebidas', sub: 'Frías y calientes', foto: F4, pos: '85% 40%', items: [
      P('Limonada natural', 'Jarra individual.', [['Vaso', 9000], ['Jarra', 22000]], { s: 'Frías', f: f4('20% 70%') }),
      P('Limonada de coco', 'Cremosa, con coco rallado.', [['', 14000]], { s: 'Frías', t: 'rec', f: f5('50% 30%') }),
      P('Jugo de lulo', 'En agua o en leche.', [['', 11000]], { s: 'Frías', t: 'new' }),
      P('Té helado de la casa', 'Té negro, durazno y hierbabuena.', [['', 10000]], { s: 'Frías', f: f4('60% 80%') }),
      P('Café de origen', 'Tostión media, cultivado en Risaralda.', [['Sencillo', 7000], ['Doble', 10000]], { s: 'Calientes', f: f5('80% 60%') }),
      P('Chocolate santafereño', 'Con queso campesino y pan.', [['', 12000]], { s: 'Calientes', t: 'out' }),
      P('Aromática de frutos rojos', 'Infusión caliente.', [['', 8000]], { s: 'Calientes' })
    ] }
  ];

  /* ---------- Estado y preferencias ---------- */
  var DEF = { style: 'lista', cols: 2, nav: 'vertical', shape: 'rounded', size: 'M', noimg: false, anim: true };
  var S = {};
  var KEY = 'menuv2-v3';
  try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = Object.assign({}, DEF); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ } }

  /* ---------- Utilidades ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cop(n) { return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  var ICON_LOCAL = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 20l3-10h30l3 10"/><path d="M6 20c0 3 2.5 4.5 5 4.5s5-1.500 5-4.500c0 3 2.500 4.500 5 4.500s5-1.500 5-4.500c0 3 2.500 4.500 5 4.500s5-1.500 5-4.500"/><path d="M10 25v15h28V25"/><path d="M20 40V31h8v9"/></svg>';
  var ICON_PLATO = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="26" r="11"/><circle cx="24" cy="26" r="6.500"/><path d="M7 8v10a3 3 0 0 0 3 3v19M10 8v8M13 8v10a3 3 0 0 1-3 3"/><path d="M41 8c-3 1.500-4.500 6-4.500 11 0 2 1 3 2.500 3V40"/></svg>';

  /* Imagen o estado vacío; siempre con la misma proporción */
  function img(src, pos, ratio, kind, alt, extra) {
    var cls = 'ph ' + ratio + (extra ? ' ' + extra : '');
    if (!src || S.noimg) {
      return '<div class="' + cls + ' ph--empty" role="img" aria-label="Sin imagen">' + (kind === 'local' ? ICON_LOCAL : ICON_PLATO) + '</div>';
    }
    return '<div class="' + cls + '"><img src="' + src + '" alt="' + esc(alt || '') + '" loading="lazy" style="object-position:' + (pos || '50% 50%') + '"></div>';
  }
  function backBtn(href, label) { return '<div class="backrow"><a class="btn btn--ghost back" href="' + href + '">' + label + '</a></div>'; }

  /* ---------- Pantallas ---------- */
  function vRestaurante() {
    var h = '<section class="screen"><header class="head"><span class="eyebrow">Club social</span><h1 class="title">' + REST.titulo + '</h1><p class="sub">' + REST.desc + '</p><hr class="rule"></header><div class="covers">';
    SEDES.forEach(function (s, i) {
      h += '<a class="cover" href="#/sede/' + s.id + '"><div class="cover__num"><b>0' + (i + 1) + '</b><span class="eyebrow">' + (s.foto ? 'Sede' : 'Sin foto') + '</span></div>' +
        img(s.foto, s.pos, 'r-sede', 'local', s.nombre) +
        '<h2 class="cover__name">' + s.nombre + '</h2><p class="cover__meta">' + esc(s.horario) + '</p><span class="cover__go">Ver sede &rarr;</span></a>';
    });
    return h + '</div></section>';
  }

  function vSede(id) {
    var s = SEDES.filter(function (x) { return x.id === id; })[0] || SEDES[0];
    var cartas = CARTAS.filter(function (c) { return c.sede === s.id; });
    var h = '<section class="screen">' + backBtn('#/', 'Volver') + '<div class="sede">' + img(s.foto, s.pos, 'r-sede', 'local', s.nombre) +
      '<div class="sede__txt"><span class="eyebrow">Sede</span><h1 class="title" style="margin-top:16px">' + s.nombre + '</h1><p class="sub">' + esc(s.horario) + '</p><p class="sede__desc">' + esc(s.desc) + '</p>' +
      '<span class="eyebrow sede__lbl">Cartas</span><div class="lines">';
    if (!cartas.length) h += '<p class="empty">Esta sede aún no tiene cartas publicadas.</p>';
    cartas.forEach(function (c) {
      h += '<a class="line" href="#/carta/' + c.id + '"><span><span class="line__name">' + c.nombre + '</span><span class="line__sub">' + c.sub + '</span></span><span class="arrow" aria-hidden="true">&rarr;</span></a>';
    });
    return h + '</div></div></div></section>';
  }

  function vCategorias() {
    var h = '<section class="screen">' + backBtn('#/sede/principal', 'Volver') + '<header class="head"><span class="eyebrow">Carta</span><h1 class="title">Carta Principal</h1><p class="sub">Elija una categoría</p><hr class="rule"></header><div class="bands">';
    CATS.forEach(function (c) {
      var n = c.items.length;
      h += '<a class="band' + (c.foto ? '' : ' band--text') + '" href="#/categoria/' + c.id + '">' + (c.foto || S.noimg ? img(c.foto, c.pos, 'r-cat', 'plato', c.nombre) : '') +
        '<div class="band__row"><div><h2 class="band__name">' + c.nombre + '</h2><p class="band__sub">' + c.sub + '</p></div><span class="band__count">' + n + ' platos <span class="arrow" aria-hidden="true">&rarr;</span></span></div></a>';
    });
    return h + '</div></section>';
  }

  function itemHtml(p) {
    var cls = 'item item--' + (S.style === 'lista' ? 'list' : S.style === 'imagenes' ? 'card' : 'banner') + (p.tag === 'out' ? ' is-out' : '');
    var tags = p.tag ? '<div class="tags"><span class="tag tag--' + (p.tag === 'rec' ? 'rec">Recomendado' : p.tag === 'new' ? 'new">Nuevo' : 'out">Agotado') + '</span></div>' : '';
    var one = p.precios.length === 1;
    var head = '<div class="row"><h3 class="row__name">' + esc(p.nombre) + '</h3>' + (one ? '<span class="row__dots"></span><span class="row__price">' + cop(p.precios[0][1]) + '</span>' : '') + '</div>';
    var prices = '';
    if (!one) {
      prices = '<div class="prices">' + p.precios.map(function (x) { return '<div class="row row--sub"><span class="row__lbl">' + esc(x[0]) + '</span><span class="row__dots"></span><span class="row__price">' + cop(x[1]) + '</span></div>'; }).join('') + '</div>';
    }
    var body = '<div class="item__body">' + tags + head + prices + (p.desc ? '<p class="desc">' + esc(p.desc) + '</p>' : '') + '</div>';
    var im = '';
    var src = p.foto ? p.foto[0] : null, pos = p.foto ? p.foto[1] : null;
    if (S.style === 'lista') im = img(src, pos, 'r-thumb', 'plato', p.nombre);
    else if (S.style === 'imagenes') im = img(src, pos, 'r-prod', 'plato', p.nombre);
    else im = img(src, pos, 'r-banner', 'plato', p.nombre);
    return '<article class="' + cls + '">' + im + body + '</article>';
  }

  function productsHtml(cat) {
    var h = '<div class="grid" data-cols="' + S.cols + '">', hasSub = cat.items.some(function (i) { return i.sub; });
    if (!hasSub) return h + cat.items.map(itemHtml).join('') + '</div>';
    h = '';
    var groups = [];
    cat.items.forEach(function (i) { var g = groups.filter(function (x) { return x.n === i.sub; })[0]; if (!g) { g = { n: i.sub, l: [] }; groups.push(g); } g.l.push(i); });
    groups.forEach(function (g) { h += '<h2 class="subhead">' + g.n + '</h2><div class="grid" data-cols="' + S.cols + '">' + g.l.map(itemHtml).join('') + '</div>'; });
    return h;
  }

  function catHead(cat) {
    return '<div class="cathead">' + (cat.foto || S.noimg ? img(cat.foto, cat.pos, 'r-cat', 'plato', cat.nombre) : '') + '<h1>' + cat.nombre + '</h1><p class="sub">' + cat.sub + '</p></div>';
  }

  function vCategoria(id) {
    var cat = CATS.filter(function (c) { return c.id === +id; })[0] || CATS[0];
    if (S.nav === 'horizontal') return vTabs(cat);
    return '<section class="screen">' + backBtn('#/carta/1', 'Volver a categorías') + catHead(cat) + productsHtml(cat) + '</section>';
  }

  function vTabs(cat) {
    var t = '<nav class="tabs" aria-label="Categorías"><div class="tabs__list">';
    CATS.forEach(function (c) { t += '<a class="tab" href="#/categoria/' + c.id + '"' + (c.id === cat.id ? ' aria-current="true"' : '') + '>' + c.nombre + '</a>'; });
    t += '</div></nav>';
    return '<section class="screen">' + backBtn('#/sede/principal', 'Volver') + '<header class="head" style="margin-bottom:32px"><span class="eyebrow">Carta</span><h1 class="title">Carta Principal</h1></header>' + t + '<div id="tabbody">' + catHead(cat) + productsHtml(cat) + '</div></section>';
  }

  /* ---------- Router ---------- */
  var stage = $('#stage') || $('#main');
  var lastRoute = '';
  function route() {
    var parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    var r = parts[0], id = parts[1], html, crumb = '', key = (r || '') + '/' + (id || '');
    var prevCat = lastRoute.indexOf('categoria/') === 0 && (r === 'categoria' || r === 'carta') && S.nav === 'horizontal';
    if (r === 'sede') { html = vSede(id); crumb = (SEDES.filter(function (s) { return s.id === id; })[0] || SEDES[0]).nombre; }
    else if (r === 'carta') { html = S.nav === 'horizontal' ? vTabs(CATS[0]) : vCategorias(); crumb = 'Carta Principal'; }
    else if (r === 'categoria') { html = vCategoria(id); crumb = (CATS.filter(function (c) { return c.id === +id; })[0] || CATS[0]).nombre; }
    else { html = vRestaurante(); r = ''; }
    var keepScroll = prevCat && r === 'categoria';
    var tabsScroll = $('.tabs__list') ? $('.tabs__list').scrollLeft : 0;
    stage.innerHTML = html;
    if (keepScroll) { var tl = $('.tabs__list'); if (tl) tl.scrollLeft = tabsScroll; var cur = $('.tab[aria-current]'); if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    else window.scrollTo(0, 0);
    $('#crumb').textContent = crumb;
    document.title = (crumb ? crumb + ' · ' : '') + 'Restaurante PP — Variante 3';
    if (r === 'sede' && lastRoute.indexOf('sede/') !== 0) openModal();
    lastRoute = key;
  }
  /* Cambios de estilo/columnas/etc. no reinician el scroll */
  function rerender() {
    var y = window.scrollY, tl = $('.tabs__list'), sx = tl ? tl.scrollLeft : 0;
    var keep = lastRoute; route(); lastRoute = keep;
    window.scrollTo(0, y); tl = $('.tabs__list'); if (tl) tl.scrollLeft = sx;
  }

  /* ---------- Modal ---------- */
  var modal = $('#modal');
  function openModal() {
    $('#modal-img').innerHTML = img(F5, '50% 45%', 'r-banner', 'local', 'Anuncio');
    modal.hidden = false; $('.modal__x').focus();
  }
  function closeModal() { modal.hidden = true; }
  modal.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closePanel(); } });

  /* ---------- Panel ---------- */
  var panel = $('#panel'), gear = $('#gear');
  function closePanel() { if (!panel.hidden) { panel.hidden = true; gear.setAttribute('aria-expanded', 'false'); } }
  gear.addEventListener('click', function () { var o = panel.hidden; panel.hidden = !o; gear.setAttribute('aria-expanded', String(o)); });
  $('#panel-close').addEventListener('click', function () { closePanel(); gear.focus(); });

  var CTL = [
    ['style', 'Estilo de categoría', [['lista', 'Lista'], ['imagenes', 'Con imágenes'], ['banner', 'Banner']]],
    ['cols', 'Columnas', [[1, '1'], [2, '2'], [3, '3']]],
    ['nav', 'Navegación', [['vertical', 'Vertical'], ['horizontal', 'Horizontal']]],
    ['shape', 'Forma de botón', [['square', 'Cuadrado'], ['rounded', 'Redondeado'], ['pill', 'Píldora']]],
    ['size', 'Tamaño de botón', [['S', 'S'], ['M', 'M'], ['L', 'L']]],
    ['noimg', 'Sin imagen', [[false, 'Mostrar'], [true, 'Quitar fotos']]],
    ['anim', 'Animaciones', [[true, 'Activadas'], [false, 'Reducidas']]]
  ];
  function buildPanel() {
    var h = '';
    CTL.forEach(function (c) {
      h += '<div class="ctl"><span class="ctl__t">' + c[1] + '</span><div class="seg" role="group" aria-label="' + c[1] + '">';
      c[2].forEach(function (o) { h += '<button type="button" data-k="' + c[0] + '" data-v="' + o[0] + '" aria-pressed="' + (S[c[0]] === o[0]) + '">' + o[1] + '</button>'; });
      h += '</div></div>';
    });
    h += '<div class="ctl"><span class="ctl__t">Ir a pantalla</span><div class="jump"><a href="#/">1 · Restaurante</a><a href="#/sede/principal">2 · Sede</a><a href="#/carta/1">3 · Categorías</a><a href="#/categoria/3">4 · Productos</a></div></div>';
    $('#panel-body').innerHTML = h;
  }
  $('#panel-body').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]'); if (!b) return;
    var k = b.getAttribute('data-k'), v = b.getAttribute('data-v');
    S[k] = (v === 'true') ? true : (v === 'false') ? false : (k === 'cols') ? +v : v;
    save(); applyPrefs(); buildPanel(); rerender();
    var again = $('button[data-k="' + k + '"][data-v="' + v + '"]'); if (again) again.focus();
  });

  function applyPrefs() {
    var b = document.body;
    b.setAttribute('data-btn-shape', S.shape); b.setAttribute('data-btn-size', S.size);
    b.classList.toggle('no-anim', !S.anim);
  }

  /* Miniatura de lista: 96 px, mismas esquinas que las demás imágenes */
  var st = document.createElement('style'); st.textContent = '.r-thumb{aspect-ratio:1/1}'; document.head.appendChild(st);

  applyPrefs(); buildPanel();
  window.addEventListener('hashchange', route);
  route();
})();
