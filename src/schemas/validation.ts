import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Che, poné tu email')
    .email('Ese email no parece válido, dale'),
  password: yup
    .string()
    .required('La contraseña también, eh')
});

export const signupSchema = yup.object({
  name: yup
    .string()
    .required('Dale, contanos cómo te llamás')
    .min(2, 'El nombre tiene que tener al menos 2 letras, che'),
  email: yup
    .string()
    .required('El email también, dale')
    .email('Ese email no parece válido, eh'),
  password: yup
    .string()
    .required('Una contraseña copada, por favor')
    .min(6, 'La contraseña tiene que tener al menos 6 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña tiene que tener al menos una mayúscula, una minúscula y un número, che'
    )
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type SignupFormData = yup.InferType<typeof signupSchema>;
