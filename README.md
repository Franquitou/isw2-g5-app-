# Liga Amateur Santafesina — app móvil

Base de la aplicación React Native + Expo para el proyecto de Ingeniería de Software II. **Esta entrega contiene únicamente la infraestructura compartida**: navegación, configuración, cliente HTTP, almacenamiento del token, tipos del contrato y tema visual. Las pantallas de negocio se agregan a medida que el backend expone sus endpoints.

## Estado

- ✅ Expo + TypeScript + Expo Router.
- ✅ Cliente API con manejo uniforme de errores (`ApiErrorResponse`).
- ✅ Token JWT en almacenamiento seguro (pendiente de conectar al login).
- ✅ Tipos de catálogo, equipos y jugadores (contrato `docs/API.md` §5).
- ✅ Tema y componentes base.
- ⏳ Pantallas de negocio: no incluidas a propósito.

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
│   ├── index.tsx             # pantalla inicial / estado de la base
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

## Autenticación

`src/auth/tokenStorage.ts` guarda el token con `expo-secure-store` en Android/iOS y `localStorage` en web. El login (RF-01) y el contexto de sesión los implementa Franco; esta base solo deja el almacenamiento y el envío del token preparados.

## Trabajo en equipo

- Repositorio separado del backend.
- Una rama por tarea (`feature/RF-05-catalogo`, etc.) y Pull Request hacia `main`.
- No modificar la infraestructura compartida (`src/api`, `src/theme`, `src/components`, `src/types`) sin coordinarlo.
- Antes de crear una pantalla, el endpoint debe existir y estar documentado en `docs/API.md` del backend.
- Cada módulo tiene su espacio en `src/features/`; ver `src/features/README.md`.

## Qué no incluye (a propósito)

- Login y gestión de usuarios.
- Pantallas de catálogo, equipos, jugadores, partidos, eventos, tabla o suspendidos.
- Lógica de negocio duplicada: las reglas RN se validan en el backend.

Cada una se agrega cuando su endpoint esté disponible y acordado.
