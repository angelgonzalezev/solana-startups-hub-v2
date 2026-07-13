# Product Release Checklist - Solana Startups Hub

## Agent Context Guide

Open this file when validating whether the current implementation satisfies the MVP release checklist. This file is for QA state, not product definition. If you need task status, use `docs/delivery/TASK_BACKLOG.md`; if you need product rules, start with `MVP_SPEC.md`.

Este documento valida el estado real de la plataforma y las comprobaciones necesarias antes de una release.

## 1. Fundamentos y Auth

- [x] Rutas de producto implementadas (`/startups`, `/dashboard`, etc.)
- [x] Solana Wallet Standard SIWS y sesiones Supabase SSR implementadas
- [x] `AuthGate` protegiendo marketplace y dashboard
- [x] Landing sin estadísticas, partners, escala o capacidades ficticias

## 2. Perfil de Usuario

- [x] Pantalla `/dashboard/profile` funcional
- [x] Validación de perfil mínimo (Display Name, Job Title)
- [x] Bloqueo de creación de startup si el perfil está incompleto
- [x] Perfil, avatar y redes sociales persistidos en Supabase

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

- [x] Landing, Marketplace, Dashboard y pantallas protegidas adaptadas para anchos móviles
- [x] Marketplace mobile usa un drawer de filtros y las tarjetas no superponen badges o acciones
- [x] Dashboard mobile usa tabs desplazables y los formularios no quedan tapados por acciones sticky
- [x] Empty states en marketplace, dashboard y contacto
- [x] Loading states durante la carga de servicios
- [x] Estética visual coherente con la landing page (Solana dark mode)
- [x] `npm test`, lint, formato, TypeScript y build ejecutados correctamente el 2026-07-13
- [x] Landing, Marketplace y rutas principales de Dashboard responden HTTP 200 en local
- [ ] Capturas automatizadas desktop/mobile pendientes de un navegador disponible en el entorno de QA

## 8. Imágenes Gestionadas

- [ ] Avatar y logo aceptan JPG, PNG y WebP de hasta 2 MB (pendiente QA interactiva)
- [ ] Recorte 1:1 con preview y salida WebP de 512x512 (pendiente QA interactiva)
- [ ] Sustitución y eliminación conservan los datos anteriores si falla el guardado (pendiente QA con Storage)
- [ ] Políticas de Storage restringen mutaciones al prefijo del propietario (pendiente ejecutar pgTAP)
- [x] URLs externas heredadas mantienen compatibilidad de renderizado

---

## Decisiones Técnicas Pendientes

Las siguientes capacidades permanecen fuera del flujo de producción actual:

1. **Reviewer workflow**: sustituir el simulador de desarrollo por operaciones controladas de revisión.
2. **Verificación**: implementar validación real de DNS/dominio e integración con la API de X.
3. **Mensajería**: decidir e implementar comunicación wallet-to-wallet.
4. **Analytics**: incorporar medición de eventos cuando se elija un proveedor.
5. **Notificaciones**: implementar alertas para cambios de estado en verificación.
