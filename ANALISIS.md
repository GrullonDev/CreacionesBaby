# Análisis de la Aplicación: Creaciones Baby

Análisis de la arquitectura y de las decisiones de diseño de **Creaciones Baby**, el sistema
interno de administración: control de inventario, registro de ventas y reportes.

> **Nota histórica.** Buena parte de este documento describe la etapa en que el proyecto era
> una tienda en línea con panel de administración. Esa tienda **se eliminó**: la venta al
> público ocurre en una plataforma externa y aquí solo queda el back office (`admin/` +
> `backend/`). Se conserva el análisis porque explica *por qué* la arquitectura es como es —
> la capa de hooks, los contextos, la separación contenedor/presentación — y todo eso sigue
> vigente en la aplicación actual. Las secciones que hablan de carrito, checkout o catálogo
> público son historia, no estado actual.

---

## 🚀 Arquitectura y Tecnologías Principales

La aplicación está diseñada bajo principios modernos de desarrollo frontend, optimizada para ofrecer un alto rendimiento y un mantenimiento sencillo:

- **React 19 + Vite 8**: Uso de las últimas versiones del ecosistema React para compilaciones rápidas, Hot Module Replacement (HMR) y procesamiento eficiente en producción.
- **Tailwind CSS v4 (CDN)**: Diseño responsive basado en clases utilitarias que garantizan coherencia visual y facilidad de desarrollo para interfaces modernas.
- **react-router-dom v7**: Sistema de enrutamiento robusto para una navegación fluida tipo SPA (Single Page Application).
- **Google Stitch (MCP)**: Sincronización ágil del sistema de diseño (tokens de diseño, colores, fuentes e iconografía) directamente hacia el código del proyecto.

---

## 🔄 Últimas Mejoras y Refactorización

Recientemente se ha llevado a cabo una profunda reestructuración del código enfocada en **rendimiento** y **mantenimiento a largo plazo (Clean Code)**:

### 1. Carga Diferida e Incremento de Rendimiento (Lazy Loading)
Se ha implementado división de código (*code splitting*) a nivel de rutas en el archivo [App.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/App.jsx):
- Las páginas pesadas se cargan bajo demanda utilizando `React.lazy()` y `Suspense`.
- Se introdujo un componente visual de transición (`RouteFallback`) para mantener informados a los usuarios durante la carga dinámica de rutas secundarias.

### 2. Separación de Responsabilidades mediante Hooks Personalizados
Se ha eliminado la lógica de negocio y gestión de estados de los componentes visuales (JSX), delegándola a un ecosistema de **Custom Hooks** en la carpeta `src/hooks/`. Esto mejora sustancialmente la legibilidad de la interfaz, facilita la escritura de pruebas unitarias y simplifica el mantenimiento:

| Hook Personalizado | Componente/Página Destino | Responsabilidad Principal |
| :--- | :--- | :--- |
| `useHeaderLogic.js` | [Header.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/components/Header.jsx) | Control del menú móvil, estado del scroll superior, barra de búsqueda y sincronización con carritos y listas de deseos. |
| `useQuickView.js` | [QuickView.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/components/QuickView.jsx) | Lógica de selección de variantes (colores, tallas) y cantidad de compra en el modal de previsualización rápida. |
| `useProductHelpers.js` | [ProductCard.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/components/ProductCard.jsx) | Lógica de hover, validaciones de stock y redirección de navegación de productos individuales. |
| `useProductFilters.js` | [Products.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/pages/Products.jsx) | Gestión de filtros por categoría, marca, precio, ordenamiento de productos y paginación en el catálogo. |
| `useProductDetail.js` | [ProductDetail.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/pages/ProductDetail.jsx) | Consulta de producto por ID, control de carrusel de imágenes, variantes activas, cantidad seleccionada y carga de productos relacionados. |
| `useCartLogic.js` | [Cart.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/pages/Cart.jsx) | Acciones del carrito de compras, cálculo de subtotales, impuestos, descuentos y envío. |
| `useCheckoutLogic.js` | [Checkout.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/pages/Checkout.jsx) | Formulario de envío y facturación, selección de métodos de pago, validación de cupones y generación de órdenes de compra. |
| `useHomeLogic.js` | [Home.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/pages/Home.jsx) | Lógica del slider promocional principal, filtrado de productos destacados/ofertas y control del Popup de Newsletter. |
| `useStreamingLogic.js` | [Streaming.jsx](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/src/pages/Streaming.jsx) | Control y suscripción a planes digitales, filtrado de planes por período y pasarela preliminar de suscripción. |
| `useSales.js` | `pages/admin/AdminSales.jsx` | Listado unificado de ventas (tienda en línea + registradas a mano), filtros por período/canal/estado/búsqueda con *debounce*, paginación y cambio de estado. Los totales los calcula el servidor sobre todo el conjunto filtrado, no sobre la página visible. |
| `useSaleForm.js` | `pages/admin/AdminSaleForm.jsx` | Estado, validación y envío del formulario de registro de ventas: líneas de producto, precio negociado, verificación de stock por producto (sumando todas las líneas), totales y margen en vivo. Recibe `listPath` para poder montarse bajo distintas rutas base. |
| `useFinanceEntries.js` | `pages/admin/AdminFinance.jsx` | Libro de caja: ingresos que no son ventas y egresos. Filtros, totales y validación de que la categoría corresponda al tipo de movimiento. |
| `useReportSummary.js` + `usePeriod` | `pages/admin/AdminReports.jsx` | Consulta de `GET /reports/summary` (una sola petición con todas las cifras) y estado compartido del período seleccionado. |

---

## 📁 Estructura del Proyecto

```
creaciones_baby/
├── .agents/            # Configuración local de estándares y agentes
├── public/             # Recursos públicos estáticos
├── src/
│   ├── assets/         # Imágenes estáticas globales (héroes, logos)
│   ├── components/     # Componentes UI puros y presentacionales (Footer, Header, ProductCard, QuickView, etc.)
│   │   └── admin/      # Piezas del back office (StatCard, Badge, Modal, LineItemsEditor, MagnitudeBars)
│   ├── context/        # Estado global persistente (CartContext, WishlistContext, AdminAuthContext)
│   ├── data/           # Catálogo y base de datos simulada (products.js)
│   ├── hooks/          # Nueva capa de lógica de negocio y custom hooks (useCartLogic, useProductFilters, etc.)
│   ├── pages/          # Vistas principales optimizadas con lazy loading (Home, Products, Checkout, etc.)
│   │   └── admin/      # Área /admin: ventas, finanzas y reportes (requiere rol SELLER o ADMIN)
│   ├── App.jsx         # Enrutador central: dos grupos de layout (tienda con chrome / admin sin chrome)
│   ├── index.css       # Estilos globales y tokens de Tailwind CSS v4
│   └── main.jsx        # Punto de entrada de la aplicación
├── AGENTS.md           # Estándares de desarrollo locales
├── ANALISIS.md         # Este documento (Análisis detallado de arquitectura)
└── SKILLS.md           # Habilidades y reglas de Clean Code de React
```

---

## 🛠️ Buenas Prácticas y Calidad Establecidas

La aplicación se rige por normas estrictas documentadas en los archivos [AGENTS.md](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/AGENTS.md) y [SKILLS.md](file:///c:/Users/jgrullon/Documents/MISARCHIVOS/AppsFlutter/creaciones_baby/SKILLS.md):
- **Principio de Responsabilidad Única (SRP)**: Los componentes de UI son ligeros y solo manejan presentación; la lógica reside enteramente en custom hooks.
- **Persistencia Aislada**: El estado global (carrito, favoritos) se centraliza en Context Providers y se sincroniza automáticamente con el `localStorage`.
- **Modo Oscuro Integrado**: Los componentes aplican dinámicamente el prefijo `dark:` de Tailwind para soportar temas visuales alternativos.
- **Análisis Estático**: Uso de `npx oxlint` antes de los commits para garantizar código limpio de advertencias o ineficiencias de sintaxis.

---

## 💰 Módulo de ventas, inventario y finanzas

La incorporación más grande desde la refactorización: el sistema ya no solo vende en línea, también **registra todo lo que se vende fuera de la tienda** (WhatsApp, presencial, ferias), lo que se gasta, y deja rastro de cada movimiento de inventario.

### Decisiones de arquitectura

- **Una sola tabla de ventas.** Una venta hecha a mano y un pedido web son el mismo registro (`Order`) diferenciado por un campo `channel`. Se descartó un modelo `Sale` aparte: "todas mis ventas" tiene que resolverse con una consulta, o cada reporte termina siendo la unión de dos fuentes que se desincronizan.
- **Fecha de negocio separada de la fecha del registro.** `soldAt` es la fecha en que ocurrió la venta y es editable hacia atrás; `createdAt` es cuándo se capturó. Los reportes agrupan por `soldAt`, así que registrar hoy la feria del sábado no distorsiona el período.
- **El costo se congela en la línea de venta.** `OrderItem.cost` guarda el costo unitario del momento; si mañana sube el costo del producto, el margen histórico no cambia retroactivamente.
- **El inventario es auditable, no un número suelto.** Cada cambio de `Product.stock` — venta, entrada de producción, merma, ajuste por conteo físico, devolución, incluso editar el campo en la ficha del producto — escribe una fila en `StockMovement` con el delta firmado y el stock resultante, dentro de la misma transacción.
- **Los cálculos viven en el servidor.** `GET /reports/summary` devuelve ya calculados ingresos, costo de lo vendido, margen, egresos por categoría, resultado neto, valor de inventario y series por día y por canal. El navegador nunca descarga el historial completo para sumarlo.
- **La regla de visibilidad está en un solo lugar.** `backend/src/lib/sales.js` define qué ventas puede ver cada usuario (un vendedor ve las ventas que contienen sus propios productos; ADMIN ve todo). Duplicar esa regla en cada ruta es cómo se filtran los ingresos de un vendedor a otro.
- **Honestidad en las cifras.** El costo por producto es opcional, así que un producto sin costo aporta 0 al costo de lo vendido e infla el margen. La API reporta cuántos productos están en esa situación y toda pantalla que muestre un margen lo advierte, en lugar de presentar un número inflado como si fuera exacto.

### Una sola aplicación, adaptable

Durante un tiempo hubo dos superficies para este módulo: el panel de escritorio y una versión
para teléfono dentro de la tienda. Al eliminar la tienda se unificaron en `admin/`, que ahora
es responsive: la lista de ventas se dibuja como tabla en pantallas anchas y como tarjetas por
debajo de `md`, y el total del formulario de venta se queda fijo al pie en el teléfono. Eso
eliminó la duplicación que existía entre ambas apps — hoy hay **una sola copia** de cada hook,
util y componente.

### Un solo operador

El sistema nació con un modelo de marketplace: cada vendedor veía únicamente las ventas que
contenían sus propios productos. Con un solo operador eso era complejidad pura, así que se
eliminó por completo — no hay filtros por dueño en ninguna ruta. Las columnas `sellerId` y
`userId` siguen escribiéndose por trazabilidad, pero nada consulta por ellas; si algún día hay
una segunda persona, la regla vuelve a un helper compartido en `backend/src/lib/`, no repartida
por las rutas. A cambio, **nada es público**: toda ruta salvo `/health` y `/auth/*` exige token.

### Pruebas

El backend pasa de "verificación manual" a una suite versionada: `cd backend && npm test` levanta los manejadores de ruta reales sobre un Prisma falso en memoria (`test/helpers/fakePrisma.js`) mediante `inject` de Fastify. 34 pruebas cubren precisamente donde un error cuesta dinero: totales con precio negociado, sobreventa (incluida la que se reparte en dos líneas del mismo producto), descuento y devolución de stock, validación de categorías del libro de caja, la aritmética de margen y costo de lo vendido, y que ninguna ruta del catálogo responda sin token. No requiere PostgreSQL.
