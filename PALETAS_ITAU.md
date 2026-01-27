# 🎨 Propuestas de Paleta de Colores para Itaú

## Problema Actual
- Naranja melocotón (#ffc099) es muy pastel → luce "a medio camino"
- Gradiente con múltiples tonos naranjas → se ve turbio
- Falta contraste fuerte

---

## Opción 1: 🔥 **Bold Orange + White** (Recomendada)
### Paleta limpia y moderna con alto contraste

**Colores:**
```css
[data-bank="itau"] {
  --bank-primary: #ff6200;          /* Naranja fuerte (principal) */
  --bank-primary-light: #ff7a29;    /* Naranja ligeramente más claro */
  --bank-primary-rgb: 255, 98, 0;
  --bank-primary-light-rgb: 255, 122, 41;

  --bank-accent: #ff6200;           /* Naranja como acento */
  --bank-accent-rgb: 255, 98, 0;

  /* Gradiente simple: oscuro → naranja fuerte */
  --bank-gradient-from: #0a0e1f;    /* Base oscura */
  --bank-gradient-via: #1a1a2e;     /* Gris oscuro (sin naranja turbio) */
  --bank-gradient-to: #ff6200;      /* Naranja fuerte final */
}
```

**Características:**
- ✅ Naranja principal fuerte y vibrante
- ✅ Gradiente simple: oscuro → naranja puro (sin tonos intermedios turbios)
- ✅ Alto contraste con blanco
- ✅ Moderno y limpio
- ✅ El acento naranja destaca claramente

**Visualización:**
```
Gradiente:  [Negro] ──────► [Gris oscuro] ──────► [🔥 Naranja fuerte]
Franja:     ═══════════════ 🧡 Naranja brillante ═══════════════
Botón Swap: [Gradiente 🔥 #ff6200 → #ff7a29]
Media text: 🧡 Naranja fuerte (#ff6200)
```

---

## Opción 2: ⚡ **Flat Orange** (Ultra plano)
### Sin gradientes, solo naranja sólido + fondos sutiles

**Colores:**
```css
[data-bank="itau"] {
  --bank-primary: #ff6200;          /* Naranja fuerte único */
  --bank-primary-light: #ff6200;    /* Mismo color (flat) */
  --bank-primary-rgb: 255, 98, 0;
  --bank-primary-light-rgb: 255, 98, 0;

  --bank-accent: #ff6200;
  --bank-accent-rgb: 255, 98, 0;

  /* Gradiente minimal: solo oscuro a más oscuro */
  --bank-gradient-from: #0a0e1f;
  --bank-gradient-via: #0f1426;     /* Apenas varía */
  --bank-gradient-to: #141929;      /* Sin naranja en fondo */
}
```

**Características:**
- ✅ Un solo naranja (#ff6200) para todo
- ✅ Fondo oscuro plano (sin naranja en gradiente)
- ✅ Estilo minimalista moderno
- ✅ Botones y acentos usan opacidad para variaciones
- ✅ Inspirado en diseño flat de Apple/Google

**Visualización:**
```
Gradiente:  [Negro uniforme] ━━━━━━━━━━━━━━━━━━━━━━━━
Franja:     ═════════════ 🧡 Naranja sólido ═════════════
Botón Swap: [🧡 Naranja sólido con sombra]
Media text: 🧡 Naranja (#ff6200)
Cards:      Fondo negro + borde naranja
```

---

## Opción 3: 🌊 **Orange + Deep Blue** (Contraste máximo)
### Naranja vibrante con azul oscuro como complemento

**Colores:**
```css
[data-bank="itau"] {
  --bank-primary: #ff6200;          /* Naranja fuerte */
  --bank-primary-light: #ff8533;    /* Naranja medio */
  --bank-primary-rgb: 255, 98, 0;
  --bank-primary-light-rgb: 255, 133, 51;

  --bank-accent: #ff6200;
  --bank-accent-rgb: 255, 98, 0;

  /* Gradiente con azul profundo */
  --bank-gradient-from: #0a1128;    /* Azul muy oscuro */
  --bank-gradient-via: #1a2847;     /* Azul marino */
  --bank-gradient-to: #ff6200;      /* Naranja fuerte */
}
```

**Características:**
- ✅ Contraste naranja cálido vs azul frío
- ✅ Gradiente oscuro azulado → naranja
- ✅ Más dramático y profesional
- ✅ Inspirado en sunset/amanecer

**Visualización:**
```
Gradiente:  [🌊 Azul oscuro] ──► [Azul marino] ──► [🔥 Naranja]
Franja:     ══════════════ 🧡 Naranja brillante ══════════════
Botón Swap: [Gradiente 🔥 #ff6200 → #ff8533]
Media text: 🧡 Naranja (#ff6200)
```

---

## Comparación Rápida

| Aspecto | Opción 1: Bold + White | Opción 2: Flat | Opción 3: Orange + Blue |
|---------|------------------------|----------------|-------------------------|
| **Estilo** | Moderno, vibrante | Minimalista | Dramático |
| **Gradiente fondo** | Oscuro → Naranja | Oscuro plano | Azul → Naranja |
| **Complejidad** | Media | Baja | Alta |
| **Contraste** | Alto | Muy alto | Máximo |
| **Mantenimiento** | Fácil | Muy fácil | Media |
| **Inspiración** | Duolingo, Spotify | Apple, Google | Netflix, Stripe |

---

## 🎯 Recomendación

**Opción 1: Bold Orange + White** es la más equilibrada:
- ✅ Vibrante sin ser agresivo
- ✅ Gradiente simple pero efectivo
- ✅ El naranja destaca claramente
- ✅ Profesional y moderno

Si prefieres algo más minimalista → **Opción 2: Flat**
Si quieres máximo impacto visual → **Opción 3: Orange + Blue**

---

## 🧪 Cómo Aplicar

Una vez que elijas, solo cambiaremos las variables CSS en `src/assets/main.css`:

```css
/* Itaú Theme - [OPCIÓN ELEGIDA] */
[data-bank="itau"] {
  /* Pegar colores aquí */
}
```

**¿Cuál opción prefieres? (1, 2 o 3)**
O si tienes otra idea, puedo crear una variación custom.
