(function () {
'use strict';

/* ---------- Datos de ejemplo ---------- */
var F4 = '../assets/foto-4.png', F5 = '../assets/foto-5.jpeg';
var LONG = 'Lomo fino de res madurado durante veintiún días, sellado a la parrilla de carbón y terminado al horno lento; se sirve con puré rústico de papa criolla, vegetales asados de temporada, reducción de vino tinto y mantequilla de hierbas finas de la casa. Preparación artesanal que puede tardar hasta veinte minutos.';

var SEDES = [
  { id: 'principal', name: 'Sede Principal', desc: 'Salón principal y terraza junto a los jardines.', img: F4, pos: '30% 50%' },
  { id: 'norte', name: 'Sede Norte', desc: 'Ambiente tranquilo frente a la cancha.', img: F5, pos: '50% 40%' },
  { id: 'sanfernando', name: 'Sede San Fernando', desc: 'Atención de martes a domingo.', img: null }
];
var CARTAS = [
  { id: 1, name: 'Carta Principal', desc: 'Entradas, platos fuertes, postres y bebidas.' },
  { id: 2, name: 'Carta de Eventos', desc: 'Selección para celebraciones y reuniones.' }
];

function P(n, d, pr, o) { o = o || {}; return { n: n, d: d, p: pr, rec: o.rec, nw: o.nw, off: o.off, img: o.img, pos: o.pos, sub: o.sub }; }
var CATS = [
  { id: 1, name: 'Entradas', img: F4, pos: '20% 50%', prods: [
    P('Ceviche de camarón', 'Camarón fresco curado en limón, cilantro y ají dulce.', [['', 36000]], { nw: 1, img: F4, pos: '70% 60%' }),
    P('Carpaccio de res', LONG, [['Individual', 28000], ['Para compartir', 52000]], { rec: 1 }),
    P('Empanadas de la casa', 'Tres unidades con ají de maní.', [['', 18000]]),
    P('Tabla de quesos y embutidos', 'Selección de quesos madurados, jamón serrano y frutos secos.', [['Para 2', 48000], ['Para 4', 86000], ['Para 6', 120000]]),
    P('Ensalada caprese', 'Tomate, mozzarella fresca y albahaca.', [['', 24000]]),
    P('Croquetas de jamón', 'Crujientes, con salsa alioli.', [['', 22000]], { off: 1 }),
    P('Tostadas de aguacate con tomate cherry confitado, reducción de balsámico y albahaca fresca', 'Pan de masa madre.', [['', 26000]])
  ] },
  { id: 2, name: 'Sopas y Cremas', img: F5, pos: '45% 60%', prods: [
    P('Ajiaco santafereño', 'Con pollo, mazorca, alcaparras y crema.', [['Individual', 32000], ['Para compartir', 58000]], { rec: 1 }),
    P('Crema de champiñones', 'Con aceite de trufa.', [['', 22000]]),
    P('Sancocho de gallina', 'Tradicional, con arroz y aguacate.', [['', 34000]]),
    P('Crema de tomate asado', 'Con crotones de pan y albahaca.', [['', 20000]], { nw: 1 }),
    P('Consomé de la casa', 'Caldo claro de res con vegetales.', [['', 18000]], { off: 1 })
  ] },
  { id: 3, name: 'Carnes y Parrilla', img: F5, pos: '50% 80%', prods: [
    P('Lomo fino a la parrilla', LONG, [['250 g', 68000], ['350 g', 89000]], { rec: 1, img: F5, pos: '50% 70%' }),
    P('Churrasco argentino', 'Con chimichurri y papas rústicas.', [['', 64000]]),
    P('Costillas BBQ', 'Cocción lenta, salsa ahumada.', [['Media', 56000], ['Completa', 92000]]),
    P('Pechuga rellena de queso y espinacas con salsa de champiñones', 'Acompañada de arroz y ensalada.', [['', 44000]]),
    P('Parrillada para compartir', 'Res, cerdo, pollo, chorizo y morcilla.', [['Para 2', 118000], ['Para 4', 210000], ['Para 6', 295000]], { nw: 1 }),
    P('Punta de anca', 'Con yuca frita y hogao.', [['', 58000]], { off: 1 }),
    P('Medallones de cerdo', 'En salsa de ciruela.', [['', 46000]])
  ] },
  { id: 4, name: 'Pescados y Mariscos', img: F4, pos: '80% 70%', prods: [
    P('Salmón a la plancha', 'Con puré de coliflor y vegetales.', [['', 62000]], { rec: 1, img: F4, pos: '30% 60%' }),
    P('Trucha al ajillo', 'Con arroz de coco.', [['', 48000]]),
    P('Cazuela de mariscos', 'Camarón, calamar y pescado en salsa de coco.', [['Individual', 58000], ['Para compartir', 104000]]),
    P('Arroz marinero', 'Con mariscos del día.', [['', 54000]], { nw: 1 }),
    P('Filete de róbalo', 'Salsa de maracuyá.', [['', 59000]], { off: 1 }),
    P('Camarones al ajillo', 'Con pan tostado.', [['', 52000]])
  ] },
  { id: 5, name: 'Postres', img: null, prods: [
    P('Tres leches', 'Bizcocho húmedo con crema chantilly.', [['', 16000]], { rec: 1 }),
    P('Brownie con helado', 'Chocolate oscuro y helado de vainilla.', [['', 18000]]),
    P('Flan de caramelo', 'Receta tradicional del club.', [['', 14000]]),
    P('Cheesecake de frutos rojos', 'Base de galleta artesanal.', [['', 20000]], { nw: 1 }),
    P('Tarta de limón', 'Merengue flameado.', [['', 17000]], { off: 1 })
  ] },
  { id: 6, name: 'Bebidas', img: F5, pos: '20% 20%', prods: [
    P('Café americano', 'Grano de origen, tostión media.', [['', 6000]], { sub: 'Calientes' }),
    P('Capuchino', 'Con espuma de leche.', [['', 9000]], { sub: 'Calientes' }),
    P('Chocolate santafereño', 'Con queso y pan.', [['', 12000]], { sub: 'Calientes', rec: 1 }),
    P('Limonada de coco', 'Cremosa y refrescante.', [['Vaso', 12000], ['Jarra', 32000]], { sub: 'Frías', nw: 1, img: F5, pos: '60% 30%' }),
    P('Jugo natural en agua o leche', 'Mora, lulo, maracuyá o fresa.', [['', 10000]], { sub: 'Frías' }),
    P('Té frío de la casa', 'Infusión de frutos rojos.', [['', 9000]], { sub: 'Frías', off: 1 }),
    P('Copa de vino tinto', 'Selección de la cava.', [['Copa', 24000], ['Botella', 98000]], { sub: 'Licores' }),
    P('Cerveza artesanal', 'Rubia, roja o negra.', [['', 14000]], { sub: 'Licores' })
  ] }
];

/* ---------- Estado y preferencias ---------- */
var DEFAULTS = { style: 'img', cols: 2, nav: 'v', shape: 'rd', size: 'M', noimg: false, anim: true };
var S = Object.assign({}, DEFAULTS);
try { var saved = JSON.parse(localStorage.getItem('menuv2-var2') || 'null'); if (saved) Object.assign(S, saved); } catch (e) {}
function save() { try { localStorage.setItem('menuv2-var2', JSON.stringify(S)); } catch (e) {} }

/* ---------- Utilidades ---------- */
var $ = function (s) { return document.querySelector(s); };
function money(n) { return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function plural(n) { return n + (n === 1 ? ' plato' : ' platos'); }
var ICON_LOCAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10l1.5-5h15L21 10"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/></svg>';
var ICON_DISH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2.5"/><path d="M3 4v5a2 2 0 0 0 2 2v9M5 4v5M7 4v5"/><path d="M21 4c-1.8 1-3 3.5-3 6h3v10"/></svg>';
var CHEV = '<svg class="chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

function media(cls, img, pos, icon, extra) {
  if (img && !S.noimg) {
    return '<div class="media ' + cls + '"><img src="' + img + '" alt="" loading="lazy" style="object-position:' + (pos || '50% 50%') + '">' + (extra || '') + '</div>';
  }
  return '<div class="media media--ph ' + cls + '">' + icon + (extra ? extra.replace('class="shade"', 'class="shade" hidden') : '') + '</div>';
}
function tags(p) {
  var t = '';
  if (p.rec) t += '<span class="tag tag--rec">Recomendado</span>';
  if (p.nw) t += '<span class="tag tag--new">Nuevo</span>';
  if (p.off) t += '<span class="tag tag--off">Agotado</span>';
  return t ? '<div class="tags">' + t + '</div>' : '';
}
function prices(p) {
  return '<div class="prices">' + p.p.map(function (x) {
    return '<div class="price">' + (x[0] ? '<span class="price__l">' + x[0] + '</span>' : '') + '<span class="price__v">' + money(x[1]) + '</span></div>';
  }).join('') + '</div>';
}
function prod(p) {
  var cls = 'prod card prod--' + S.style + (p.off ? ' prod--off' : '');
  var body = function (withTags) {
    return '<div class="prod__body"><h3 class="prod__name">' + p.n + '</h3>' + (withTags ? tags(p) : '') +
      '<p class="prod__desc">' + p.d + '</p>' + prices(p) + '</div>';
  };
  if (S.style === 'list') return '<article class="' + cls + '">' + body(true) + '</article>';
  if (S.style === 'banner') {
    var inner = tags(p) + (p.img && !S.noimg ? '<div class="shade"></div>' : '');
    var m = (p.img && !S.noimg)
      ? '<div class="media ar-banner"><img src="' + p.img + '" alt="" loading="lazy" style="object-position:' + (p.pos || '50% 50%') + '"><div class="shade"></div>' + tags(p) + '</div>'
      : '<div class="media media--ph ar-banner">' + ICON_DISH + '</div>';
    return '<article class="' + cls + '">' + m + body(!(p.img && !S.noimg)) + '</article>';
  }
  var m2 = media('ar-prod', p.img, p.pos, ICON_DISH);
  return '<article class="' + cls + '">' + m2 + body(true) + '</article>';
}
function prodGrid(cat) {
  var h = '', last = null;
  cat.prods.forEach(function (p) {
    if (p.sub && p.sub !== last) { h += '<h3 class="sub-h">' + p.sub + '</h3>'; last = p.sub; }
    h += prod(p);
  });
  return '<div class="prods" data-cols="' + S.cols + '">' + h + '</div>';
}
function crumbs(items) {
  $('#crumbs').innerHTML = '<ol>' + items.map(function (i, k) {
    return '<li>' + (k === items.length - 1 ? '<span aria-current="page">' + i[0] + '</span>' : '<a href="' + i[1] + '">' + i[0] + '</a>') + '</li>';
  }).join('') + '</ol>';
}
function back(href) { return '<a class="btn btn--outline back" href="' + href + '">← Volver</a>'; }
function findSede(id) { return SEDES.filter(function (s) { return s.id === id; })[0] || SEDES[0]; }
function findCat(id) { return CATS.filter(function (c) { return c.id === +id; })[0] || CATS[0]; }
function findCarta(id) { return CARTAS.filter(function (c) { return c.id === +id; })[0] || CARTAS[0]; }

/* ---------- Pantallas ---------- */
var ctx = { sede: 'principal', carta: 1 };

function screenHome() {
  crumbs([['Restaurante PP', '#/']]);
  return '<header class="head"><p class="eyebrow">Restaurante PP</p><h1>Nuestra Gastronomía</h1><hr class="rule"><p class="sub">Seleccione una sede para conocer su carta</p></header>' +
    '<div class="sedes">' + SEDES.map(function (s) {
      return '<a class="sede card" href="#/sede/' + s.id + '">' + media('ar-sede', s.img, s.pos, ICON_LOCAL) +
        '<div class="sede__body"><h2>' + s.name + '</h2><p>' + s.desc + '</p><span class="link">Ver cartas →</span></div></a>';
    }).join('') + '</div>';
}
function screenSede(id) {
  var s = findSede(id); ctx.sede = s.id;
  crumbs([['Restaurante PP', '#/'], [s.name]]);
  return back('#/') + '<header class="head"><h1>' + s.name + '</h1><hr class="rule"><p class="sub">Elija la carta que desea consultar</p></header>' +
    '<ul class="cartas">' + CARTAS.map(function (c) {
      return '<li><a href="#/carta/' + c.id + '"><div><h2>' + c.name + '</h2><p>' + c.desc + '</p></div>' + CHEV + '</a></li>';
    }).join('') + '</ul>';
}
function crumbsCarta(cartaObj, catName) {
  var sede = findSede(ctx.sede);
  var it = [['Restaurante PP', '#/'], [sede.name, '#/sede/' + sede.id]];
  if (catName) { it.push([cartaObj.name, '#/carta/' + cartaObj.id]); it.push([catName]); } else it.push([cartaObj.name]);
  crumbs(it);
}
function tabsBar(activeId) {
  return '<div class="tabs"><div class="tabs__in" role="tablist" aria-label="Categorías">' + CATS.map(function (c) {
    return '<a class="tab" role="tab" href="#/categoria/' + c.id + '" aria-selected="' + (c.id === +activeId) + '">' + c.name + '</a>';
  }).join('') + '</div></div>';
}
function screenCarta(id) {
  var c = findCarta(id); ctx.carta = c.id;
  crumbsCarta(c);
  if (S.nav === 'h') return screenMenuH(c, CATS[0]);
  return back('#/sede/' + ctx.sede) + '<header class="head"><h1>' + c.name + '</h1><hr class="rule"><p class="sub">Elija una categoría</p></header>' +
    '<div class="cats" data-cols="' + S.cols + '">' + CATS.map(function (k) {
      return '<a class="cat card" href="#/categoria/' + k.id + '">' + media('ar-cat', k.img, k.pos, ICON_DISH) +
        '<div class="cat__t"><div><h3>' + k.name + '</h3><p>' + plural(k.prods.length) + '</p></div></div>' + CHEV + '</a>';
    }).join('') + '</div>';
}
function screenMenuH(carta, cat) {
  return back('#/sede/' + ctx.sede) + '<header class="head"><h1>' + carta.name + '</h1></header>' + tabsBar(cat.id) +
    '<section id="menu-body" aria-label="' + cat.name + '"><h2 class="sr" style="position:absolute;left:-999px">' + cat.name + '</h2>' + prodGrid(cat) + '</section>';
}
function screenCat(id) {
  var cat = findCat(id), c = findCarta(ctx.carta);
  crumbsCarta(c, cat.name);
  if (S.nav === 'h') return screenMenuH(c, cat);
  return back('#/carta/' + c.id) + '<header class="head"><h1>' + cat.name + '</h1><hr class="rule"><p class="sub">' + plural(cat.prods.length) + ' en esta categoría</p></header>' + prodGrid(cat);
}

/* ---------- Router ---------- */
var lastKey = null;
function route(quiet) {
  var h = location.hash.replace(/^#\/?/, '').split('/');
  var key, html;
  if (h[0] === 'sede') { key = 'sede'; html = screenSede(h[1]); }
  else if (h[0] === 'carta') { key = S.nav === 'h' ? 'menu' : 'carta'; html = screenCarta(h[1]); }
  else if (h[0] === 'categoria') { key = S.nav === 'h' ? 'menu' : 'cat'; html = screenCat(h[1]); }
  else { key = 'home'; html = screenHome(); }
  var view = $('#view');
  var same = quiet === true || key === lastKey;
  view.classList.remove('enter');
  view.innerHTML = html;
  if (!same) { void view.offsetWidth; view.classList.add('enter'); window.scrollTo(0, 0); }
  else if (key === 'menu') { /* cambio de pestaña: no anima ni salta */ }
  if (key === 'menu') {
    var t = view.querySelector('.tab[aria-selected="true"]');
    if (t && t.scrollIntoView) { var bar = t.parentNode; bar.scrollLeft = Math.max(0, t.offsetLeft - 16); }
  }
  if (key === 'sede' && lastKey !== 'sede' && quiet !== true) openModal();
  lastKey = key;
  document.title = 'Restaurante PP — Menú digital (variante 2)';
}
window.addEventListener('hashchange', function () { route(); });

/* ---------- Modal ---------- */
var modal = $('#modal');
function openModal() { modal.hidden = false; $('#modal-close').focus(); }
function closeModal() { modal.hidden = true; $('#view').focus({ preventScroll: true }); }
$('#modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { if (!modal.hidden) closeModal(); else if (!$('#panel').hidden) togglePanel(false); }
});

/* ---------- Panel ---------- */
var CONTROLS = [
  ['style', 'Estilo de categoría', [['list', 'Lista'], ['img', 'Con imágenes'], ['banner', 'Banner']]],
  ['cols', 'Columnas', [[1, '1'], [2, '2'], [3, '3']]],
  ['nav', 'Navegación', [['v', 'Vertical'], ['h', 'Horizontal']]],
  ['shape', 'Forma de botón', [['sq', 'Cuadrado'], ['rd', 'Redondeado'], ['pill', 'Píldora']]],
  ['size', 'Tamaño de botón', [['S', 'S'], ['M', 'M'], ['L', 'L']]],
  ['anim', 'Animaciones', [[true, 'Activadas'], [false, 'Reducidas']]]
];
function renderPanel() {
  $('#panel-body').innerHTML = CONTROLS.map(function (c) {
    return '<p class="panel__l">' + c[1] + '</p><div class="seg" role="group" aria-label="' + c[1] + '">' + c[2].map(function (o) {
      return '<button type="button" data-k="' + c[0] + '" data-v="' + o[0] + '" aria-pressed="' + (S[c[0]] === o[0]) + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }).join('') + '<p class="panel__l">Sin imagen</p><button type="button" class="btn btn--outline" id="noimg">' + (S.noimg ? 'Mostrar fotos' : 'Quitar fotos') + '</button>';
}
function applyPrefs() {
  var r = { sq: '0px', rd: 'var(--r-2)', pill: 'var(--r-3)' }[S.shape];
  var z = { S: ['8px', '14px', '14px'], M: ['12px', '20px', '15px'], L: ['16px', '28px', '17px'] }[S.size];
  var st = document.documentElement.style;
  st.setProperty('--btn-r', r); st.setProperty('--btn-py', z[0]); st.setProperty('--btn-px', z[1]); st.setProperty('--btn-fs', z[2]);
  document.body.classList.toggle('no-anim', !S.anim);
}
function togglePanel(open) {
  var p = $('#panel'); p.hidden = !open; $('#gear').setAttribute('aria-expanded', String(open));
}
$('#gear').addEventListener('click', function () { togglePanel($('#panel').hidden); });
$('#panel').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  if (b.id === 'noimg') S.noimg = !S.noimg;
  else if (b.dataset.k) {
    var k = b.dataset.k, v = b.dataset.v;
    S[k] = (k === 'cols') ? +v : (k === 'anim') ? v === 'true' : v;
  } else return;
  save(); applyPrefs(); renderPanel();
  var y = window.scrollY;
  route(true); window.scrollTo(0, y);
});
$('#panel').addEventListener('click', function (e) { if (e.target.closest('.jump a')) togglePanel(false); });

applyPrefs(); renderPanel(); route();
})();
