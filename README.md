# Presupuestoya - Lead Generation Platform

Plataforma moderna de captura y enrutamiento geográfico de leads para empresas de ventanas y cerramientos a medida. Formulario optimizado para conversión, validación robusta y integración automática con sistemas de automatización como n8n, Zapier y Airtable.

## 🎯 Características

✅ **Formulario optimizado para conversión**
- Diseño mobile-first responsive
- Validación en tiempo real
- UX limpia y enfocada
- Temas claro y oscuro automáticos

✅ **Captura de datos completa**
- Nombre, teléfono, email
- Código postal con validación geográfica
- Tipo de cerramiento (ventanas, puertas, etc.)
- Información adicional opcional

✅ **Validaciones robustas**
- Teléfono español: +34, 034, 0, o formato directo
- Email con validación RFC
- Código postal: 5 dígitos con validación de provincia
- Detección automática de región

✅ **Integración webhook**
- Envío automático de leads a tu servidor
- Retry automático en caso de fallo
- Timeout inteligente (30 segundos)
- Compatible con n8n, Zapier, Airtable, etc.

✅ **Seguridad RGPD**
- Consentimiento explícito requerido
- Política de privacidad referenciada
- Sin compartir datos con terceros
- Logging completo de consentimiento

✅ **Sin dependencias pesadas**
- HTML/CSS/JS vanilla (sin frameworks de UI)
- ~15KB comprimido (gzip)
- Tiempo de carga: <500ms en 3G
- Funciona en todos los navegadores modernos

## 📦 Estructura del Proyecto

```
presupuestoya/
├── index.html              # Formulario principal
├── styles.css              # Estilos responsivos
├── app.js                  # Lógica del formulario y validaciones
├── server.js               # Servidor Node.js (opcional)
├── package.json            # Dependencias Node.js
├── .env.example            # Variables de entorno (plantilla)
├── WEBHOOK_CONFIG.md       # Guía de configuración webhook
├── README.md               # Este archivo
└── .git/                   # Control de versiones
```

## 🚀 Inicio Rápido

### Opción 1: Solo Frontend (Recomendado)

1. **Obtén tu URL de webhook** desde n8n, Zapier, o tu servidor
2. **Actualiza la URL en `app.js`**:
   ```javascript
   const CONFIG = {
       WEBHOOK_URL: 'https://tu-webhook.com/leads',
   };
   ```
3. **Despliega los archivos** en tu servidor web:
   ```bash
   # Nginx, Apache, Vercel, Netlify, AWS S3, etc.
   scp index.html styles.css app.js usuario@servidor:/var/www/
   ```

### Opción 2: Con Servidor Node.js (Local/Development)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
cp .env.example .env
# Edita .env y añade tu WEBHOOK_URL

# 3. Ejecutar servidor
npm start

# 4. Abre http://localhost:3000 en el navegador
```

## 🔧 Configuración del Webhook

### n8n

1. Crea un nuevo workflow
2. Agrega trigger "Webhook"
3. Copia la URL completa (ej: `https://your-instance.n8n.cloud/webhook/abc123`)
4. Pega en `WEBHOOK_URL` en `app.js`

### Zapier

1. Crea nuevo Zap
2. Trigger: "Catch Hook"
3. Copia la URL del webhook
4. Configura acciones para procesar leads

### Custom Server

Si tienes tu propio servidor, espera JSON POST:
```json
{
  "timestamp": "2024-08-13T14:30:00.000Z",
  "name": "Juan García",
  "phone": "691234567",
  "email": "juan@email.com",
  "postalCode": "28001",
  "region": "Madrid",
  "closureType": "ventanas",
  "message": "Información adicional",
  "source": "presupuestoya-web",
  "userAgent": "..."
}
```

## 🌐 Despliegue en Producción

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel deploy
```

Configura variable de entorno `WEBHOOK_URL` en dashboard.

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

Añade variable `WEBHOOK_URL` en Netlify Settings → Build & Deploy.

### AWS S3 + CloudFront

```bash
aws s3 cp . s3://presupuestoya-bucket/ --recursive
aws cloudfront create-invalidation --id DISTRIBUTION_ID --paths "/*"
```

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t presupuestoya .
docker run -e WEBHOOK_URL="your-url" -p 3000:3000 presupuestoya
```

## 📊 Monitoreo

### Logs en Cliente (DevTools)

Abre F12 → Console para ver:
- Leads enviados correctamente
- Errores de validación
- Fallos de webhook

### Logs en Servidor

Si usas `server.js`:
```bash
# Ver logs en tiempo real
npm start
```

### Monitoreo en Producción

- **n8n**: Dashboard de ejecuciones
- **Zapier**: Task history
- **Servidor propio**: Integra logging (Winston, Morgan, etc.)

## 🔐 Seguridad

✅ Validación client-side de todos los campos
✅ Consentimiento RGPD explícito
✅ Sanitización de datos telefónicos
✅ Timeout en peticiones (30s)
✅ Retry automático de fallos
✅ User-Agent tracking para prevenir spam
✅ CORS habilitado solo en dominio configurado

## 📱 Responsive Design

- ✅ Mobile-first (desde 320px ancho)
- ✅ Tablet (480px - 1024px)
- ✅ Desktop (1024px+)
- ✅ Temas claro y oscuro automáticos

Prueba con DevTools (F12 → Toggle device toolbar).

## 🧪 Testing

### Test Manual

1. Rellena el formulario con datos válidos
2. Abre DevTools (F12) → Console
3. Envía el formulario
4. Verifica que el lead llegó a tu webhook

### Test Automatizado (RequestBin)

```bash
# 1. Ir a https://requestbin.com
# 2. Crear bin
# 3. Copiar URL en app.js
# 4. Rellenar formulario
# 5. Ver request en RequestBin
```

## 🚨 Troubleshooting

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución**: Configura tu webhook para permitir CORS:
```
Access-Control-Allow-Origin: *
```

### Timeout Error
```
The request took too long
```

**Solución**: Aumenta timeout en `app.js`:
```javascript
TIMEOUT: 60000 // 60 segundos
```

### Webhook No Responde
```
Webhook unavailable
```

**Solución**:
1. Verifica que la URL es correcta
2. Prueba con `curl`:
   ```bash
   curl -X POST https://tu-webhook.com/leads \
     -H "Content-Type: application/json" \
     -d '{"name":"Test"}'
   ```

### Los datos no llegan

1. Abre DevTools → Console
2. Revisa si hay errores
3. Revisa localStorage para leads encolados:
   ```javascript
   Object.keys(localStorage).filter(k => k.startsWith('lead_'))
   ```

## 📈 Métricas y Analytics

### Información Capturada

- Timestamp exacto del lead
- Datos de contacto completos
- Geolocalización por código postal
- Tipo de producto/servicio requerido
- Dispositivo y navegador (User-Agent)
- Fuente de origen (`presupuestoya-web`)

### Integración con Analytics

Puedes conectar con Google Analytics, Mixpanel, etc. añadiendo:

```javascript
// En app.js, al final de handleSubmit()
if (window.gtag) {
    gtag('event', 'lead_submitted', {
        closure_type: data.closureType,
        region: data.region
    });
}
```

## 🎨 Customización

### Cambiar Colores

Edita variables CSS en `styles.css`:

```css
:root {
    --primary: #1a73e8;      /* Azul principal */
    --primary-dark: #1557b0;  /* Azul oscuro */
    --success: #34a853;       /* Verde */
    --error: #d33b27;         /* Rojo */
}
```

### Cambiar Tipos de Cerramiento

En `index.html`, modifica el `<select>`:

```html
<select id="closureType" name="closureType">
    <option value="ventanas">Ventanas</option>
    <option value="tu-opcion">Tu Opción</option>
</select>
```

### Agregar Campos

1. Añade `<input>` en `index.html`
2. Crea función `validateNuevoCampo()` en `app.js`
3. Añade validación en `handleSubmit()`
4. Incluye en `leadData` object

## 📚 Documentación Adicional

- [WEBHOOK_CONFIG.md](./WEBHOOK_CONFIG.md) - Guía completa de webhook
- [Validaciones](./app.js#L65) - Funciones de validación
- [Estructura de datos](./app.js#L176) - Formato de leads

## 📝 Licencia

MIT - Libre para usar, modificar y distribuir.

## 👥 Soporte

Para preguntas, issues o sugerencias:
1. Revisa la [guía de webhook](./WEBHOOK_CONFIG.md)
2. Consulta [Troubleshooting](#-troubleshooting)
3. Contacta al equipo de desarrollo

---

**Versión**: 1.0.0
**Última actualización**: 2024-08-13
**Mantenedor**: Presupuestoya Team
