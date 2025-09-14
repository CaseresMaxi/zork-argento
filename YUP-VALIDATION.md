# Validación con Yup y React Hook Form

## ✅ **Implementación Completada**

### 🔧 **Dependencias Instaladas**
- `yup` - Librería de validación de esquemas
- `@hookform/resolvers` - Resolvers para react-hook-form
- `react-hook-form` - Manejo de formularios

### 📋 **Esquemas de Validación**

#### **Login Schema (`src/schemas/validation.ts`)**
```typescript
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});
```

#### **Signup Schema**
```typescript
export const signupSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
});
```

### 🔄 **Flujo de Validación**

1. **Validación del Frontend (Yup)**
   - Se ejecuta antes de enviar a Firebase
   - Valida formato de email, longitud de contraseña, etc.
   - Muestra errores inmediatamente en los campos

2. **Validación del Backend (Firebase)**
   - Si pasa la validación de Yup, se envía a Firebase
   - Firebase responde con errores específicos
   - Los errores de Firebase se convierten en errores de validación de Yup

3. **Manejo de Errores**
   - Los errores se muestran directamente en los campos correspondientes
   - Cada campo muestra su error específico
   - Los errores se limpian automáticamente cuando el usuario corrige el campo

### 🎯 **Errores de Firebase Mapeados a Yup**

#### **Para Login:**
- `auth/user-not-found` → Error en campo `email`
- `auth/wrong-password` → Error en campo `password`
- `auth/invalid-email` → Error en campo `email`
- `auth/user-disabled` → Error en campo `email`
- `auth/too-many-requests` → Error en campo `password`
- `auth/network-request-failed` → Error en campo `email`
- `auth/invalid-credential` → Error en campo `password`

#### **Para Signup:**
- `auth/email-already-in-use` → Error en campo `email`
- `auth/invalid-email` → Error en campo `email`
- `auth/weak-password` → Error en campo `password`
- `auth/operation-not-allowed` → Error en campo `email`
- `auth/network-request-failed` → Error en campo `email`

### 🧪 **Casos de Prueba**

#### **Validaciones de Yup (Frontend):**
1. **Email vacío** → "El email es requerido"
2. **Email inválido** → "Debe ser un email válido"
3. **Contraseña vacía** → "La contraseña es requerida"
4. **Contraseña < 6 caracteres** → "La contraseña debe tener al menos 6 caracteres"
5. **Nombre vacío** → "El nombre es requerido"
6. **Contraseña débil** → "La contraseña debe contener al menos una mayúscula, una minúscula y un número"

#### **Errores de Firebase (Backend):**
1. **Usuario no encontrado** → Error en campo email
2. **Contraseña incorrecta** → Error en campo password
3. **Email ya en uso** → Error en campo email
4. **Demasiados intentos** → Error en campo password

### 🔧 **Componentes Actualizados**

#### **Input Component**
- Ahora soporta `forwardRef` para react-hook-form
- Muestra errores de validación debajo del campo
- Estilos visuales para campos con error

#### **LoginScreen**
- Usa `useForm` con `yupResolver`
- Maneja errores de Firebase como errores de validación
- Validación en tiempo real

#### **SignupScreen**
- Misma implementación que LoginScreen
- Validación adicional para contraseña fuerte
- Validación de nombre

### 🎨 **Características Visuales**

- **Campos con error**: Borde rojo y mensaje de error
- **Validación en tiempo real**: Errores se muestran al escribir
- **Limpieza automática**: Errores se borran al corregir
- **Estados de carga**: Botones deshabilitados durante operaciones

### 🚀 **Ventajas de esta Implementación**

1. **Validación robusta**: Yup + Firebase
2. **UX mejorada**: Errores específicos por campo
3. **Type safety**: TypeScript con tipos inferidos
4. **Mantenible**: Esquemas centralizados
5. **Escalable**: Fácil agregar nuevas validaciones

### 📝 **Cómo Agregar Nuevas Validaciones**

1. **Actualizar esquema en `validation.ts`**
2. **Agregar mapeo de error en `AuthContext.tsx`**
3. **Los errores se mostrarán automáticamente**

### 🔍 **Debugging**

- Los errores de validación aparecen en la consola del navegador
- Los errores de Firebase se mapean automáticamente
- Cada campo muestra su error específico
