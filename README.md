# Liga Amateur Santafesina — app móvil

Aplicación React Native + Expo para el proyecto de Ingeniería de Software II. La base incluye la infraestructura compartida —navegación, configuración, cliente HTTP, almacenamiento del token, tipos del contrato y tema visual— y el catálogo público (RF-05). Las demás pantallas de negocio se agregan a medida que el backend expone sus endpoints.

## Estado

- ✅ Expo + TypeScript + Expo Router.
- ✅ Cliente API con manejo uniforme de errores (`ApiErrorResponse`).
- ✅ Login RF-01, sesión recuperable y token JWT en almacenamiento seguro Android/iOS.
- ✅ Gestión ADMIN de usuarios RF-02: listado, filtros, detalle, alta, edición, contraseña y baja/reactivación lógica.
- ✅ Tipos de catálogo, equipos y jugadores (contrato `docs/API.md` §5).
- ✅ Tema y componentes base.
- ✅ Catálogo público (RF-05): torneos, equipos, jugadores, canchas y árbitros.
- ⏳ Pantallas de alta, edición y baja de equipos y jugadores (RF-03/RF-04): a cargo del módulo B.
- ⏳ Resto de las pantallas de negocio: se agregan cuando su endpoint esté disponible.

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
│   ├── catalogo/             # RF-05: menú y pantallas del catálogo
│   │   ├── index.tsx         # menú del catálogo
│   │   ├── canchas.tsx
│   │   ├── arbitros.tsx
│   │   ├── torneos/          # listado de torneos y equipos por torneo
│   │   └── equipos/          # jugadores por equipo
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

El alta, la edición y la baja de equipos y jugadores (RF-03/RF-04) se agregan cuando exista el login (RF-01), porque el backend exige rol ADMIN.

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

- Escrituras de equipos y jugadores (RF-03/RF-04).
- Pantallas de partidos, eventos, tabla o suspendidos.
- Lógica de negocio duplicada: las reglas RN se validan en el backend.

Cada una se agrega cuando su endpoint esté disponible y acordado.
