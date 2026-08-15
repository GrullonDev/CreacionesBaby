# OpenCode Skills & Standards

Las **reglas** del proyecto: un back office interno (`admin/` + `backend/`) para control de
inventario, registro de ventas y reportes. No hay tienda: la venta al público ocurre en una
plataforma externa. Para el mapa de la arquitectura, cómo levantarlo, las invariantes de
negocio y las trampas del entorno, empieza por [CLAUDE.md](CLAUDE.md); para el detalle de
rutas y esquema, [AGENTS.md](AGENTS.md).

---

name: react-clean-code-and-architecture
description: Directrices y buenas prácticas para escribir código limpio, modular y mantenible en React 19 y JS.
rules:
  - **Single Responsibility Principle (SRP)**: Cada componente debe tener una única responsabilidad. Si un componente supera las 150 líneas o maneja lógica de negocio compleja junto con la UI, extrae la lógica a hooks personalizados (`src/hooks/`) o subcomponentes en `src/components/`.
  - **Componentes Funcionales y Declarativos**: Usa componentes funcionales con sintaxis moderna de ES6+. Prioriza la legibilidad y el enfoque declarativo sobre el imperativo.
  - **Custom Hooks**: Extrae cualquier lógica de estado persistente, llamadas a APIs o sincronización de `localStorage` a custom hooks (ej. `useCart`, `useWishlist`, `useDarkMode`).
  - **Prop Validation & Defaults**: Define valores por defecto claros para las props y mantén las firmas de componentes estructuradas y descriptivas.
  - **Evitar Props Drilling**: Para estados compartidos globalmente (carrito, wishlist, tema), utiliza React Context (`src/context/`) de forma limpia y controlada.

---

name: design-patterns-and-structure
description: Patrones de diseño aplicados al desarrollo frontend de la aplicación Creaciones Baby.
rules:
  - **Compound Component Pattern**: Para componentes UI complejos y reutilizables como Modales (`QuickView`), Carruseles (`ImageCarousel`) o Dropdowns, utiliza composición limpia para mantener la flexibilidad.
  - **Container/Presenter Pattern**: Separa las vistas de las páginas (`src/pages/`) en componentes contenedores (manejo de rutas, contexto y datos) y componentes de presentación (`src/components/`) puramente visuales y basados en props.
  - **Manejo de Estado Centralizado y Persistencia**: Toda la persistencia local (`localStorage`) debe estar encapsulada dentro de sus respectivos proveedores de contexto (`CartContext`, `WishlistContext`), asegurando sincronización limpia sin efectos secundarios dispersos en la UI.
  - **Estructura de Carpetas Consistente**:
    - `src/components/`: Componentes UI reutilizables y atómicos.
    - `src/context/`: Contextos globales de la aplicación.
    - `src/data/`: Mock data estático o esquemas de datos.
    - `src/pages/`: Vistas asociadas a las rutas de `react-router-dom`.

---

name: styling-and-ui-guidelines
description: Estándares para el diseño visual, Tailwind CSS v4 y experiencia de usuario.
rules:
  - **Tailwind CSS Utility-First**: Utiliza clases utilitarias de Tailwind v4 evitando CSS nativo inline innecesario.
  - **Consistencia en Modo Oscuro (Dark Mode)**: Garantiza que todos los nuevos componentes incluyan soporte dinámico para modo oscuro mediante las clases `dark:` correspondientes.
  - **Diseño Responsive First**: Construye con un enfoque mobile-first utilizando los breakpoints de Tailwind (`sm:`, `md:`, `lg:`, `xl:`).
  - **Accesibilidad (a11y)**:
    - Asegura que los elementos interactivos (`button`, `a`, `input`) tengan atributos `aria-label` o texto accesible implícito.
    - Maneja la navegación por teclado y el foco visual en elementos modales (como `QuickView`).

---

name: performance-and-code-quality
description: Optimización de rendimiento, estándares de calidad y revisión con Oxlint.
rules:
  - **Optimización de React 19**: Utiliza memoización explícita (`useMemo`, `useCallback`, `React.memo`) únicamente cuando existan re-renderizados costosos demostrados.
  - **Carga Diferida (Lazy Loading)**: Para rutas secundarias o imágenes pesadas (como galerías de productos), aplica `React.lazy`, `Suspense` o `loading="lazy"`.
  - **Análisis Estático con Oxlint**: Todo el código propuesto o generado debe pasar las validaciones de `npx oxlint` sin advertencias de código muerto, imports no utilizados o malas prácticas sintácticas.
  - **Manejo de Errores y Casos Límite**: Valida siempre estados vacíos (*empty states*), estados de carga (*loading states*) y datos nulos/undefined (ej. en búsquedas o filtrado de `products.js`).

---

---

name: stitch-ui-design-integration
description: Reglas y buenas prácticas para la integración de diseño UI/UX sincronizado mediante Google Stitch (MCP).
rules:
  - **Uso de Tokens de Diseño de Stitch**: Al implementar o modificar componentes, utiliza exclusivamente los colores, tipografías (Manrope) y espaciados definidos en el sistema de diseño de Stitch resguardado en Tailwind CSS v4.
  - **Fidelidad Visual y Glassmorphism**: Respeta la estética premium de Creaciones Baby manteniendo efectos de translucidez (*glassmorphism*), bordes suaves y micro-animaciones alineadas a las maquetas de Stitch.
  - **Sincronización MCP (Model Context Protocol)**: Antes de crear nuevos componentes UI desde cero, verifica la estructura y parámetros exportados por Stitch para reutilizar la sintaxis de clases y marcado JSX sugerido.
  - **Diseño Componentizado y Modular**: Traduce los bloques visuales de Stitch a los componentes reutilizables que ya existen en `admin/src/components/` (`Layout`, `StatCard`, `Badge`, `Modal`, `ProductRow`, `ComingSoon`…), garantizando que sean independientes de la capa de datos, en vez de crear una estructura paralela.
  - **Consistencia de Layouts y Responsive**: Garantiza que las maquetas importadas o referenciadas desde Stitch mantengan la adaptación fluida (mobile-first) utilizando los breakpoints estándar de Tailwind CSS (`sm:`, `md:`, `lg:`, `xl:`).
  - **Conexión MCP**: la conexión a Stitch vive en `admin/.mcp.json`, que está en `.gitignore` porque contiene la API key real. El archivo versionado es `admin/.mcp.json.example` con `${STITCH_API_KEY}` como placeholder — nunca pongas la key real en el `.example` ni en ningún archivo que sí se vaya a commitear.
  - **No es alcanzable desde una sesión de chat**: es un MCP con alcance de proyecto para Claude Code; solo se conecta corriéndolo con `admin/` como directorio de trabajo. Desde chat, trabaja a mano contra los tokens que ya declara `admin/index.html`, a menos que una maqueta de Stitch indique explícitamente un rediseño de esos tokens.

---

name: backend-api-design-and-security
description: Convenciones establecidas en `backend/` (Fastify + Prisma + Zod) para mantener consistencia al agregar o modificar rutas de la API.
rules:
  - **Un archivo de ruta por recurso**: cada recurso vive en `backend/src/routes/<recurso>.js`, exporta un `default async function xRoutes(app)` que desestructura `const { prisma } = app`, y se registra una sola vez en `backend/src/app.js`.
  - **Validación con Zod en el borde**: todo `request.body` se valida con un schema Zod local al archivo (`safeParse`, nunca `parse`), devolviendo `reply.code(400).send({ error: parsed.error.flatten() })` en caso de fallo — nunca confíes en datos del cliente sin validar primero.
  - **Nunca confíes en valores calculados del cliente**: precios, totales y stock siempre se recalculan/verifican server-side contra la base de datos (ver `POST /orders`, que ignora cualquier `price` que mande el cliente y solo acepta `productId`/`quantity`).
  - **Autenticación y autorización vía decorators**: rutas protegidas usan `{ preHandler: [app.authenticate] }` (definido en `plugins/auth.js`); rutas con rol fijo agregan `app.requireRole('SELLER', 'ADMIN')`. Para recursos con dueño (productos, pedidos), compara `existing.sellerId`/`existing.userId` contra `request.user.sub`, permitiendo `request.user.role === 'ADMIN'` como bypass — responde `403` si no aplica, `404` si el recurso no existe (verifica existencia antes que permisos).
  - **Serialización explícita**: cada recurso tiene una función `toStorefrontX`/`toPublicX` que transforma el modelo de Prisma a la forma que el frontend ya consume (convierte `Decimal` a `Number`, aplana relaciones como `images`), en vez de devolver el objeto de Prisma crudo.
  - **Transacciones para escrituras multi-tabla**: cuando una operación toca más de una tabla con invariantes entre ellas (crear `Order` + `OrderItem` + descontar `Product.stock`), usa `prisma.$transaction(async (tx) => { ... })` y opera sobre `tx`, no sobre `prisma`, dentro del callback.
  - **Migraciones**: cualquier cambio a `prisma/schema.prisma` requiere una migración correspondiente en `prisma/migrations/` antes de dar el cambio por terminado; si no hay acceso a una base de datos real para correr `prisma migrate dev` interactivamente, se escribe el SQL a mano siguiendo el estilo de las migraciones existentes (ver `20260813120000_sales_inventory_finance/migration.sql`, escrita así) y se deja documentado en AGENTS.md que falta aplicarla contra el Postgres local. **Verifícala igual antes de darla por buena**: levanta un PostgreSQL desechable, aplica *todas* las migraciones en orden con `psql -v ON_ERROR_STOP=1 -f`, y compara el resultado contra el schema consultando `information_schema` (columnas, nulabilidad, enums, índices y foreign keys). Una migración escrita a mano y no ejecutada nunca no es una migración, es una hipótesis.
  - **Migraciones que amplían, no que rompen**: al volver opcional una columna existente (`DROP NOT NULL`) o agregar una con default, rellena los datos históricos en la misma migración si el nuevo campo participa en reportes — ej. `UPDATE "Order" SET "soldAt" = "createdAt"` evitó que todos los pedidos previos cayeran en la fecha de la migración.
  - **Un solo lugar para las reglas de visibilidad**: cuando varias rutas comparten la respuesta a "¿qué registros puede ver este usuario?", esa condición vive en un helper compartido (`backend/src/lib/sales.js` → `saleScopeWhere`) y todas la importan. Tres copias de esa regla es exactamente cómo se filtran los ingresos de un vendedor a otro.
  - **Nada es público**: toda ruta salvo `GET /health` y `POST /auth/*` lleva `{ preHandler: [app.authenticate] }`. Si agregas una ruta, agrégale el guard — hay una prueba que verifica que el catálogo responde 401 sin token, y debe seguir pasando. Este sistema no tiene superficie pública y no debería volver a tenerla sin una decisión explícita.
  - **Un solo operador, sin scoping**: quien esté autenticado ve todo. No reintroduzcas filtros por dueño (`sellerId`, `userId`) "por si acaso": esas columnas existen y se siguen escribiendo para auditoría, pero nada filtra por ellas. Si algún día hay una segunda persona, la regla vuelve a un helper compartido en `backend/src/lib/`, no repartida por las rutas.
  - **Auth opcional cuando la ruta debe servir tanto a invitados como a usuarios logueados**: no uses `{ preHandler: [app.authenticate] }` (que responde 401 si no hay token) — llama `await request.jwtVerify()` dentro de un `try/catch` vacío al inicio del handler, y usa `request.user?.sub || null` para lo que sigue. Así la ruta nunca rechaza al invitado, pero sigue asociando el registro al usuario si mandó un token válido (ver `POST /orders`, guest checkout).

---

name: frontend-api-consistency
description: Reglas de consistencia entre la aplicación (`admin/`) y la API (`backend/`), y lo que aplicaría si alguna vez vuelve a haber una segunda app.
rules:
  - **Los tokens de diseño viven en `admin/index.html`**: el `tailwind.config` inline (colores, Manrope, radios) es la única fuente. No hay `tailwind.config.js` ni build de Tailwind — es el script CDN.
  - **Un hook por página**: `ToastContext`/`useToast` y el estilo de hooks `useX` para la lógica de negocio (ver `react-clean-code-and-architecture` arriba) son el patrón; las páginas quedan presentacionales.
  - **No fabricar persistencia falsa**: si una sección de la UI no tiene todavía soporte real en el backend (sin modelo, sin ruta), no la respaldes con `localStorage` como si fuera datos reales — usa un componente de tipo "Próximamente" (`ComingSoon.jsx`) que sea honesto sobre el estado, en vez de aparentar que algo se guardó cuando no es así. Si una vista placeholder sí puede mostrar datos reales ya disponibles de otra fuente, hazlo — placeholder no significa "sin datos", significa "sin la funcionalidad completa todavía".
  - **Manejo de errores de API consistente**: los errores de Zod (`error.flatten()`) y errores planos (`{ error: 'mensaje' }`) que devuelve `backend/` se normalizan con un solo helper (`extractApiError` en `src/utils/apiError.js`) en vez de repetir la lógica de extracción en cada página/hook.
  - **Una sola app de frontend**: la duplicación que existía entre la tienda y el panel desapareció con la tienda. Hay una única copia de cada hook, util y componente, en `admin/`. Si alguna vez vuelve a haber una segunda app, la respuesta es un workspace compartido, no copiar archivos.
  - **Un hook que navega no hardcodea rutas**: la ruta destino entra por parámetro (`useSaleForm(id, { listPath })`), no como literal, para que el mismo hook pueda montarse bajo otra ruta base sin editarlo.

---

name: sales-inventory-and-money-integrity
description: Invariantes del módulo de ventas, inventario y finanzas. Estas reglas protegen datos de dinero y de stock — romperlas no produce un bug visible, produce números equivocados en los que alguien confía.
rules:
  - **Una sola tabla de ventas**: una venta hecha a mano y una de la plataforma externa son el mismo registro (`Order`), diferenciados por `channel` (WEB / WHATSAPP / PRESENCIAL / FERIA / REDES / OTRO — donde **WEB significa la plataforma externa**, este sistema no tiene tienda propia). **Nunca agregues un modelo `Sale` paralelo**: "todas mis ventas" tiene que resolverse con una consulta, o cada reporte termina siendo la unión de dos fuentes que se desincronizan y nadie sabe cuál es la verdadera.
  - **Fecha de negocio ≠ fecha del registro**: `soldAt` es cuándo ocurrió la venta (editable hacia atrás, rechazada si es futura); `createdAt` es cuándo se capturó. **Todos los reportes agrupan por `soldAt`.** Lo mismo para `FinanceEntry.occurredAt`. Si agregas un concepto nuevo con fecha, decide explícitamente cuál de las dos es y documéntalo.
  - **Fechas de negocio en hora local, sin pasar por UTC**: `utils/dates.js` construye `YYYY-MM-DD` a mano desde `getFullYear/getMonth/getDate`, nunca con `toISOString()`. Una venta capturada a las 8pm en Guatemala (UTC-6) se archivaría mañana. En el backend, un `to=YYYY-MM-DD` desnudo se empuja al final de ese día (`23:59:59.999`) para que un rango de un solo día incluya las ventas de la tarde.
  - **Congela el costo en la línea, no lo leas del producto**: `OrderItem.cost` guarda el costo unitario del momento de la venta. Si mañana sube el costo del producto, el margen histórico no debe cambiar retroactivamente. Cualquier cálculo de margen usa el costo de la línea, nunca `product.cost` actual.
  - **Suma por producto antes de validar stock**: dos líneas del mismo producto (distinto color o talla) no deben pasar cada una una validación por línea y en conjunto sobrevender. Construye un `Map` producto→cantidad total y valida contra eso, tanto en el chequeo como en el descuento. Esto era un bug real en `POST /orders`; hay una prueba que lo cubre y debe seguir pasando.
  - **Stock y su rastro se mueven juntos**: todo cambio a `Product.stock` escribe una fila en `StockMovement` (delta firmado + `stockAfter`) dentro de la **misma** `prisma.$transaction`. Sin excepciones: la venta, la entrada de producción, la merma, el ajuste por conteo, la devolución, y también editar el campo `stock` en la ficha del producto. Si el historial tiene huecos, deja de ser auditoría y pasa a ser decoración.
  - **`VENTA` solo lo escriben las rutas de venta**: `POST /stock-movements` acepta únicamente los tipos manuales (ENTRADA / SALIDA / AJUSTE / MERMA / DEVOLUCION). Así un movimiento y su venta nunca pueden contradecirse.
  - **El inventario es el producto del sistema, no un detalle**: control de inventario, registro de ventas y reportes son las tres razones por las que esto existe. Si una decisión de diseño mejora una de las tres a costa de las otras, dilo explícitamente en el comentario; si empeora la trazabilidad del stock, no la tomes.
  - **`AJUSTE` recibe el conteo absoluto, guarda el delta**: quien cuenta físicamente reporta "hay 7", no "quita 3". La ruta calcula `newStock - stock`. Un ajuste que no cambia nada es un `400`, no un no-op silencioso que llena el historial de ruido.
  - **El stock nunca queda negativo**: `409` antes de escribir cualquier cosa. Nada de "ya lo corregimos después".
  - **Las ventas se cancelan, no se borran**: no existe `DELETE /sales/:id`, a propósito. Cancelar devuelve el stock y escribe movimientos `DEVOLUCION`; reactivar lo vuelve a descontar y falla con `409` si ya no está disponible. Cancelar dos veces es idempotente. Cancelar es una acción destructiva desde el punto de vista de los reportes: **pide confirmación en la UI** y explica qué pasa (el stock regresa, deja de contar, no se borra).
  - **El envío cobrado no es margen**: ganancia bruta = `total − envío − costo de lo vendido`. El envío que paga el cliente es un pase de caja, no utilidad.
  - **El monto siempre es positivo; el signo lo lleva la dirección**: en `FinanceEntry`, `amount > 0` y `direction` (INGRESO/EGRESO) determina el sentido. Nunca guardes egresos como negativos — duplica la lógica de signos en cada consulta.
  - **Una categoría pertenece a una sola dirección, y el backend lo valida**: un EGRESO etiquetado `APORTE_CAPITAL` corrompe en silencio todo reporte agrupado por categoría. Al validar un `PUT` parcial, valida la entidad **fusionada**, no solo el patch: cambiar solo `category` sigue teniendo que ser coherente con la `direction` almacenada.
  - **Los ingresos por venta no van al libro de caja**: `FinanceEntry` es para dinero que **no** viene de vender producto (aportes, préstamos, reembolsos, y todos los egresos). Meter las ventas ahí obliga a mantener dos registros del mismo hecho en sincronía. Los reportes unen las dos fuentes al final.
  - **Un dato faltante se advierte, no se rellena**: `Product.cost` es opcional, así que un producto sin costo aporta 0 al costo de lo vendido e infla la ganancia y el margen. La API devuelve `inventory.withoutCost` y **toda pantalla que muestre un margen debe advertirlo cuando sea distinto de cero**. Nunca uses el precio como costo por defecto para que el número se vea prolijo: un número inflado presentado como exacto es peor que un número con asterisco.
  - **Los cálculos pesados viven en el servidor**: `GET /reports/summary` devuelve ya calculados ingresos, COGS, margen, egresos por categoría, resultado neto, valor de inventario, top de productos y series por día y canal. El navegador nunca descarga el historial completo de ventas para sumarlo. Los totales de una lista paginada se calculan sobre **todo** el conjunto filtrado, no sobre la página visible — si cambian al pasar de página, están mal.
  - **En una venta mixta, cada vendedor solo cuenta sus líneas**: si una venta contiene productos de dos vendedores, los reportes de cada uno consideran únicamente las líneas de sus propios productos, no el total de la venta.
  - **Todo lo que toque dinero o stock lleva prueba** en `backend/test/`. La suite inyecta un Prisma falso en memoria en los manejadores **reales** vía `inject` de Fastify, así que auth, permisos, validación Zod y la aritmética corren de verdad y no hace falta PostgreSQL. Si una ruta empieza a usar una forma de consulta que el falso no soporta, la prueba falla ruidosamente ahí — eso es intencional, no lo silencies: agrégale soporte.

---

name: data-visualization-and-metrics-ui
description: Reglas para gráficas, medidores y tarjetas de métricas, para que los números se lean igual en toda la aplicación y en ambos modos de color.
rules:
  - **Los colores de gráfica son tokens, no literales**: viven como custom properties en `index.css` de cada app (`--viz-income`, `--viz-expense`, `--viz-neutral`, `--viz-track`) y se consumen con `style={{ backgroundColor: 'var(--viz-income)' }}`. No hardcodees hex en componentes: el modo oscuro dejaría de funcionar y no habría un solo lugar donde corregir la paleta.
  - **Claro y oscuro son pasos elegidos, no un volteo automático**: cada par se valida contra la superficie sobre la que realmente se dibuja (tarjeta blanca en claro, `slate-900` en oscuro) por banda de luminosidad, croma, contraste ≥ 3:1 y separación para daltonismo. Los números de la validación están anotados en el comentario sobre los tokens — si cambias un color, vuelve a validar y actualiza el comentario.
  - **Verde entra, rojo sale**: ingresos y egresos usan la misma semántica de color que el resto de la app. No reutilices esos dos colores para "serie 3" y "serie 4".
  - **Un solo eje, siempre**: dos medidas de escalas distintas nunca comparten gráfica con dos escalas verticales. Si son incomparables, son dos gráficas. Ingresos y egresos sí comparten eje porque ambos son quetzales.
  - **El color nunca es la única señal**: con dos o más series hay leyenda **y** valores legibles (tooltip al pasar/enfocar, o etiqueta directa). Las tablas de Ventas y Finanzas son la vista textual de los mismos datos y cumplen ese rol.
  - **Magnitud = un solo tono**: los medidores horizontales (ventas por canal, egresos por categoría, top de productos) usan un tono único y se ordenan por valor, con el número escrito al lado. La longitud de la barra es ayuda de comparación, no la única forma de leer el dato.
  - **Cuando no hay datos, dilo**: nada de una gráfica vacía o de ejes sin contenido. Estado vacío explícito, y si aplica, un enlace a la acción que lo llenaría ("Registrar un gasto").
  - **No dibujes más columnas de las que se pueden leer**: la serie diaria rellena los días sin actividad (para que el eje de tiempo no engañe) pero agrupa por mes cuando el rango pasa de ~45 puntos, y etiqueta solo una de cada N columnas. Cuando una vista recorta o agrupa datos, que se vea en la pantalla.
  - **Las métricas de un período se calculan sobre el período**: toda pantalla con filtro de fechas indica el rango que está mostrando (`describeRange`), y las cifras que **no** dependen del período (valor de inventario actual) se rotulan como tales para que nadie las lea como del mes.
  - **Un `StatCard` no es una gráfica**: para un número solo, una tarjeta con su etiqueta y una pista de contexto. No le pongas gráfica a un dato de un solo valor.

