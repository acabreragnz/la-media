# E2E Tests - La Media

Tests end-to-end usando Playwright para validar la funcionalidad de la aplicación.

## 📁 Estructura

```
e2e/
├── pages/                    # Page Object Models (POM)
│   ├── home.page.ts         # HomePage actions and selectors
│   └── bank.page.ts         # BankPage actions and selectors
├── config/                   # Test configuration
│   └── routes.ts            # Centralized route constants
├── home.spec.ts             # Home page tests
└── input-validation.spec.ts # Currency input validation tests
```

## 🎭 Page Object Model (POM)

Este proyecto usa el patrón Page Object Model para mejorar mantenibilidad y reducir duplicación.

### HomePage (`pages/home.page.ts`)
Encapsula interacciones con la página principal:
- Selección de bancos (BROU, Itaú)
- Logo y elementos de navegación
- Verificación de carga de página

### BankPage (`pages/bank.page.ts`)
Encapsula interacciones con páginas de conversión específicas de cada banco:
- Input y validación de moneda
- Funcionalidad de swap de monedas
- Display de resultado de conversión
- Elementos específicos de página

## Ejecutar Tests

### Prerequisitos

```bash
# Instalar dependencias (si no están instaladas)
pnpm install

# Instalar navegadores de Playwright
pnpm exec playwright install chromium
```

### Comandos

```bash
# Ejecutar todos los tests
pnpm test:e2e

# Ejecutar solo tests de validación de input
pnpm test:e2e input-validation

# Ejecutar solo tests de navegación
pnpm test:e2e home

# Ver reporte HTML después de ejecutar
npx playwright show-report
```

## Tests de Validación de Input

El archivo `input-validation.spec.ts` valida que `vue-currency-input` funcione correctamente:

### ✅ Validaciones Implementadas

1. **Filtrado de caracteres no numéricos**
   - Letras: `abc123` → `123`
   - Símbolos: `@#$100` → `100`
   - Emojis: `😀100💰` → `100`

2. **Formato de números decimales**
   - Acepta coma como separador: `100,50` ✅
   - Previene múltiples separadores: `100,50,30` → `100,50`

3. **Validación de signos**
   - Rechaza números negativos: `-50` → `50`

4. **Valores especiales**
   - Acepta cero: `0` ✅
   - Maneja valores vacíos correctamente

5. **Consistencia después de swap**
   - La validación sigue funcionando después de cambiar dirección USD↔UYU

### ¿Por qué NO testeamos XSS/HTML injection?

**Vue.js escapa automáticamente todo el output** cuando usas:
- `{{ variable }}` - Escapado automático
- `v-text` - Escapado automático
- Templates de Vue - Escapado automático

Solo sería vulnerable si usaras `v-html` (mala práctica) o `innerHTML` directamente.

**Resumen**: No necesitas tests de seguridad XSS porque Vue ya te protege por defecto. 🛡️

## Tests de Navegación

El archivo `home.spec.ts` valida la navegación básica:

- Página principal carga correctamente
- Links a bancos funcionan
- Footer se muestra correctamente

## Tecnología

- **Playwright**: Framework de testing E2E
- **vue-currency-input**: Librería que maneja la validación numérica
- **Vue 3**: Framework que escapa automáticamente el output

## ✨ Mejores Prácticas Aplicadas

### ✅ APIs Modernas de Playwright
- Usa `.fill()` en lugar de `.type()` (deprecated) para inputs
- Sin llamadas redundantes a `.clear()` (`.fill()` limpia automáticamente)
- Uso consistente de APIs en todos los tests

### ✅ Selectores Intencionales
- Eliminados `.first()` innecesarios que podrían ocultar problemas
- Cada selector es específico e intencional

### ✅ Configuración Centralizada
- Constantes de rutas en `config/routes.ts`
- Sin URLs hardcodeadas en archivos de tests

### ✅ DRY (Don't Repeat Yourself)
- Selectores definidos una vez en Page Objects
- Acciones comunes encapsuladas en métodos reutilizables
- Setup consistente en bloques `beforeEach`

### ✅ Mantenibilidad
- Cambios de UI solo requieren actualizar Page Objects
- Lógica de tests separada de detalles de selectores
- Código de tests claro y legible

## Desarrollo

### Agregar Nuevos Tests

Ejemplo usando Page Objects:

```typescript
import { test, expect } from '@playwright/test'
import { BankPage } from './pages/bank.page'

test('mi nuevo test', async ({ page }) => {
  const bankPage = new BankPage(page, 'brou')
  await bankPage.navigate()
  await bankPage.waitForLoad()

  // Usar métodos del page object
  await bankPage.enterAmount('100')
  await bankPage.swapCurrency()

  // Usar selectores del page object
  await expect(bankPage.currencyInput).toHaveValue('100')
})
```

### Debugging

```bash
# Ver tests en modo UI (recomendado)
npx playwright test --ui

# Ejecutar con DevTools
PWDEBUG=1 pnpm test:e2e

# Screenshots en fallos (automático)
pnpm test:e2e
```

## Notas

- Tests corren en modo headless (sin ventana visible)
- Solo se ejecutan en Chromium (suficiente para validación)
- El servidor dev se inicia automáticamente antes de los tests
- Screenshots y videos se guardan en `test-results/` en caso de fallos
