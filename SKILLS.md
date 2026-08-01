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