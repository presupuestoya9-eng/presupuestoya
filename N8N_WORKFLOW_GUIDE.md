# Guía Completa del Workflow n8n Presupuestoya

Workflow de automatización completo que recibe leads, valida datos, busca profesionales disponibles, asigna automáticamente y envía notificaciones.

## 📊 Flujo General del Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      LEAD ARRIVAL FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1️⃣ RECEIVE
   └─ Webhook Trigger
      └─ Recibe POST del formulario Presupuestoya

2️⃣ VALIDATE
   └─ Validate & Enrich Data
      └─ Limpia y enriquece datos del lead
   └─ Check Required Fields
      └─ Verifica email, nombre, CP

3️⃣ IDENTIFY REGION
   └─ Get All Regions from Airtable
      └─ Obtiene tabla de regiones
   └─ Match Region by Postal Code
      └─ Detecta región por prefijo CP

4️⃣ FIND PROFESSIONAL
   └─ Get Available Professionals
      └─ Obtiene profesionales activos
   └─ Select Best Professional
      └─ Filtra por región + especialidad + rating

5️⃣ ASSIGN & NOTIFY
   ├─ IF Professional Found:
   │  └─ Create Lead (With Assignment)
   │  └─ Send Email to Lead
   │  └─ Send Email to Professional
   │
   └─ ELSE:
      └─ Create Lead (Manual Review)
      └─ Alert Admin

6️⃣ ERROR HANDLING
   └─ Validation Error
      └─ Alert Admin
```

---

## 📥 Paso 1: Importar Workflow

### Opción A: Importar JSON (Recomendado)

1. Abre n8n: `https://tu-instancia.n8n.cloud`
2. Click en "Workflows" → "Import"
3. Selecciona archivo: `n8n-workflow-complete.json`
4. Click "Import"
5. El workflow se carga automáticamente

### Opción B: Crear Manualmente

Si prefieres crear desde cero, sigue los pasos en la sección "Crear Workflow Manual".

---

## 🔑 Paso 2: Configurar Credenciales

### Airtable OAuth2

1. En el workflow, selecciona cualquier nodo "Airtable"
2. Click en "Create New Credential"
3. Type: "Airtable"
4. Click en "Sign in to Airtable"
5. Autoriza n8n para acceder a Airtable
6. Confirma la base de datos: tu base "Presupuestoya"

**Credenciales Guardadas**: n8n guarda automáticamente

### Email SMTP (Gmail, SendGrid, etc.)

1. Selecciona un nodo "Email Send"
2. Click en "Credentials"
3. **Opción A: Gmail**
   ```
   Type: Gmail
   Email: tu-email@gmail.com
   Click "Sign in"
   Autoriza n8n
   ```

4. **Opción B: SMTP Personalizado**
   ```
   Type: SMTP
   Host: smtp.gmail.com (o tu servidor)
   Port: 587
   User: tu-email@gmail.com
   Password: tu-contraseña
   Encryption: STARTTLS
   ```

---

## ⚙️ Paso 3: Configurar Nodos Específicos

### Nodo 1: Webhook

**Ya viene preconfigurado**, pero verifica:

```
HTTP Method: POST
Path: presupuestoya
Response Code: 200
```

**Tu URL será**:
```
https://tu-instancia.n8n.cloud/webhook/presupuestoya
```

### Nodo 2: Validate & Enrich Lead Data

**Código preconfigurado**: Limpia y formatea datos

No requiere cambios, pero puedes ver el código:
```javascript
// Normaliza email, teléfono, código postal
// Asegura que todos los datos están limpios
```

### Nodo 3: Check Required Fields

**Valida**:
- Name (no vacío)
- Email (no vacío)
- PostalCode (no vacío)

### Nodo 4: Get All Regions

**Conectar a Airtable**:
1. Click en nodo
2. Credentials: Selecciona tu Airtable connection
3. Base: Selecciona "Presupuestoya" base
4. Table: Selecciona "Regions"
5. Fields: Name, PostalCodePrefix

### Nodo 5: Match Region by Postal Code

**Código preconfigurado**: Encuentra región por CP

```javascript
// Extrae primeros 2 dígitos del CP
// Busca coincidencia en tabla Regions
// Retorna nombre de región
```

### Nodo 6: Get Available Professionals

**Conectar a Airtable**:
1. Credentials: Tu Airtable
2. Base: "Presupuestoya"
3. Table: "Professionals"
4. Filter: `AND({Status} = 'Active', {Available} = TRUE())`
5. Fields: Name, Email, Phone, Region, Specialties, Rating

### Nodo 7: Select Best Professional

**Código preconfigurado**: Filtra y ordena por rating

```javascript
// Filtra por:
//   - Región coincide
//   - Especialidad (o sin restricción)
// Ordena por Rating (mayor primero)
// Retorna el mejor profesional
```

### Nodo 8: Professional Found?

**Condición**:
```
professonalNotFound = False
```

Si FALSE → rama 1 (Asignar)
Si TRUE → rama 2 (Revisar manual)

### Nodo 9: Create Lead (With Assignment)

**Conectar a Airtable**:
1. Credentials: Tu Airtable
2. Base: "Presupuestoya"
3. Table: "Leads"
4. Operation: "Create Record"
5. Fields (mapear):
   ```
   Name → {{$json.name}}
   Email → {{$json.email}}
   Phone → {{$json.phone}}
   PostalCode → {{$json.postalCode}}
   Region → {{$json.detectedRegion}}
   ClosureType → {{$json.closureType}}
   Message → {{$json.message}}
   Status → "Assigned"
   AssignedTo → {{$json.assignedProfessionalId}}
   Source → "presupuestoya-web"
   ```

### Nodo 10: Create Lead (Manual Review)

**Similar a Nodo 9**, pero:
- Status: "New" (no "Assigned")
- Sin AssignedTo
- Message agrega: "[MANUAL REVIEW REQUIRED]"

### Nodo 11: Send Email to Lead

**Configurar SMTP**:
1. Credentials: Tu SMTP/Gmail
2. To Email: `{{$json.email}}`
3. From Email: `noreply@presupuestoya.com`
4. Subject: `✓ Tu solicitud de presupuesto ha sido recibida`
5. Body: HTML personalizado (viene preconfigurado)

**Personalización**:
- Cambiar email "From"
- Cambiar firma (nombre empresa)
- Cambiar colores HTML

### Nodo 12: Send Email to Professional

**Similar a Nodo 11**:
- To Email: `{{$json.assignedProfessionalEmail}}`
- Subject: `🔔 Nuevo Lead Asignado: {{$json.name}}`
- Body: Notifica al profesional sobre el nuevo lead

### Nodo 13: Alert Admin - No Professional Available

**Similar**, pero:
- To Email: `admin@presupuestoya.com`
- Subject: `⚠️ Lead Sin Profesional Disponible`
- Notifica si no hay profesionales

### Nodo 14: Alert Admin - Validation Error

**Similar**:
- To Email: `admin@presupuestoya.com`
- Subject: `❌ Lead Rechazado - Datos Inválidos`
- Se ejecuta si fallan validaciones

---

## 🧪 Paso 4: Probar el Workflow

### Prueba 1: Desde Panel Admin

1. Abre: `admin-config.html`
2. Pega tu URL de webhook en el panel
3. Completa datos de prueba
4. Haz clic: "🧪 Enviar Prueba"
5. En n8n, verás la ejecución en vivo

### Prueba 2: Directamente en n8n

1. En el nodo Webhook, click en "Test"
2. Agrega JSON de test:
   ```json
   {
     "name": "Juan García",
     "email": "juan@test.com",
     "phone": "+34 612345678",
     "postalCode": "28001",
     "region": "Madrid",
     "closureType": "ventanas",
     "message": "Prueba desde n8n"
   }
   ```
3. Click "Execute"
4. Verifica que:
   - Se crea lead en Airtable
   - Se envía email al cliente
   - Se envía email al profesional

### Prueba 3: Desde Formulario Real

1. Abre: `http://localhost:3000`
2. Llena el formulario con datos reales
3. Envía
4. Verifica en:
   - Airtable (tabla Leads)
   - Gmail del cliente (debe recibir email)
   - Gmail del profesional (debe recibir email)

---

## 📋 Datos de Test Recomendados

### Test 1: Madrid (Profesional Encontrado)

```json
{
  "name": "Pedro Martínez",
  "email": "pedro@test.com",
  "phone": "+34 691234567",
  "postalCode": "28001",
  "region": "Madrid",
  "closureType": "ventanas",
  "message": "Quiero 5 ventanas de aluminio"
}
```

**Resultado esperado**:
- Lead creado con Status "Assigned"
- Email al cliente
- Email al profesional de Madrid

### Test 2: Sin Profesional Disponible

```json
{
  "name": "María Sánchez",
  "email": "maria@test.com",
  "phone": "+34 612345678",
  "postalCode": "99999",
  "region": "Unknown",
  "closureType": "armarios",
  "message": ""
}
```

**Resultado esperado**:
- Lead creado con Status "New"
- Email de alerta al admin
- Sin asignación

### Test 3: Datos Inválidos

```json
{
  "name": "",
  "email": "invalido",
  "phone": "123",
  "postalCode": "abc"
}
```

**Resultado esperado**:
- Lead rechazado
- Email de alerta al admin
- No se crea en Airtable

---

## 🔍 Monitoreo y Debugging

### Execution History

1. En n8n, click en "Execution History"
2. Verás todas las ejecuciones del webhook
3. Click en una ejecución para ver:
   - Input (datos recibidos)
   - Output (datos procesados)
   - Errores (si los hay)

### Logs de Errores

**Si falla el workflow**:

1. Click en la ejecución fallida
2. Busca el nodo rojo (error)
3. Verifica el mensaje de error
4. Soluciona:
   - Credenciales incorrectas → Reconecta
   - Campo no existe → Verifica en Airtable
   - Email inválido → Verifica SMTP

### Debugging Manual

En cada nodo Code, puedes agregar `console.log()`:

```javascript
console.log('Region:', $json.detectedRegion);
console.log('Professionals:', matchedProfessionals.length);
```

Verifica en Execution History → Output

---

## 🔐 Seguridad y Mejores Prácticas

### Credenciales
- ✅ Guardadas encriptadas en n8n
- ✅ Nunca compartas en código
- ✅ Revoca tokens si es necesario

### API Rate Limiting
- Airtable: 30 requests/segundo
- El workflow envía ~3-5 requests por lead
- Máximo 6000 leads/hora (seguro)

### Validación de Datos
- ✅ Email validado
- ✅ Teléfono formateado
- ✅ CP verificado
- ✅ Campos obligatorios chequeados

### Email Notifications
- ✅ Emails normalizados (no spam)
- ✅ HTML seguro
- ✅ Sin datos sensibles en logs

---

## 🚀 Mejoras Futuras

### 1. Notificaciones por SMS
```
Agrega nodo "Twilio - Send SMS"
Notifica profesionales por WhatsApp
```

### 2. Slack Notifications
```
Agrega nodo "Slack - Send Message"
Alerta en #new-leads
```

### 3. Automático Follow-up
```
Agrega trigger por tiempo
Si lead no contactado en 24h → re-notificar
```

### 4. Calificación Automática
```
Si profesional no responde en 48h → Declinar
Si cliente no responde en 72h → Cerrar
```

### 5. Integración con CRM
```
Sync con Salesforce/Pipedrive
Sincronización bidireccional
```

---

## 📞 Troubleshooting

### Error: "Airtable Credential Invalid"
```
Solución:
1. Ve a Credentials
2. Selecciona Airtable credential
3. Click "Re-authenticate"
4. Sigue flujo OAuth nuevamente
```

### Error: "Table not found"
```
Solución:
1. Verifica nombre exacto en Airtable
2. Verifica que tienes permisos
3. Reconecta la credencial
```

### Emails no se envían
```
Solución:
1. Verifica credenciales SMTP
2. Verifica que email "From" es válido
3. Revisa logs SMTP para errores
4. Prueba con test SMTP
```

### Profesional no se encuentra
```
Solución:
1. Verifica tabla Professionals tiene datos
2. Verifica profesional tiene Status = Active
3. Verifica profesional tiene Region asignada
4. Verifica especialidad coincide
```

### Lead no se crea en Airtable
```
Solución:
1. Verifica campos requeridos en Airtable
2. Verifica tipos de datos coinciden
3. Verifica que Airtable allows create records
4. Revisa error en Airtable node
```

---

## 📊 Métricas a Monitorear

1. **Total Leads Recibidos**: Suma registros en tabla Leads
2. **Leads Asignados**: Count Status = "Assigned"
3. **Leads Pendientes**: Count Status = "New"
4. **Tasa de Asignación**: Assigned / Total
5. **Tiempo Respuesta Profesional**: DateAssigned - DateReceived
6. **Tasa Conversión**: Completed / Total

---

## 🎓 Próximos Pasos

1. ✅ Importar workflow
2. ✅ Configurar credenciales (Airtable, Email)
3. ✅ Verificar nodos conectados correctamente
4. ✅ Hacer pruebas (panel admin + formulario real)
5. ✅ Monitorear execution history
6. ✅ Ajustar emails y mensajes
7. ✅ Implementar mejoras futuras

---

**Última actualización**: 2024-08-13
**Versión**: 1.0
**Autor**: Presupuestoya Dev Team
