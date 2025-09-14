# Guía de Formularios con React Hook Form

## ✅ **Formularios Optimizados Implementados**

### 🔧 **Hooks Personalizados Creados**

#### **1. useLoginForm**
```typescript
const {
  register,
  onSubmit,
  formState: { errors },
  isLoading,
  isSubmitting
} = useLoginForm();
```

#### **2. useSignupForm**
```typescript
const {
  register,
  onSubmit,
  formState: { errors },
  isLoading,
  isSubmitting
} = useSignupForm();
```

#### **3. useFormHandler (Genérico)**
```typescript
const form = useFormHandler({
  schema: mySchema,
  defaultValues: { field: '' },
  onSubmit: async (data) => { /* handle submit */ }
});
```

### 🎯 **Componente FormField**

**Uso simplificado:**
```typescript
<FormField
  name="email"
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  icon="📧"
  error={errors.email}
  register={register}
  required
/>
```

### 📋 **Estructura de Archivos**

```
src/
├── hooks/
│   ├── useLoginForm.ts      # Hook específico para login
│   ├── useSignupForm.ts     # Hook específico para signup
│   ├── useFormHandler.ts    # Hook genérico reutilizable
│   └── index.ts
├── components/
│   ├── forms/
│   │   ├── FormField.tsx    # Componente de campo reutilizable
│   │   └── index.ts
│   └── index.ts
├── utils/
│   ├── formUtils.ts         # Utilidades para formularios
│   └── index.ts
└── schemas/
    └── validation.ts        # Esquemas de validación Yup
```

### 🚀 **Ventajas de esta Implementación**

#### **1. Facilidad de Uso**
- **Antes**: 20+ líneas de código para un formulario
- **Ahora**: 3-5 líneas con el hook personalizado

#### **2. Reutilización**
- Hooks personalizados para casos específicos
- Componente FormField reutilizable
- Hook genérico para casos nuevos

#### **3. Type Safety**
- TypeScript completo
- Tipos inferidos automáticamente
- Validación en tiempo de compilación

#### **4. Validación Robusta**
- Yup + Firebase
- Validación en tiempo real
- Errores específicos por campo

### 📝 **Ejemplos de Uso**

#### **Formulario Simple (Login)**
```typescript
const LoginScreen = () => {
  const { register, onSubmit, formState: { errors }, isLoading } = useLoginForm();

  return (
    <form onSubmit={onSubmit}>
      <FormField
        name="email"
        type="email"
        label="Email"
        error={errors.email}
        register={register}
        required
      />
      <FormField
        name="password"
        type="password"
        label="Password"
        error={errors.password}
        register={register}
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};
```

#### **Formulario con Hook Genérico**
```typescript
const MyForm = () => {
  const form = useFormHandler({
    schema: mySchema,
    defaultValues: { name: '', email: '' },
    onSubmit: async (data) => {
      // Handle submission
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <FormField
        name="name"
        label="Name"
        error={form.formState.errors.name}
        register={form.register}
      />
      {/* ... más campos */}
    </form>
  );
};
```

### 🛠️ **Utilidades Disponibles**

#### **formUtils.ts**
```typescript
import { getFieldError, hasFieldError, isFormValid } from '../utils';

// Obtener mensaje de error
const errorMessage = getFieldError(errors.email);

// Verificar si hay error
const hasError = hasFieldError(errors.email);

// Verificar si el formulario es válido
const isValid = isFormValid(errors);
```

### 🎨 **Características de UX**

#### **1. Validación en Tiempo Real**
- `mode: 'onChange'` - Valida mientras el usuario escribe
- Errores se muestran inmediatamente
- Se limpian automáticamente al corregir

#### **2. Estados de Carga**
- Botones deshabilitados durante envío
- Texto dinámico en botones
- Indicadores visuales de progreso

#### **3. Manejo de Errores**
- Errores específicos por campo
- Mensajes en español
- Estilos visuales para errores

### 🔄 **Flujo de Validación**

1. **Usuario escribe** → Validación de Yup
2. **Usuario envía** → Validación completa
3. **Si hay errores** → Se muestran en campos
4. **Si es válido** → Se envía a Firebase
5. **Error de Firebase** → Se convierte en error de Yup
6. **Éxito** → Navegación automática

### 📚 **Cómo Crear un Nuevo Formulario**

#### **Paso 1: Crear el Esquema**
```typescript
// schemas/validation.ts
export const myFormSchema = yup.object({
  field1: yup.string().required('Campo requerido'),
  field2: yup.email().required('Email requerido')
});
```

#### **Paso 2: Crear el Hook (Opcional)**
```typescript
// hooks/useMyForm.ts
export const useMyForm = () => {
  return useFormHandler({
    schema: myFormSchema,
    defaultValues: { field1: '', field2: '' },
    onSubmit: async (data) => {
      // Handle submission
    }
  });
};
```

#### **Paso 3: Usar en el Componente**
```typescript
const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useMyForm();
  
  return (
    <form onSubmit={handleSubmit}>
      <FormField
        name="field1"
        label="Field 1"
        error={errors.field1}
        register={register}
      />
    </form>
  );
};
```

### 🧪 **Testing**

#### **Casos de Prueba**
- Validación de campos requeridos
- Validación de formato de email
- Validación de contraseña
- Manejo de errores de Firebase
- Estados de carga
- Navegación después del éxito

### 🚀 **Próximas Mejoras**

- [ ] Formularios multi-paso
- [ ] Validación asíncrona
- [ ] Autocompletado
- [ ] Drag & drop para archivos
- [ ] Formularios dinámicos
- [ ] Persistencia de datos en localStorage
