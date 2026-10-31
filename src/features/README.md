# Módulos y propiedad del código

Esta carpeta está pensada para que cada integrante agregue su módulo **sin pisar el trabajo de los demás**. No se crean carpetas vacías: cada una se agrega cuando empieza la funcionalidad.

## Responsables

| Carpeta sugerida | Integrante | Alcance |
|---|---|---|
| `src/features/auth/` | Franco (A) | Login, sesión, usuarios y permisos. |
| `src/features/catalog/` | Marcos (B) | Catálogo público (RF-05), equipos (RF-03) y jugadores (RF-04). |
| `src/features/partidos/` | José (C) y Mateo (D) | Partidos, estados, eventos, tabla y suspendidos (RF-06 a RF-12). |

## Reglas

1. **Pantallas en `app/`**: Expo Router usa rutas por archivos. Una pantalla nueva va en `app/`, por ejemplo `app/equipos/index.tsx`.
2. **Lógica de módulo en `src/features/<modulo>/`**: componentes, hooks y llamadas propias del módulo.
3. **Infraestructura compartida** (`src/api`, `src/theme`, `src/components`, `src/types`): cualquier cambio debe coordinarse porque afecta a todos.
4. **Contrato primero**: antes de una pantalla, el endpoint debe existir y estar documentado en `docs/API.md` del repositorio backend.
5. **Sin lógica duplicada**: el cálculo de resultados/tabla lo hace el backend; la app solo muestra datos.
6. **No implementar módulos ajenos**: si falta una dependencia, coordinar la interfaz en lugar de crear una versión paralela.

## Estructura sugerida para un módulo

```text
src/features/partidos/
├── components/
│   ├── EstadoBadge.tsx
│   ├── EventoForm.tsx
│   ├── PartidoCard.tsx
│   └── PartidoForm.tsx
├── services/
│   ├── partidoError.ts
│   └── partidosApi.ts
└── utils/
    ├── confirmarAccion.ts
    └── partidoLabels.ts
```

Las rutas públicas o privadas se agregan en `app/` cuando el backend esté listo.
