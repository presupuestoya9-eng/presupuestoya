# Dashboard de Analytics - Airtable

Guía completa para crear un dashboard ejecutivo en Airtable que monitoree leads, conversión, distribución geográfica y rendimiento de profesionales.

---

## 📊 Tablero Principal: KPI Overview

### Vista 1: Dashboard Summary (Form View)

Esta es la vista principal que ves al abrir Airtable.

**Paso 1: Crear formulario dashboard**
1. En tabla "Leads", click "+"
2. Selecciona "Form"
3. Nombre: "📊 Dashboard Summary"
4. Click "Create"

**Paso 2: Agregar campos de resumen**

En el formulario, agrega estos campos:

```
📈 MÉTRICAS PRINCIPALES (Display Only)
├─ Total Leads Today: Count({Status} ≠ empty AND date = today)
├─ Total Leads This Week: Count({Status} ≠ empty AND date >= week start)
├─ Total Leads This Month: Count({Status} ≠ empty AND date >= month start)
│
└─ TASA DE CONVERSIÓN
  ├─ Assigned Today: Count({Status} = "Assigned" AND date = today)
  ├─ Completed Today: Count({Status} = "Completed" AND date = today)
  └─ Conversion Rate: Assigned / Total (en %)

📍 DISTRIBUCIÓN GEOGRÁFICA
├─ Top Region Today: Max count by Region
├─ Madrid Leads: Count({Region} = "Madrid")
├─ Barcelona Leads: Count({Region} = "Barcelona")
└─ Others: Count (all regions)

👥 PROFESIONALES
├─ Most Active: Professional with most leads
├─ Highest Rated: Professional with best rating
└─ Available Now: Count({Status} = "Active" AND {Available} = true)

⏰ SLA COMPLIANCE
├─ Response Time Average: Avg(DateAssigned - DateReceived)
├─ Within 24h: Count(response <= 24h)
├─ Overdue: Count({Status} = "Assigned" AND age > 24h)
└─ SLA %: (Within 24h / Total) * 100
```

---

## 📈 Vistas de Análisis

### Vista 2: Por Estado (Grid View)

```
Name: "Por Estado"
Type: Grid
Group by: Status
Sort by: DateReceived (Descending)

Filtros:
- Status ≠ empty

Campos mostrados:
- Name
- Email
- Phone
- PostalCode
- Region
- ClosureType
- AssignedTo
- DateReceived
- DateAssigned

En cada grupo:
- Muestra count automático
- Ejemplo: "Assigned (23)" "Completed (45)"
```

### Vista 3: Por Región (Grid Group By)

```
Name: "Por Región"
Type: Grid
Group by: Region (primario)
Then by: ClosureType (secundario)
Sort by: DateReceived (Descending)

Filtros:
- DateReceived >= este mes

Campos:
- Name
- Email
- Phone
- Status
- AssignedTo
- Rating (del profesional)

Propósito:
- Ver distribución geográfica
- Identificar regiones con alto volumen
- Detectar profesionales saturados por región
```

### Vista 4: Por Profesional (Grid)

```
Name: "Profesionales - Carga"
Type: Grid
Filter: {Status} = "Assigned" OR {Status} = "In Progress"

Campos:
- Name (client)
- AssignedTo (profesional)
- ClosureType
- DateAssigned
- Days Elapsed
- Status

Orden:
- Sort by: AssignedTo (para agrupar)
- Secondary: DateAssigned (oldest first)

Propósito:
- Ver carga de trabajo por profesional
- Identificar cuellos de botella
- Detectar sobrecarga
```

### Vista 5: Leads Críticos (Calendar)

```
Name: "🔔 Críticos - Timeline"
Type: Calendar
Date field: DateAssigned
Filter: {Status} = "Assigned" AND {DateAssigned} <= TODAY()-1

Propósito:
- Ver visualmente leads sin respuesta
- Días antiguos = más oscuro (urgencia)
- Click para detalles
```

### Vista 6: Conversión en Tiempo Real (Form)

```
Name: "Conversión - KPIs"
Type: Form (read-only)

Mostrar:
- Leads totales: COUNT({Status} ≠ empty)
- Asignados: COUNT({Status} = "Assigned")
- En progreso: COUNT({Status} = "In Progress")
- Completados: COUNT({Status} = "Completed")
- Rechazados: COUNT({Status} = "Rejected")

Cálculos:
- Tasa asignación: Assigned / Total * 100%
- Tasa conversión: Completed / Assigned * 100%
- Pipeline total: $$ (si tienes estimado)
```

---

## 📊 Dashboard Profesionales

### Vista 1: Profesionales - Rendimiento

```
Name: "👥 Profesionales - Rendimiento"
Type: Gallery

Campos mostrados:
- Name (grande)
- Company
- Rating (estrellas)
- LeadsAssigned (count)
- Status badge (Active/Inactive)
- Region tags

Sort by: Rating (Desc)

Propósito:
- Ver top performers
- Quick visual identification
- Performance at a glance
```

### Vista 2: Profesionales - Disponibilidad

```
Name: "✅ Profesionales - Disponibles"
Type: Grid
Filter: {Status} = "Active" AND {Available} = TRUE

Campos:
- Name
- Company
- Specialties
- Region
- Rating
- MaxLeadsPerDay
- LeadsAssigned (count)
- Available (checkbox)
- Phone
- Email

Sort by: Rating (Desc)

Propósito:
- Ver quién está disponible ahora
- Quick assignment reference
- Contact details ready
```

### Vista 3: Profesionales - Carga Diaria

```
Name: "Carga de Trabajo - Hoy"
Type: Grid
Filter: {Status} = "Active"

Agregaciones (sumarias):
- COUNT(LeadsAssigned WHERE date = today)
- Por profesional

Campos:
- Name
- Leads Today: COUNT(date = today)
- Leads This Week: COUNT(date >= week start)
- Leads This Month: COUNT(date >= month start)
- Avg Response Time: AVG(time to respond)

Propósito:
- Evitar sobrecarga
- Distribuir leads equitativamente
- Detectar patterns
```

---

## 🗓️ Dashboard Temporal

### Vista 1: Calendario de Leads (Month View)

```
Name: "📅 Calendario - Entradas"
Type: Calendar
Date field: DateReceived

Propósito:
- Ver distribución de leads por día
- Identificar picos
- Planificar recursos
```

### Vista 2: Timeline - Conversión

```
Name: "Conversión - Timeline"
Type: Timeline (si está disponible)

Mostrar:
- DateReceived (start)
- DateAssigned (milestone 1)
- DateCompleted (end)

Propósito:
- Ver cuánto tarda conversión
- Comparar velocidad por región
- Identificar cuellos de botella
```

### Vista 3: Aging Report

```
Name: "Leads - Aging (Antiguedad)"
Type: Grid
Filter: {Status} = "Assigned"

Campos calculados:
- DaysOld: DATETIME_DIFF(NOW(), {DateAssigned}, 'days')
- Status Aging: 
  IF DaysOld <= 1: "🟢 Fresh (< 24h)"
  IF DaysOld <= 3: "🟡 Warm (1-3d)"
  IF DaysOld > 3: "🔴 Critical (> 3d)"

Sort by: DaysOld (DESC)

Propósito:
- Identificar leads en riesgo
- Alertar sobre delays
- Escalación automática triggers
```

---

## 🎯 Dashboard por Cerramiento

### Vista: Por Tipo de Producto

```
Name: "Por Tipo - Conversión"
Type: Grid
Group by: ClosureType

Campos:
- Name
- PostalCode
- Region
- Status
- AssignedTo
- DateReceived

Count automático:
- Total por tipo
- % del total

Propósito:
- Ver demanda por producto
- Especialización de profesionales
- Tendencias de mercado
```

---

## 📊 Campos de Fórmula Recomendados

Agrega estos campos calculados a la tabla Leads:

### Campo 1: DaysElapsed
```
Fórmula: DATETIME_DIFF(NOW(), {DateReceived}, 'days')
Tipo: Number
Propósito: Medir edad del lead
```

### Campo 2: HoursToResponse
```
Fórmula: DATETIME_DIFF({DateAssigned}, {DateReceived}, 'hours')
Tipo: Number
Propósito: Medir velocidad de asignación
```

### Campo 3: SLAStatus
```
Fórmula:
IF({Status} = "Completed", "✅ Complete",
IF(DATETIME_DIFF(NOW(), {DateReceived}, 'hours') <= 24, "🟢 On Track",
IF(DATETIME_DIFF(NOW(), {DateReceived}, 'hours') <= 48, "🟡 At Risk",
"🔴 Overdue")))

Tipo: Single line text
Propósito: Quick visual status
```

### Campo 4: RegionColor
```
Fórmula:
IF({Region} = "Madrid", "Blue",
IF({Region} = "Barcelona", "Purple",
IF({Region} = "Sevilla", "Green",
"Gray")))

Tipo: Single line text
Propósito: Colorear por región
```

### Campo 5: ProfessionalRating
```
Fórmula: 
LOOKUP({AssignedTo}, "Rating")

Tipo: Rollup / Lookup
Propósito: Ver rating del profesional desde Lead
```

---

## 🎨 Coloración y Formato

### Códigos de Color Recomendados

Por Status:
```
✅ Completed: Verde (#34a853)
🔄 In Progress: Azul (#1a73e8)
📍 Assigned: Amarillo (#fbbc04)
🆕 New: Gris (#5f6368)
❌ Rejected: Rojo (#d33b27)
```

Por Región:
```
Madrid: Azul (#4285f4)
Barcelona: Púrpura (#ab47bc)
Sevilla: Verde (#43a047)
Valencia: Naranja (#fb8c00)
Otros: Gris (#78909c)
```

Por SLA:
```
Dentro 24h: Verde (#34a853)
1-3 días: Amarillo (#fbbc04)
> 3 días: Rojo (#d33b27)
```

---

## 📈 Métricas Clave a Monitorear

### Diarias
```
□ Leads entrantes hoy
□ Leads asignados hoy
□ Conversion rate hoy
□ Respuesta promedio (horas)
□ Profesionales disponibles
```

### Semanales
```
□ Total leads semana
□ Tasa asignación %
□ Tasa conversión %
□ Leads por región
□ Lead value por professional
```

### Mensuales
```
□ MRR (si tienes pricing)
□ Total leads
□ Total conversions
□ Leads por región (ranking)
□ Top 3 profesionales
□ SLA compliance %
```

---

## 🤖 Automatización de Vistas

### Vista Dinámicas (Auto-refresh)

En cada vista, configurar auto-refresh:
1. Click en view name
2. "View options"
3. "Sort & filter"
4. Auto-refresh: Every 5 minutes (en production)

### Avisos Automáticos

En vista "Leads Críticos", agregar:
```
Si DaysOld > 2:
  Background: Rojo (#ffebee)
  Icon: 🔴
Si DaysOld > 3:
  Background: Oscuro rojo (#c62828)
  Icon: 🚨
```

---

## 📱 Mobile Optimized Views

Para ver en teléfono (campo):

### Vista: "Mobile - Hoy"
```
Type: Gallery

Campos grandes:
- Name
- Phone (clickeable)
- Status
- Region
- SLA Status

Propósito:
- Sales team en campo
- Quick access
- Large touch targets
```

---

## 🎯 Ejemplo de Setup Completo

### Paso 1: Crear vistas básicas (5 min)
- Por Estado
- Por Región
- Profesionales

### Paso 2: Agregar campos fórmula (3 min)
- DaysElapsed
- HoursToResponse
- SLAStatus

### Paso 3: Crear dashboard resumen (2 min)
- Form view con KPIs
- Coloración

### Paso 4: Optimizar (5 min)
- Auto-refresh
- Mobile view
- Permisos

**Total: 15 minutos**

---

## 📊 Ejemplos de Vistas por Rol

### Para Sales Manager
```
Vistas necesarias:
- Por Estado (para pipeline)
- Críticos (para escalación)
- Profesionales - Carga (para balanceo)
- Dashboard KPIs
```

### Para Profesional
```
Vistas necesarias:
- Mobile - Hoy (mis leads)
- Mis Leads (filter by me)
- Próximas acciones
```

### Para Admin
```
Vistas necesarias:
- Todas las anteriores
- Aging report (para escalación)
- Profesionales - Performance (para evaluación)
- Calendario (para planning)
```

### Para CEO/Directivo
```
Vistas necesarias:
- Dashboard KPIs (only)
- Por Región (growth tracking)
- Conversión Timeline (efficiency)
```

---

## 🔐 Permisos por Rol

Recomendaciones:

```
Admin:
- Acceso: Full (read + write)
- Vistas: Todas
- Editar: Sí

Sales Manager:
- Acceso: Read + write
- Vistas: Por Estado, Críticos, Profesionales
- Editar: Status, AssignedTo, Notes

Profesional:
- Acceso: Read
- Vistas: Mobile - Hoy, Mis Leads
- Editar: Status propio (In Progress, Completed)

Cliente (si aplica):
- Acceso: Read only
- Vistas: Mi Solicitud solo
- Editar: Nada
```

---

## 📞 Tips Prácticos

### Tip 1: Buscar Lead Rápido
En cualquier vista: `Ctrl+F` o `Cmd+F`
Busca por nombre, email, teléfono

### Tip 2: Exportar Datos
En vista Grid:
1. Click en ⋯
2. Download
3. Formato: CSV o Excel

### Tip 3: Imprimir Dashboard
1. Click en ⋯
2. Print
3. Formato: Optimizado para A4

### Tip 4: Compartir Vista
1. Click en share icon
2. Seleccionar view
3. Get link compartible
4. Configurar permisos

---

## 🚀 Próximos Pasos

1. ✅ Crear vistas principales (Hoy)
2. ✅ Agregar campos fórmula (Hoy)
3. ✅ Crear dashboard (Mañana)
4. ✅ Entrenar equipo (Próxima semana)
5. ✅ Optimizar basado en feedback (Ongoing)

---

**Última actualización**: 2024-08-13
**Versión**: 1.0
