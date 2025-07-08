# Tema Aura Black - Guía de Personalización

Documentación completa del tema Aura Black personalizado para PrimeNG 20.

## Descripción

El tema Aura Black es una personalización del tema base Aura de PrimeNG 20, optimizado para modo oscuro con colores elegantes y modernos.

## Configuración

### Design Tokens Personalizados

El tema utiliza design tokens para mantener consistencia visual:

```typescript
// src/app/themes/aura-black.preset.ts
export const AuraBlackPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      // ... más definiciones
    }
  }
});
```

### Activación del Tema

```typescript
// src/app/app.config.ts
providePrimeNG({
  theme: {
    preset: AuraBlackPreset,
    options: {
      darkModeSelector: '.dark-mode',
      cssLayer: {
        name: 'primeng',
        order: 'tailwind-base, primeng, tailwind-utilities'
      }
    }
  }
})
```

## Paleta de Colores

### Colores Primarios
- **Indigo**: Tonos del 50 al 950
- **Base**: Tonos neutros para fondos y texto
- **Superficie**: Variaciones para cards y paneles

### Colores Semánticos
- **Success**: Verde para confirmaciones
- **Warning**: Amarillo para advertencias  
- **Danger**: Rojo para errores
- **Info**: Azul para información

## Variables CSS Disponibles

Todas las variables siguen el patrón `--p-*`:

```css
/* Colores principales */
--p-primary-color
--p-primary-contrast-color
--p-surface-ground
--p-surface-card

/* Estados */
--p-primary-hover-color
--p-primary-active-color
--p-focus-ring-color

/* Componentes */
--p-button-primary-background
--p-input-border-color
--p-panel-background
```

## Mejores Prácticas

1. **Usar design tokens**: Siempre usar variables `--p-*` en lugar de valores hardcodeados
2. **No sobrescribir componentes**: Usar el preset en lugar de CSS personalizado
3. **Mantener consistencia**: Usar la paleta definida en el preset
4. **Dark mode first**: El tema está optimizado para modo oscuro

## Ejemplo de Uso

```scss
// ✅ Correcto - usando design tokens
.my-component {
  background-color: var(--p-surface-card);
  color: var(--p-text-color);
  border: 1px solid var(--p-border-color);
}

// ❌ Incorrecto - valores hardcodeados
.my-component {
  background-color: #1a1a1a;
  color: #ffffff;
  border: 1px solid #333333;
}
```
