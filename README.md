# Liga Amateur Santafesina — app móvil

Aplicación React Native + Expo para el proyecto de Ingeniería de Software II. La base incluye la infraestructura compartida —navegación, configuración, cliente HTTP, almacenamiento del token, tipos del contrato y tema visual—, el catálogo público (RF-05) y la gestión de partidos, eventos, tabla y suspendidos (RF-06 a RF-12).

## Estado

- ✅ Expo + TypeScript + Expo Router.
- ✅ Cliente API con manejo uniforme de errores (`ApiErrorResponse`).
- ✅ Login RF-01, sesión recuperable y token JWT en almacenamiento seguro Android/iOS.
- ✅ Gestión ADMIN de usuarios RF-02: listado, filtros, detalle, alta, edición, contraseña y baja/reactivación lógica.
- ✅ Tipos de catálogo, equipos y jugadores (contrato `docs/API.md` §5).
- ✅ Tema y componentes base.
- ✅ Catálogo público (RF-05): torneos, equipos, jugadores, canchas y árbitros.
- ✅ Gestión ADMIN de equipos (RF-03) y jugadores (RF-04): listado por torneo, alta, edición y baja lógica.
- ✅ Partidos y resultados (RF-06 a RF-12): fixture por jornada, detalle con eventos, alta/edición/baja de partidos, cambio de estado, registro de eventos, tabla de posiciones y suspendidos.

## Requisitos

- Node.js LTS y npm.
- Expo Go en el teléfono, o un emulador Android/iOS.
- Backend Spring Boot iniciado para probar llamadas reales.

## Instalación

```powershell
cd isw2-g5-app
npm install
Copy-Item .env.example .env
```

Editá `.env` con la URL real de la API:

```text
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080/api
```

> En un teléfono físico, `localhost` apunta al teléfono, no a tu PC. Usá la IP LAN de la computadora y verificá que el firewall permita el puerto 8080.

## Ejecución

```powershell
npm start          # abre Expo DevTools
npm run android    # abre en emulador/dispositivo Android
npm run ios        # requiere macOS para simulador
npm run web        # versión web de desarrollo
npm run typecheck  # verifica TypeScript sin generar archivos
```

## Estructura

```text
isw2-g5-app/
├── app/                      # rutas de Expo Router
│   ├── _layout.tsx           # stack raíz
│   ├── index.tsx             # inicio: módulos disponibles y conexión
│   ├── login.tsx             # RF-01: inicio de sesión
│   ├── catalogo/             # RF-05: menú y pantallas del catálogo
│   │   ├── index.tsx         # menú del catálogo
│   │   ├── canchas.tsx
│   │   ├── arbitros.tsx
│   │   ├── torneos/          # listado de torneos y equipos por torneo
│   │   └── equipos/          # jugadores por equipo
│   ├── usuarios/             # RF-02: gestión ADMIN de usuarios
│   ├── equipos/              # RF-03/RF-04: gestión ADMIN de equipos y jugadores
│   ├── partidos/             # RF-06 a RF-12: fixture, detalle, tabla y suspendidos
│   └── +not-found.tsx
├── src/
│   ├── api/                  # cliente HTTP, configuración y errores
│   ├── auth/                 # almacenamiento del token JWT
│   ├── components/           # componentes visuales compartidos
│   ├── features/             # módulos por integrante (ver README interno)
│   ├── theme/                # colores, espacios y tipografía
│   └── types/                # DTOs del contrato del backend
├── .env.example
├── app.json
└── package.json
```

## Uso del cliente API

```ts
import { api } from '@/api';
import type { Torneo } from '@/types';

// Endpoint público: no adjunta token.
const torneos = await api.get<Torneo[]>('/torneos', { auth: false });
```

El cliente:
- agrega `Authorization: Bearer <token>` cuando `auth` es `true` y hay token guardado;
- convierte errores HTTP al tipo `ApiError`, con `status`, `message` y `validationErrors`;
- usa un timeout de 15 segundos por defecto;
- devuelve `undefined` en respuestas `204`.

## Catálogo público (RF-05)

La pantalla inicial enlaza a `/catalogo`, un menú con las consultas públicas del contrato:

| Pantalla | Endpoint |
| --- | --- |
| Torneos | `GET /api/torneos` |
| Equipos de un torneo | `GET /api/torneos/{torneoId}/equipos` |
| Jugadores de un equipo | `GET /api/equipos/{equipoId}/jugadores` |
| Canchas | `GET /api/canchas` |
| Árbitros | `GET /api/arbitros` |

Todas las llamadas usan `auth: false` porque el backend las expone sin token. Cada pantalla maneja carga, error con reintento y listado vacío mediante `useListaCatalogo` y `ListaCatalogo`.

El alta, la edición y la baja de equipos y jugadores (RF-03/RF-04) están en la sección administrativa `/equipos`, disponible solo para ADMIN porque el backend exige ese rol en las escrituras.

## Gestión de equipos y jugadores (RF-03/RF-04)

Un ADMIN accede desde el inicio a `/equipos`. La pantalla elige el torneo activo y lista sus equipos; cada equipo abre un detalle con su plantel.

| Acción | Endpoint |
| --- | --- |
| Alta de equipo | `POST /api/torneos/{torneoId}/equipos` |
| Edición de equipo | `PUT /api/equipos/{id}` |
| Baja lógica de equipo | `DELETE /api/equipos/{id}` |
| Alta de jugador | `POST /api/equipos/{equipoId}/jugadores` |
| Edición de jugador | `PUT /api/jugadores/{id}` |
| Baja lógica de jugador | `DELETE /api/jugadores/{id}` |

Las lecturas siguen usando los endpoints públicos de RF-05. El formulario valida longitudes y rangos antes de enviar, pero el backend es la autoridad final. La baja es lógica: el registro deja de listarse y no se puede reactivar desde la app. El equipo de un jugador y el torneo de un equipo no se pueden cambiar desde la edición, tal como define el contrato.

## Partidos, resultados, tabla y suspendidos (RF-06 a RF-12)

La sección `/partidos` es pública: cualquier visitante elige torneo y jornada, ve el fixture con el resultado derivado de los eventos y abre el detalle de cada partido. Desde ahí también se accede a la tabla de posiciones y a los suspendidos de la jornada.

| Pantalla | Endpoint | Acceso |
| --- | --- | --- |
| Fixture por jornada | `GET /api/torneos/{torneoId}/partidos?numeroFecha=N` | Público |
| Detalle con eventos | `GET /api/partidos/{id}` | Público |
| Tabla de posiciones | `GET /api/torneos/{torneoId}/tabla` | Público |
| Suspendidos | `GET /api/torneos/{torneoId}/suspendidos?numeroFecha=N` | Público |
| Alta de partido | `POST /api/partidos` | ADMIN |
| Edición de partido | `PUT /api/partidos/{id}` | ADMIN |
| Baja de partido | `DELETE /api/partidos/{id}` | ADMIN |
| Cambio de estado | `PATCH /api/partidos/{id}/estado` | ADMIN o DELEGADO |
| Alta de evento | `POST /api/partidos/{partidoId}/eventos` | ADMIN o DELEGADO |
| Baja de evento | `DELETE /api/partidos/{partidoId}/eventos/{eventoId}` | ADMIN o DELEGADO |

El formulario de partido elige torneo, equipos, cancha y árbitro desde los catálogos públicos, y envía la fecha con el offset de Santa Fe (`-03:00`). Las transiciones de estado y los eventos se validan en el backend: la app solo muestra las acciones permitidas para cada estado y rol. El marcador y la tabla no se cargan a mano; se derivan de los eventos `GOL` y de los partidos `FINALIZADO`.

## Autenticación

`app/login.tsx` consume `POST /api/auth/login` sin token previo. `src/auth/SessionContext.tsx` mantiene la sesión y restaura usuario, nombre, rol y vencimiento al abrir la app. `src/auth/tokenStorage.ts` guarda token y perfil (sin contraseña) con `expo-secure-store` en Android/iOS; en web usa `localStorage`, que no ofrece seguridad equivalente. El JWT dura ocho horas; si vence o una solicitud protegida recibe 401, se elimina la sesión. El catálogo sigue disponible sin login y el acceso visual a usuarios se muestra solo a ADMIN. El backend verifica todos los permisos.

## Gestión de usuarios (RF-02)

Desde el inicio, un ADMIN accede a `/usuarios`. El módulo en `src/features/users/` consume los seis endpoints `/api/usuarios` del contrato: listado con filtro `activo`, detalle, alta, edición, cambio de contraseña y cambio de estado. Las pantallas manejan carga, errores y reintento; las contraseñas no se guardan, y se confirma antes de desactivar. RN-08 impide visualmente quitarse ADMIN o desactivar la propia cuenta; el backend vuelve a validar estas reglas. Un DELEGADO no ve el acceso ni puede entrar a las rutas administrativas.

## Trabajo en equipo

- Repositorio separado del backend.
- Una rama por tarea (`feature/RF-05-catalogo`, etc.) y Pull Request hacia `main`.
- No modificar la infraestructura compartida (`src/api`, `src/theme`, `src/components`, `src/types`) sin coordinarlo.
- Antes de crear una pantalla, el endpoint debe existir y estar documentado en `docs/API.md` del backend.
- Cada módulo tiene su espacio en `src/features/`; ver `src/features/README.md`.

## Qué no incluye (a propósito)

- Lógica de negocio duplicada: las reglas RN se validan en el backend.

Cada módulo nuevo se agrega cuando su endpoint esté disponible y acordado.
