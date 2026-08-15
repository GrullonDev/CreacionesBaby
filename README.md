# Creaciones Baby — Sistema de Administración

Back office interno para **Creaciones Baby**, un negocio guatemalteco de ropa y artículos
para bebé. Controla el **inventario**, lleva el **registro de todas las ventas** y produce
los **reportes** del negocio.

La venta al público ocurre en una plataforma externa. Este sistema **no es una tienda**: no
tiene carrito, ni checkout, ni nada de cara al cliente. Las ventas hechas en esa plataforma
se registran aquí como un canal más, igual que las de WhatsApp, las presenciales o las de
feria.

Precios en **GTQ**. Interfaz en **español**.

---

## Contenido

- [Qué hace](#qué-hace)
- [Las dos partes](#las-dos-partes)
- [Documentación](#documentación)
- [Puesta en marcha](#puesta-en-marcha)
- [Rutas](#rutas)
- [Modelo de datos](#modelo-de-datos)
- [API](#api)
- [Calidad y pruebas](#calidad-y-pruebas)
- [Estado del proyecto](#estado-del-proyecto)
- [Licencia](#licencia)

---

## Qué hace

**Control de inventario.** Catálogo interno de productos con precio y costo por unidad,
existencias al día, y un historial auditable de **cada** movimiento: entradas de producción,
salidas, mermas, ajustes por conteo físico, devoluciones y las bajas por venta. Ningún cambio
de stock ocurre sin quedar registrado.

**Registro y seguimiento de ventas.** Todas las ventas en una sola lista, sin importar de
dónde vengan. Se registran con fecha real (se puede capturar hoy una venta de la semana
pasada), precio negociable, cliente opcional, descuento y envío. Cambian de estado
—pendiente, pagada, enviada, entregada, cancelada— y cancelar devuelve el inventario solo.

**Reportes.** Ingresos, costo de lo vendido, margen, gastos por categoría, resultado neto,
ventas por canal, productos más vendidos y valor del inventario a precio de venta y al costo.
Todo filtrable por período y exportable a CSV.

**Libro de caja.** Los gastos del negocio —materia prima, envíos, empaque, publicidad,
renta— y los ingresos que no son ventas, para que la ganancia que ves sea la real y no solo
lo que facturaste.

---

## Las dos partes

| Parte | Ruta | Puerto | Qué es |
|---|---|---|---|
| **Aplicación** | [`admin/`](admin/) | 5173 | React 19 + Vite 8. Toda la interfaz. |
| **API** | [`backend/`](backend/) | 4000 | Fastify 5 + Prisma 6 + PostgreSQL 16. |

Cada una tiene su `package.json`: se instalan y se levantan por separado, en terminales
distintas.

### Stack

| Capa | Tecnología |
|---|---|
| Interfaz | React 19 · Vite 8 · react-router-dom v7 |
| Estilos | Tailwind CSS v4 vía CDN, tokens en `admin/index.html` |
| Tipografía / iconos | Manrope · Material Symbols Outlined |
| API | Fastify 5 · Prisma 6 · PostgreSQL 16 |
| Autenticación | `@fastify/jwt` · `bcryptjs` |
| Validación | Zod |
| Linter | Oxlint |
| Pruebas | `node --test` (API) |

---

## Documentación

| Archivo | Qué contiene | Cuándo leerlo |
|---|---|---|
| **[CLAUDE.md](CLAUDE.md)** | El mapa: cómo encajan las partes, cómo levantarlas, las invariantes de negocio y las trampas del entorno. | **Primero, siempre.** |
| **[AGENTS.md](AGENTS.md)** | La referencia detallada: cada ruta, el esquema completo, el diseño del módulo, el roadmap. | Antes de tocar la API o el esquema. |
| **[SKILLS.md](SKILLS.md)** | Las reglas: clean code, patrones, Tailwind y accesibilidad, convenciones del backend, integridad de dinero y stock, gráficas. | Antes de escribir código. |
| **[LAUNCH.md](LAUNCH.md)** | Lo que falta para producción: bloqueadores, hosting, el plan ordenado. | Antes de desplegar. |
| **[ANALISIS.md](ANALISIS.md)** | El porqué de las decisiones de arquitectura. | Cuando necesites el contexto de una decisión. |

---

## Puesta en marcha

### Requisitos

- Node.js ≥ 20 · npm ≥ 9
- Podman (o Docker) para PostgreSQL

### 1. Base de datos

PostgreSQL corre en un contenedor. La primera vez:

```bash
podman run -d --name creaciones-baby-db -p 5432:5432 \
  -e POSTGRES_USER=creaciones -e POSTGRES_PASSWORD=creaciones_dev_pw \
  -e POSTGRES_DB=creaciones_baby \
  -v creaciones-baby-db-data:/var/lib/postgresql/data \
  docker.io/library/postgres:16-alpine
```

Después: `podman start creaciones-baby-db`. Los datos persisten en el volumen. Verifica con
`podman ps` que la columna `PORTS` diga `0.0.0.0:5432->5432/tcp`.

### 2. API

```bash
cd backend
npm install
cp .env.example .env          # DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGIN
npx prisma migrate deploy
npx prisma generate
npm run seed:admin            # crea tu cuenta de acceso
npm run dev                   # http://localhost:4000
```

`npx prisma generate` **no es opcional**: sin él, el cliente de Prisma no conoce las tablas
nuevas y la API falla en tiempo de ejecución.

**No hay datos de ejemplo.** Este es un inventario real: cada producto que exista aquí debería
ser uno que de verdad tienes. El catálogo se carga desde la aplicación.

### 3. Aplicación

```bash
cd admin
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:4000
npm run dev                   # http://localhost:5173
```

Entra con la cuenta que creó `npm run seed:admin`
(`admin@creacionesbaby.test` / `admin12345` por defecto — cámbiala antes de usarlo en serio).

### Variables de entorno

**API** (`backend/.env`):

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL. |
| `PORT` | Puerto de la API (4000). |
| `CORS_ORIGIN` | Orígenes permitidos. En desarrollo, `http://localhost:5173`. |
| `JWT_SECRET` | Firma de los tokens. En producción, algo largo y aleatorio (`openssl rand -base64 48`). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Opcionales, solo los lee `npm run seed:admin`. |

**Aplicación** (`admin/.env`): `VITE_API_URL` es obligatoria — la app no tiene modo sin
conexión.

---

## Rutas

`/dashboard` · `/ventas` · `/ventas/nueva` · `/ventas/:id/editar` · `/finanzas` ·
`/inventario` · `/productos` · `/productos/nuevo` · `/productos/:id/editar` · `/reportes` ·
`/promociones` · `/configuracion` · `/pagos`

`/login` y `/registro` son las únicas públicas; todo lo demás exige sesión.

---

## Modelo de datos

| Modelo | Para qué |
|---|---|
| `User` | Cuentas de acceso. |
| `Product` + `ProductImage` | Catálogo interno, con `cost` (costo por unidad) para calcular margen. |
| `Order` + `OrderItem` | **Una venta**, de cualquier canal — se distinguen por `channel`. `soldAt` es la fecha real y es modificable hacia atrás; `OrderItem.cost` congela el costo del momento. |
| `StockMovement` | Rastro auditable de cada cambio de inventario, con el delta y el stock resultante. |
| `FinanceEntry` | Libro de caja: gastos, e ingresos que no son ventas. |

La decisión de fondo: **una sola tabla de ventas**. Una venta de feria y una de la plataforma
externa son el mismo registro, así "todas mis ventas" se responde con una consulta en lugar
de la unión de dos fuentes que se desincronizan. El detalle está en [AGENTS.md](AGENTS.md).

---

## API

Todo requiere token salvo `GET /health` y `POST /auth/*`.

| Método y ruta | Qué hace |
|---|---|
| `POST /auth/register` · `POST /auth/login` · `GET /auth/me` | Autenticación con JWT. |
| `GET /products` · `GET /products/:id` | Catálogo interno, incluyendo el costo. |
| `POST` · `PUT` · `DELETE /products/:id` | Gestión del catálogo. Crear con stock registra la entrada inicial; editar el stock registra un ajuste. |
| `GET /sales` | Todas las ventas, con filtros de período, canal, estado y búsqueda. Los totales cubren todo el conjunto filtrado, no solo la página. |
| `POST /sales` | Registrar una venta: valida stock, descuenta y deja rastro, todo en una transacción. |
| `GET /sales/:id` · `PATCH /sales/:id` | Detalle y cambios de estado. Cancelar devuelve el inventario. |
| `GET` · `POST` · `PUT` · `DELETE /finance-entries` | Libro de caja. |
| `GET` · `POST /stock-movements` | Historial y registro de movimientos de inventario. |
| `GET /reports/summary` | Todas las cifras de los reportes en una sola petición. |
| `GET /health` | Chequeo de estado. |

---

## Calidad y pruebas

```bash
cd backend && npm test                    # 34 pruebas, no requiere PostgreSQL
cd backend && npx prisma validate         # si tocaste el esquema
cd admin && npm run lint && npm run build
```

`oxlint` debe terminar con **0 advertencias y 0 errores**.

Las pruebas inyectan un Prisma falso en memoria en los manejadores de ruta **reales** vía
`inject` de Fastify: la autenticación, la validación con Zod y toda la aritmética se ejecutan
de verdad, y solo se sustituye la base de datos. Cubren donde un error cuesta dinero —
totales con precio negociado, sobreventa, descuento y devolución de stock, categorías del
libro de caja, y el cálculo de margen.

La interfaz no tiene suite automatizada: se verifica a mano con `npm run dev`, en modo claro
y oscuro, y en ancho de teléfono.

---

## Estado del proyecto

**Funciona:** catálogo con costo y margen; registro de ventas de cualquier canal con precio
negociable, fecha hacia atrás y protección contra sobreventa; estados de venta con devolución
automática de inventario al cancelar; historial completo de movimientos; libro de caja; y
reportes de ingresos, costo, margen, gastos, resultado neto, canales, productos y valor de
inventario. Exportación a CSV en todas las vistas.

**Falta** — y esto es justo lo que el alcance actual pide, así que es lo siguiente:

- **SKU o código de barras** en los productos, para conteos físicos y para poder cruzar en el
  futuro las ventas de la plataforma externa.
- **Punto de reorden por producto y alertas de stock bajo.** Hoy solo hay una etiqueta visual
  con un umbral fijo de 5 unidades igual para todo.
- **Rotación de inventario**, días de inventario y reporte de stock muerto.
- **Importación de catálogo por CSV**, para no teclear el inventario inicial.
- **Sincronización con la plataforma externa.** Hoy esas ventas se registran a mano.

**Y del lado de infraestructura:** no hay respaldos, los tokens no expiran, no hay límite de
intentos en el login, y no hay despliegue. [LAUNCH.md](LAUNCH.md) los ordena por prioridad —
los respaldos primero, porque es lo único de la lista que no se puede recuperar.

---

## Licencia

Privado — todos los derechos reservados.
