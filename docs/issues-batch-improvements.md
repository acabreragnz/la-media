# GitHub Issues - Batch de Mejoras

Issues para crear en el repositorio `acabreragnz/la-media`.

---

## Issue 3: Copiar al portapapeles

**Título:** `feat: add copy to clipboard button for conversion result`

**Labels:** `enhancement`

**Body:**
```markdown
## Descripción
Solo está disponible compartir por WhatsApp. Debería haber opción de copiar el resultado al portapapeles.

## Propuesta
- Botón de copiar junto al resultado de conversión (icono de clipboard)
- Toast de confirmación "¡Copiado!" que desaparece después de 2 segundos
- Formato a copiar: `100 USD = 4,325 UYU (BROU, 03/02/2026)`

## Implementación sugerida
- Usar `navigator.clipboard.writeText()`
- Componente Toast reutilizable o usar librería como `vue-toastification`
- Agregar botón en `ConversionResult.vue` junto al valor

## Beneficio
Usuarios pueden compartir por cualquier plataforma (Telegram, email, notas), no solo WhatsApp.
```

---

## Issue 8: Mensajes de error específicos

**Título:** `fix: show specific error messages instead of generic error`

**Labels:** `bug`, `ux`

**Body:**
```markdown
## Descripción
`ErrorBanner.vue` muestra solo "Error al cargar cotizaciones" genérico sin diferenciar el tipo de error.

## Comportamiento actual
- Cualquier error muestra el mismo mensaje genérico
- Usuario no sabe si es problema de su red o del servidor

## Comportamiento esperado
Mensajes específicos según el tipo de error:

| Error | Mensaje |
|-------|---------|
| Timeout | "El servidor tardó demasiado. Intentá de nuevo." |
| Sin red | "Sin conexión a internet. Verificá tu conexión." |
| Scraper falla | "El banco no está disponible temporalmente." |
| 503 | "Servicio en mantenimiento. Intentá en unos minutos." |
| SSL | "Problema de conexión segura con el banco." |

## Implementación sugerida
- Extender el tipo de error en la respuesta de la API
- Mapear códigos HTTP a mensajes amigables
- Detectar `navigator.onLine` para errores de red

## Beneficio
Usuario entiende la causa del problema y sabe si debe reintentar o esperar.
```

---

## Issue 10: Modo claro (Light Theme)

**Título:** `feat: add light theme with system preference detection`

**Labels:** `enhancement`, `accessibility`

**Body:**
```markdown
## Descripción
La aplicación es 100% dark mode. Debería detectar preferencia del sistema y permitir cambiar tema.

## Propuesta
1. Detectar `prefers-color-scheme` del sistema operativo
2. Toggle en header para cambiar manualmente
3. Persistir preferencia en localStorage
4. Tres opciones: Auto | Claro | Oscuro

## Implementación sugerida
- Variables CSS en `:root` para colores base
- Clase `[data-theme='light']` en `<html>`
- Composable `useTheme()` con:
  - `theme: 'auto' | 'light' | 'dark'`
  - `effectiveTheme: computed` (resuelve 'auto')
  - `toggleTheme()`

## Paleta sugerida para modo claro
- Background: `#f5f5f5`
- Card: `#ffffff`
- Text: `#1a1a1a`
- Mantener accent colors de cada banco

## Beneficio
Mejora accesibilidad para usuarios que prefieren modo claro, especialmente durante el día.
```

---

## Issue 11: Mejorar navegación por teclado

**Título:** `fix: improve keyboard navigation and focus indicators`

**Labels:** `bug`, `accessibility`

**Body:**
```markdown
## Descripción
Los inputs tienen estilos que afectan la navegación por teclado. No hay indicador visual claro de foco.

## Problemas actuales
- `outline: none` en algunos elementos quita el focus ring
- Tab no muestra claramente qué elemento tiene foco
- Falta de ARIA labels en algunos controles

## Comportamiento esperado
- Focus ring visible en TODOS los elementos interactivos
- Colores de focus que respeten el accent del banco
- Skip link para ir directo al contenido principal
- ARIA labels en botones de icono (swap, share, etc.)

## Checklist de accesibilidad
- [ ] Focus visible en inputs
- [ ] Focus visible en botones
- [ ] Focus visible en links
- [ ] Tab order lógico
- [ ] ARIA labels en iconos
- [ ] Skip to content link
- [ ] Contrast ratio >= 4.5:1

## Recursos
- [WCAG 2.1 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Beneficio
Accesibilidad mejorada para usuarios con discapacidades visuales o que prefieren navegación por teclado.
```

---

## Issue 13: Validación visual de rango en inputs

**Título:** `fix: show validation error for out-of-range input values`

**Labels:** `bug`, `ux`

**Body:**
```markdown
## Descripción
El composable define `valueRange: { min: 0, max: 100000000 }` pero no hay feedback visual cuando el usuario excede estos límites.

## Comportamiento actual
- Usuario ingresa `999999999999`
- Input acepta sin ningún mensaje
- Conversión puede dar resultados incorrectos o NaN

## Comportamiento esperado
- Borde rojo en input cuando valor está fuera de rango
- Mensaje de error debajo: "El monto máximo es $100.000.000"
- Prevenir conversión hasta que se corrija
- Para negativos: "El monto debe ser positivo"

## Implementación sugerida
```vue
<CurrencyInput
  :class="{ 'border-red-500': isOutOfRange }"
/>
<span v-if="isOutOfRange" class="text-red-500 text-sm">
  {{ errorMessage }}
</span>
```

## Casos a validar
| Input | Resultado |
|-------|-----------|
| -100 | "El monto debe ser positivo" |
| 0 | ✓ Válido |
| 100000001 | "El monto máximo es $100.000.000" |
| abc | Prevenir entrada (ya funciona) |

## Beneficio
Feedback claro al usuario sobre límites válidos, evita comportamiento inesperado.
```

---

## Issue 14: Atajos de teclado

**Título:** `feat: add keyboard shortcuts for common actions`

**Labels:** `enhancement`

**Body:**
```markdown
## Descripción
No hay atajos de teclado para acciones comunes. Usuarios avanzados podrían operar más rápido.

## Propuesta de atajos

| Atajo | Acción |
|-------|--------|
| `S` | Swap dirección USD ↔ UYU |
| `C` | Copiar resultado al portapapeles |
| `W` | Compartir por WhatsApp |
| `Esc` | Limpiar input activo |
| `1-5` | Navegar a banco (1=BROU, 2=Itaú, etc.) |
| `?` | Mostrar modal de ayuda con atajos |
| `/` | Focus en input USD |

## Implementación sugerida
- Composable `useKeyboardShortcuts()`
- Usar `@vueuse/core` `useMagicKeys` o listener manual
- Solo activar cuando no hay focus en input (excepto Esc)
- Modal de ayuda accesible con `?`

```typescript
// Ejemplo con @vueuse/core
const { s, c, w, escape } = useMagicKeys()

watch(s, (pressed) => {
  if (pressed && !isInputFocused.value) {
    swapDirection()
  }
})

watch(escape, (pressed) => {
  if (pressed) {
    clearInput()
  }
})
```

## UI para mostrar atajos
- Tooltip en botones mostrando atajo: "Compartir (W)"
- Modal de ayuda con lista completa

## Beneficio
Experiencia mejorada para power users, operación más rápida sin mouse.
```

---

## Comandos para crear issues

```bash
# Autenticarse primero
gh auth login

# Crear cada issue (ajustar labels según existan en el repo)
gh issue create --title "TITULO" --label "LABELS" --body "BODY"
```
