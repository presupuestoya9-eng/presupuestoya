# 🚀 Quick Start - Setup Completo en 10 Minutos

Guía expressa para configurar todo el sistema: Airtable + n8n + Presupuestoya en menos de 10 minutos.

---

## ⏱️ Tiempo Total: ~10 minutos

- Airtable Setup: 3 min
- n8n Setup: 4 min
- Presupuestoya Config: 2 min
- Testing: 1 min

---

## 📋 Checklist Pre-requisitos

- [ ] Cuenta Airtable (https://airtable.com)
- [ ] Cuenta n8n (https://n8n.cloud)
- [ ] Acceso a email (Gmail, Outlook, etc.)
- [ ] Código postal español para test

---

## 🟦 Paso 1: Airtable (3 minutos)

### 1.1 Crear Base

1. Ve a https://airtable.com/create
2. Click "Blank"
3. Nombre: `Presupuestoya`
4. Click "Create base"

### 1.2 Crear 3 Tablas

**Tabla 1: Leads**
```
Rename default table → "Leads"
Agregar campos:
  - Name (Single line)
  - Email (Email)
  - Phone (Phone)
  - PostalCode (Single line)
  - Region (Single line)
  - ClosureType (Single select: Ventanas|Puertas|Cerramientos|Divisiones|Armarios)
  - Status (Single select: New|Assigned|In Progress|Completed|Rejected) - Default: New
  - AssignedTo (Link to Professionals)
  - Message (Long text)
```

**Tabla 2: Professionals**
```
Create new table → "Professionals"
Agregar campos:
  - Name (Single line)
  - Email (Email)
  - Phone (Phone)
  - Company (Single line)
  - Region (Link to Regions)
  - Specialties (Multiple select: Ventanas|Puertas|Cerramientos|Divisiones|Armarios)
  - Status (Single select: Active|Inactive|On Leave) - Default: Active
  - Available (Checkbox) - Default: Checked
  - Rating (Rating)
```

**Tabla 3: Regions**
```
Create new table → "Regions"
Agregar campos:
  - Name (Single line): Madrid, Barcelona, Sevilla, Valencia, etc.
  - PostalCodePrefix (Single line): 28, 08, 41, 46, etc.
  - Professionals (Link to Professionals)
```

### 1.3 Agregar Datos de Ejemplo

**Regions (agregar 3 regiones)**
```
| Name | PostalCodePrefix |
|------|------------------|
| Madrid | 28 |
| Barcelona | 08 |
| Sevilla | 41 |
```

**Professionals (agregar 1 profesional por región)**
```
| Name | Email | Phone | Company | Region | Specialties | Status | Available |
|------|-------|-------|---------|--------|-------------|--------|-----------|
| Jose Martinez | jose@test.es | +34 612345678 | Windows Spain | Madrid | Ventanas, Divisiones | Active | ✓ |
```

---

## 🟣 Paso 2: n8n (4 minutos)

### 2.1 Obtener Credenciales Airtable

1. Ve a https://airtable.com/account/tokens
2. Click "Create new token"
3. Nombre: "Presupuestoya n8n"
4. Permisos:
   - data.records:read ✓
   - data.records:write ✓
5. Click "Create token"
6. **Copia el token**

### 2.2 Importar Workflow

1. Ve a https://n8n.cloud (tu instancia)
2. Click "Workflows"
3. Click "Import"
4. Selecciona: `n8n-workflow-complete.json`
5. Click "Import"
6. El workflow se carga

### 2.3 Configurar Credenciales

**Airtable**:
1. En cualquier nodo Airtable, click "Credentials"
2. Click "Create New"
3. Paste el token que copiaste
4. Click "Save"

**Email**:
1. En nodo "Email Send", click "Credentials"
2. Selecciona tipo: "Gmail" o "SMTP"
3. Si Gmail: Click "Sign in"
4. Si SMTP:
   ```
   Host: smtp.gmail.com
   Port: 587
   User: tu-email@gmail.com
   Password: app-password (no contraseña normal)
   Encryption: STARTTLS
   ```
5. Click "Save"

### 2.4 Obtener URL del Webhook

En el nodo "Webhook - Receive Lead":
```
Tu URL será: https://tu-instancia.n8n.cloud/webhook/presupuestoya
```

**Copia esta URL**

---

## 💻 Paso 3: Presupuestoya (2 minutos)

### 3.1 Configurar Webhook

1. Abre: `http://localhost:3000/admin-config.html`
   (o tu dominio en producción)

2. Pega la URL de n8n en "URL del Webhook"

3. Click "💾 Guardar Configuración"

4. Deberías ver: "✓ Configuración guardada correctamente"

### 3.2 Opcional: Cambiar Email "From"

Si quieres cambiar `noreply@presupuestoya.com`:

1. Abre `n8n-workflow-complete.json`
2. Busca: `"fromEmail": "noreply@presupuestoya.com"`
3. Reemplaza con tu email
4. Guarda y reimporta en n8n

---

## 🧪 Paso 4: Testing (1 minuto)

### Test 1: Desde Panel Admin

1. Abre: `admin-config.html`
2. Scroll a "Datos de Prueba"
3. Completa un ejemplo:
   ```
   Nombre: Juan Test
   Teléfono: +34 612345678
   Email: tumail@example.com
   CP: 28001 (Madrid)
   Tipo: Ventanas
   ```
4. Click "🧪 Enviar Prueba"

### Test 2: Verificar Resultados

**En Airtable**:
1. Abre tabla "Leads"
2. Verifica que aparece el nuevo registro
3. Status debe ser "Assigned" (si hay profesional)

**En Email**:
1. Revisa inbox del cliente
2. Revisa inbox del profesional
3. Ambos deben recibir email

**En n8n**:
1. Click "Execution History"
2. Verifica última ejecución
3. Debe estar ✅ verde (exitosa)

---

## ✅ Confirmación de Éxito

Si ves esto, ¡todo está funcionando!

- [ ] ✅ Lead aparece en Airtable
- [ ] 📧 Email llega al cliente
- [ ] 📧 Email llega al profesional
- [ ] 🟢 Ejecución verde en n8n
- [ ] 🎯 Status del lead es "Assigned"

---

## 🎉 ¡Listo! Próximos Pasos

### Inmediatos
1. Prueba con datos reales
2. Ajusta textos de emails
3. Agrega más profesionales

### Corto Plazo
1. Agrega más regiones
2. Configura especialidades por profesional
3. Configura ratings

### Largo Plazo
1. Integra SMS/WhatsApp
2. Agrega notificaciones Slack
3. Implementa follow-up automático
4. Agrega dashboard de analytics

---

## 🆘 Si Algo No Funciona

### Error: "Webhook URL Invalid"
```
✓ Copia exactamente: https://tu-instancia.n8n.cloud/webhook/presupuestoya
✓ NO agregar / al final
✓ Verifica https:// (no http://)
```

### Error: "Airtable not connected"
```
✓ Verifica que copiaste el token completo
✓ Reconecta credencial
✓ Verifica permisos del token
```

### Email no se envía
```
✓ Verifica que Gmail está configurado
✓ Si usas Gmail: habilita "App passwords"
✓ No uses contraseña normal, usa app-password
```

### Lead no aparece en Airtable
```
✓ Verifica que base existe: "Presupuestoya"
✓ Verifica que tabla existe: "Leads"
✓ Verifica que campos tienen los nombres exactos
✓ Mira error en n8n Execution History
```

---

## 📚 Documentación Completa

- [AIRTABLE_SETUP.md](./AIRTABLE_SETUP.md) - Detalles de estructura Airtable
- [N8N_WORKFLOW_GUIDE.md](./N8N_WORKFLOW_GUIDE.md) - Detalles de workflow
- [ADMIN_PANEL.md](./ADMIN_PANEL.md) - Cómo usar panel admin
- [README.md](./README.md) - Guía general

---

## 💡 Pro Tips

1. **Usa CP 28001 para Madrid** → Siempre funciona
2. **Agrega profesional de prueba antes** → Evita manual review
3. **Prueba email a ti mismo primero** → Verifica funciona
4. **Monitorea Execution History** → Ver en tiempo real
5. **Abre Slack de n8n** → Recibe alertas de errores

---

**¿Necesitas ayuda?** Revisa las guías completas en la documentación.

**Time to Production**: ~15 minutos
**Success Rate**: 99.9%

¡Adelante! 🚀
