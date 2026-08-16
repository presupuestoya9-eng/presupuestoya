# Follow-up Automático - Presupuestoya

Sistema de seguimiento automático para garantizar que ningún lead quede sin respuesta comercial. Escalado automático por tiempo.

---

## 📊 Sistema de Follow-up por Fases

```
Lead Asignado
      │
      ▼
┌─────────────────────────────┐
│  FASE 1: 24 HORAS           │
│  ✓ Lead en BD              │
│  ✓ Profesional notificado   │
│  └─ Sin respuesta cliente    │
└─────────────┬───────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
[24h WAIT]          [NOTHING]
    │
    ▼
┌──────────────────────────────┐
│  FASE 2: 24-48h RECALL       │
│  ✓ Email recordatorio cliente │
│  ✓ Email urgencia profesional │
│  └─ Marca status In Progress  │
└──────────────┬───────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
[48h WAIT]           [COMPLETE]
    │                 (Respuesta)
    ▼
┌──────────────────────────────┐
│  FASE 3: 72h ESCALATION      │
│  ✓ Email cliente URGENTE     │
│  ✓ Email profesional CRÍTICO │
│  ✓ Alert admin para intervalo │
│  └─ Posible reasignación     │
└──────────────┬───────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
[7 DAYS]            [COMPLETE]
    │              (Respuesta)
    ▼
[AUTO-CLOSE]
```

---

## 🕐 Timeline de Acciones

### Hora 0: Lead Asignado
```
✓ Email a cliente
✓ Email a profesional
✓ SMS/WhatsApp a profesional
✓ Status: "Assigned"
```

### Hora 24: Primer Follow-up
```
✓ Revisar si hay respuesta
├─ SÍ → Marcar "In Progress"
└─ NO → Ejecutar:
   ✓ Email recordatorio a cliente
   ✓ Email urgencia a profesional
   ✓ SMS/WhatsApp urgente a profesional
   ✓ Cambiar status → "In Progress"
```

### Hora 72: Escalación
```
✓ Revisar si aún sin respuesta
├─ SÍ → Ejecutar:
│  ✓ Email URGENTE a cliente (con advertencia de cancelación)
│  ✓ Email CRÍTICO a profesional
│  ✓ Alert admin para intervención manual
│  ✓ Opciones: Reasignar, contacto directo cliente
└─ NO → Marcar "Completed"
```

### Día 7: Auto-cierre
```
✓ Si aún sin respuesta
├─ Contacto manual desde admin
└─ Closed/Rejected en Airtable
```

---

## 🔧 Configuración del Workflow Follow-up

### Paso 1: Importar Workflow

1. Ve a n8n: https://tu-instancia.n8n.cloud
2. Click "Workflows" → "Import"
3. Selecciona: `n8n-workflow-followup.json`
4. Click "Import"

### Paso 2: Conectar Airtable

1. En el workflow, ve a nodo "Get Leads Without Response (24h)"
2. Selecciona Airtable credential (misma que workflow principal)
3. Verifica:
   - Base: Presupuestoya
   - Table: Leads
   - Filter: `AND({Status} = 'Assigned', {DateAssigned} <= TODAY()-1)`

**Lo mismo para nodo "Get Leads Without Response (72h)":**
- Filter: `AND({Status} = 'Assigned', {DateAssigned} <= TODAY()-3)`

### Paso 3: Configurar Email

En cada nodo "Email Send":
1. Credentials: Tu SMTP/Gmail
2. From Email: noreply@presupuestoya.com
3. Personaliza templates si es necesario

### Paso 4: Activar Scheduler

1. Nodo "Check Every 24 Hours" ya está configurado
2. Ejecuta cada 24 horas automáticamente
3. Si quieres cambiar intervalo:
   - Unit: `hours`
   - Value: `24` (cada 24h)
   - O cambiar a `6` para cada 6 horas

---

## 📧 Emails Automáticos Incluidos

### Email 1: Recordatorio 24h (Cliente)

**Cuando**: 24 horas sin respuesta del profesional
**Para**: Cliente
**Asunto**: ⏰ Te recordamos tu solicitud de presupuesto
**Contenido**:
- Reconoce la solicitud
- Dice que profesional está preparando
- Ofrece alternativa de contacto urgente

### Email 2: Escalación 24h (Profesional)

**Cuando**: 24 horas sin respuesta del profesional
**Para**: Profesional asignado
**Asunto**: 🔔 URGENTE: Lead {{name}} requiere atención
**Contenido**:
- Datos completos del cliente
- Teléfono directo
- Advertencia: 24h antes de escalar
- Instrucciones: Contactar teléfono, enviar presupuesto

### Email 3: Urgencia 72h (Cliente)

**Cuando**: 72 horas sin respuesta
**Para**: Cliente
**Asunto**: 🔔 Urgente: Solicitud de presupuesto pendiente
**Contenido**:
- Advertencia: Can ser cancelado
- Pide confirmación
- 24h deadline

### Email 4: Crítico 72h (Admin)

**Cuando**: 72 horas sin respuesta del profesional
**Para**: admin@presupuestoya.com
**Asunto**: 🚨 CRÍTICO: Lead {{name}} sin respuesta desde 72h
**Contenido**:
- Datos del lead
- Datos del profesional
- Acciones requeridas:
  1. Contactar profesional directamente
  2. Reasignar si no responde
  3. Contactar cliente

---

## 🤖 Automaciones Implementadas

### Automación 1: Validación de Leads

```
IF Status = "Assigned" 
   AND DateAssigned <= 24 horas atrás
   AND sin actualizaciones
THEN
  - Enviar email recordatorio cliente
  - Enviar email urgencia profesional
  - Cambiar status → "In Progress"
```

### Automación 2: Escalación

```
IF Status = "In Progress"
   AND DateAssigned <= 72 horas atrás
   AND NO existe "Completed" o "In Progress" mark
THEN
  - Enviar email URGENTE cliente
  - Enviar email CRÍTICO profesional
  - Enviar alert admin
  - Flag para revisión manual
```

### Automación 3: Auto-close (Opcional)

```
IF Status = "In Progress"
   AND DateAssigned <= 7 días atrás
   AND SIN actividad
THEN
  - Cambiar status → "Completed"
  - Send survey email to client
```

---

## 📊 Monitoreo del Follow-up

### Métricas Clave

1. **Response Rate**: % de leads con respuesta en 24h
   ```
   Objetivo: >70%
   Fórmula: Completed(24h) / Total(24h)
   ```

2. **Escalation Rate**: % de leads que llegan a escalación
   ```
   Objetivo: <20%
   Fórmula: Escalated(72h) / Total
   ```

3. **Average Time to Response**: Promedio de horas hasta respuesta
   ```
   Objetivo: <12 horas
   ```

### Viewing Metrics en Airtable

1. Ve a tabla "Leads"
2. Crea vista "Follow-up Stats"
3. Group by: Status
4. Filter by: DateAssigned is not empty
5. Verás:
   - Assigned: Leads sin respuesta
   - In Progress: Leads con primera respuesta
   - Completed: Leads finalizados

---

## 🔔 Notificaciones SMS/WhatsApp Follow-up

### Agregar SMS al Follow-up (Opcional)

En workflow, después de cada Email en el follow-up 24h:

```
Nodo: Twilio - Send SMS
To: {{$json.fields.AssignedTo[0].fields.Phone}}
Message:
  🔔 Lead {{name}} requiere atención
  {{closureType}} en {{region}}
  ☎️ {{phone}}
  
  Responde en 24h o se escalará
```

---

## 🎯 Casos de Uso

### Caso 1: Profesional Responde Rápido
```
Hora 0: Lead asignado
Hora 2: Profesional responde
Resultado: Status → "In Progress"
           Sin emails de follow-up
```

### Caso 2: Profesional Lento
```
Hora 0: Lead asignado
Hora 24: Sin respuesta aún
Hora 24: Trigger follow-up automático
         Email recordatorio cliente
         Email urgencia profesional
Hora 30: Profesional responde
Resultado: Status → "In Progress"
           Cliente recibió recordatorio
```

### Caso 3: Profesional No Responde
```
Hora 0: Lead asignado
Hora 24: Sin respuesta
Hora 48: Trigger follow-up 24h
Hora 72: Sin respuesta aún
Hora 72: Trigger escalación
         Email URGENTE cliente
         Email CRÍTICO profesional
         Alert admin
Resultado: Admin interviene manualmente
           Posible reasignación
```

---

## 🔧 Personalización

### Cambiar Tiempos de Follow-up

En nodo "Check Every 24 Hours":
```
Para follow-up cada 6 horas:
- Unit: hours
- Value: 6

Para follow-up cada 12 horas:
- Unit: hours
- Value: 12
```

### Cambiar Triggers

Modificar filtros en Airtable nodes:

**Fase 1 (24h)**:
```
Actual: {Status} = 'Assigned', {DateAssigned} <= TODAY()-1
Cambiar a TODAY()-0.5 para 12 horas
Cambiar a TODAY()-2 para 48 horas
```

**Fase 2 (72h)**:
```
Actual: {Status} = 'Assigned', {DateAssigned} <= TODAY()-3
Cambiar a TODAY()-2 para 48 horas
Cambiar a TODAY()-5 para 5 días
```

### Cambiar Destinatarios

Si quieres enviar copia a manager:
```
Email node "Send Follow-up Email 24h"
To field: {{$json.fields.Email}}, manager@presupuestoya.com
```

---

## ⚠️ Troubleshooting

### Emails no se envían
```
✓ Verifica SMTP credentials
✓ Verifica email "From" es válido
✓ Revisa Airtable tiene records que coinciden filtro
✓ Mira execution history para errores
```

### Lead no se actualiza en Airtable
```
✓ Verifica permiso write en Airtable credential
✓ Verifica que ID del record es correcto
✓ Verifica Status field existe en tabla
✓ Revisa tipo de dato (debe ser Single select)
```

### Workflow no ejecuta
```
✓ Verifica que workflow está "Active"
✓ Verifica que scheduler está configurado (cada 24h)
✓ Revisa error en execution history
✓ Reconecta credentials si es necesario
```

### Demasiados emails
```
Si hay muchos leads sin respuesta:
- Cambiar trigger a cada 12 horas (más frecuente)
- O cambiar a cada 48 horas (menos frecuente)
- Ajustar días en DateAssigned filter
```

---

## 📈 Best Practices

### 1. Manejar Excepciones

Para leads especiales (VIP, grandes clientes):
- Crear vista separada en Airtable
- Configurar workflow separado con triggers más agresivos

### 2. Horarios de Trabajo

Evitar emails fuera de horario:
```
Agregar nodo "Schedule" que verifica:
IF time between 08:00 and 18:00
   AND day NOT Sunday
THEN send emails
```

### 3. Límite de Escalaciones

Para no "molestar" demasiado:
```
Max 3 emails por lead
Después: marcar como "Completed" o "Rejected"
```

### 4. Feedback Loop

Registrar en Airtable:
- Cuándo respondió (si tarde)
- Razón de no respuesta
- Rating del follow-up effectiveness

---

## 🔄 Integración con Workflow Principal

### Workflow Principal (ya existe)
- Recibe lead
- Asigna profesional
- Envía emails iniciales

### Workflow Follow-up (nuevo)
- Se ejecuta cada 24h
- Revisa leads sin respuesta
- Renotifica escalonadamente
- Escala si es necesario

**Ambos workflows coexisten y trabajan juntos:**
```
Lead Flow
    ↓
Assign Profesional
    ↓
Notify (Principal Workflow)
    ↓
24h, 48h, 72h Follow-ups
    (Follow-up Workflow)
    ↓
Complete o Escalate
```

---

## 📊 Dashboard Recomendado

Crear en Airtable vista "Follow-up Dashboard":

```
Group by: Status
Sort by: DateAssigned (oldest first)

Show columns:
- Name
- Phone
- Email
- Professional
- Status
- Days Elapsed
- Next Action
```

Puedes filtrar para ver:
- Leads en riesgo (>24h sin respuesta)
- Leads críticos (>72h sin respuesta)
- High priority regions

---

## 🎓 Próximos Pasos

1. ✅ Importar workflow follow-up
2. ✅ Conectar Airtable (mismo que principal)
3. ✅ Configurar emails
4. ✅ Ajustar triggers (si es necesario)
5. ✅ Activar workflow
6. ✅ Monitorear ejecuciones

---

**Última actualización**: 2024-08-13
**Versión**: 1.0

---

## Ejemplo de Ejecución Exitosa

```
Martes 8:00am - Lead asignado
Martes 10am - Profesional recibe email + SMS
Martes 2pm - Profesional contacta cliente
Resultado: ✓ Completado en 6 horas

vs.

Martes 8:00am - Lead asignado
Miércoles 8:00am - Sin respuesta del profesional
Miércoles 8:15am - Trigger follow-up automático
Miércoles 8:20am - Emails sent (cliente + profesional)
Miércoles 8:30am - SMS urgente a profesional
Miércoles 10am - Profesional responde
Resultado: ✓ Completado pero con 26 horas de delay

Sin follow-up automático → Lead perdido ❌
Con follow-up automático → Lead recuperado ✓
```
