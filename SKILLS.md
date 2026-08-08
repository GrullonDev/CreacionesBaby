# OpenCode Skills & Standards

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
  - **Diseño Componentizado y Modular**: Traduce los bloques visuales de Stitch directamente a componentes reutilizables en `src/components/` (ej. `ProductCard`, `QuickView`, `Header`), garantizando que sean independientes de la capa de datos.
  - **Consistencia de Layouts y Responsive**: Garantiza que las maquetas importadas o referenciadas desde Stitch mantengan la adaptación fluida (mobile-first) utilizando los breakpoints estándar de Tailwind CSS (`sm:`, `md:`, `lg:`, `xl:`).

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
  - **Migraciones**: cualquier cambio a `prisma/schema.prisma` requiere una migración correspondiente en `prisma/migrations/` antes de dar el cambio por terminado; si no hay acceso a una base de datos real para correr `prisma migrate dev` interactivamente, se escribe el SQL a mano siguiendo el estilo de las migraciones existentes y se deja documentado en AGENTS.md que falta aplicarla/verificarla contra Postgres real.
  - **Auth opcional cuando la ruta debe servir tanto a invitados como a usuarios logueados**: no uses `{ preHandler: [app.authenticate] }` (que responde 401 si no hay token) — llama `await request.jwtVerify()` dentro de un `try/catch` vacío al inicio del handler, y usa `request.user?.sub || null` para lo que sigue. Así la ruta nunca rechaza al invitado, pero sigue asociando el registro al usuario si mandó un token válido (ver `POST /orders`, guest checkout).

---

name: multi-app-frontend-consistency
description: Reglas para mantener `seller-portal/` (y cualquier futura app hermana) visual y arquitectónicamente alineada con el storefront (`src/`), aunque sean proyectos Vite independientes.
rules:
  - **Mismos tokens de diseño, sin compartir build**: cada app duplica su propio `tailwind.config` inline en `index.html` (colores, fuente Manrope, radios) en vez de depender de un paquete compartido — si cambias la paleta o tipografía en una app, replica el cambio en el `index.html` de la(s) otra(s) app(s) a mano.
  - **Mismos patrones de Context/hooks que el storefront**: `ToastContext`/`useToast` y el estilo de `useX` hooks para lógica de negocio (ver `react-clean-code-and-architecture` arriba) se replican tal cual en cada app nueva, no se reinventan.
  - **No fabricar persistencia falsa**: si una sección de la UI no tiene todavía soporte real en el backend (sin modelo, sin ruta), no la respaldes con `localStorage` como si fuera datos reales — usa un componente de tipo "Próximamente" (`ComingSoon.jsx` en `seller-portal/`) que sea honesto sobre el estado, en vez de aparentar que algo se guardó cuando no es así. Si una vista placeholder sí puede mostrar datos reales ya disponibles de otra fuente (ej. Inventario/Reportes derivados de `GET /products?mine=true`), hazlo — placeholder no significa "sin datos", significa "sin la funcionalidad completa todavía".
  - **Manejo de errores de API consistente**: los errores de Zod (`error.flatten()`) y errores planos (`{ error: 'mensaje' }`) que devuelve `backend/` se normalizan con un solo helper (`extractApiError` en `src/utils/apiError.js`) en vez de repetir la lógica de extracción en cada página/hook.