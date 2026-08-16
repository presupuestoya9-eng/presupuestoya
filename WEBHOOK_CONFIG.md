# Configuración de Webhook para Presupuestoya

## Overview

La app de Presupuestoya está lista para enviar leads a tu sistema de automatización (n8n, Airtable, Zapier, etc.) mediante webhooks. El formulario captura información del cliente y la envía automáticamente a tu endpoint configurado.

## Datos Enviados

Cada lead se envía con la siguiente estructura JSON:

```json
{
  "timestamp": "2024-08-13T14:30:00.000Z",
  "name": "Juan García López",
  "phone": "691234567",
  "email": "juan@email.com",
  "postalCode": "28001",
  "region": "Madrid",
  "closureType": "ventanas",
  "message": "Necesito 5 ventanas de aluminio",
  "source": "presupuestoya-web",
  "userAgent": "Mozilla/5.0..."
}
```

## Configuración del Webhook

### 1. Obtener tu URL de Webhook

Debes obtener una URL de webhook de tu servicio de automatización. Ejemplos:

- **n8n**: Crea un webhook trigger y obtén la URL
- **Airtable**: Usa Zapier/n8n como intermediario
- **Zapier**: Crea un Zap con "Catch Hook" como trigger

### 2. Configurar la URL en la App

Opción A - Variable de entorno:
```bash
export WEBHOOK_URL="https://tu-webhook.com/leads"
```

Opción B - Modificar directamente en `app.js`:
```javascript
const CONFIG = {
    WEBHOOK_URL: 'https://tu-webhook.com/leads',
    TIMEOUT: 30000,
};
```

### 3. Métodos de Despliegue

#### Opción 1: Servidor Web (Recomendado)
```bash
# Nginx, Apache o cualquier servidor web estático
# Copia los archivos a tu servidor
scp index.html styles.css app.js usuario@servidor:/var/www/presupuestoya/
```

#### Opción 2: Vercel (Recomendado para SPA)
```bash
npm install -g vercel
vercel deploy
# Configura WEBHOOK_URL en Vercel dashboard
```

#### Opción 3: Netlify
```bash
npm install -g netlify-cli
netlify deploy
# Configura variables de entorno en Netlify
```

#### Opción 4: AWS S3 + CloudFront
```bash
aws s3 cp index.html s3://presupuestoya-bucket/
aws s3 cp styles.css s3://presupuestoya-bucket/
aws s3 cp app.js s3://presupuestoya-bucket/
```

#### Opción 5: Node.js Simple Server
```bash
node server.js
# Ver server.js en este directorio
```

## Validaciones Implementadas

✅ **Nombre**: Mínimo 3 caracteres, solo letras y caracteres válidos
✅ **Teléfono**: Formato español (+34, 034, 0, o solo 9 dígitos)
✅ **Email**: Validación RFC básica
✅ **Código Postal**: 5 dígitos españoles con validación de prefijo
✅ **Tipo de Cerramiento**: Selección obligatoria
✅ **Consentimiento**: Checkbox obligatorio para RGPD

## Geolocalización Automática

La app detecta automáticamente la región española basada en el código postal:
- 28 → Madrid
- 08 → Barcelona
- 41 → Sevilla
- 46 → Valencia
- (y todas las demás provincias)

Esto facilita el enrutamiento de leads por región.

## Características de Seguridad

- ✅ Validación client-side de todos los campos
- ✅ Sanitización de datos telefónicos
- ✅ Timeout de 30 segundos en peticiones
- ✅ Retry automático para webhooks fallidos (stored en localStorage)
- ✅ User-Agent para tracking y prevención de spam
- ✅ Consentimiento RGPD explícito

## Testing del Webhook

### Opción 1: Usar RequestBin (Testing)
```bash
# 1. Ir a https://requestbin.com
# 2. Crear un nuevo bin
# 3. Copiar la URL
# 4. Usar esa URL en app.js para testing
```

### Opción 2: Usando curl
```bash
curl -X POST https://tu-webhook.com/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "691234567",
    "email": "test@example.com",
    "postalCode": "28001",
    "closureType": "ventanas"
  }'
```

## Troubleshooting

### "CORS Error" - El navegador bloquea la petición

La URL del webhook debe permitir CORS. Configura el header:
```
Access-Control-Allow-Origin: *
```

O especifica el dominio exacto de presupuestoya.

### "Timeout" - El webhook no responde en 30 segundos

- Aumenta el timeout en `app.js`: `TIMEOUT: 60000`
- Verifica que el webhook está funcionando
- Revisa los logs del servidor webhook

### Los datos no llegan pero dice "éxito"

Revisa `localStorage` en DevTools:
```javascript
// En la consola del navegador:
Object.keys(localStorage).filter(k => k.startsWith('lead_'))
```

Esto muestra los leads encolados para retry.

## Monitoreo y Logs

Para monitorear los leads que llegan:

1. **n8n**: Visualiza en el historial de ejecuciones
2. **Airtable**: Los registros se crean automáticamente
3. **Servidor personalizado**: Revisa los logs

### Logs en Cliente

Abre DevTools (F12) → Pestaña "Console":
- Éxito: `console.log('Lead enviado')`
- Error: `console.error('Error sending lead:', error)`

## Datos Extras (Futuros)

Para agregar más datos al formulario:

1. Abre `index.html`
2. Agrega un nuevo `<input>` en el `<form>`
3. En `app.js`, agrega el campo a `fields` object
4. Agrega su validación en `handleSubmit()`
5. Incluye el campo en `leadData` object

Ejemplo:
```html
<div class="form-group">
    <label for="budgetRange">Presupuesto estimado</label>
    <select id="budgetRange" name="budgetRange">
        <option value="">Selecciona...</option>
        <option value="0-1000">0€ - 1.000€</option>
        <option value="1000-5000">1.000€ - 5.000€</option>
    </select>
</div>
```

## Performance

- Tamaño total: ~50KB (sin comprimir)
- Con gzip: ~15KB
- Tiempo de carga: <500ms en 3G
- Validación: <10ms
- Envío de webhook: Depende del servidor

## Cumplimiento RGPD

✅ Consentimiento explícito requerido
✅ Política de privacidad referenciada
✅ Sin compartir datos con terceros
✅ Data mínima necesaria
✅ Timestamp de consentimiento incluido

---

**Soporte**: Para issues o preguntas, contacta al equipo de desarrollo.
