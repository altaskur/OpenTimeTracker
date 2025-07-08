# Guía de Desarrollo

Guía completa para desarrollar en el proyecto OpenTimeTracker.

## Comandos Principales

### Desarrollo

```bash
npm start                    # Servidor de desarrollo Angular (puerto 4200)
npm run dev                  # Desarrollo completo: build + Electron
npm test                     # Ejecutar tests unitarios
```

### Producción

```bash
npm run build               # Build completo: Angular + Electron
npm run electron            # Ejecutar Electron (requiere build previo)
```

## Descripción de Scripts

### `npm start`
- **Propósito**: Desarrollo solo de Angular en navegador
- **Ejecuta**: `ng serve`
- **Uso**: Desarrollo de UI sin Electron, hot reload automático
- **Puerto**: http://localhost:4200

### `npm run dev`
- **Propósito**: Desarrollo completo con Electron
- **Ejecuta**: `ng build --development && tsc electron && electron .`
- **Uso**: Desarrollo principal recomendado
- **Incluye**: Build rápido de desarrollo + compilación Electron + ejecución

### `npm run build`
- **Propósito**: Build completo optimizado para producción
- **Ejecuta**: `ng build && tsc --project electron/tsconfig.json`
- **Uso**: Preparar distribución final
- **Salida**: `dist/` con Angular y Electron compilados

### `npm run electron`
- **Propósito**: Ejecutar Electron únicamente
- **Ejecuta**: `electron .`
- **Requisito**: Debe haberse ejecutado `npm run build` previamente
- **Uso**: Testing de build de producción

### `npm test`
- **Propósito**: Ejecutar suite de tests
- **Ejecuta**: `ng test`
- **Uso**: Validación de componentes Angular

## Estructura de Componentes

### Componentes Standalone

Todos los componentes usan la nueva sintaxis standalone de Angular:

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './example.html',
  styleUrl: './example.scss'
})
export class ExampleComponent {
  // Lógica del componente
}
```

### Organización de Archivos

Cada componente tiene su propia carpeta con:
- `component.ts` - Lógica del componente
- `component.html` - Template
- `component.scss` - Estilos específicos
- `component.spec.ts` - Tests unitarios

## Estilos y Tema

### Variables CSS
Usar únicamente variables oficiales de PrimeNG:

```scss
// ✅ Correcto
.component {
  background: var(--p-surface-card);
  color: var(--p-text-color);
}

// ❌ Evitar
.component {
  background: #1a1a1a;
  color: white;
}
```

### Clases de PrimeFlex
Usar PrimeFlex para layout y spacing:

```html
<div class="flex flex-column gap-3 p-4">
  <div class="col-12 md:col-6">Content</div>
</div>
```

## Comunicación Electron-Angular

### Desde Angular (Renderer)
```typescript
// Usar la API expuesta en preload
const result = await window.electronAPI.ping();
const data = await window.electronAPI.getExamples();
```

### En Electron (Main Process)
```typescript
// Registrar handlers IPC
ipcMain.handle('method-name', async (event, ...args) => {
  // Lógica del handler
  return result;
});
```

## Mejores Prácticas

### Código Limpio
1. **Usar JSDoc** para documentar métodos públicos
2. **Eliminar comentarios** `//` innecesarios
3. **Nombres descriptivos** para variables y métodos
4. **Funciones pequeñas** con una sola responsabilidad

### Estructura
1. **Componentes standalone** para mejor tree-shaking
2. **Lazy loading** para rutas de páginas
3. **Servicios inyectables** para lógica de negocio
4. **Interfaces TypeScript** para tipado fuerte

### Performance
1. **OnPush** change detection cuando sea posible
2. **TrackBy functions** en *ngFor
3. **Async pipe** para observables
4. **Lazy loading** de módulos y componentes

## Debugging

### Angular DevTools
Instalar la extensión Angular DevTools para Chrome/Edge.

### Electron DevTools
Las DevTools se abren automáticamente en desarrollo:
```typescript
mainWindow.webContents.openDevTools();
```

### Console Logs
Usar diferentes niveles de log:
```typescript
console.log('Info message');
console.warn('Warning message');
console.error('Error message');
```
