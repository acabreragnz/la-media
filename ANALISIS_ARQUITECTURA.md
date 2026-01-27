# 🔍 Análisis de Arquitectura - Mejoras Propuestas

## 1. 🐛 BUGS EN FUNCIONES SCHEDULED

### Problema 1: Tipo `BrouRatesWithMetadata` no importado
```typescript
// update-brou-rates.mts línea 19
const dataToStore: BrouRatesWithMetadata = { // ❌ Tipo no importado
```

**Solución:** Importar o usar `ExchangeRateRecord` (como hace Itaú)

### Problema 2: Inconsistencia en nombres de metadata
```typescript
// BROU usa snake_case
metadata: {
  scraped_at: ...,  // ❌
  next_run: ...,    // ❌
}

// Itaú usa camelCase
metadata: {
  scrapedAt: ...,   // ✅
  nextRunAt: ...,   // ✅
}
```

**Impacto:** Frontend espera un formato, puede causar bugs

---

## 2. 📊 ANÁLISIS DE QUOTAS

### Uso Actual (Con 0 Usuarios)

**Ejecuciones por función:**
```
Cada 15 min (slots: :00, :15, :30, :45)
× 4 veces/hora
× 11 horas/día (8am-7pm Uruguay)
× 5 días/semana (L-V)
────────────────────
= 220 ejecuciones/semana por banco
```

**Total ambos bancos:**
- 2 funciones × 220 = **440 ejecuciones/semana**
- **~1,900 ejecuciones/mes**

### Límites de Netlify

**Free Tier:**
- 125,000 function invocations/mes
- **Uso actual: 1.5%** (casi nada)

**Conclusión:** ✅ **Tienen espacio de sobra**, incluso con 10 bancos más no habría problema

---

## 3. 🔄 PROPUESTA: CONSOLIDAR EN UNA FUNCIÓN

### ¿Por qué consolidar?

**Problemas actuales:**
- ❌ Duplicación masiva de código (90% igual)
- ❌ Difícil mantener (cambio = editar 2 archivos)
- ❌ Inconsistencias (tipos, nombres de campos)
- ❌ Doble gasto de quotas (innecesario con 0 usuarios)

**Ventajas de consolidar:**
- ✅ Un solo archivo que mantener
- ✅ Consistencia garantizada
- ✅ Fácil agregar más bancos
- ✅ Menos ejecuciones = más rápido
- ✅ Código más DRY

### Arquitectura Propuesta

**Archivo único:** `netlify/functions/update-all-rates.mts`

```typescript
import { getStore } from '@netlify/blobs';
import { scrapeBrouRates } from './utils/brou-scraper.mts';
import { scrapeItauRates } from './utils/itau-scraper.mts';
import type { ExchangeRateRecord } from '../../shared/types/exchange-rates.mts';

// Configuración de bancos a actualizar
const BANKS = [
  { id: 'brou', scraper: scrapeBrouRates },
  { id: 'itau', scraper: scrapeItauRates },
  // Fácil agregar más:
  // { id: 'santander', scraper: scrapeSantanderRates },
];

export default async (req: Request) => {
  const { next_run } = await parseBody(req);
  const nextRunIso = next_run ? new Date(next_run).toISOString() : null;

  const results = await Promise.allSettled(
    BANKS.map(async (bank) => {
      try {
        const rates = await bank.scraper();
        const store = getStore('rates');

        const dataToStore: ExchangeRateRecord = {
          ...rates,
          metadata: {
            scrapedAt: new Date().toISOString(),
            nextRunAt: nextRunIso,
            source: 'scheduled' as const
          }
        };

        await store.setJSON(`${bank.id}-latest`, dataToStore);
        console.log(`✅ ${bank.id.toUpperCase()} actualizado:`, rates);

        return { bank: bank.id, success: true, rates };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`❌ ${bank.id.toUpperCase()} falló:`, errorMessage);
        return { bank: bank.id, success: false, error: errorMessage };
      }
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;

  console.log(`📊 Resumen: ${successful}/${results.length} exitosos, ${failed} fallidos`);
  console.log('Próxima ejecución:', nextRunIso ?? 'No programada');

  return new Response(JSON.stringify({
    success: failed === 0,
    updated: successful,
    failed,
    results: results.map(r => r.status === 'fulfilled' ? r.value : null)
  }), {
    status: failed === 0 ? 200 : 207, // 207 = Multi-Status
    headers: { 'Content-Type': 'application/json' }
  });
};

const parseBody = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return { next_run: undefined };
  }
};

export const config: Config = {
  schedule: '0,15,30,45 11-22 * * 1-5'
};
```

**Beneficios:**
- ✅ Actualiza ambos bancos **en paralelo** (más rápido)
- ✅ Un banco puede fallar sin afectar al otro
- ✅ Resumen consolidado de resultados
- ✅ Agregar Santander = 1 línea

---

## 4. 🎨 PROPUESTA: CSS MODULAR POR BANCO

### Problema Actual

Todo el CSS está en `main.css`:
```css
/* main.css - 200 líneas mezcladas */
[data-bank="brou"] { ... }
[data-bank="itau"] { ... }
/* No es Open/Closed (modificar para agregar) */
```

### Solución: Arquitectura de Plugins

**Estructura propuesta:**
```
src/
├── assets/
│   ├── main.css                    # Base + imports
│   └── themes/
│       ├── _base.css              # Variables genéricas
│       ├── brou.css               # Theme BROU
│       ├── itau.css               # Theme Itaú
│       └── santander.css          # Theme Santander (futuro)
```

**`src/assets/main.css`** (orquestador):
```css
@import "tailwindcss";
@import "./themes/_base.css";
@import "./themes/brou.css";
@import "./themes/itau.css";

/* Configuración global */
@theme {
  --color-dark-bg-1: #0f0f1a;
  /* ... */
}

/* Estilos base */
html, body { ... }
```

**`src/assets/themes/_base.css`** (genérico):
```css
/* Gradiente genérico (aplica a todos los bancos) */
[data-bank].app-gradient {
  background: linear-gradient(
    to top right,
    var(--bank-gradient-from) 0%,
    var(--bank-gradient-stop1) 30%,
    var(--bank-gradient-via) 60%,
    var(--bank-gradient-to) 100%
  );
}

@media (min-width: 768px) {
  [data-bank].app-gradient {
    background: linear-gradient(
      135deg,
      var(--bank-gradient-from) 0%,
      var(--bank-gradient-stop1) 30%,
      var(--bank-gradient-via) 60%,
      var(--bank-gradient-to) 100%
    );
  }
}
```

**`src/assets/themes/brou.css`** (específico BROU):
```css
/* BROU Theme */
[data-bank="brou"] {
  --bank-primary: #08528D;
  --bank-primary-light: #0d5ea1;
  --bank-primary-rgb: 8, 82, 141;
  --bank-primary-light-rgb: 13, 94, 161;

  --bank-accent: #FFCB05;
  --bank-accent-rgb: 255, 203, 5;

  --bank-gradient-from: #0a0e1f;
  --bank-gradient-stop1: #0f1a2e;
  --bank-gradient-via: #0d2744;
  --bank-gradient-to: #08528D;
}

/* Estilos específicos de BROU (si los hay) */
[data-bank="brou"] .custom-brou-element {
  /* ... */
}
```

**`src/assets/themes/itau.css`** (específico Itaú):
```css
/* Itaú Theme */
[data-bank="itau"] {
  --bank-primary: #ff5500;
  --bank-primary-light: #ff7733;
  --bank-primary-rgb: 255, 85, 0;
  --bank-primary-light-rgb: 255, 119, 51;

  --bank-accent: #ff5500;
  --bank-accent-rgb: 255, 85, 0;

  /* Mismo gradiente de fondo que BROU */
  --bank-gradient-from: #0a0e1f;
  --bank-gradient-stop1: #0f1a2e;
  --bank-gradient-via: #0d2744;
  --bank-gradient-to: #08528D;
}
```

**Ventajas:**
- ✅ **Open/Closed**: Agregar banco = crear archivo, no modificar existentes
- ✅ **Modular**: Cada banco en su propio archivo
- ✅ **Mantenible**: Cambios aislados
- ✅ **Tree-shakeable**: Vite puede optimizar imports
- ✅ **Escalable**: Preparado para 10+ bancos

---

## 5. 🗂️ PROPUESTA: SIMPLIFICAR `banks.ts`

### Problema Actual

**Campos no usados:**
```typescript
colors: {
  primary: '#08528D',       // ❌ No se usa (está en CSS)
  primaryLight: '#0d5ea1',  // ❌ No se usa (está en CSS)
  accent: '#FFCB05',        // ✅ SÍ se usa (HomeView, navegación)
  gradient: {               // ❌ No se usa (está en CSS)
    from: '#0a0e1f',
    via: '#0d2744',
    to: '#08528D'
  }
}
```

### Solución: Mantener Solo lo Necesario

**`src/config/banks.ts`** (simplificado):
```typescript
export interface BankConfig {
  id: string
  name: string
  displayName: string
  logoUrl: string
  websiteUrl: string
  route: string
  accentColor: string  // Solo el accent (para HomeView y navegación)
}

export const BANKS: Record<string, BankConfig> = {
  brou: {
    id: 'brou',
    name: 'BROU',
    displayName: 'La Media BROU',
    logoUrl: '/brou-logo.webp',
    websiteUrl: 'https://www.brou.com.uy/cotizaciones',
    route: '/brou',
    accentColor: '#FFCB05'  // Amarillo BROU
  },
  itau: {
    id: 'itau',
    name: 'Itaú',
    displayName: 'La Media Itaú',
    logoUrl: '/itau-logo.svg',
    websiteUrl: 'https://www.itau.com.uy/inst/aci/cotiz.xml',
    route: '/itau',
    accentColor: '#ff5500'  // Naranja Itaú
  }
}
```

**Actualizar usos:**
```typescript
// Antes
bank.colors.accent

// Después
bank.accentColor
```

**Beneficios:**
- ✅ Elimina duplicación (colores ya están en CSS)
- ✅ Single Source of Truth para cada cosa
- ✅ Más limpio y fácil de entender
- ✅ Menos campos = menos bugs

---

## 6. 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Arreglar Bugs Críticos (15 min)
1. Importar tipos correctos en `update-brou-rates.mts`
2. Unificar nombres de metadata a camelCase

### Fase 2: Consolidar Funciones (30 min)
1. Crear `update-all-rates.mts`
2. Testear localmente con `netlify functions:invoke`
3. Deploy y verificar logs
4. Eliminar funciones viejas

### Fase 3: Modularizar CSS (45 min)
1. Crear estructura `themes/`
2. Mover CSS de BROU a `themes/brou.css`
3. Mover CSS de Itaú a `themes/itau.css`
4. Crear `_base.css` con estilos genéricos
5. Actualizar imports en `main.css`
6. Verificar que no haya regresiones visuales

### Fase 4: Simplificar Config (15 min)
1. Cambiar `colors` por `accentColor` en `banks.ts`
2. Actualizar usos en HomeView y navegación
3. Type-check y tests

**Total: ~2 horas**

---

## 7. 🎯 RECOMENDACIÓN FINAL

### Para Tu Caso (0 Usuarios)

**✅ SÍ consolidar funciones:**
- Ahorra complexity
- Más fácil de mantener
- Quotas no son problema

**✅ SÍ modularizar CSS:**
- Preparado para escalar
- Open/Closed principle
- Más profesional

**✅ SÍ simplificar `banks.ts`:**
- Elimina duplicación
- Más limpio

### Prioridad

1. 🔴 **ALTA**: Arreglar bugs de tipos (puede romper en producción)
2. 🟡 **MEDIA**: Consolidar funciones (mejora mantenibilidad)
3. 🟢 **BAJA**: Modularizar CSS (mejora escalabilidad)
4. 🟢 **BAJA**: Simplificar config (nice to have)

---

## 8. ❓ PREGUNTAS PARA TI

1. **¿Quieres que implemente la función consolidada ahora?**
2. **¿Modularizamos el CSS en archivos separados?**
3. **¿Simplificamos `banks.ts` eliminando campos duplicados?**
4. **¿O prefieres mantener todo como está y solo arreglar los bugs?**

Dime qué te parece y qué quieres priorizar. 🚀
