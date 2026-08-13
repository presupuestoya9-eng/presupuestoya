# Guía de Integraciones - Presupuestoya

## n8n - Flujo Completo

### Setup Básico

1. **Crear Webhook Trigger**
   - Nuevo workflow
   - Trigger: Webhook
   - Method: POST
   - Copia la URL (ej: `https://your-instance.n8n.cloud/webhook/presupuestoya`)

2. **Configurar en Presupuestoya**
   ```javascript
   // En app.js
   const CONFIG = {
       WEBHOOK_URL: 'https://your-instance.n8n.cloud/webhook/presupuestoya',
   };
   ```

3. **Crear Nodo de Base de Datos (Airtable/DB)**
   ```
   Webhook → JSON Parser → Airtable
                       ↓
                    Email
                       ↓
                    Success
   ```

### Ejemplo de Workflow n8n

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "method": "POST",
      "path": "presupuestoya"
    },
    {
      "name": "Airtable",
      "type": "n8n-nodes-base.airtable",
      "operation": "create",
      "table": "Leads",
      "fields": {
        "Name": "{{$json.name}}",
        "Email": "{{$json.email}}",
        "Phone": "{{$json.phone}}",
        "PostalCode": "{{$json.postalCode}}",
        "Region": "{{$json.region}}",
        "ClosureType": "{{$json.closureType}}",
        "Message": "{{$json.message}}"
      }
    },
    {
      "name": "Email Notification",
      "type": "n8n-nodes-base.emailSend",
      "to": "sales@presupuestoya.com",
      "subject": "Nuevo Lead: {{$json.name}}",
      "body": "Nuevo presupuesto solicitado por {{$json.name}} ({{$json.closureType}})"
    }
  ]
}
```

## Zapier - Setup Rápido

### 1. Crear Zap

```
Trigger: Webhooks by Zapier > Catch Hook
```

URL que genera Zapier:
```
https://hooks.zapier.com/hooks/catch/123456/abc789xyz/
```

### 2. Configurar en Presupuestoya

```javascript
const CONFIG = {
    WEBHOOK_URL: 'https://hooks.zapier.com/hooks/catch/123456/abc789xyz/',
};
```

### 3. Configurar Acciones

**Opción A: Airtable**
```
Trigger: Webhook
↓
Action: Airtable - Create Record
  Table: Leads
  Name: {{name}}
  Email: {{email}}
  Phone: {{phone}}
  etc.
```

**Opción B: Email + Sheets**
```
Trigger: Webhook
↓
Action: Google Sheets - Add Row
  Spreadsheet: Presupuestoya Leads
  Sheet: Data
↓
Action: Email - Send
  To: sales@presupuestoya.com
```

## Airtable - Setup Directo (sin n8n)

Si usas Airtable Automations (más nuevo):

1. **Base**: Presupuestoya
2. **Table**: Leads
3. **Fields**:
   - Name (Single line text)
   - Email (Email)
   - Phone (Phone)
   - PostalCode (Single line text)
   - Region (Single line text)
   - ClosureType (Single select)
   - Message (Long text)
   - Timestamp (Date & time)

4. **Automation**:
   - Trigger: Webhook
   - Action: Create record

## Google Sheets + Apps Script

Para loguear leads directamente en Google Sheets:

```javascript
// En app.js, antes de fetchWebhook()

async function sendToSheets(data) {
  const SHEETS_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercontent';
  
  await fetch(SHEETS_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Llamar en handleSubmit():
await sendToSheets(leadData);
await sendToWebhook(leadData);
```

### Google Apps Script

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(data.timestamp),
    data.name,
    data.email,
    data.phone,
    data.postalCode,
    data.region,
    data.closureType,
    data.message
  ]);
  
  return ContentService.createTextOutput("OK");
}
```

## Slack - Notificaciones en Tiempo Real

### Con n8n

Agrega nodo después del webhook:

```
Webhook
  ↓
Slack - Post Message
  Channel: #new-leads
  Text: "Nuevo lead: {{$json.name}} - {{$json.closureType}}"
```

### Con Zapier

```
Trigger: Webhook
  ↓
Action: Slack - Send Channel Message
  Channel: #new-leads
  Text: {{name}} solicita {{closureType}}
```

### Directo desde Presupuestoya

```javascript
// En app.js
const SLACK_WEBHOOK = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';

async function notifySlack(data) {
  await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    body: JSON.stringify({
      text: `🔔 Nuevo Lead: *${data.name}*`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🔔 *${data.name}* - ${data.closureType}\n📧 ${data.email}\n📱 ${data.phone}\n🏙️ ${data.region}`
          }
        }
      ]
    })
  });
}
```

## WhatsApp - Alertas al Equipo

### Con Twilio + n8n

1. Registra en Twilio
2. Obtén credenciales
3. En n8n agrega nodo Twilio:

```
Webhook → Twilio - Send SMS
  To: +34XXXXXXXXX
  Body: "Nuevo lead: {{$json.name}}"
```

## Email - Confirmación al Cliente

### Mailgun (Recomendado)

```javascript
// En app.js
async function sendConfirmationEmail(email, name) {
  const MAILGUN_URL = 'https://api.mailgun.net/v3/presupuestoya.com/messages';
  
  const formData = new FormData();
  formData.append('from', 'noreply@presupuestoya.com');
  formData.append('to', email);
  formData.append('subject', '✓ Presupuesto solicitado');
  formData.append('html', `
    <h1>Hola ${name},</h1>
    <p>Recibimos tu solicitud.</p>
    <p>Nos contactaremos en 24 horas.</p>
  `);
  
  await fetch(MAILGUN_URL, {
    method: 'POST',
    auth: `api:${MAILGUN_API_KEY}`,
    body: formData
  });
}
```

## Calendario - Booking Automático

### Con Calendly + n8n

```
Webhook
  ↓
Calendly - Create Event Link
  Email: {{$json.email}}
  Name: {{$json.name}}
↓
Email - Send confirmation with link
```

## CRM Personalizado

Si tienes un CRM propio, endpoint esperado:

```
POST /api/leads
Headers: {
  "Authorization": "Bearer YOUR_API_TOKEN",
  "Content-Type": "application/json"
}

Body: {
  "name": "Juan García",
  "email": "juan@email.com",
  "phone": "+34 612345678",
  "postalCode": "28001",
  "region": "Madrid",
  "closureType": "ventanas",
  "message": "texto",
  "timestamp": "2024-08-13T14:30:00Z"
}

Response: {
  "success": true,
  "leadId": "abc123xyz"
}
```

## Telegram - Bot Alertas

### Setup Bot

1. Habla con @BotFather en Telegram
2. Crea bot, obtén token
3. Obtén tu chat ID

```javascript
// En app.js
async function notifyTelegram(data) {
  const TELEGRAM_TOKEN = 'YOUR_BOT_TOKEN';
  const CHAT_ID = 'YOUR_CHAT_ID';
  
  const text = `
📌 <b>Nuevo Lead</b>
👤 ${data.name}
📧 ${data.email}
📱 ${data.phone}
🏢 ${data.region}
🪟 ${data.closureType}
  `.trim();
  
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    })
  });
}
```

## Pipeline Completo Recomendado

```
Presupuestoya Web
      ↓
   Webhook
      ↓
   ┌──┴──────────────────┐
   ↓                      ↓
 n8n                    Zapier
   ↓                      ↓
   ├─→ Airtable          ├─→ Google Sheets
   ├─→ Email             ├─→ Email
   ├─→ Slack             └─→ SMS
   ├─→ SMS
   └─→ CRM
```

---

**Recomendación**: Comienza con n8n + Airtable para máxima flexibilidad.
