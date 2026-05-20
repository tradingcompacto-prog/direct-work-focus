# Sprint Sesión 1.5 — Hub Social Advisor

Implementación en 9 bloques. Construyo primero la infraestructura
(caps + AlcanceFilter + tipos + estimación), luego las rutas y vistas
que la consumen, y por último el sidebar dinámico y el panel admin.

## Orden de ejecución

1. **Infra base (Sección 1 + 3 + tipos)**
   - `src/types/database.ts`: añadir `devuelta_at` y `motivo_devolucion` a `Tarea`.
   - `src/lib/queries.ts`: añadir `useUserRoles(userId)` leyendo `user_roles`.
     También añadir queries derivadas que usaré después:
     `useRevisionGlobal()`, `useMisRevisiones()`, `useMisDevoluciones()`.
   - `src/lib/user-caps.ts` (nuevo): hook `useUserCaps()` con
     `isDirector`, `isPM`, `hasDevoluciones`. PM se calcula sobre
     `pm_principal_id` o `pm_secundario_id` en clientes.
   - `src/components/AlcanceFilter.tsx` (nuevo): toggle 🌐/👤/✋,
     helpers `defaultAlcance(caps)` y `filtrarPorAlcance(...)`. Persistencia
     en `localStorage` con key `alcance:${ruta}:${userId}`.
   - `src/lib/estimacion.ts`: reescribir `estimar()` con `categoria` como
     factor primario (peso 5, umbral 5, mínimo 3 muestras).

2. **Devoluciones (Sección 4 + 5)**
   - `src/lib/tareas-store.ts`:
     - `devolverAResponsable(id, motivo)`: setea `estado=haciendola`,
       resetea las 3 fechas a hoy, escribe `devuelta_at` + `motivo_devolucion`.
     - `marcarParaRevisar(id)`: limpia `devuelta_at` + `motivo_devolucion`
       al volver a `estado=revision`.
   - `src/components/DevolverTareaDialog.tsx` (nuevo): modal con motivo
     (≥5 chars), soporta 1 o varias tareas, ejecuta `Promise.all`.
   - `src/components/TareaModal.tsx`: usar el nuevo dialog en lugar de la
     llamada directa actual a `devolverAResponsable`.
   - `src/components/views/MisTareasTimeline.tsx`,
     `src/components/views/MisTareasTabla.tsx`: estilos `border-l-4 border-orange-500 bg-orange-50`
     + badge "↩ Devuelta" con tooltip `motivo_devolucion` cuando
     `devuelta_at != null`.

3. **Rutas de revisión (Sección 6)**
   - `src/routes/revision.tsx` (director): tabla de tareas `estado=revision`
     con AlcanceFilter (todo/mis-proyectos/solo-mias, default `todo`),
     filtros laterales, checkboxes y bulk Aprobar/Devolver.
   - `src/routes/mis-revisiones.tsx` (PM/director): mismas columnas pero
     query filtrada a clientes donde el usuario es pm_principal o
     pm_secundario. AlcanceFilter sin opción "todo".
   - `src/routes/mis-devoluciones.tsx`: tabla simple de mis tareas con
     `devuelta_at != null` y `estado != completada`. Sin AlcanceFilter.
   - Las 3 rutas redirigen con `redirect()` en `beforeLoad` si el caps no
     da acceso (verificado vía sesión + roles).

4. **AlcanceFilter en vistas de tareas (Sección 7)**
   - `src/routes/tareas.timeline.tsx`, `tareas.tabla.tsx`,
     `tareas.index.tsx`: el filtro vive en las propias vistas
     (`MisTareasTimeline`, `MisTareasTabla`) para no duplicar lógica.
     Persistencia en localStorage por ruta + usuario.
   - Toggle adicional para PMs "Incluir revisiones pendientes" mezclando
     tareas en `revision` de sus clientes con estilo "por-revisar"
     (azul). Persistencia idem.
   - Nota: no hay `MisTareasKanban`; solo timeline y tabla. `tareas.index`
     redirige a `tareas.timeline` y queda como está.

5. **Brújula (Sección 2)**
   - `src/components/views/Brujula.tsx`:
     - Cumplimiento: usar `useEntregas() + useTareas()`, filtrar entregas
       `completada`, `fecha_cierre` últimos 30 días, con ≥1 tarea asociada.
       Si 0 → "Sin datos suficientes aún para calcular cumplimiento".
     - Renombrar bloque a "Top clientes (carga activa)" y contar todas
       las tareas activas por cliente, top 5.

6. **Sidebar dinámico (Sección 8)**
   - `src/components/layout/Sidebar.tsx`: añadir entradas condicionales
     según `useUserCaps()`:
     - "Mis devoluciones" si `hasDevoluciones` (badge naranja).
     - "Mis revisiones" si `isPM` (badge azul, count = mis-revisiones).
     - "Revisión global" si `isDirector` (badge morado).
   - Mantengo el sistema de roles para el resto del sidebar — solo
     añado entradas, no reescribo todo.

7. **Panel admin (Sección 9)**
   - `src/routes/personas.$id.tsx`: si `caps.isDirector`, mostrar selector
     de rol (director/pm/responsable) que hace `upsert`/`delete` en
     `user_roles`. Tras éxito invalida `["user-roles"]`.

## Detalles técnicos

- **Tipos**: `AlcanceValue = "todo" | "mis-proyectos" | "solo-mias"`.
  `Tarea.devuelta_at?: string | null`, `Tarea.motivo_devolucion?: string | null`.
- **Colores**: aplico la paleta semántica del prompt (borde + bg + badge).
  Solo añado los estilos de `devuelta` y `por-revisar` donde aún no existen;
  el resto (haciendola, pausada, revision, completada) ya se renderiza.
- **Estimación**: callers a auditar — `TareaModal`, `Brujula`,
  `CerrarTareaDialog`, `CrearModal`. Todos pasan ya `useTareas()`; solo
  añado `categoria` al `parcial`.
- **RLS / queries de revisión**: las 3 nuevas vistas leen `tareas` con
  joins a `clientes` cuando hace falta filtrar por PM. Si las policies
  actuales no permiten al PM leer tareas de otros responsables, lo
  registro como hallazgo en una nota de tarea y propongo migración
  separada — NO toco RLS en este sprint salvo que sea imprescindible.
- **routeTree.gen.ts**: no se toca a mano; el plugin lo regenera al
  añadir las 3 rutas nuevas.

## Verificación

Al terminar reviso build, abro consola en preview y compruebo los 12
escenarios del prompt. Listaré los archivos tocados al final.