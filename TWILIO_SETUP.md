# Configuración de Twilio - SMS/WhatsApp para Profesionales

Guía completa para integrar SMS y WhatsApp en el workflow de Presupuestoya, notificando a profesionales por canal directo además de email.

## 📱 ¿Qué es Twilio?

Twilio es una plataforma que permite:
- ✅ Enviar SMS a teléfonos móviles
- ✅ Enviar WhatsApp (más económico que SMS)
- ✅ Integración fácil con n8n
- ✅ Tracking de entregas

**Costo aproximado**: 
- SMS: $0.0075 por mensaje (España)
- WhatsApp: $0.0079 por mensaje
- Muy económico para ~100 leads/mes

---

## 🔑 Paso 1: Crear Cuenta Twilio

### 1.1 Registro

1. Ve a: https://www.twilio.com/try-twilio
2. Click "Sign Up"
3. Completa datos:
   ```
   Email: tu@empresa.com
   Contraseña: segura
   Teléfono verificación: +34 XXXXX
   ```
4. Verifica email (link en bandeja)
5. Verifica teléfono (código SMS)

### 1.2 Obtener Credenciales

1. Dashboard: https://console.twilio.com
2. Busca:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **COPIA AMBOS** (no podrás verlos después)

### 1.3 Obtener Número Twilio

1. Dashboard → "Phone Numbers" → "Get started"
2. Click "Get a Twilio phone number"
3. Selecciona:
   - Country: Spain (España)
   - Capability: SMS ✓, WhatsApp ✓
4. Click "Search"
5. Elige número (ej: +34 91 XXX XXX)
6. Click "Buy"

**Número Twilio**: `+34 91 XXX XXX` (úsalo como "From")

---

## 📲 Paso 2: Configurar WhatsApp (Recomendado)

WhatsApp es más barato que SMS y más directo.

### 2.1 Conectar WhatsApp Business

1. Dashboard → "Messaging" → "Try it out"
2. Click "WhatsApp"
3. Click "Set up WhatsApp Sandbox"
4. Sigue instrucciones:
   - Envía mensaje a número Twilio con código
   - Twilio responde confirmando

### 2.2 Obtener Template Messages

Para producción, necesitas templates aprobados por WhatsApp:

1. Dashboard → "WhatsApp" → "Explore"
2. Click "Manage templates"
3. Crear template:
   ```
   Name: presupuestoya_lead_notification
   Category: TRANSACTIONAL
   Body: Hola {{1}}, tienes un nuevo lead:
         {{2}} - {{3}}
         Contacto: {{4}}
         Responde aquí: [link]
   ```
4. Submit para aprobación (24-48 horas)

---

## 🔗 Paso 3: Conectar Twilio en n8n

### 3.1 Crear Credencial Twilio

1. En n8n, cualquier nodo Twilio
2. Click "Credentials" → "Create New"
3. Type: "Twilio"
4. Campos:
   ```
   Account SID: ACxxxxxxxx...
   Auth Token: xxxxxxxx...
   From: +34 91 XXX XXX (tu número Twilio)
   ```
5. Click "Save"

### 3.2 Test de Conexión

1. Agrega nodo "Twilio - Send SMS"
2. Credenciales: Tu Twilio connection
3. To: Tu teléfono personal
4. Message: "Test from Twilio"
5. Execute
6. Deberías recibir SMS en 10 segundos

---

## 📧 Paso 4: Agregar SMS/WhatsApp al Workflow

### Opción A: SMS (Más Simple)

En n8n workflow, después de "Send Email to Professional":

1. Agrega nodo "Twilio - Send SMS"
2. Credenciales: Twilio
3. To: `{{$json.assignedProfessionalPhone}}`
4. Message:
   ```
   🔔 Nuevo Lead: {{$json.name}}
   📍 {{$json.detectedRegion}}
   🪟 {{$json.closureType}}
   ☎️ {{$json.phone}}
   
   Responde en Airtable dentro de 24h
   ```

### Opción B: WhatsApp (Recomendado)

1. Agrega nodo "Twilio - Send WhatsApp"
2. Credenciales: Twilio
3. To: `{{$json.assignedProfessionalPhone}}`
4. Message: Mismo que SMS (se formatea automático)

**Ventajas WhatsApp**:
- ✅ Más barato ($0.0079 vs $0.0075)
- ✅ Más probable que lea (WhatsApp > SMS)
- ✅ Entrega confirmada
- ✅ Mejor conversión

---

## 🔄 Paso 5: Agregar al Workflow Completo

### Flujo Actualizado

```
Lead Input
    ↓
Validación
    ↓
Detectar Región
    ↓
Buscar Profesionales
    ↓
    ├─ ENCONTRADO:
    │  ├─ Crear Lead (Assigned)
    │  ├─ Email Cliente
    │  ├─ Email Profesional
    │  ├─ SMS/WhatsApp Profesional ⭐ NUEVO
    │  └─ Log Success
    │
    └─ NO ENCONTRADO:
       ├─ Crear Lead (Manual)
       ├─ Email Admin
       └─ Log Error
```

### Nodos a Agregar

**Nodo 12b: SMS to Professional**
```
Type: Twilio - Send SMS
Credentials: Twilio
To: {{$json.assignedProfessionalPhone}}
Message: Mismo que WhatsApp

CONECTAR DESDE: "Send Email to Professional"
CONECTAR A: "Success Response"
```

**Nodo 12c: WhatsApp to Professional** (Alternativa)
```
Type: Twilio - Send WhatsApp
Credentials: Twilio
To: {{$json.assignedProfessionalPhone}}
Message: Mensaje personalizado

CONECTAR DESDE: "Send Email to Professional"
CONECTAR A: "Success Response"
```

---

## 📞 Plantillas de Mensajes

### SMS/WhatsApp Corto
```
🔔 {{name}}, nuevo lead en {{region}}

📍 {{postalCode}}
🪟 {{closureType}}
☎️ {{phone}}

Responde en 24h
```

### SMS/WhatsApp Completo
```
¡Hola {{professional_name}}!

Tienes un nuevo lead asignado:

👤 Cliente: {{name}}
📞 Teléfono: {{phone}}
✉️ Email: {{email}}
📍 Ubicación: {{region}} ({{postalCode}})
🪟 Servicio: {{closureType}}

💬 {{message}}

⏰ Debes responder dentro de 24 horas

Ver en Airtable: [link]
```

---

## 🎯 Mejores Prácticas

### Horarios de Envío
- **Lunes-Viernes**: 08:00 - 18:00
- **Sábados**: 10:00 - 14:00
- **Domingos**: No enviar

Puedes configurar en n8n con nodo "Schedule":

```
If time between 08:00 and 18:00
  AND day NOT Sunday
Then send SMS
```

### Verificación de Teléfono
Antes de enviar, verifica que el teléfono es válido:

```javascript
const phone = $json.assignedProfessionalPhone;
const isValid = /^\+34[6789]\d{8}$/.test(phone.replace(/\s/g, ''));

if (!isValid) {
  throw new Error('Teléfono no válido: ' + phone);
}
```

### Rate Limiting
Twilio tiene límites:
- 1 mensaje por segundo por defecto
- Para 100+ leads/hora, solicitar aumento

Si necesitas más velocidad:
1. Dashboard → "SMS" → "Scaling"
2. Solicitar throughput incrementado
3. Se aprueba automáticamente para nuevas cuentas

---

## 💰 Costos

### Estimación Mensual

```
Escenario: 100 leads/mes

SMS:
- 100 leads × $0.0075 = $0.75/mes
- + 100 follow-ups × $0.0075 = $0.75/mes
- Total SMS: ~$1.50/mes

WhatsApp:
- 100 leads × $0.0079 = $0.79/mes
- + 100 follow-ups × $0.0079 = $0.79/mes
- Total WhatsApp: ~$1.58/mes

Total Twilio: ~$1.50-1.60/mes
Número Twilio: $1/mes
Total: ~$2.50/mes
```

**Muy económico** comparado con valor de cada lead.

---

## 🧪 Testing

### Test 1: SMS Manual

1. En n8n, nodo "Twilio - Send SMS"
2. To: Tu teléfono
3. Message: "Test SMS"
4. Click "Execute"
5. Deberías recibir SMS en <5 segundos

### Test 2: WhatsApp Manual

1. En n8n, nodo "Twilio - Send WhatsApp"
2. To: Tu WhatsApp
3. Message: "Test WhatsApp"
4. Click "Execute"
5. Deberías recibir en WhatsApp en <5 segundos

### Test 3: Desde Workflow Completo

1. Envía lead de prueba
2. Verifica:
   - ✅ Email a cliente
   - ✅ Email a profesional
   - ✅ SMS/WhatsApp a profesional
3. Todos deben llegar en <30 segundos

---

## 🔐 Seguridad

### Proteger Credenciales
- ✅ Guarda en n8n (encriptado)
- ✅ Nunca en código
- ✅ Revisa tokens regularmente

### Validación de Teléfono
- ✅ Verifica formato (+34 XXXXXXXX)
- ✅ Rechaza teléfono vacío
- ✅ Log de errores

### Privacidad
- ✅ SMS/WhatsApp = consentimiento implícito (B2B)
- ✅ No enviar a teléfono privado del cliente
- ✅ Solo a profesionales consentidos

---

## 📊 Analytics en Twilio

### Monitorear Entregas

1. Dashboard → "SMS" → "Logs"
2. Verás:
   - Enviados ✅
   - Fallos ❌
   - Bounces 🔄
   - Timestamps

### Rates de Entrega

```
Objetivo: >98% entrega
Si <95%: Revisar números de teléfono
```

### Webhook de Confirmación

Twilio puede enviar webhook cuando:
- SMS entregado ✓
- SMS fallido ✗
- SMS leído (si es WhatsApp)

Configurable en Dashboard → Webhooks

---

## 🚨 Troubleshooting

### Error: "Invalid phone number"
```
✓ Verifica que número comienza con +34
✓ Debe tener 12 caracteres: +34XXXXXXXXX
✓ Solo dígitos después de +34
```

### Error: "Credentials invalid"
```
✓ Verifica Account SID exacto
✓ Verifica Auth Token exacto
✓ Reconecta credencial en n8n
```

### SMS no llega
```
✓ Verifica número destinatario es correcto
✓ Verifica Twilio tiene crédito
✓ Mira logs en Dashboard → SMS
✓ Prueba con tu teléfono personal
```

### WhatsApp no funciona
```
✓ Verifica teléfono tiene WhatsApp Business activado
✓ Verifica que agregaste número a Sandbox
✓ Espera a que se apruebe template message
```

---

## 📈 Próximos Pasos

1. ✅ Crear cuenta Twilio
2. ✅ Obtener credenciales (Account SID, Auth Token)
3. ✅ Obtener número Twilio (+34 91 XXX)
4. ✅ Configurar WhatsApp (más recomendado)
5. ✅ Agregar nodos SMS/WhatsApp a workflow
6. ✅ Hacer tests
7. ✅ Ir a producción

---

## 🔗 Enlaces Útiles

- Twilio Console: https://console.twilio.com
- Twilio Pricing: https://www.twilio.com/sms/pricing/es
- n8n Twilio Docs: https://docs.n8n.io/nodes/n8n-nodes-base.twilio/

---

**Última actualización**: 2024-08-13
**Versión**: 1.0
