# Sistema de Reportes Diarios Automáticos

Documentación completa para configurar reportes diarios automáticos que resumen el rendimiento de leads, conversión y alertas críticas.

---

## 📊 ¿Qué Incluye el Reporte Diario?

### Secciones del Email

```
1️⃣ RESUMEN DEL DÍA
   ├─ Total leads entrantes
   ├─ Leads asignados
   └─ Leads rechazados

2️⃣ ESTADO DE LEADS
   ├─ Nuevos (New)
   ├─ Asignados (Assigned)
   ├─ En Progreso (In Progress)
   ├─ Completados (Completed)
   └─ Rechazados (Rejected)

3️⃣ DISTRIBUCIÓN GEOGRÁFICA
   ├─ Top 5 regiones
   ├─ Leads por región
   └─ Porcentaje del total

4️⃣ POR TIPO DE SERVICIO
   ├─ Ventanas
   ├─ Puertas
   ├─ Cerramientos
   ├─ Divisiones
   └─ Armarios

5️⃣ ALERTAS DE RIESGO
   ├─ Leads sin respuesta (>24h)
   ├─ Críticos (>72h)
   └─ Acciones requeridas

6️⃣ ESTADÍSTICAS DEL MES
   ├─ Total completados
   └─ Tasa de conversión

7️⃣ CALL-TO-ACTION
   └─ Link a Airtable dashboard
```

---

## 🔧 Configuración del Workflow

### Paso 1: Importar Workflow

1. Ve a n8n: https://tu-instancia.n8n.cloud
2. Click "Workflows" → "Import"
3. Selecciona: `n8n-workflow-daily-report.json`
4. Click "Import"

### Paso 2: Conectar Airtable

El workflow tiene 3 nodos Airtable que se ejecutan en paralelo:

**Nodo 1: Get Today's Leads**
```
Base: Presupuestoya
Table: Leads
Filter: {DateReceived} >= TODAY()
Fields: Name, Email, Phone, Region, ClosureType, Status, DateReceived
```

**Nodo 2: Get Month Completions**
```
Base: Presupuestoya
Table: Leads
Filter: {Status} = "Completed" AND {DateReceived} >= TODAY()-30
Fields: Name, Status, Region, ClosureType
```

**Nodo 3: Get Overdue Leads**
```
Base: Presupuestoya
Table: Leads
Filter: {Status} = "Assigned" AND {DateAssigned} <= TODAY()-1
Fields: Name, Region, Status, AssignedTo, DateAssigned
```

### Paso 3: Configurar Email

En nodo "Send Daily Report Email":
1. Credentials: Tu SMTP/Gmail
2. To Email: sales@presupuestoya.com (o lista de emails)
3. From Email: noreply@presupuestoya.com
4. Subject: Automático (incluye fecha)

### Paso 4: Activar Scheduler

En nodo "Daily Report Trigger (8 AM)":
```
Type: CRON
Trigger: Every day
At: 8:00 AM
Timezone: Europe/Madrid
```

Si quieres cambiar la hora:
- Unit: hours
- Value: 24
- At Hour: 8 (cambia a la hora que prefieras)

---

## 📈 Métricas Que Se Calculan

### Diarias

| Métrica | Fórmula | Propósito |
|---------|---------|-----------|
| Total Leads | COUNT({DateReceived} = today) | Ver volumen diario |
| Asignados | COUNT({Status} = "Assigned") | Velocidad de asignación |
| Completados | COUNT({Status} = "Completed") | Conversión diaria |
| Por Región | GROUP BY {Region} | Distribución geográfica |
| Por Tipo | GROUP BY {ClosureType} | Demanda por producto |

### Alertas

| Alerta | Trigger | Acción |
|--------|---------|--------|
| Sin respuesta 24h | {DateAssigned} <= TODAY()-1 | Notificar manager |
| Crítico 72h | {DateAssigned} <= TODAY()-3 | Escalar a admin |

---

## 📧 Personalización del Email

### Cambiar Destinatarios

En nodo "Send Daily Report Email":
```
To Email (singular):
  sales@presupuestoya.com

To Emails (múltiples):
  sales@presupuestoya.com, manager@presupuestoya.com, admin@presupuestoya.com
```

### Cambiar Hora de Envío

En nodo "Daily Report Trigger":
```
Opción A: Cambiar "At Hour"
- At Hour: 9 (para 9 AM)
- At Hour: 18 (para 6 PM)

Opción B: Cambiar frecuencia
- Unit: hours
- Value: 12 (cada 12 horas)
- Uncomment "triggerAtHour" para hora específica
```

### Agregar/Cambiar Secciones del Email

El HTML del email está en nodo "Send Daily Report Email".

Para cambiar sección de "Distribución Geográfica":
```html
<!-- Encontrar esta línea: -->
<h3 style="margin: 0 0 15px 0; color: #202124;">🗺️ Distribución Geográfica</h3>

<!-- Cambiar emoji, texto o formato -->
```

---

## 🧮 Cálculos de Métricas

### Métrica 1: Tasa de Conversión

```javascript
// En nodo "Calculate Daily Metrics"
conversionRate = (completed / total) * 100

// Ejemplo:
// Si 10 leads completados de 50 totales:
// (10/50) * 100 = 20%
```

### Métrica 2: Distribución por Región

```javascript
// Contar leads por región
byRegion = {
  "Madrid": 15,
  "Barcelona": 12,
  "Sevilla": 8,
  ...
}

// Calcular %
Madrid% = (15 / total) * 100
```

### Métrica 3: Leads Críticos

```javascript
// Leads sin respuesta más de 72 horas
critical = COUNT({
  Status} = "Assigned" 
  AND DateAssigned <= TODAY()-3
)
```

---

## 🚨 Interpretación de Resultados

### Buen Desempeño
```
✅ >10 leads/día
✅ >70% asignados en 24h
✅ >30% conversión
✅ <5% críticos (>72h)
```

### Desempeño Regular
```
⚠️ 5-10 leads/día
⚠️ 50-70% asignados en 24h
⚠️ 20-30% conversión
⚠️ 5-10% críticos
```

### Desempeño Bajo
```
❌ <5 leads/día
❌ <50% asignados en 24h
❌ <20% conversión
❌ >10% críticos
```

---

## 📊 Interpretación por Región

### Analizar Desempeño Regional

```
Madrid:      20 leads (40%)  ✅ Fuerte
Barcelona:   12 leads (24%)  ✅ Bueno
Sevilla:      8 leads (16%)  ⚠️ Necesita atención
Valencia:     7 leads (14%)  ⚠️ Oportunidad
Otros:        3 leads (6%)   ❌ Muy bajo
```

**Acciones**:
- Regiones altas: Aumentar profesionales
- Regiones bajas: Marketing adicional
- Analizar tendencias: ¿Es estacional?

---

## 📈 Seguimiento de Tendencias

### Crear Histórico

Guardar emails en carpeta:
```
Email inbox:
  └─ Presupuestoya Reports
      ├─ 2024-08-13 - Daily Report
      ├─ 2024-08-12 - Daily Report
      └─ 2024-08-11 - Daily Report
```

### Llevar Registro Manual

Crear hoja de cálculo:
```
Fecha | Leads | Asignados | Completados | Críticos | Notes
2024-08-13 | 15 | 12 | 3 | 2 | Pico de Madrid
2024-08-12 | 12 | 10 | 2 | 1 | Normal
2024-08-11 | 9 | 7 | 1 | 0 | Fin de semana bajo
```

---

## 🔧 Troubleshooting

### El email no llega

```
✓ Verifica que workflow está "Active"
✓ Verifica que scheduler está correcto
✓ Revisa credenciales SMTP/Gmail
✓ Mira execution history en n8n
✓ Verifica email "To" es correcto
✓ Revisa spam/junk folder
```

### Métricas incorrectas

```
✓ Verifica filtros en Airtable nodes
✓ Verifica que campos existen en tabla
✓ Comprueba que nombres de campos son exactos
✓ Revisa tipos de datos (Select, DateTime, etc.)
✓ Mira logs en execution history
```

### Email con formato roto

```
✓ Revisa HTML en nodo "Send Daily Report Email"
✓ Verifica que todas las tags cierren correctamente
✓ Prueba con cliente de email diferente
✓ Visualiza source para ver HTML completo
```

### Datos vacíos en email

```
✓ Verifica que hay registros en Airtable
✓ Verifica filtros (ej: {DateReceived} >= TODAY())
✓ Mira si TODAY() se calcula correctamente
✓ Prueba con rango de fechas más amplio
```

---

## 💡 Mejoras Futuras

### Mejora 1: Reportes Adicionales

```
Opción A: Reportes Semanales
- Unit: 7 days
- Día: Monday
- Hora: 8 AM

Opción B: Reportes Mensuales
- Unit: 30 days
- Día: Primero del mes
- Hora: 9 AM
```

### Mejora 2: Gráficos en Email

Usar n8n node "Slack" o "Google Sheets":
```
Crear chart de leads por región
Adjuntar como imagen en email
Requiere: node Chart o Slack integration
```

### Mejora 3: Alertas Críticas Inmediatas

Crear workflow separado:
```
IF {Status} = "Assigned" AND {DateAssigned} <= TODAY()-2
THEN send SMS/WhatsApp to manager
```

### Mejora 4: Diferentes Reportes por Rol

```
Para Sales Manager:
- Leads por región
- Profesionales saturados
- Top performers

Para CEO:
- Revenue (si aplica)
- Conversión %
- Growth trends

Para Profesional:
- Mis leads hoy
- Próximas acciones
```

---

## 🎯 Best Practices

### 1. Revisar Reporte Diario

Tiempo estimado: 5 minutos
```
✓ Abrir email matutino
✓ Revisar métricas principales
✓ Notar cualquier anormalidad
✓ Tomar acciones si es necesario
```

### 2. Escalación de Críticos

Si ves criterios muy altos:
```
✓ Ir a Airtable
✓ Abrir vista "Críticos"
✓ Notificar profesionales
✓ Reasignar si es necesario
```

### 3. Análisis Semanal

Cada lunes, revisar:
```
✓ Tendencia de leads
✓ Conversión semanal
✓ Rendimiento por región
✓ Performance de profesionales
```

---

## 📊 Ejemplo de Reporte Real

```
REPORTE DIARIO: Martes, 13 de Agosto 2024

📈 RESUMEN DEL DÍA
   15 Leads Entrantes
   12 Asignados Hoy
   2 Rechazados

🔄 ESTADO DE LEADS
   Nuevos:         3
   Asignados:     12
   En Progreso:    8
   Completados:    3
   Rechazados:     2

🗺️ DISTRIBUCIÓN GEOGRÁFICA
   Madrid:        8 leads (53%)
   Barcelona:     4 leads (27%)
   Sevilla:       2 leads (13%)
   Valencia:      1 lead  (7%)

🪟 POR TIPO DE SERVICIO
   Ventanas:      8 (53%)
   Puertas:       4 (27%)
   Cerramientos:  2 (13%)
   Armarios:      1 (7%)

🚨 LEADS SIN RESPUESTA
   Sin respuesta:     7 leads
   Críticos (>72h):   2 leads
   ACCIÓN: Revisar vista "Críticos" en Airtable

📅 ESTADÍSTICAS DEL MES
   Completados:   45 leads
   Tasa conversión: 28%

CONCLUSIÓN:
✅ Día fuerte en Madrid
⚠️ Barcelona necesita atención
🟢 Conversión dentro de lo normal
🔴 2 leads críticos requieren intervención inmediata
```

---

## 🎓 Próximos Pasos

1. ✅ Importar workflow daily report
2. ✅ Conectar Airtable (mismo que workflows anteriores)
3. ✅ Configurar email (to, from, subject)
4. ✅ Establecer hora de envío (8 AM)
5. ✅ Activar workflow
6. ✅ Monitorear primer reporte
7. ✅ Ajustar si es necesario

---

**Última actualización**: 2024-08-13
**Versión**: 1.0
