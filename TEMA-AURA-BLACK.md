# 🎨 Tema Aura Black - PrimeNG 20

## Descripción

Este proyecto implementa un tema personalizado basado en **Aura de PrimeNG 20** con una paleta de colores **negros/grises** para una apariencia moderna y elegante.

## ✨ Características Implementadas

### 🖤 Tema Personalizado

- **Archivo:** `src/app/themes/aura-black.preset.ts`
- **Basado en:** Aura preset de PrimeNG 20
- **Paleta principal:** Zinc (grises/negros)
- **Superficie:** Slate/Gray para diferentes modos

### 🌙 Modo Oscuro

- **Selector:** `.my-app-dark`
- **Toggle dinámico:** Implementado en el componente Home
- **Modo por defecto:** Oscuro (configurado en `index.html`)

### 🎨 Configuración del Tema

```typescript
// src/app/themes/aura-black.preset.ts
export const AuraBlack = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',   // Muy claro
      500: '{zinc.500}', // Gris medio
      950: '{zinc.950}'  // Casi negro
    },
    colorScheme: {
      light: {
        primary: {
          color: '{zinc.950}',      // Negro principal
          hoverColor: '{zinc.900}', // Hover más claro
        }
      },
      dark: {
        primary: {
          color: '{zinc.50}',       // Blanco/gris claro
          hoverColor: '{zinc.100}', // Hover gris claro
        }
      }
    }
  }
});
```

## 🔧 Configuración de la Aplicación

### app.config.ts

```typescript
providePrimeNG({
  theme: {
    preset: AuraBlack,
    options: {
      darkModeSelector: '.my-app-dark'
    }
  }
})
```

### index.html

```html
<html lang="en" class="my-app-dark">
```

## 🎭 Funcionalidades del Tema

### ⚡ Toggle Dinámico

- **Botón:** "Alternar Tema" en la página Home
- **Función:** `toggleDarkMode()`
- **Comportamiento:** Alterna la clase `.my-app-dark` en el elemento `<html>`

### 🎨 Estilos Mejorados

- **Transiciones suaves** entre temas
- **Efectos hover** en botones
- **Mejores contrastes** para legibilidad
- **Sombras** y efectos visuales

## 📦 Archivos Modificados

1. **`src/app/themes/aura-black.preset.ts`** - Tema personalizado
2. **`src/app/app.config.ts`** - Configuración del tema
3. **`src/styles.scss`** - Estilos globales mejorados
4. **`src/index.html`** - Modo oscuro por defecto
5. **`src/app/pages/home/home.ts`** - Funcionalidad toggle
6. **`src/app/pages/home/home.html`** - Botón toggle
7. **`src/app/pages/home/home.scss`** - Estilos del botón

## 🚀 Características PrimeNG 20

### ✅ Características Modernas Utilizadas

- **definePreset()** - API moderna para temas personalizados
- **Design Tokens** - Sistema de tokens semánticos
- **Color Schemes** - Soporte nativo light/dark
- **CSS Variables** - Variables CSS dinámicas
- **Focus Ring** - Anillos de foco personalizados

### 🎯 Tokens Personalizados

- **Primary Colors:** Zinc palette (50-950)
- **Surface Colors:** Slate/Gray para diferentes superficies
- **Focus Ring:** 2px solid con color primario
- **Transitions:** Suaves y elegantes

## 💡 Cómo Usar

### Para cambiar colores

Modifica el archivo `aura-black.preset.ts` y cambia las referencias de `{zinc.XXX}` por otras paletas:

- `{blue.XXX}` - Azul
- `{emerald.XXX}` - Verde esmeralda  
- `{red.XXX}` - Rojo
- `{purple.XXX}` - Púrpura

### Para deshabilitar el modo oscuro

```typescript
providePrimeNG({
  theme: {
    preset: AuraBlack,
    options: {
      darkModeSelector: false // o 'none'
    }
  }
})
```

### Para modo claro por defecto

Remover `class="my-app-dark"` del `index.html`

## 📚 Referencias

- [PrimeNG 20 Theming](https://primeng.org/theming)
- [definePreset API](https://primeng.org/theming#customization)
- [Design Tokens](https://primeng.org/theming#architecture)
- [Dark Mode](https://primeng.org/theming#dark-mode)
