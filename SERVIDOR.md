# Guía: montar el sistema en tu servidor local

Runbook para poner Creaciones Baby a correr en una computadora vieja de la casa/taller, con
acceso desde fuera vía Tailscale. Pensado para seguirse de arriba a abajo.

> **Nota:** [LAUNCH.md](LAUNCH.md) recomienda hosting administrado en la nube. Esta guía es la
> alternativa autoalojada que elegiste. Lo que **no cambia** entre las dos opciones son los
> bloqueadores de seguridad de `LAUNCH.md` (tokens sin expiración, sin límite de intentos en
> el login, secretos de producción) — esos siguen pendientes y son código, no servidor.

---

## Qué vas a montar

Todo en una sola máquina:

```
          Internet ─╳ (nada expuesto)
                     │
        Tailscale ───┤  https://servidor.tu-tailnet.ts.net
                     │
    ┌────────────────▼─────────────────┐
    │  Ubuntu Server LTS               │
    │                                  │
    │  Caddy  :8080                    │
    │    ├── /        → admin/dist     │  (archivos estáticos)
    │    └── /api/*   → localhost:4000 │  (proxy a la API)
    │                                  │
    │  Node (systemd)  :4000           │  la API
    │  PostgreSQL      :5432           │  solo local
    └──────────────────────────────────┘
                     │
              respaldo diario → fuera de esta máquina
```

**Por qué así:** la aplicación y la API quedan en el **mismo origen** (`/` y `/api`), lo que
elimina de raíz todos los problemas de CORS. Y nada se publica a internet: Tailscale es el
único camino de entrada, cifrado, sin abrir puertos en el router.

---

## Antes de empezar

### Revisa el hardware

| Qué | Mínimo | Cómodo |
|---|---|---|
| Procesador | 64 bits | cualquiera de 2012 en adelante |
| RAM | 2 GB | 4 GB |
| Disco | 30 GB | **SSD** de 120 GB |
| Red | Cable ethernet | — |

**Cámbiale el disco por un SSD si el que tiene es mecánico.** No es por velocidad: es que un
disco de 10 años es el componente con más probabilidad de morir, y ahí va a vivir tu
contabilidad. Un SSD de 240 GB cuesta poco.

Si vas a reutilizar el disco actual, revisa su salud antes de confiarle nada:

```bash
sudo apt install smartmontools
sudo smartctl -H /dev/sda        # debe decir PASSED
sudo smartctl -a /dev/sda | grep -i reallocated   # 0 es lo que quieres ver
```

### Consigue una UPS

En serio. Un apagón en medio de una escritura puede corromper la base de datos, y en
Guatemala los cortes no son raros. Una UPS chica (~$60) protege el único lugar donde vive tu
historial de ventas. Es la compra con mejor relación costo/beneficio de toda esta lista.

### Ten a mano

- Una USB de 4 GB o más (para el instalador)
- El nombre de usuario y contraseña que quieras usar
- Acceso al router (para reservar la IP)
- Una cuenta de Tailscale (gratis, se crea con Google o GitHub)
- Una cuenta de almacenamiento en la nube para los respaldos (Backblaze B2, Google Drive, lo
  que uses)

---

## Paso 1 — Instalar Ubuntu Server

Usa **Ubuntu Server 24.04 LTS** (no la versión de escritorio: no necesitas interfaz gráfica y
consume RAM que no te sobra). Soporte hasta 2029.

1. Descarga la ISO de `ubuntu.com/download/server`
2. Graba la USB con [Balena Etcher](https://etcher.balena.io/) o Rufus
3. Arranca la máquina desde la USB (normalmente F12 o Supr al encender)
4. En el instalador:
   - Idioma/teclado a tu gusto
   - **Marca "Install OpenSSH server"** — con esto administras el servidor desde tu Mac sin
     tener que estar frente a él
   - No instales ningún "snap" adicional
   - Usa el disco completo (borra lo que haya, asumiendo que ya no necesitas nada de esa
     computadora)

Cuando termine y reinicie, ya puedes desconectar el monitor y el teclado — todo lo demás se
hace por SSH desde tu Mac.

## Paso 2 — Primer arranque

Desde tu Mac:

```bash
ssh tuusuario@192.168.1.XX      # la IP te la dice el instalador al terminar
```

Actualiza y pon la zona horaria correcta:

```bash
sudo apt update && sudo apt upgrade -y
sudo timedatectl set-timezone America/Guatemala
timedatectl                      # verifica que diga -06
```

**La zona horaria importa de verdad** en este sistema: los reportes agrupan por día, y una
máquina en UTC te va a mandar las ventas de la noche al día siguiente.

Activa las actualizaciones de seguridad automáticas:

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## Paso 3 — IP fija en tu red

Entra a tu router y **reserva la IP por DHCP** para la MAC de esta máquina (busca "DHCP
reservation" o "IP estática"). Así la dirección no cambia cuando se reinicie el router.

Anota esa IP; la vas a usar para entrar por SSH desde la red local.

## Paso 4 — PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
psql --version                   # debe ser 16.x
```

Crea la base y el usuario. **Genera una contraseña larga y guárdala** — no uses la de
desarrollo:

```bash
openssl rand -base64 24          # copia el resultado

sudo -u postgres psql
```

Dentro de `psql`:

```sql
CREATE USER creaciones WITH PASSWORD 'PEGA_AQUI_LA_CONTRASEÑA';
CREATE DATABASE creaciones_baby OWNER creaciones;
\q
```

PostgreSQL en Ubuntu solo escucha en `localhost` por defecto. **Déjalo así** — la API corre en
la misma máquina y nada más necesita entrar.

## Paso 5 — Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v                          # v22.x
```

## Paso 6 — Traer el código

Dos caminos, según si tienes el repositorio en algún lado:

**Si tienes GitHub/GitLab (privado):**

```bash
sudo mkdir -p /opt/creaciones && sudo chown $USER:$USER /opt/creaciones
git clone TU_REPO /opt/creaciones
```

**Si el repositorio solo existe en tu Mac** — cópialo directo, desde tu Mac:

```bash
rsync -av --exclude node_modules --exclude dist \
  /Volumes/WorkDiskDev/DevTools/react_native_projects/CreacionesBaby/ \
  tuusuario@192.168.1.XX:/opt/creaciones/
```

> Vale la pena crear un repositorio privado en GitHub aunque sea solo para esto: actualizar el
> servidor pasa a ser `git pull` en vez de un rsync a mano, y de paso tienes una copia más del
> código.

Instala dependencias **en el servidor** (Prisma descarga binarios propios de Linux; copiar el
`node_modules` de tu Mac no funciona):

```bash
cd /opt/creaciones/backend && npm install --omit=dev
cd /opt/creaciones/admin   && npm install
```

## Paso 7 — Configuración de la API

```bash
cd /opt/creaciones/backend
cp .env.example .env
openssl rand -base64 48          # para JWT_SECRET
nano .env
```

Debe quedar así:

```
DATABASE_URL="postgresql://creaciones:LA_CONTRASEÑA_DEL_PASO_4@localhost:5432/creaciones_baby?schema=public"
PORT=4000
CORS_ORIGIN="https://servidor.tu-tailnet.ts.net"
JWT_SECRET="EL_VALOR_QUE_GENERASTE"
```

Protégelo, porque contiene dos secretos:

```bash
chmod 600 .env
```

## Paso 8 — Crear el esquema y tu cuenta

```bash
cd /opt/creaciones/backend
npx prisma migrate deploy
npx prisma generate

ADMIN_EMAIL="tucorreo@ejemplo.com" ADMIN_PASSWORD="UNA_CONTRASEÑA_LARGA" npm run seed:admin
```

**Esa cuenta es toda tu seguridad.** Es la única llave del sistema — usa una contraseña que no
uses en ningún otro lado, y guárdala en un gestor de contraseñas.

Prueba que la API arranca:

```bash
npm start
# en otra terminal:  curl localhost:4000/health   → {"status":"ok"}
```

Corta con Ctrl+C.

## Paso 9 — Que la API arranque sola

Sin esto, la API se muere en cuanto cierres la sesión SSH o se reinicie la máquina.

```bash
sudo nano /etc/systemd/system/creaciones-api.service
```

```ini
[Unit]
Description=Creaciones Baby API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=tuusuario
WorkingDirectory=/opt/creaciones/backend
EnvironmentFile=/opt/creaciones/backend/.env
Environment=NODE_ENV=production
Environment=TZ=America/Guatemala
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now creaciones-api
sudo systemctl status creaciones-api        # debe decir active (running)
```

Para ver los registros cuando algo falle: `journalctl -u creaciones-api -f`

## Paso 10 — Compilar la aplicación y servirla

La aplicación es un sitio estático: se compila una vez y Caddy la sirve.

```bash
cd /opt/creaciones/admin
echo 'VITE_API_URL=/api' > .env
npm run build                    # genera dist/
```

> `VITE_API_URL=/api` es lo que hace que la app y la API queden en el mismo origen. Sin barra
> al final.

Instala Caddy:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

```bash
sudo nano /etc/caddy/Caddyfile
```

Borra todo y deja esto:

```
:8080 {
    handle_path /api/* {
        reverse_proxy localhost:4000
    }

    handle {
        root * /opt/creaciones/admin/dist
        try_files {path} /index.html
        file_server
    }
}
```

> La línea `try_files {path} /index.html` no es opcional: sin ella, recargar la página estando
> en `/ventas` da un 404, porque las rutas las maneja React en el navegador, no el servidor.

```bash
sudo systemctl restart caddy
curl localhost:8080/api/health    # → {"status":"ok"}
```

Ya puedes entrar desde cualquier equipo de tu red en `http://192.168.1.XX:8080`.

## Paso 11 — Acceso desde fuera con Tailscale

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Te da un enlace; ábrelo en el navegador para vincular la máquina a tu cuenta. Instala también
Tailscale en tu teléfono y en tu Mac, con la misma cuenta.

Ahora expón el servicio dentro de tu red privada, con HTTPS y certificado válido:

```bash
sudo tailscale serve --bg 8080
sudo tailscale serve status       # te dice la URL https://... resultante
```

> La sintaxis de `tailscale serve` ha cambiado entre versiones. Si el comando de arriba no te
> funciona, revisa `tailscale serve --help` — la idea es siempre la misma: exponer el puerto
> 8080 local dentro de tu tailnet.

Esa URL `https://servidor.tu-tailnet.ts.net` funciona desde tu teléfono en cualquier lado, sin
abrir un solo puerto en el router. Ponla en `CORS_ORIGIN` (Paso 7) y reinicia la API:

```bash
sudo systemctl restart creaciones-api
```

Cierra el resto con el cortafuegos:

```bash
sudo ufw allow in on tailscale0
sudo ufw allow from 192.168.1.0/24 to any port 22    # SSH desde tu red local
sudo ufw allow from 192.168.1.0/24 to any port 8080  # la app desde tu red local
sudo ufw enable
```

## Paso 12 — Respaldos (el paso que no te puedes saltar)

Todo lo anterior es reinstalable en una tarde. Esto no.

```bash
sudo mkdir -p /var/backups/creaciones && sudo chown $USER:$USER /var/backups/creaciones
nano /opt/creaciones/respaldo.sh
```

```bash
#!/usr/bin/env bash
set -euo pipefail

DESTINO=/var/backups/creaciones
FECHA=$(date +%F_%H%M)
ARCHIVO="$DESTINO/creaciones_$FECHA.sql.gz"

export PGPASSWORD='LA_CONTRASEÑA_DE_LA_BASE'
pg_dump -h localhost -U creaciones creaciones_baby | gzip > "$ARCHIVO"

# Fuera de esta máquina. Sin esta línea, esto no es un respaldo: es una copia
# en el mismo disco que puede morir.
rclone copy "$ARCHIVO" remoto:creaciones-respaldos/

# Conserva 30 días en local.
find "$DESTINO" -name 'creaciones_*.sql.gz' -mtime +30 -delete

echo "$(date -Is) respaldo ok: $(du -h "$ARCHIVO" | cut -f1)"
```

```bash
chmod 700 /opt/creaciones/respaldo.sh    # contiene la contraseña de la base
```

Configura `rclone` con tu nube (`sudo apt install rclone && rclone config` — te guía paso a
paso; Backblaze B2 sale por centavos al mes).

Prográmalo diario:

```bash
crontab -e
```

```
0 2 * * * /opt/creaciones/respaldo.sh >> /var/log/creaciones-respaldo.log 2>&1
```

## Paso 13 — Prueba el restore (hoy, no "algún día")

Un respaldo que nunca restauraste es una suposición, no un respaldo.

```bash
sudo -u postgres createdb prueba_restore
gunzip -c /var/backups/creaciones/creaciones_*.sql.gz | sudo -u postgres psql prueba_restore
sudo -u postgres psql prueba_restore -c 'SELECT COUNT(*) FROM "Order";'
sudo -u postgres dropdb prueba_restore
```

Si el conteo coincide con lo que tienes, tu respaldo sirve. **Anota la fecha en que lo
probaste** y repítelo cada tres meses.

---

## Rutina de mantenimiento

| Cada | Qué |
|---|---|
| Semana | `journalctl -u creaciones-api --since "1 week ago" \| grep -i error` |
| Mes | `sudo apt update && sudo apt upgrade` · revisar `/var/log/creaciones-respaldo.log` |
| Trimestre | Probar un restore (Paso 13) · `sudo smartctl -H /dev/sda` |

**Para actualizar el sistema cuando haya código nuevo:**

```bash
cd /opt/creaciones && git pull
cd backend && npm install --omit=dev && npx prisma migrate deploy && npx prisma generate
sudo systemctl restart creaciones-api
cd ../admin && npm install && npm run build
```

---

## Si algo falla

| Síntoma | Casi siempre es |
|---|---|
| La página carga pero no muestra datos | `CORS_ORIGIN` no coincide con la URL por la que entras. Revísalo en `backend/.env` y reinicia la API. |
| "Cannot read properties of undefined" en la API | Faltó `npx prisma generate` después de una migración. |
| Recargar en `/ventas` da 404 | Falta `try_files {path} /index.html` en el Caddyfile. |
| La API no arranca | `journalctl -u creaciones-api -n 50` — casi siempre es la `DATABASE_URL`. |
| Todo iba bien y dejó de responder | `sudo systemctl status creaciones-api postgresql caddy` |

---

## Lo que esto todavía no resuelve

Sé honesto contigo mismo sobre esto:

- **Los bloqueadores de seguridad siguen en el código**, no en el servidor: los tokens no
  expiran nunca y el login no tiene límite de intentos. Con Tailscale de por medio el riesgo
  baja bastante (nadie de internet llega al login), pero siguen pendientes.
- **Una sola máquina sigue siendo un solo punto de falla.** El respaldo fuera del equipo es lo
  que convierte "se murió el disco" en "perdí una tarde" en vez de "perdí el año".
- **Si se va la luz, el sistema no está.** Con UPS aguantas los cortes cortos; para los largos,
  no hay nada que hacer salvo esperar.
