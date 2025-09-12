# Estructura del Proyecto Zork Argento

## 📁 Estructura de Carpetas

```
src/
├── components/           # Componentes reutilizables
│   ├── common/          # Componentes comunes (Button, Input)
│   ├── forms/           # Componentes de formularios
│   ├── AppRouter.tsx    # Configuración de rutas
│   └── index.ts         # Exportaciones de componentes
├── screens/             # Pantallas de la aplicación
│   ├── Login/           # Pantallas de autenticación
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── index.ts
│   ├── Home/            # Pantalla principal
│   │   ├── HomeScreen.tsx
│   │   └── index.ts
│   └── index.ts         # Exportaciones de pantallas
├── hooks/               # Hooks personalizados
│   ├── useAuth.ts       # Hook de autenticación
│   └── index.ts
├── types/               # Definiciones de TypeScript
│   └── index.ts         # Interfaces y tipos
├── utils/               # Funciones utilitarias
├── contexts/            # Contextos de React
├── assets/              # Recursos estáticos
│   ├── images/          # Imágenes
│   └── icons/           # Iconos
├── App.tsx              # Componente principal
├── App.css              # Estilos globales
└── main.tsx             # Punto de entrada
```

## 🚀 Características Implementadas

### Autenticación
- ✅ Pantalla de Login
- ✅ Pantalla de Registro (Signup)
- ✅ Hook personalizado `useAuth`
- ✅ Gestión de estado de autenticación
- ✅ Redirección automática basada en estado de auth

### Navegación
- ✅ React Router DOM configurado
- ✅ Rutas protegidas
- ✅ Redirección automática
- ✅ Navegación entre pantallas

### Componentes
- ✅ Componente `Button` reutilizable
- ✅ Componente `Input` reutilizable
- ✅ Estilos CSS modulares
- ✅ TypeScript para tipado fuerte

### Pantallas
- ✅ **Login**: Formulario de inicio de sesión
- ✅ **Signup**: Formulario de registro
- ✅ **Home**: Pantalla principal con logout

## 🛠️ Tecnologías Utilizadas

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **React Router DOM** - Enrutamiento
- **Vite** - Herramienta de build
- **CSS3** - Estilos

## 📋 Rutas Disponibles

- `/` - Redirección automática (login/home según auth)
- `/login` - Pantalla de login
- `/signup` - Pantalla de registro
- `/home` - Pantalla principal (requiere autenticación)

## 🔧 Cómo Usar

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   ```

## 📝 Próximos Pasos

- [ ] Implementar validación de formularios
- [ ] Agregar manejo de errores
- [ ] Implementar API real de autenticación
- [ ] Agregar tests unitarios
- [ ] Implementar tema oscuro/claro
- [ ] Agregar más pantallas según necesidades
