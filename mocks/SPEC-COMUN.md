# Especificación común de los mocks (aplica a las 5 variantes)

Objetivo: probar 5 lenguajes visuales para el flujo público de MenuV2, sin tocar la app real.
Cada variante es un mock **estático** (sin build, sin backend, sin dependencias npm).

## Identidad visual del club (OBLIGATORIA, no negociable en ninguna variante)
Es un club social: la imagen debe ser **sobria, clara y de confianza**. Las variantes cambian la *forma* (radios, tipografía, uso de foto, densidad), **no la identidad**.

- **Modo claro siempre.** Fondos claros (crema/blanco). Prohibido el tema oscuro como base. Las zonas oscuras (barra superior, velos sobre foto) son acentos, no el fondo de la pantalla.
- **Paleta corporativa** (tomada de las páginas públicas actuales; si el club tiene manual de marca, estos tokens se sustituyen en un solo lugar):
  - `--brand-navy: #0B2D45` (principal: barra superior, titulares, botones primarios)
  - `--brand-gold: #C9A85C` (acento: filetes, divisores, detalles; nunca como color de texto sobre crema por contraste)
  - `--brand-cream: #F8F5EE` (fondo/superficie cálida)
  - `--brand-green: #0B3B2E` (secundario: insignias, estados positivos)
  - `--brand-blue: #003C6F` (degradados sobre foto)
  - Neutros: texto `#1F2933`, texto suave `#5B6670`, bordes `#E4DFD3`, blanco `#FFFFFF`.
  - Estados: Recomendado = dorado suave, Nuevo = azul suave, Agotado = gris/rojo apagado.
- Cada variante define sus tokens en `:root` **partiendo de esta paleta**; puede usar tonos derivados (más claros/oscuros) pero no colores nuevos de acento.
- Tono: serio, cálido, sin efectos llamativos. Animaciones discretas (≤ 300 ms, sin rebotes, sin parallax, sin rotaciones).
- **Tipografía serif = parte de la identidad (obligatoria en las 5).** La familia serif es **Cormorant Garamond** (la misma que usa la app real; fallback `Georgia, serif`), cargada por Google Fonts. Se usa en: nombre del restaurante/marca, títulos de pantalla, nombres de sede, de carta, de categoría y de producto, precios y subtítulos en cursiva. El texto de apoyo (descripciones, etiquetas, botones, controles del panel) puede ir en sans-serif (`Inter`/system) para legibilidad en móvil. Ninguna variante puede usar sans-serif en titulares. Como Cormorant es fina, usar pesos 500–700 y tamaños mínimos de 20 px en nombres de producto/categoría y 16 px en precios para mantener contraste.
- Logo: círculo con iniciales del restaurante (como hoy), en la barra superior.

## Escritorio y móvil (OBLIGATORIO)
Se diseñan **dos modos reales**, no un escritorio que se encoge:
- **Móvil (360–767 px):** una columna, barra superior compacta, objetivos táctiles ≥ 44 px, texto ≥ 15 px, sin scroll horizontal de página, imágenes con las mismas proporciones, navegación horizontal como chips deslizables con scroll-snap. Las columnas 2 y 3 del toggle colapsan a 1 (2 solo si la tarjeta cabe sin recortar texto).
- **Tableta (768–1023 px):** hasta 2 columnas.
- **Escritorio (≥ 1024 px):** contenedor centrado máx. 1240 px; 2 y 3 columnas reales; la navegación horizontal puede ser barra fija; hover y foco visibles.
- Breakpoints: 768 y 1024 px. Verificar a 390, 820 y 1366 px.
- Uso al aire libre/celular: contraste AA mínimo y texto de precio nunca menor a 16 px.

## Entregables (por variante)
Carpeta `mocks/variante-N/` con **solo** estos archivos (puedes añadir más si lo necesitas, pero estos tres son obligatorios):
- `index.html` — estructura y contenedores de pantalla.
- `styles.css` — tokens (variables CSS) + estilos + animaciones.
- `app.js` — datos de ejemplo, router por hash, render, toggles.
- `SPEC.md` de la variante ya existe: léelo, no lo modifiques.

Reglas de trabajo:
- Escribe **únicamente** dentro de `mocks/variante-N/`. No toques otras carpetas ni el código real.
- Imágenes: usa `../assets/foto-1.png … foto-8.*` (ruta relativa). Mira las imágenes para decidir cuál va con cada sede/categoría/plato. Reutilízalas; si falta una, usa el estado "sin imagen" (ver abajo).
- Sin frameworks ni CDN. HTML, CSS y JS puros; debe abrirse con doble clic (`file://`).
- Fuentes: solo las del sistema o Google Fonts por `<link>` (opcional; debe verse bien sin ellas).
- Español en toda la interfaz. Accesible: contraste AA, foco visible, `prefers-reduced-motion` respetado, botones reales (`<a>`/`<button>`).
- Responsive: ver la sección "Escritorio y móvil" (390, 820 y 1366 px).

## Flujo de pantallas (router por hash)
`#/` Restaurante → `#/sede/principal` Sede → `#/carta/1` Categorías → `#/categoria/3` Productos.
Cada pantalla enlaza a la siguiente y tiene botón "Volver". Transición animada entre pantallas.
Hay también un anuncio emergente (modal) al entrar a la Sede, con botón cerrar.

## Datos de ejemplo (idénticos en las 5 variantes, para poder comparar)
- Restaurante: **Restaurante PP**. Título "Nuestra Gastronomía", descripción "Seleccione una sede para conocer su carta".
- Sedes (3): **Sede Principal**, **Sede Norte**, **Sede San Fernando** (la última sin foto → estado vacío).
- Carta: **Carta Principal** con categorías: Entradas, Sopas y Cremas, Carnes y Parrilla, Pescados y Mariscos, Postres, Bebidas (una sin imagen, otra con subcategorías).
- 5–8 productos por categoría (nombres, descripciones, 1–3 precios con nombre, p. ej. "Individual $28.000 / Para compartir $52.000"). Incluir: uno **Recomendado**, uno **Nuevo**, uno **Agotado**, uno sin foto, uno con descripción muy larga, uno con nombre largo.
- Precios en formato COP: `$28.000`.

## Panel de configuración (toggle) — OBLIGATORIO
Un botón flotante pequeño (esquina inferior derecha, icono de engranaje) que abre un panel compacto. Simula lo que el administrador configura. Todo se aplica **en vivo**, sin recargar, y se recuerda en `localStorage` (con try/catch).

| Control | Valores | Qué cambia |
|---|---|---|
| Estilo de categoría | Lista · Con imágenes · Banner | Cómo se ven los productos en la pantalla de productos |
| Columnas | 1 · 2 · 3 | Rejilla de productos (en móvil siempre colapsa a 1 columna, salvo que la variante diga otra cosa) |
| Navegación | Vertical · Horizontal | **Vertical:** la pantalla de categorías es una lista de tarjetas y cada categoría abre su propia pantalla. **Horizontal:** las categorías son pestañas/chips deslizables arriba y los productos cambian en la misma pantalla sin recargar. |
| Forma de botón | Cuadrado · Redondeado · Píldora | Radio de los botones (no del resto de tarjetas: el sistema de radios de la variante manda) |
| Tamaño de botón | S · M · L | Padding y tamaño de fuente de los botones |
| Sin imagen | Mostrar / simular | Botón "Quitar fotos" que simula ausencia de imágenes para ver el estado por defecto |
| Animaciones | Activadas / reducidas | Apaga transiciones para comparar |

Además, el panel debe permitir **saltar directamente a cualquier pantalla** (4 enlaces), para revisar rápido.

## Estados por defecto (sin imagen)
- Local sin foto: icono de local sobre fondo suave de la paleta.
- Plato sin foto: icono de plato con cubiertos sobre fondo suave de la paleta.
Deben respetar el mismo radio y proporción que una foto real (no cambiar la altura de la tarjeta).

## Qué debe ser CONSISTENTE dentro de cada variante (esto es lo que se evalúa)
1. **Una sola escala de radios** (definida en el SPEC de la variante como tokens `--r-1/--r-2/--r-3`). Prohibido usar radios "sueltos".
2. **Proporciones de imagen definidas**: una proporción por tipo (sede, categoría, producto, banner). Las imágenes siempre `object-fit: cover`, con `object-position` explícito.
3. **Una sola escala de espaciado** (múltiplos de 4 u 8 px) y una sola sombra/borde por nivel.
4. **Una pareja tipográfica** (titulares + texto) con escala definida.
5. **Un solo estilo de botón** (más sus 2 variantes: primario y contorno).
6. Mismo encabezado/barra superior en todas las pantallas.
7. Una "firma" de animación (duración y easing) usada en todo.

## Criterio de calidad
- Que alguien pueda recorrer el flujo completo en 30 segundos y notar el mismo lenguaje en las 4 pantallas.
- Que cada combinación de toggles (3 estilos × 3 columnas × 2 navegaciones) se vea bien, sin textos cortados ni imágenes deformadas.
- Longitudes extremas (nombre largo, descripción larga, 3 precios) no rompen el diseño.

## Al terminar
Responde con: archivos creados, cómo abrirlo, decisiones de diseño relevantes (máx. 10 líneas) y cualquier limitación conocida. Verifica tú mismo que abre sin errores de consola (puedes usar Playwright desde `frontend/node_modules/@playwright/test` para capturar pantallas a 390 y 1366 px).
