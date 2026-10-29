# Módulos y propiedad del código

Esta carpeta está pensada para que cada integrante agregue su módulo **sin pisar el trabajo de los demás**. No se crean carpetas vacías: cada una se agrega cuando empieza la funcionalidad.

## Responsables

| Carpeta sugerida | Integrante | Alcance |
|---|---|---|
| `src/features/auth/` | Franco (A) | Login, sesión, usuarios y permisos. |
| `src/features/catalog/` | Marcos (B) | Catálogo público (RF-05): torneos, equipos, jugadores, canchas y árbitros. |
| `src/features/teams/` | Marcos (B) | ABM de equipos (RF-03); pendiente del login ADMIN. |
| `src/features/players/` | Marcos (B) | ABM de jugadores (RF-04); pendiente del login ADMIN. |
| `src/features/matches/` | José (C) | Partidos, estados y listado por fecha. |
| `src/features/events/` | Mateo (D) | Eventos del partido y detalle. |
| `src/features/standings/` | Mateo (D) | Tabla de posiciones y suspendidos. |

## Reglas

1. **Pantallas en `app/`**: Expo Router usa rutas por archivos. Una pantalla nueva va en `app/`, por ejemplo `app/equipos/index.tsx`.
2. **Lógica de módulo en `src/features/<modulo>/`**: componentes, hooks y llamadas propias del módulo.
3. **Infraestructura compartida** (`src/api`, `src/theme`, `src/components`, `src/types`): cualquier cambio debe coordinarse porque afecta a todos.
4. **Contrato primero**: antes de una pantalla, el endpoint debe existir y estar documentado en `docs/API.md` del repositorio backend.
5. **Sin lógica duplicada**: el cálculo de resultados/tabla lo hace el backend; la app solo muestra datos.
6. **No implementar módulos ajenos**: si falta una dependencia, coordinar la interfaz en lugar de crear una versión paralela.

## Estructura sugerida para un módulo

```text
src/features/equipos/
├── components/
│   └── EquipoCard.tsx
├── hooks/
│   └── useEquipos.ts
└── services/
    └── equiposApi.ts
```

Las rutas públicas o privadas se agregan en `app/` cuando el backend esté listo.
