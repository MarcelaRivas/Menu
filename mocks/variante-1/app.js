(function () {
  'use strict';

  /* ---------- Iconos ---------- */
  var I = function (p) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>'; };
  var ICON = {
    store: I('<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-4h4v4"/>'),
    plate: I('<circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2.2"/><path d="M3.5 3v6a1.5 1.5 0 003 0V3M5 10v11"/><path d="M20.5 21V3c-2 1-3.2 4-3.2 7.5H20.5"/>'),
    gear: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>'),
    back: I('<path d="M19 12H5M12 19l-7-7 7-7"/>'),
    chev: I('<path d="M9 6l6 6-6 6"/>'),
    x: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    book: I('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/>')
  };

  /* ---------- Datos de ejemplo ---------- */
  var F4 = '../assets/foto-4.png', F5 = '../assets/foto-5.jpeg';
  var SEDES = [
    { id: 'principal', name: 'Sede Principal', img: F4, desc: 'Salón principal y terraza con vista al campo', hours: 'Todos los días, 11:30 a. m. a 9:00 p. m.' },
    { id: 'norte', name: 'Sede Norte', img: F5, desc: 'Ambiente familiar junto a la cancha', hours: 'Martes a domingo, 12:00 m. a 8:00 p. m.' },
    { id: 'sanfernando', name: 'Sede San Fernando', img: null, desc: 'Cafetería y servicio rápido', hours: 'Lunes a sábado, 7:00 a. m. a 6:00 p. m.' }
  ];
  var CARTA = { id: 1, name: 'Carta Principal' };

  // Producto: [nombre, descripción, precios, banderas, foto]
  // precios: [[etiqueta|null, valor], ...]  banderas: r=Recomendado, n=Nuevo, a=Agotado
  function P(name, desc, prices, flags, img, sub) {
    return { name: name, desc: desc, prices: prices, r: /r/.test(flags || ''), n: /n/.test(flags || ''), a: /a/.test(flags || ''), img: img || null, sub: sub || null };
  }
  var CATS = [
    { id: 1, name: 'Entradas', img: F4, items: [
      P('Ceviche de camarón', 'Camarones marinados en limón con cebolla morada, cilantro y chips de plátano.', [['Individual', 28000], ['Para compartir', 52000]], 'r', F4),
      P('Empanadas de la casa (3 uds.)', 'Masa de maíz crocante rellena de carne desmechada, con ají de la casa.', [[null, 18000]], '', F5),
      P('Tabla de quesos y embutidos', 'Selección de quesos madurados, jamón serrano, salami y aceitunas, acompañados de frutos secos, mermelada de higo, uvas frescas, pan artesanal tostado y galletas de la casa; pensada para compartir en la mesa mientras llega el plato fuerte, con opción de agregar copa de vino.', [['Para 2', 46000], ['Para 4', 84000], ['Para 6', 118000]], '', F4),
      P('Carpaccio de res', 'Láminas finas de lomo con rúcula, parmesano y alcaparras.', [[null, 32000]], 'n', F5),
      P('Ensalada tibia de quinoa con vegetales asados y vinagreta de maracuyá de la huerta del club', 'Quinoa, calabacín, berenjena y pimentón asados.', [['Individual', 24000], ['Grande', 38000]], '', null),
      P('Patacones con hogao', 'Plátano verde frito con hogao y queso costeño.', [[null, 16000]], 'a', F4)
    ] },
    { id: 2, name: 'Sopas y Cremas', img: F5, items: [
      P('Ajiaco santafereño', 'Tres tipos de papa, pollo, mazorca, alcaparras y crema de leche.', [['Tazón', 26000], ['Olla familiar', 78000]], 'r', F5),
      P('Crema de champiñones', 'Champiñones salteados con un toque de vino blanco y crotones.', [[null, 22000]], 'n', F4),
      P('Sancocho de gallina', 'Gallina criolla, yuca, plátano y mazorca, con arroz y aguacate.', [['Individual', 32000], ['Para compartir', 60000]], '', F5),
      P('Sopa de tomate asado', 'Tomates asados con albahaca y queso gratinado.', [[null, 20000]], 'a', F4),
      P('Caldo de costilla', 'Caldo tradicional de costilla con papa y cilantro, ideal para la mañana.', [[null, 19000]], '', null)
    ] },
    { id: 3, name: 'Carnes y Parrilla', img: F5, items: [
      P('Lomo fino a la parrilla (300 g)', 'Corte selecto a la brasa con papas rústicas y chimichurri.', [['Media porción', 58000], ['Completo', 74000]], 'r', F5),
      P('Costillas BBQ', 'Costillas de cerdo glaseadas en salsa ahumada, con ensalada de col.', [['Media tira', 48000], ['Tira completa', 79000]], 'n', F4),
      P('Churrasco argentino', 'Corte de res con sal gruesa, acompañado de arroz y ensalada.', [[null, 66000]], '', F5),
      P('Picada del club', 'Chorizo, morcilla, costilla, chicharrón, pollo apanado, papa criolla, arepa, plátano maduro, yuca frita, ají y limón, servida sobre tabla de madera para toda la mesa y pensada para acompañar la conversación con una bebida fría.', [['Para 2', 78000], ['Para 4', 142000], ['Para 6', 205000]], '', F4),
      P('Pechuga rellena de champiñones y queso con salsa de vino blanco y vegetales salteados', 'Pechuga de pollo rellena, bañada en salsa cremosa.', [[null, 44000]], '', F5),
      P('Bandeja paisa', 'Frijoles, arroz, chicharrón, carne molida, huevo, chorizo y aguacate.', [[null, 49000]], 'a', F4),
      P('Medallones de cerdo', 'Con puré de manzana y reducción de panela.', [[null, 52000]], '', null)
    ] },
    { id: 4, name: 'Pescados y Mariscos', img: F4, items: [
      P('Trucha almendrada', 'Trucha entera dorada con almendras, arroz de coco y ensalada.', [[null, 46000]], '', F4),
      P('Salmón a la plancha', 'Salmón con puré de ahuyama y vegetales al vapor.', [[null, 68000]], 'r', F5),
      P('Arroz marinero', 'Arroz caldoso con camarones, calamar, mejillones y pescado.', [['Individual', 54000], ['Para compartir', 98000]], '', F4),
      P('Filete de pargo rojo frito con patacón, arroz de coco y ensalada fresca de la casa', 'Pargo rojo del Pacífico, crujiente por fuera y jugoso por dentro.', [[null, 62000]], '', F5),
      P('Cazuela de mariscos', 'Mariscos en salsa de coco con un toque de ají dulce.', [[null, 64000]], 'n', null),
      P('Langostinos al ajillo', 'Salteados en mantequilla de ajo y perejil.', [[null, 72000]], 'a', F4)
    ] },
    { id: 5, name: 'Postres', img: null, items: [
      P('Tres leches', 'Bizcocho húmedo con crema chantilly y canela.', [[null, 14000]], '', F4),
      P('Brownie con helado', 'Brownie tibio de chocolate con helado de vainilla.', [[null, 16000]], 'r', F5),
      P('Flan de caramelo', 'Flan casero con caramelo oscuro.', [[null, 12000]], '', null),
      P('Torta de zanahoria', 'Con nueces y glaseado de queso crema.', [[null, 15000]], 'n', F4),
      P('Cheesecake de maracuyá', 'Base de galleta y cobertura de maracuyá natural.', [[null, 17000]], 'a', F5)
    ] },
    { id: 6, name: 'Bebidas', img: F4, items: [
      P('Limonada de coco', 'Cremosa y fría, preparada al momento.', [['Vaso', 9000], ['Jarra', 24000]], 'r', F5, 'Sin alcohol'),
      P('Jugos naturales', 'Mora, lulo, maracuyá, mango o fresa, en agua o en leche.', [['Vaso', 8000], ['Jarra', 22000]], '', F4, 'Sin alcohol'),
      P('Café americano', 'Café de origen, tostión media.', [[null, 6000]], '', null, 'Sin alcohol'),
      P('Limonada cerezada', 'Limón, cereza y hielo frappé.', [[null, 10000]], 'n', F5, 'Sin alcohol'),
      P('Cerveza nacional', 'Botella de 330 ml, bien fría.', [[null, 8000]], '', F4, 'Licores'),
      P('Copa de vino tinto', 'Selección de la casa, Malbec o Cabernet.', [['Copa', 24000], ['Botella', 98000]], '', F5, 'Licores'),
      P('Mojito clásico', 'Ron blanco, hierbabuena, limón y soda.', [[null, 26000]], '', null, 'Licores'),
      P('Aguardiente antioqueño', 'Servido con limón y hielo.', [['Trago', 8000], ['Media', 62000], ['Botella', 118000]], 'a', F4, 'Licores')
    ] }
  ];

  /* ---------- Estado / configuración ---------- */
  var KEY = 'menuv2-variante-1';
  var DEFAULTS = { style: 'imagenes', cols: '2', nav: 'vertical', shape: 'redondeado', size: 'M', noimg: 'off', anim: 'on' };
  var state = Object.assign({}, DEFAULTS);
  try { var saved = JSON.parse(localStorage.getItem(KEY) || '{}'); Object.keys(DEFAULTS).forEach(function (k) { if (saved[k]) state[k] = String(saved[k]); }); } catch (e) {}
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function applyState() {
    var h = document.documentElement;
    Object.keys(state).forEach(function (k) { h.setAttribute('data-' + k, state[k]); });
  }
  var lastSede = 'principal', lastCat = 1, prevKind = null;

  /* ---------- Utilidades ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var money = function (n) { return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var sedeById = function (id) { return SEDES.filter(function (s) { return s.id === id; })[0] || SEDES[0]; };
  var catById = function (id) { return CATS.filter(function (c) { return c.id === +id; })[0] || CATS[0]; };
  var showImg = function (src) { return src && state.noimg !== 'on'; };
  function media(src, cls, kind) {
    var inner = showImg(src) ? '<img src="' + src + '" alt="" loading="lazy">' : '<div class="ph">' + (kind === 'sede' ? ICON.store : ICON.plate) + '</div>';
    return '<div class="media ' + cls + '">' + inner + '</div>';
  }
  function head(title, sub) {
    return '<header class="head"><h1>' + title + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '<div class="divider"></div></header>';
  }
  function back(href) {
    return '<div class="toolbar"><a class="btn btn-back" href="' + href + '">' + ICON.back + 'Volver</a></div>';
  }

  /* ---------- Pantallas ---------- */
  function viewHome() {
    var cards = SEDES.map(function (s) {
      return '<article class="card sede-card lift">' + media(s.img, 'ar-sede', 'sede') +
        '<div class="card-body"><h2>' + s.name + '</h2><p>' + s.desc + '</p>' +
        '<a class="btn btn-primary stretch" href="#/sede/' + s.id + '" aria-label="Ver carta de ' + s.name + '">Ver carta</a></div></article>';
    }).join('');
    return head('Nuestra Gastronomía', 'Seleccione una sede para conocer su carta') + '<div class="sedes">' + cards + '</div>';
  }

  function viewSede(id) {
    var s = sedeById(id);
    return back('#/') +
      '<div class="hero">' + media(s.img, 'ar-sede', 'sede') + '</div>' +
      head(s.name, s.desc) +
      '<div class="rows">' +
      '<article class="card row-card lift"><span class="badge">' + ICON.book + '</span><div class="tx"><h2><a class="stretch" style="text-decoration:none" href="#/carta/1">' + CARTA.name + '</a></h2><p>' + CATS.length + ' categorías · Entradas, parrilla, postres y más</p></div><span class="chev">' + ICON.chev + '</span></article>' +
      '<div class="card row-card info" style="border-style:dashed"><span class="badge">' + ICON.clock + '</span><div class="tx"><h2>Horario de atención</h2><p>' + s.hours + '</p></div></div>' +
      '</div>';
  }

  function viewCartaVertical() {
    var s = sedeById(lastSede);
    var cards = CATS.map(function (c) {
      var has = showImg(c.img);
      return '<a class="cat' + (has ? '' : ' noimg') + '" href="#/categoria/' + c.id + '">' +
        '<div class="media">' + (has ? '<img src="' + c.img + '" alt="" loading="lazy">' : '<div class="ph">' + ICON.plate + '</div>') + '</div>' +
        '<div class="tx"><h2>' + c.name + '</h2><span class="n">' + c.items.length + ' platos</span></div></a>';
    }).join('');
    return back('#/sede/' + lastSede) + head(CARTA.name, s.name + ' · Seleccione una categoría') + '<div class="cats">' + cards + '</div>';
  }

  function productCard(p) {
    var tags = (p.r ? '<span class="tag tag-rec">Recomendado</span>' : '') + (p.n ? '<span class="tag tag-new">Nuevo</span>' : '') + (p.a ? '<span class="tag tag-out">Agotado</span>' : '');
    var prices = p.prices.map(function (x) {
      return '<li class="' + (x[0] ? '' : 'single') + '"><span class="pn">' + (x[0] || '') + '</span><span class="lead" aria-hidden="true"></span><span class="pv">' + money(x[1]) + '</span></li>';
    }).join('');
    return '<article class="card prod' + (p.a ? ' out' : '') + '">' + media(p.img, 'ar-prod', 'prod') +
      '<div class="prod-body">' + (tags ? '<div class="tags">' + tags + '</div>' : '') +
      '<h3>' + p.name + '</h3><p class="desc">' + p.desc + '</p><ul class="prices">' + prices + '</ul></div></article>';
  }
  function products(c) {
    var out = '', subs = [];
    c.items.forEach(function (p) { if (subs.indexOf(p.sub) < 0) subs.push(p.sub); });
    subs.forEach(function (sub) {
      var list = c.items.filter(function (p) { return p.sub === sub; });
      if (sub) out += '<h2 class="sub-h">' + sub + '</h2>';
      out += '<div class="grid">' + list.map(productCard).join('') + '</div>';
    });
    return out;
  }
  function viewProducts(c, horizontal) {
    var s = sedeById(lastSede);
    var chips = '';
    if (horizontal) {
      chips = '<div class="chipbar"><nav class="chips" aria-label="Categorías">' + CATS.map(function (k) {
        return '<a class="chip" href="#/categoria/' + k.id + '"' + (k.id === c.id ? ' aria-current="page"' : '') + '>' + k.name + '</a>';
      }).join('') + '</nav></div>';
    }
    var backHref = horizontal ? '#/sede/' + lastSede : '#/carta/1';
    return '<div class="prodscreen">' + back(backHref) + chips + head(c.name, CARTA.name + ' · ' + s.name) + '<div id="prods">' + products(c) + '</div></div>';
  }

  /* ---------- Router ---------- */
  function route(soft) {
    soft = soft === true;
    var h = (location.hash || '#/').replace(/^#/, '');
    var parts = h.split('/').filter(Boolean);
    var kind, html, ctx = '';
    var horiz = state.nav === 'horizontal';
    var name = parts[0] || 'home';

    if (name === 'sede') { lastSede = sedeById(parts[1]).id; kind = 'sede'; html = viewSede(lastSede); ctx = sedeById(lastSede).name; }
    else if (name === 'carta') {
      if (horiz) { kind = 'prod'; html = viewProducts(catById(lastCat), true); ctx = CARTA.name; }
      else { kind = 'carta'; html = viewCartaVertical(); ctx = CARTA.name; }
    }
    else if (name === 'categoria') { var c = catById(parts[1]); lastCat = c.id; kind = 'prod'; html = viewProducts(c, horiz); ctx = c.name; }
    else { kind = 'home'; html = viewHome(); }

    var screen = $('#screen');
    var sameProd = soft || (kind === 'prod' && prevKind === 'prod' && horiz && screen.querySelector('.chips'));
    var keepScroll = 0;
    if (sameProd && screen.querySelector('.chips')) keepScroll = screen.querySelector('.chips').scrollLeft;
    screen.innerHTML = '<section class="screen' + (sameProd ? '' : ' enter') + '">' + html + '</section>';
    $('#ctx').textContent = ctx;
    document.title = (ctx ? ctx + ' — ' : '') + 'Restaurante PP';
    var chipsEl = screen.querySelector('.chips');
    if (chipsEl) {
      chipsEl.scrollLeft = keepScroll;
      var act = chipsEl.querySelector('[aria-current]');
      if (act) {
        var left = act.offsetLeft - (chipsEl.clientWidth - act.offsetWidth) / 2;
        chipsEl.scrollLeft = Math.max(0, left);
      }
    }
    if (soft) { prevKind = kind; return; }
    if (!sameProd) window.scrollTo(0, 0);
    else { var top = $('.chipbar').getBoundingClientRect().top; if (top <= 80) window.scrollTo(0, Math.max(0, window.scrollY + $('.head').getBoundingClientRect().top - 140)); }

    if (kind === 'sede' && prevKind !== 'sede') openModal();
    prevKind = kind;
  }

  /* ---------- Modal ---------- */
  var modal = $('#modal'), lastFocus = null;
  function openModal() {
    $('#modal-media').innerHTML = showImg(F5) ? '<img src="' + F5 + '" alt="">' : '<div class="ph">' + ICON.plate + '</div>';
    modal.hidden = false; lastFocus = document.activeElement; $('#modal-x').focus();
  }
  function closeModal() { if (modal.hidden) return; modal.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  modal.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(); });
  $('#modal-x').innerHTML = ICON.x;

  /* ---------- Panel de configuración ---------- */
  var panel = $('#panel'), fab = $('#fab');
  fab.innerHTML = ICON.gear;
  var CONTROLS = [
    ['style', 'Estilo de categoría', [['lista', 'Lista'], ['imagenes', 'Con imágenes'], ['banner', 'Banner']]],
    ['cols', 'Columnas', [['1', '1'], ['2', '2'], ['3', '3']]],
    ['nav', 'Navegación', [['vertical', 'Vertical'], ['horizontal', 'Horizontal']]],
    ['shape', 'Forma de botón', [['cuadrado', 'Cuadrado'], ['redondeado', 'Redondeado'], ['pildora', 'Píldora']]],
    ['size', 'Tamaño de botón', [['S', 'S'], ['M', 'M'], ['L', 'L']]],
    ['anim', 'Animaciones', [['on', 'Activadas'], ['off', 'Reducidas']]]
  ];
  function renderPanel() {
    var html = '<h2>Configuración</h2>';
    CONTROLS.forEach(function (c) {
      html += '<div class="ctl" role="group" aria-label="' + c[1] + '"><span>' + c[1] + '</span><div class="seg">' +
        c[2].map(function (o) { return '<button type="button" data-k="' + c[0] + '" data-v="' + o[0] + '" aria-pressed="' + (state[c[0]] === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    });
    html += '<div class="ctl"><span>Sin imagen</span><div class="seg"><button type="button" data-k="noimg" data-v="toggle" aria-pressed="' + (state.noimg === 'on') + '">' + (state.noimg === 'on' ? 'Mostrar fotos' : 'Quitar fotos') + '</button></div></div>';
    html += '<div class="ctl"><span>Ir a la pantalla</span><div class="links"><a href="#/">1. Restaurante</a><a href="#/sede/principal">2. Sede</a><a href="#/carta/1">3. Categorías</a><a href="#/categoria/3">4. Productos</a></div></div>';
    panel.innerHTML = html;
  }
  panel.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]');
    if (!b) return;
    var k = b.dataset.k, v = b.dataset.v;
    state[k] = k === 'noimg' ? (state.noimg === 'on' ? 'off' : 'on') : v;
    persist(); applyState(); renderPanel();
    var again = panel.querySelector('button[data-k="' + k + '"]' + (k === 'noimg' ? '' : '[data-v="' + v + '"]'));
    if (again) again.focus();
    if (k !== 'shape' && k !== 'size' && k !== 'anim') { route(true); }
  });
  panel.addEventListener('click', function (e) { if (e.target.closest('.links a')) { panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); } });
  fab.addEventListener('click', function () {
    var open = panel.hidden;
    if (open) renderPanel();
    panel.hidden = !open; fab.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    else if (!panel.hidden) { panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.focus(); }
  });

  /* ---------- Inicio ---------- */
  applyState();
  window.addEventListener('hashchange', route);
  route();
})();
