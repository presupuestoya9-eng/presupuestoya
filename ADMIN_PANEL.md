# Panel de Administración - Presupuestoya

## 🎯 Descripción

El panel de administración permite configurar y probar el webhook de n8n sin tocar código. Es la forma más fácil de conectar Presupuestoya con tu flujo de automatización.

## 🚀 Acceso

```
URL: http://localhost:3000/admin-config.html
    (o tu dominio de producción: https://presupuestoya.com/admin-config.html)
```

## 📋 Características

### 1. Configuración del Webhook
- **URL del Webhook**: Pega tu URL de n8n/Zapier
- **Descripción**: Notas sobre el webhook (opcional)
- **Validación**: Verifica que la URL es válida

### 2. Pruebas Automáticas
- **Enviar Prueba**: Clic para enviar un lead de test
- **Datos de Prueba**: Completa campos predefinidos
- **Resultado Inmediato**: Ve si el webhook funciona

### 3. Estado del Sistema
- **Webhook Configurado**: Muestra si hay URL guardada
- **Fecha de Guardado**: Cuándo se configuró por última vez
- **Validación**: Indica si todo está correcto

## 🔧 Pasos para Usar

### Paso 1: Obtén tu URL de n8n

1. Abre tu instancia n8n: `https://tu-instancia.n8n.cloud`
2. Crea nuevo workflow o abre uno existente
3. Agrega nodo "Webhook"
4. Copia la URL completa:
   ```
   https://tu-instancia.n8n.cloud/webhook/presupuestoya
   ```

### Paso 2: Configura en el Panel

1. Abre: `admin-config.html`
2. Pega la URL en "URL del Webhook"
3. Haz clic en "💾 Guardar Configuración"
4. Deberías ver mensaje de éxito

### Paso 3: Prueba el Webhook

1. En el panel, completa los campos de prueba:
   - Nombre: `Juan García López`
   - Teléfono: `+34 612345678`
   - Email: `test@presupuestoya.com`
   - Código Postal: `28001`
   - Tipo: `Ventanas`

2. Haz clic en "🧪 Enviar Prueba"

3. Resultado esperado:
   ```
   ✓ Envío exitoso
   Respuesta del servidor: 200 OK
   ```

### Paso 4: Verifica en n8n

1. Ve a tu webhook en n8n
2. Deberías ver un tick verde (✓)
3. Haz clic en el nodo para ver los datos recibidos
4. Los datos deben coincidir con lo que enviaste

## 📊 Datos de Prueba Predefinidos

El panel incluye valores por defecto para pruebas rápidas:

```json
{
  "timestamp": "2024-08-13T14:30:00.000Z",
  "name": "Test User",
  "phone": "+34 612345678",
  "email": "test@presupuestoya.com",
  "postalCode": "28001",
  "region": "Madrid",
  "closureType": "ventanas",
  "message": "Envío de prueba desde panel de administración",
  "source": "presupuestoya-admin-test",
  "userAgent": "Mozilla/5.0..."
}
```

Puedes modificar cualquier campo antes de hacer "Enviar Prueba".

## 🔒 Seguridad

### ¿Dónde se guarda la configuración?

La configuración se guarda en **localStorage del navegador**, NO en servidor:
- ✅ Es local y segura
- ✅ No se envía a terceros
- ✅ Se elimina al limpiar datos del navegador

### ¿Quién puede acceder?

Cualquiera que abra `admin-config.html` en tu servidor puede ver/cambiar la configuración. Para producción:

**Opción 1: Proteger con contraseña**
```html
<!-- Agregar en admin-config.html -->
<script>
  const adminPassword = 'tu-contraseña-segura';
  const pwd = prompt('Contraseña del panel:');
  if (pwd !== adminPassword) {
    alert('Acceso denegado');
    location.href = '/';
  }
</script>
```

**Opción 2: Proteger con autenticación del servidor**
- Usa nginx/Apache con basic auth
- O implementa sesiones con Node.js

**Opción 3: Mover a URL secreta**
- Renombra `admin-config.html` a `admin-webhook-xzk9f2m.html`
- Comparte solo la URL con tu equipo

## 🧪 Escenarios de Prueba

### Test 1: Validación Básica
```
Datos: Todos los campos completos
Resultado: ✓ Envío exitoso
```

### Test 2: Código Postal Madrid
```
PostalCode: 28001
Región esperada: Madrid
Verifica en n8n que llegó con región detectada
```

### Test 3: Código Postal Barcelona
```
PostalCode: 08001
Región esperada: Barcelona
```

### Test 4: Error - Webhook Inactivo
```
Si cambias la URL a una inválida:
Resultado: ✗ Error de conexión
```

## 📈 Indicadores de Estado

### ✓ Verde (Éxito)
- Webhook configurado y activo
- Última prueba exitosa

### ⚠️ Amarillo (Pendiente)
- Webhook no configurado
- Primera ejecución

### ✗ Rojo (Error)
- Webhook no responde
- URL inválida
- Problema de conectividad

## 🔄 Flujo Recomendado para Pruebas

1. **Configurar**
   ```
   admin-config.html → Guardar webhook
   ```

2. **Verificar**
   ```
   admin-config.html → Enviar Prueba
   ```

3. **Validar**
   ```
   n8n Dashboard → Ver datos recibidos
   ```

4. **Probar en Formulario**
   ```
   Llenar formulario real → Verificar en n8n
   ```

5. **Monitorear**
   ```
   Usar n8n Logs → Revisar errores/éxitos
   ```

## 📝 Ejemplos de URLs

### n8n Cloud
```
https://tu-instancia.n8n.cloud/webhook/presupuestoya
```

### n8n Self-Hosted
```
https://n8n.tu-servidor.com/webhook/presupuestoya
```

### Zapier
```
https://hooks.zapier.com/hooks/catch/123456/abc789xyz/
```

### RequestBin (Testing)
```
https://requestbin.com/abc123xyz
```

## 🎓 Guías Relacionadas

- [N8N_SETUP.md](./N8N_SETUP.md) - Configuración completa de n8n
- [WEBHOOK_CONFIG.md](./WEBHOOK_CONFIG.md) - Guía general de webhooks
- [INTEGRATIONS.md](./INTEGRATIONS.md) - Ejemplos de integración

## 🆘 Troubleshooting

### "Error de conexión"
- ✓ Verifica que la URL es correcta
- ✓ Incluye https:// en la URL
- ✓ Comprueba que el webhook está activo en n8n

### "La configuración no se guarda"
- ✓ Verifica que localStorage está habilitado
- ✓ Abre DevTools (F12) → Application → LocalStorage
- ✓ Busca `presupuestoya_webhook_config`

### "No veo el botón de prueba"
- ✓ Recarga la página (F5)
- ✓ Borra cache del navegador (Ctrl+Shift+Del)

### "El formulario no envía datos"
- ✓ Abre admin-config.html
- ✓ Verifica que hay webhook guardado
- ✓ Haz una prueba desde el panel
- ✓ Revisa console (F12) para errores

## 💡 Pro Tips

### Múltiples Webhooks
Si tienes diferentes flujos (producción/staging):
1. Crea dos navegadores/perfiles diferentes
2. Configura un webhook en cada uno
3. Los datos se guardan por navegador

### Testing Rápido
- Usa RequestBin para pruebas iniciales
- Una vez listo, cambia a tu webhook de n8n
- Mantén la URL de RequestBin guardada para debug

### Monitorear en Producción
- Abre admin-config.html
- Verifica status cada mañana
- Haz prueba semanal para asegurar conectividad

## 📱 Responsivo

El panel de administración funciona en:
- ✓ Desktop (navegadores modernos)
- ✓ Tablet
- ✓ Móvil

Perfectamente funcional incluso desde teléfono.

## 🚀 Próximos Pasos

1. Abre `admin-config.html`
2. Obtén URL de n8n
3. Configura el webhook
4. Envía prueba
5. Verifica en n8n
6. ¡Listo para producción!

---

**Última actualización**: 2024-08-13
**Versión**: 1.0
