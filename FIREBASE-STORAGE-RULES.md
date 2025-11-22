# Firebase Storage Rules Configuration

Para que las imágenes se puedan subir correctamente a Firebase Storage, necesitás configurar las reglas de seguridad.

## Configuración de Reglas

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Storage** en el menú lateral
4. Haz clic en la pestaña **Rules**
5. Reemplaza las reglas con las siguientes:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /adventures/{userId}/{adventureId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Explicación de las Reglas

- **`allow read`**: Permite leer archivos solo si el usuario está autenticado y es el propietario (userId coincide con el uid del usuario autenticado)
- **`allow write`**: Permite escribir archivos solo si el usuario está autenticado y es el propietario

## Reglas Alternativas (Solo para Desarrollo)

Si necesitás reglas más permisivas solo para desarrollo (NO recomendado para producción):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /adventures/{userId}/{adventureId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Verificar la Configuración

Después de actualizar las reglas:
1. Haz clic en **Publish** para guardar los cambios
2. Espera unos segundos para que los cambios se propaguen
3. Intenta subir una imagen nuevamente desde la aplicación

## Solución de Problemas

Si aún tenés problemas de CORS después de configurar las reglas:

1. **Verifica que el usuario esté autenticado**: Las reglas requieren `request.auth != null`
2. **Verifica el formato del path**: El path debe ser `adventures/{userId}/{adventureId}/...`
3. **Limpia la caché del navegador**: A veces los cambios en las reglas tardan en aplicarse
4. **Verifica la consola de Firebase**: Revisa los logs de Storage para ver errores específicos

