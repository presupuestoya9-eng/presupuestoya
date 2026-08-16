# Guía Completa: Conectar Presupuestoya con n8n

Esta guía te ayudará a configurar un flujo de n8n que reciba leads desde el formulario de Presupuestoya y los valide/enrute por código postal.

## 🚀 Inicio Rápido (5 minutos)

### Paso 1: Crear un Webhook en n8n

1. **Abre tu instancia de n8n**
   - Dirección: `https://tu-instancia.n8n.cloud` (o tu URL local)
   - Inicia sesión con tus credenciales

2. **Crea un nuevo workflow**
   - Click en "New" o "+" → "New Workflow"
   - Dale un nombre: "Presupuestoya Lead Handler"

3. **Añade un trigger de Webhook**
   - Click en "+" para agregar nodo
   - Busca "Webhook"
   - Selecciona "Webhook" (tipo trigger)

4. **Configura el Webhook**
   - HTTP Method: `POST`
   - Path: `presupuestoya` (el sistema completa: `/webhook/presupuestoya`)
   - Copia la URL completa (verás algo como: `https://tu-instancia.n8n.cloud/webhook/presupuestoya`)

### Paso 2: Conectar en Presupuestoya

**Opción A: Panel de Administración (Recomendado)**
1. Abre: `http://localhost:3000/admin-config.html` (o la URL de tu sitio)
2. Pega la URL del webhook en el campo "URL del Webhook"
3. Haz clic en "💾 Guardar Configuración"
4. Prueba con "🧪 Enviar Prueba"

**Opción B: Editar Manualmente**
1. Abre `app.js`
2. Busca la línea con `WEBHOOK_URL`
3. Cambia a tu URL:
   ```javascript
   const CONFIG = {
       WEBHOOK_URL: 'https://tu-instancia.n8n.cloud/webhook/presupuestoya',
   };
   ```

### Paso 3: Verificar la Conexión

En el panel de Presupuestoya (`admin-config.html`):
1. Completa los campos de prueba
2. Haz clic en "🧪 Enviar Prueba"
3. Deberías ver: "✓ Envío exitoso"

En n8n:
1. El nodo webhook debe mostrar un tick verde
2. Verás los datos recibidos en el panel

---

## 📊 Flujo Completo Recomendado

Este es el workflow que recomendamos para máxima funcionalidad:

```
┌─────────────────────┐
│  Webhook Trigger    │ (Recibe lead)
│  /webhook/          │
│  presupuestoya      │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│  Airtable - Create   │ (Guarda en base de datos)
│  - Table: Leads      │
│  - Name, Email, etc. │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────┐
│  If - Postal Code       │ (Valida por región)
│  Exists?                │
└──┬──────────────────┬───┘
   │ YES              │ NO
   ▼                  ▼
┌─────────────┐   ┌──────────┐
│ Route by    │   │ Manual   │
│ Region      │   │ Review   │
└─────────────┘   └──────────┘
```

---

## 🔄 Flujo Paso a Paso

### 1. Crear el Workflow Base

```
New Workflow → Add Webhook Node
```

**Webhook Configuration:**
```json
{
  "method": "POST",
  "path": "presupuestoya",
  "responseCode": 200
}
```

### 2. Agregar Nodo Airtable (Guardar Leads)

1. Click en "+" después del webhook
2. Busca "Airtable" y selecciona
3. Configura:

**Credenciales:**
- Conecta tu cuenta de Airtable
- Selecciona tu base de datos

**Datos:**
- Operation: `Create`
- Table: `Leads` (crea esta tabla si no existe)

**Campos:**
```
- Name         → {{$json.name}}
- Email        → {{$json.email}}
- Phone        → {{$json.phone}}
- PostalCode   → {{$json.postalCode}}
- Region       → {{$json.region}}
- ClosureType  → {{$json.closureType}}
- Message      → {{$json.message}}
- Timestamp    → {{$json.timestamp}}
- Source       → {{$json.source}}
```

### 3. Agregar Validación de Código Postal

1. Agrega un nodo "If" después de Airtable
2. Condición: `$json.postalCode` is not empty
3. Si verdadero → envía a la ruta correcta
4. Si falso → registra error

### 4. Enrutamiento por Región (Opcional)

```
If Region = "Madrid"
  → Enviar a Proveedor Madrid
If Region = "Barcelona"
  → Enviar a Proveedor Barcelona
Else
  → Cola de revisión manual
```

**Ejemplo en n8n:**
```
Add "Switch" node → Condiciones por región:
- Case "Madrid": Webhook/Email a proveedor
- Case "Barcelona": Webhook/Email a proveedor
- Default: Guardar en tabla de revisión
```

### 5. Agregar Notificación por Email

Después de Airtable:
1. Agrega nodo "Gmail" o "SMTP Email"
2. Configura:
   ```
   To: sales@presupuestoya.com
   Subject: 🔔 Nuevo Lead: {{$json.name}}
   Body: 
   Nombre: {{$json.name}}
   Email: {{$json.email}}
   Teléfono: {{$json.phone}}
   Código Postal: {{$json.postalCode}}
   Región: {{$json.region}}
   Tipo: {{$json.closureType}}
   ```

### 6. Agregar Slack (Opcional)

Para notificaciones en tiempo real:
1. Agrega nodo "Slack"
2. Configura:
   ```
   Channel: #new-leads
   Text: 📌 Nuevo lead: {{$json.name}} ({{$json.closureType}})
   ```

---

## 📋 Estructura de Datos Esperada

El webhook recibirá JSON con esta estructura:

```json
{
  "timestamp": "2024-08-13T14:30:00.000Z",
  "name": "Juan García López",
  "phone": "691234567",
  "email": "juan@email.com",
  "postalCode": "28001",
  "region": "Madrid",
  "closureType": "ventanas",
  "message": "Quiero 5 ventanas de aluminio blanco",
  "source": "presupuestoya-web",
  "userAgent": "Mozilla/5.0..."
}
```

**Campos Clave:**
- `postalCode`: 5 dígitos españoles (28001, 08001, etc.)
- `region`: Detectada automáticamente (Madrid, Barcelona, etc.)
- `closureType`: ventanas | puertas | cerramientos | divisiones | armarios | otro
- `timestamp`: ISO 8601 format

---

## 🗺️ Mapeo de Regiones por Código Postal

El formulario detecta automáticamente la región:

| Prefijo | Región | Ejemplo |
|---------|--------|---------|
| 28 | Madrid | 28001 |
| 08 | Barcelona | 08001 |
| 41 | Sevilla | 41001 |
| 46 | Valencia | 46001 |
| 29 | Málaga | 29001 |
| 39 | Cantabria | 39001 |
| 48 | Vizcaya | 48001 |
| 20 | Guipúzcoa | 20001 |
| 01 | Álava | 01001 |
| 06 | Badajoz | 06001 |
| 10 | Cáceres | 10001 |
| 14 | Córdoba | 14001 |
| 18 | Granada | 18001 |
| 23 | Jaén | 23001 |
| 04 | Almería | 04001 |
| 11 | Cádiz | 11001 |
| 12 | Castellón | 12001 |
| 03 | Alicante | 03001 |
| 07 | Islas Baleares | 07001 |
| 30 | Murcia | 30001 |

---

## 🧪 Testing del Webhook

### Opción 1: Panel de Administración
```
URL: http://localhost:3000/admin-config.html
1. Configura el webhook
2. Completa datos de prueba
3. Haz clic en "🧪 Enviar Prueba"
4. Verifica respuesta
```

### Opción 2: curl desde Terminal
```bash
curl -X POST https://tu-instancia.n8n.cloud/webhook/presupuestoya \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-08-13T14:30:00Z",
    "name": "Test User",
    "phone": "691234567",
    "email": "test@example.com",
    "postalCode": "28001",
    "region": "Madrid",
    "closureType": "ventanas",
    "message": "Prueba"
  }'
```

### Opción 3: Postman
1. Abre Postman
2. Nueva solicitud POST
3. URL: Tu webhook de n8n
4. Body (raw JSON):
   ```json
   {
     "timestamp": "2024-08-13T14:30:00Z",
     "name": "Juan García",
     "phone": "691234567",
     "email": "juan@example.com",
     "postalCode": "28001",
     "region": "Madrid",
     "closureType": "ventanas"
   }
   ```
5. Send

---

## 🐛 Troubleshooting

### Error: "Webhook not found"
- ✓ Verifica que el webhook está activado en n8n
- ✓ Recopia la URL exacta (incluyendo protocolo https://)
- ✓ Espera 30 segundos después de crear el webhook

### Error: "Connection refused"
- ✓ Verifica que la URL es correcta
- ✓ Comprueba que n8n está activo (abre en navegador)
- ✓ Revisa firewall/proxy si está en producción

### Los datos no llegan a Airtable
- ✓ Verifica credenciales de Airtable en n8n
- ✓ Comprueba que el nombre de la tabla es exacto
- ✓ Verifica que los campos existen en Airtable

### CORS Error en el navegador
- ✓ Esto es normal, el webhook debe configurarse en el servidor
- ✓ Usa el panel admin para configurar (no es por CORS)

---

## 📈 Monitoreo en Producción

### Logs de n8n
1. Abre tu workflow
2. Click en "Execution History"
3. Haz clic en una ejecución para ver detalles
4. Revisa inputs/outputs

### Estadísticas
- Total de leads recibidos
- Leads por región
- Tasa de error
- Tiempo de respuesta

---

## 🔐 Seguridad

### Proteger el Webhook

Si deseas limitar acceso:

**Opción 1: Validar en n8n**
```
Webhook Node → Add auth
Type: Basic Auth / Bearer Token
```

**Opción 2: IP Whitelist**
Contacta a soporte de n8n para whitelist de IPs

---

## 🚀 Próximos Pasos

1. **Configura el webhook** en Presupuestoya
2. **Crea tabla Leads** en Airtable (si no existe)
3. **Prueba con datos de prueba** desde admin-config.html
4. **Verifica llegada en Airtable**
5. **Agrega acciones adicionales** (email, SMS, etc.)
6. **Activa en producción**

---

## 📞 Soporte

- **Documentación n8n**: https://docs.n8n.io/
- **Comunidad n8n**: https://community.n8n.io/
- **Issues Presupuestoya**: Contacta al equipo de desarrollo

---

**Última actualización**: 2024-08-13
**Versión**: 1.0
