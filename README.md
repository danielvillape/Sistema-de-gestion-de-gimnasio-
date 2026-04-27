# Gym Management — Proyecto final (ITM)

Sistema web full-stack de gestión de gimnasio: **miembros**, **entrenadores**, **clases**, **membresías** e **inscripciones** (N:M entre miembro y clase), alineado con la rúbrica de Programación Web (.NET 8 + frontend moderno).

## Integrantes

- _(Agregar nombres de los 3 integrantes del grupo)_

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Backend | .NET 8 Web API, capas **Domain**, **DataAccess**, **API** |
| ORM | Entity Framework Core 8 (SQLite, code-first, migraciones) |
| Patrones | Generic Repository, servicios de dominio con validaciones, DTOs + **AutoMapper** |
| API | Swagger / OpenAPI, autenticación **JWT** (roles Admin, Staff, Member) |
| Frontend | React 18 + TypeScript + Vite, React Router |

## Requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) y npm (para el frontend)

## Cómo ejecutar el backend

Desde la raíz del repositorio:

```powershell
dotnet restore
dotnet run --project src/GymManagement.API/GymManagement.API.csproj --launch-profile http
```

Use el perfil **`http`** para que la API quede en `http://localhost:5093` y coincida con el proxy del frontend (Vite).

- API HTTP: `http://localhost:5093` (perfil `http` en `launchSettings.json`)
- Swagger: `http://localhost:5093/swagger`

Al iniciar, se aplican **migraciones** y el **DataSeeder** crea datos de prueba si la base está vacía.

### Usuarios de prueba (contraseña común: `Admin123!`)

| Email | Rol |
|--------|-----|
| `admin@gym.local` | Admin |
| `staff@gym.local` | Staff |
| `ana.member@gym.local` | Member (con perfil miembro) |
| `carlos.member@gym.local` | Member |

## Cómo ejecutar el frontend

```powershell
cd gym-client
npm install
npm run dev
```

Abrir `http://localhost:5173`. El proxy de Vite reenvía `/api` al backend en `http://localhost:5093`; **deje la API en ejecución** en otra terminal.

Inicie sesión con `admin@gym.local` / `Admin123!` para ver panel, miembros, clases y membresías.

## Estructura del backend

- `src/GymManagement.Domain`: entidades, enums, DTOs, interfaces de repositorio y servicios, implementación de servicios, perfil AutoMapper.
- `src/GymManagement.DataAccess`: `GymDbContext`, `GenericRepository<T>`, migraciones EF, `GymDataSeeder`.
- `src/GymManagement.API`: controladores REST, JWT, Swagger, registro de dependencias.

## Dominio implementado

- Relaciones **1:N**: entrenador → clases; miembro → membresías.
- Relación **N:M**: miembro ↔ clase mediante **Enrollment**.
- Enums: `MembershipType`, `ClassEventType` (tipo de sesión/evento), `EnrollmentStatus`, `UserRole`.
- Clases con **día de la semana**, **hora inicio/fin** y **capacidad máxima**; inscripciones validan cupo y duplicados.

## Migraciones (referencia)

```powershell
dotnet ef migrations add NombreMigracion --project src/GymManagement.DataAccess --startup-project src/GymManagement.API --output-dir Migrations
```

## Notas para sustentación

- Los endpoints protegidos requieren **Bearer token** (botón *Authorize* en Swagger).
- Los miembros con rol `Member` solo pueden crear/cancelar inscripciones **para su propio** `memberId` (claim en el JWT).
