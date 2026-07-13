# MVP v1.0 Release Checklist - Solana Startups Hub

## Agent Context Guide

Open this file when validating whether the current implementation satisfies the MVP release checklist. This file is for QA state, not product definition. If you need task status, use `docs/delivery/TASK_BACKLOG.md`; if you need product rules, start with `MVP_SPEC.md`.

Este documento valida el cumplimiento de los requisitos del MVP v1.0 según la especificación.

## 1. Fundamentos y Auth

- [x] Rutas de producto implementadas (`/startups`, `/dashboard`, etc.)
- [x] Mock Wallet Auth funcional (Marco Vulcan como default)
- [x] `AuthGate` protegiendo marketplace y dashboard
- [x] Landing page alineada con messaging v1 (no promesas de trading/pagos)

## 2. Perfil de Usuario

- [x] Pantalla `/dashboard/profile` funcional
- [x] Validación de perfil mínimo (Display Name, Job Title)
- [x] Bloqueo de creación de startup si el perfil está incompleto
- [x] Almacenamiento mock de redes sociales (X, Telegram)

## 3. Gestión de Startups (Founder)

- [x] Dashboard principal con resumen y stats
- [x] Creación de startup en estado `draft`
- [x] Edición de startups propias
- [x] Archivar startups (oculta de marketplace)
- [x] Formulario con taxonomía cerrada (Stages, Categories, Tech Stack)

## 4. Verificación y Publicación

- [x] Pantalla de verificación con checklist de requisitos
- [x] Solicitud de verificación (pasa a `pending`)
- [x] Helpers de desarrollo para aprobar/rechazar verificación
- [x] Acción de `Publish` disponible solo para startups verificadas

## 5. Marketplace y Descubrimiento

- [x] Listado protegido de startups `verified + published`
- [x] Filtros combinables (Category, Stage, Tech Stack, Raising, Acquisition)
- [x] Búsqueda por nombre o keyword
- [x] Startup Cards con señales de mercado (Raising, Open to Acquisition)

## 6. Detalle y Contacto

- [x] Página de detalle protegida
- [x] `Founder Contact` mostrando redes sociales del owner
- [x] Empty state cuando el founder no tiene redes configuradas
- [x] Información pública completa (About, Stack, Categories, Metrics)

## 7. Calidad y UX

- [x] Diseño responsive en todas las pantallas nuevas
- [x] Empty states en marketplace, dashboard y contacto
- [x] Loading states durante la carga de servicios mock
- [x] Estética visual coherente con la landing page (Solana dark mode)

## 8. Imágenes Gestionadas

- [ ] Avatar y logo aceptan JPG, PNG y WebP de hasta 2 MB (pendiente QA interactiva)
- [ ] Recorte 1:1 con preview y salida WebP de 512x512 (pendiente QA interactiva)
- [ ] Sustitución y eliminación conservan los datos anteriores si falla el guardado (pendiente QA con Storage)
- [ ] Políticas de Storage restringen mutaciones al prefijo del propietario (pendiente ejecutar pgTAP)
- [x] URLs externas heredadas mantienen compatibilidad de renderizado

---

## Decisiones Técnicas Pendientes (Post-MVP / v2)

Lo siguiente ha sido implementado como **MOCK** o **SIMULADO** para el MVP y debe ser reemplazado en la fase de producción real:

1. **Autenticación**: Reemplazar `AuthContext` mock por `Solana Wallet Adapter` real.
2. **Persistencia**: Migrar de archivos JSON locales y estado en memoria a `Supabase` o `PostgreSQL`.
3. **Verificación**: Implementar validación real de DNS/Dominio e integración con la API de X (Twitter).
4. **Mensajería**: Implementar chat wallet-to-wallet mediante `XMTP` (Roadmap v2).
5. **Admin**: Crear un panel de administración real para que los revisores aprueben/rechacen startups.
6. **Analytics**: Integrar un proveedor real de analíticas en lugar de mocks.
7. **Notificaciones**: Implementar sistema de alertas para cambios de estado en verificación.
