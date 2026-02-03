# Issues para La Media

Ejecutar cada comando para crear las issues en GitHub:

```bash
# Asegúrate de estar autenticado: gh auth login
```

---

## Issue 1: Vista de comparación de bancos

```bash
gh issue create \
  --title "feat: add comparison view to show all bank rates side by side" \
  --label "enhancement" \
  --body "## Descripción
Actualmente el usuario debe navegar entre bancos individualmente para comparar tasas.

## Propuesta
- Nueva ruta \`/comparar\`
- Cards de cada banco mostrando: compra, venta, media
- Destacar visualmente el mejor rate para compra y venta
- Permitir ingresar monto y ver conversión en todos los bancos

## Beneficio
Tomar decisiones rápidas entre bancos sin navegar múltiples páginas."
```

---

## Issue 2: Indicador visual de cambio de tasa (subió/bajó)

```bash
gh issue create \
  --title "feat: show rate change indicator (up/down arrow with color)" \
  --label "enhancement" \
  --body "## Descripción
Cuando la tasa cambia, no hay indicación visual de si subió o bajó respecto al valor anterior.

## Propuesta
- Mostrar flecha verde ↑ si la tasa subió
- Mostrar flecha roja ↓ si la tasa bajó
- Pequeña animación de transición
- Guardar última tasa conocida en localStorage para comparar

## Mockup
\`\`\`
Media: 43.25 ↑ (+0.15)
\`\`\`"
```

---

## Issue 3: Copiar resultado al portapapeles

```bash
gh issue create \
  --title "feat: add copy to clipboard button for conversion result" \
  --label "enhancement" \
  --body "## Descripción
Solo está disponible compartir por WhatsApp. Debería haber opción de copiar el resultado al portapapeles.

## Propuesta
- Botón de copiar junto al resultado de conversión
- Toast de confirmación 'Copiado!'
- Copiar formato: '100 USD = 4,325 UYU (BROU, 03/02/2026)'

## Beneficio
Usuarios pueden compartir por cualquier plataforma, no solo WhatsApp."
```

---

## Issue 4: Persistir valores ingresados entre navegación

```bash
gh issue create \
  --title "fix: persist input values when navigating between banks" \
  --label "bug,ux" \
  --body "## Descripción
Cuando el usuario navega entre bancos o actualiza la página, los valores ingresados en USD/UYU se pierden.

## Comportamiento actual
- Usuario ingresa 100 USD en BROU
- Navega a Itaú
- Vuelve a BROU
- El campo está vacío

## Comportamiento esperado
- Valores deberían persistir por banco usando localStorage
- Similar a cómo ya se guarda la dirección de conversión

## Impacto
Frustración al hacer comparaciones rápidas entre bancos."
```

---

## Issue 5: Soporte offline con PWA

```bash
gh issue create \
  --title "feat: add offline support with service worker (PWA)" \
  --label "enhancement" \
  --body "## Descripción
La app tiene manifest.json pero no hay service worker para funcionar offline.

## Propuesta
- Service worker que cachee la última tasa conocida
- Permitir cálculos offline con última tasa
- Mostrar banner 'Usando tasa de hace X horas' cuando offline
- Sincronizar cuando vuelva la conexión

## Beneficio
App funcional sin internet, ideal para usuarios móviles con conexión intermitente."
```

---

## Issue 6: Mini gráfico de historial de tasas

```bash
gh issue create \
  --title "feat: add mini sparkline chart showing rate history" \
  --label "enhancement" \
  --body "## Descripción
No hay visualización de cambios históricos de tasa. El usuario no tiene contexto sobre volatilidad.

## Propuesta
- Mini sparkline debajo de la tasa media
- Mostrar últimas 24 horas o 7 días
- Hover para ver valor en punto específico
- Guardar historial en Blobs

## Mockup
\`\`\`
Media: 43.25
[▁▂▃▅▆▇█▇▆▅] últimas 24h
\`\`\`

## Implementación sugerida
- Usar librería ligera como unovis/sparkline
- Scheduled function guarda histórico cada 15 min"
```

---

## Issue 7: Historial de conversiones realizadas

```bash
gh issue create \
  --title "feat: add conversion history (last 10 conversions)" \
  --label "enhancement" \
  --body "## Descripción
No hay registro de conversiones realizadas. Usuarios que hacen múltiples conversiones no tienen referencia.

## Propuesta
- Guardar últimas 10-20 conversiones en localStorage
- Mostrar en panel colapsable o modal
- Incluir: fecha, banco, monto, tasa usada, resultado
- Opción de limpiar historial

## Beneficio
Útil para usuarios empresariales o que necesitan tracking."
```

---

## Issue 8: Mejorar mensajes de error con detalles específicos

```bash
gh issue create \
  --title "fix: show specific error messages instead of generic error" \
  --label "bug,ux" \
  --body "## Descripción
ErrorBanner muestra solo 'Error al cargar cotizaciones' genérico sin diferenciar el tipo de error.

## Comportamiento actual
- Cualquier error muestra el mismo mensaje

## Comportamiento esperado
- Timeout: 'El servidor tardó demasiado. Intentá de nuevo.'
- Red: 'Sin conexión a internet.'
- Scraper: 'El banco X no está disponible temporalmente.'
- SSL: 'Problema de conexión segura.'

## Beneficio
Usuario entiende si es problema de su red o del servicio."
```

---

## Issue 9: Notificación cuando la tasa cambia significativamente

```bash
gh issue create \
  --title "feat: notify user when rate changes significantly" \
  --label "enhancement" \
  --body "## Descripción
Cuando la tasa cambia significativamente (ej: > 0.5%), no hay notificación al usuario.

## Propuesta
- Toast notification cuando la tasa cambie más de X%
- Badge en el icono del banco en HomeView
- Opción de configurar umbral de notificación
- Push notification opcional (PWA)

## Ejemplo
'📈 BROU: La tasa subió 0.8% en los últimos 15 minutos'"
```

---

## Issue 10: Modo claro (light theme)

```bash
gh issue create \
  --title "feat: add light theme with system preference detection" \
  --label "enhancement,accessibility" \
  --body "## Descripción
La app es 100% dark mode. Debería detectar preferencia del sistema y permitir toggle.

## Propuesta
- Detectar \`prefers-color-scheme\`
- Toggle en header o settings
- Persistir preferencia en localStorage
- Variables CSS para ambos temas

## Beneficio
Accesibilidad para usuarios que prefieren modo claro, especialmente durante el día."
```

---

## Issue 11: Mejorar accesibilidad de navegación por teclado

```bash
gh issue create \
  --title "fix: improve keyboard navigation and focus indicators" \
  --label "bug,accessibility" \
  --body "## Descripción
Los inputs tienen \`outline: none\` que afecta navegación por teclado. No hay indicador visual claro de foco.

## Comportamiento actual
- Tab no muestra claramente qué elemento tiene foco
- Lectores de pantalla tienen dificultad

## Comportamiento esperado
- Focus ring visible en todos los elementos interactivos
- Skip links para navegación rápida
- ARIA labels correctos

## Impacto
Accesibilidad reducida para usuarios con discapacidades."
```

---

## Issue 12: Feedback visual al compartir por WhatsApp

```bash
gh issue create \
  --title "fix: add visual feedback when sharing via WhatsApp" \
  --label "bug,ux" \
  --body "## Descripción
Al hacer clic en 'Compartir cotización', no hay confirmación visual de que la acción fue exitosa.

## Comportamiento actual
- Click en botón
- Se abre WhatsApp (o no, si falla)
- Sin feedback visual

## Comportamiento esperado
- Botón muestra estado 'Abriendo...' brevemente
- Toast de confirmación o error
- Fallback a copiar si WhatsApp no disponible"
```

---

## Issue 13: Validación visual de rango en inputs

```bash
gh issue create \
  --title "fix: show validation error for out-of-range values" \
  --label "bug,ux" \
  --body "## Descripción
El composable define \`valueRange: { min: 0, max: 100000000 }\` pero no hay feedback cuando el usuario excede el límite.

## Comportamiento actual
- Usuario ingresa 999999999999
- Input acepta sin mensaje
- Comportamiento impredecible

## Comportamiento esperado
- Mostrar borde rojo en input
- Mensaje: 'El monto máximo es 100,000,000'
- Prevenir conversión hasta corregir"
```

---

## Issue 14: Atajos de teclado

```bash
gh issue create \
  --title "feat: add keyboard shortcuts for power users" \
  --label "enhancement" \
  --body "## Descripción
No hay atajos de teclado para acciones comunes.

## Propuesta
- \`S\` o \`Space\` en input: Swap dirección USD/UYU
- \`C\`: Copiar resultado
- \`W\`: Compartir WhatsApp
- \`Esc\`: Limpiar input
- \`1-5\`: Navegar a banco específico
- \`?\`: Mostrar ayuda de atajos

## Beneficio
Usuarios avanzados pueden operar más rápido."
```

---

## Issue 15: Calcular con tasa personalizada

```bash
gh issue create \
  --title "feat: allow manual rate input for custom calculations" \
  --label "enhancement" \
  --body "## Descripción
No hay opción de ingresar una tasa manual para cálculos con tasa diferente (paralela, histórica, etc).

## Propuesta
- Toggle 'Usar tasa personalizada'
- Input para ingresar tasa manual
- Mostrar diferencia vs tasa oficial
- Útil para simular escenarios

## Ejemplo de uso
- Usuario quiere calcular con tasa del mercado paralelo
- Usuario quiere ver cuánto hubiera sido ayer
- Contador necesita tasa específica de cierre"
```

---

## Comandos para crear todas las issues

```bash
# Ejecutar en el directorio del proyecto después de: gh auth login

# O crear manualmente desde GitHub web copiando título y body de cada una
```
