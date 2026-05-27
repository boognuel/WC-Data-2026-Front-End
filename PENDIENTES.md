# Pendientes — WC-Data-2026 Front-End

## Alta prioridad

### 1. AuthGuard desactivado
`src/app/guards/auth.guard.ts` retorna `true` siempre — el guard está comentado.
- Activar la lógica existente: si no está autenticado → redirigir a `/login`
- Aplicar `canActivate: [authGuard]` a todas las rutas protegidas en `app.routes.ts`

### 2. Guard de roles
No existe. Ninguna ruta distingue entre ADMIN (1), OPERARIO (2) y USUARIO_EXTERNO (3).
- Crear `roleGuard` que verifique el rol del usuario en sesión
- USUARIO_EXTERNO no debe acceder a: Parámetros, Roles, Usuarios, Auditoría
- Solo ADMIN puede desbloquear usuarios y modificar roles/parámetros

### 3. Flujo CONTRASENA_EXPIRADA incompleto
El login detecta HTTP 202 pero solo muestra texto. Falta:
- Componente `CambiarContrasenaComponent`
- Ruta `/cambiar-contrasena`
- Método en `UsuarioService`: `POST /usuario/cambiarContrasena`
- Redirección automática desde login al recibir 202

### 4. Registro de usuario externo
No existe componente ni ruta de registro. Falta:
- Ruta pública `/registro` (sin guard)
- Componente con campos: username, password, nombreapellido, **email (obligatorio)**
- Método en `UsuarioService`: `POST /usuario/registro`
- El modelo `UsuarioRequest` debe incluir campo `email`

---

## Media prioridad

### 5. Modelo Usuario sin campo email
`UsuarioModel` / `UsuarioRequest` y `UsuarioResponse` no tienen campo `email`.
- Agregar `email: string` a ambos modelos
- Mostrarlo en el formulario de usuarios (requerido en `/registro`, opcional en `/saveUsuario`)

### 6. Gráficas (REQ 7)
El componente de reportes solo tiene tabla de posiciones en texto. Falta:
- Integrar librería (ng2-charts + Chart.js o similar)
- Gráfica de goles por equipo
- Gráfica de partidos por fase

### 7. HttpInterceptor
No hay interceptor HTTP. Si el backend requiere headers de sesión/token en el futuro, todos los servicios fallarán.
- Crear interceptor que adjunte credenciales o token de sesión

---

## Baja prioridad

### 8. Navbar no respeta roles
Todos los links visibles para cualquier usuario.
- Ocultar Parámetros / Roles / Usuarios / Auditoría a USUARIO_EXTERNO
- Considerar ocultar acciones de escritura a roles sin permiso
