# Configuración de Airtable para Presupuestoya

Guía completa para crear la estructura de base de datos en Airtable que alojará leads y profesionales, permitiendo enrutamiento automático por región.

## 📋 Estructura General

La base de datos Airtable tendrá 3 tablas principales:

```
Presupuestoya Base
├── Leads              (Nuevos leads del formulario)
├── Professionals      (Base de profesionales/proveedores)
└── Regions            (Mapeo de CP a profesionales)
```

---

## 📊 Tabla 1: Leads

Almacena los leads recibidos del formulario.

### Crear la tabla
1. Abre tu base Airtable
2. Click en "+" → "Add a table"
3. Nombre: `Leads`

### Campos (columnas)

| Campo | Tipo | Descripción | Notas |
|-------|------|-------------|-------|
| **Name** | Single line text | Nombre del cliente | Obligatorio |
| **Email** | Email | Email del cliente | Obligatorio |
| **Phone** | Phone number | Teléfono | Formato: +34 |
| **PostalCode** | Single line text | Código postal | 5 dígitos |
| **Region** | Single line text | Región detectada | Madrid, Barcelona, etc. |
| **ClosureType** | Single select | Tipo de cerramiento | ventanas, puertas, etc. |
| **Message** | Long text | Detalles adicionales | Opcional |
| **Status** | Single select | Estado del lead | New, Assigned, In Progress, Completed, Rejected |
| **AssignedTo** | Link to another record | Profesional asignado | Link a tabla Professionals |
| **DateReceived** | Date & time | Fecha/hora de recepción | Auto, set by Airtable |
| **DateAssigned** | Date & time | Fecha de asignación | Auto cuando se asigna |
| **Notes** | Long text | Notas internas | Para el equipo |
| **Source** | Single line text | Origen del lead | presupuestoya-web |

### Configuración de Campos

**Name**
- Type: Single line text
- Required: ✓ Sí

**Email**
- Type: Email
- Required: ✓ Sí

**Phone**
- Type: Phone number
- Format: International (+1 555 123 4567)
- Required: ✓ Sí

**PostalCode**
- Type: Single line text
- Length: 5
- Required: ✓ Sí

**Region**
- Type: Single line text
- Required: ✓ Sí

**ClosureType**
- Type: Single select
- Options:
  - Ventanas (Windows)
  - Puertas (Doors)
  - Cerramientos (Enclosures)
  - Divisiones (Glass Divisions)
  - Armarios (Wardrobes)
  - Otro (Other)
- Required: ✓ Sí

**Status**
- Type: Single select
- Options:
  - 🆕 New (Blue)
  - 📍 Assigned (Green)
  - ⏳ In Progress (Yellow)
  - ✅ Completed (Green)
  - ❌ Rejected (Red)
- Default: New
- Required: ✓ Sí

**AssignedTo**
- Type: Link to another record
- Link to: Professionals
- Allow linking to multiple records: No
- Display as: Expand record

**DateReceived**
- Type: Date & time
- Date format: YYYY-MM-DD
- Include time: ✓ Yes (HH:mm)
- Timezone: Europe/Madrid
- Auto-populate: ✓ Yes (Today's date)

**Source**
- Type: Single line text
- Default: presupuestoya-web

---

## 👥 Tabla 2: Professionals

Base de datos de profesionales/proveedores por región.

### Crear la tabla
1. Click en "+" → "Add a table"
2. Nombre: `Professionals`

### Campos (columnas)

| Campo | Tipo | Descripción | Notas |
|-------|------|-------------|-------|
| **Name** | Single line text | Nombre del profesional | Obligatorio |
| **Email** | Email | Email de contacto | Obligatorio |
| **Phone** | Phone number | Teléfono | Obligatorio |
| **Company** | Single line text | Nombre de empresa | Opcional |
| **Region** | Link to another record | Regiones que cubre | Link a Regions |
| **Specialties** | Multiple select | Especialidades | ventanas, puertas, etc. |
| **Status** | Single select | Estado del profesional | Active, Inactive, On Leave |
| **LeadsAssigned** | Link to another record | Leads asignados | Link a Leads (reverse) |
| **LeadsCompleted** | Count | Leads completados | Formula: countall(LeadsAssigned) |
| **Rating** | Rating | Calificación | 1-5 estrellas |
| **MaxLeadsPerDay** | Number | Límite de leads/día | Default: 5 |
| **CurrentLeadsToday** | Count | Leads asignados hoy | Fórmula automática |
| **Available** | Checkbox | ¿Disponible? | Checked = disponible |
| **Notes** | Long text | Notas | Información adicional |
| **DateJoined** | Date | Fecha de registro | |

### Configuración de Campos

**Name**
- Type: Single line text
- Required: ✓ Sí

**Email**
- Type: Email
- Required: ✓ Sí

**Phone**
- Type: Phone number
- Required: ✓ Sí

**Company**
- Type: Single line text
- Required: No

**Region**
- Type: Link to another record
- Link to: Regions
- Allow linking to multiple records: ✓ Yes
- Display as: Pills

**Specialties**
- Type: Multiple select
- Options:
  - Ventanas (Windows)
  - Puertas (Doors)
  - Cerramientos (Enclosures)
  - Divisiones (Glass Divisions)
  - Armarios (Wardrobes)

**Status**
- Type: Single select
- Options:
  - 🟢 Active (Green)
  - 🔴 Inactive (Red)
  - 🟡 On Leave (Yellow)
- Default: Active

**LeadsAssigned**
- Type: Link to another record
- Link to: Leads (campo AssignedTo)
- Allow multiple: ✓ Yes
- Lookup fields: Show Name, Email

**Rating**
- Type: Rating
- Max: 5 stars
- Color: Yellow

**MaxLeadsPerDay**
- Type: Number
- Default: 5
- Minimum: 1
- Maximum: 20

**Available**
- Type: Checkbox
- Checkbox label: Available
- Default checked: ✓ Yes

---

## 🗺️ Tabla 3: Regions

Mapeo de códigos postales a regiones y profesionales.

### Crear la tabla
1. Click en "+" → "Add a table"
2. Nombre: `Regions`

### Campos (columnas)

| Campo | Tipo | Descripción | Notas |
|-------|------|-------------|-------|
| **Name** | Single line text | Nombre región | Madrid, Barcelona, etc. |
| **PostalCodePrefix** | Single line text | Prefijo CP | 28, 08, 41, etc. |
| **Professionals** | Link to another record | Profesionales en región | Link a Professionals |
| **LeadsCount** | Count | Total de leads | Fórmula automática |
| **ActiveProfessionals** | Count | Profesionales activos | Fórmula |
| **AverageResponseTime** | Number | Tiempo respuesta promedio | En horas |
| **Commission** | Percent | Comisión por lead | Default: 10% |
| **Notes** | Long text | Notas | Información región |

### Configuración de Campos

**Name**
- Type: Single line text
- Required: ✓ Sí
- Options: Madrid, Barcelona, Sevilla, Valencia, etc.

**PostalCodePrefix**
- Type: Single line text
- Length: 2
- Required: ✓ Sí
- Examples: 28, 08, 41, 46, 29

**Professionals**
- Type: Link to another record
- Link to: Professionals
- Allow multiple: ✓ Yes

**LeadsCount**
- Type: Count
- Count: Leads where Region = this region

**ActiveProfessionals**
- Type: Count
- Condition: Professionals where Status = Active

---

## 🔗 Relaciones (Lookups)

### En tabla Leads
Agrega campos de lookup para ver datos del profesional asignado:

1. Click en "+" para agregar campo
2. Type: Lookup
3. Link field: AssignedTo
4. Fields to lookup:
   - Email
   - Phone
   - Company
   - Rating

**Nombre de campo**: `ProfessionalDetails`

### En tabla Professionals
Agrega lookup para ver leads asignados:

1. Click en "+" para agregar campo
2. Type: Lookup
3. Link field: LeadsAssigned
4. Fields to lookup:
   - Name
   - Email
   - Region
   - ClosureType

**Nombre de campo**: `MyLeads`

---

## 📊 Vistas Recomendadas

### En tabla Leads

**Vista 1: Por Estado**
- Type: Grid
- Group by: Status
- Filter: Status is not empty
- Sort: DateReceived (Descending)

**Vista 2: Pendientes de Asignar**
- Type: Grid
- Filter: Status = "New"
- Sort: DateReceived (Ascending)

**Vista 3: Por Región**
- Type: Grid
- Group by: Region
- Filter: Status ≠ Rejected

**Vista 4: Calendario**
- Type: Calendar
- Field: DateReceived

### En tabla Professionals

**Vista 1: Disponibles**
- Type: Grid
- Filter: Status = Active AND Available = Checked
- Sort: LeadsCompleted (Descending)

**Vista 2: Por Región**
- Type: Grid
- Group by: Region

**Vista 3: Rendimiento**
- Type: Gallery
- Sort by: Rating (Descending)
- Show: Name, Company, Rating, LeadsCompleted

---

## 📝 Datos de Ejemplo

### Leads (3 ejemplos)

```
| Name | Email | Phone | PostalCode | Region | ClosureType | Status |
|------|-------|-------|-----------|--------|-------------|--------|
| Juan García | juan@email.com | +34 612345678 | 28001 | Madrid | Ventanas | New |
| Maria López | maria@email.com | +34 623456789 | 08001 | Barcelona | Puertas | Assigned |
| Carlos Ruiz | carlos@email.com | +34 634567890 | 41001 | Sevilla | Cerramientos | In Progress |
```

### Professionals (3 ejemplos)

```
| Name | Email | Company | Region | Specialties | Status | Available |
|------|-------|---------|--------|-------------|--------|-----------|
| Jose Martinez | jose@windows.es | Windows Spain | Madrid | Ventanas, Divisiones | Active | ✓ |
| Ana Garcia | ana@vidrio.es | Vidrio Barcelona | Barcelona | Cerramientos, Armarios | Active | ✓ |
| Pedro López | pedro@sevilla.es | Cerramientos Andalucia | Sevilla | Ventanas, Puertas | Active | ✓ |
```

### Regions (3 ejemplos)

```
| Name | PostalCodePrefix | Commission |
|------|------------------|------------|
| Madrid | 28 | 10% |
| Barcelona | 08 | 12% |
| Sevilla | 41 | 10% |
```

---

## ✅ Setup Checklist

- [ ] Crear tabla Leads con todos los campos
- [ ] Crear tabla Professionals con todos los campos
- [ ] Crear tabla Regions con todos los campos
- [ ] Vincular Leads.AssignedTo → Professionals
- [ ] Vincular Professionals.Region → Regions
- [ ] Agregar campos lookup en Leads
- [ ] Agregar campos lookup en Professionals
- [ ] Crear vistas Grid, Group by Status/Region
- [ ] Agregar datos de ejemplo (regiones, profesionales)
- [ ] Conectar n8n con Airtable (API token)
- [ ] Probar flujo end-to-end

---

## 🔑 Obtener Credenciales Airtable

Para conectar n8n con Airtable:

### Paso 1: Obtener Personal Access Token

1. Abre: https://airtable.com/account/tokens
2. Click en "Create new token"
3. Dale nombre: "Presupuestoya n8n"
4. Permisos necesarios:
   - data.records:read
   - data.records:write
5. Click "Create token"
6. **Copia el token** (no podrás verlo después)

### Paso 2: Obtener Base ID

1. Ve a tu base Airtable
2. URL: `https://airtable.com/appXXXXXXXXXXXX/...`
3. El ID es: `appXXXXXXXXXXXX`

### Paso 3: Obtener Table IDs

1. Abre la tabla Leads
2. URL: `https://airtable.com/appXXXX/tblYYYYYYYYYYY/...`
3. El ID es: `tblYYYYYYYYYYY`
4. Repite para Professionals y Regions

---

## 🔐 Seguridad

### En n8n
- Usa "Airtable" credential type
- Guarda API token de forma segura
- No compartas el token

### En Airtable
- Limita permisos del token a solo lectura/escritura
- Revoca tokens no usados
- Usa diferentes tokens para dev/prod

---

## 📞 Próximos Pasos

1. ✅ Crear las 3 tablas
2. ✅ Configurar campos y relaciones
3. ✅ Agregar datos de ejemplo
4. ✅ Conectar con n8n
5. ✅ Probar workflow completo

---

**Última actualización**: 2024-08-13
**Versión**: 1.0
