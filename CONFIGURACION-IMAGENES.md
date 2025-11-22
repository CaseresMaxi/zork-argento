# 🎨 Configuración del Sistema de Generación de Imágenes

Este sistema genera automáticamente imágenes ambientales para cada respuesta del chat usando DALL-E 3 de OpenAI.

## 📋 Pasos de Configuración

### 1. Obtener tu API Key de OpenAI

1. Visitá [OpenAI Platform](https://platform.openai.com/)
2. Iniciá sesión o creá una cuenta
3. Navegá a la sección "API Keys"
4. Creá una nueva API key
5. Copiá la key (no podrás verla de nuevo después)

### 2. Configurar Variables de Entorno

Creá un archivo `.env` en la raíz del proyecto (si no existe) y agregá:

```env
VITE_OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
```

### 3. Probar la Conexión (Opcional pero Recomendado)

Ejecutá el script de prueba para verificar que tu API key funciona:

```bash
node test-openai.js
```

Si todo está bien, verás algo como:
```
✅ API Key found: sk-proj-ab...
🔍 Testing OpenAI DALL-E 3 API connection...
📡 Sending request to OpenAI...
✅ SUCCESS! Image generated successfully
🎉 Your OpenAI API key is working correctly!
```

### 4. Archivo .env Completo

Tu archivo `.env` debe contener todas estas variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_firebase_app_id

# Zork API
ZORK_API_KEY=tu_zork_api_key

# OpenAI API para generación de imágenes
VITE_OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
```

## 🚀 ¿Cómo Funciona?

1. **Generación automática**: Cada vez que el chat recibe una respuesta, se genera automáticamente una imagen
2. **Basada en el prompt**: La imagen se basa en el campo `imagePrompt` de la respuesta o se extrae de la narrativa
3. **Configuración DALL-E 3**:
   - Modelo: `dall-e-3`
   - Tamaño: `1024x1024`
   - Calidad: `standard`
   - Formato: `b64_json` (base64 codificado)
4. **Almacenamiento**: La imagen en base64 se guarda directamente en Firebase Firestore como parte del step de la aventura
5. **Visualización**: Las imágenes se muestran en el chat arriba del texto narrativo

## 💰 Consideraciones de Costos

- DALL-E 3 cuesta aproximadamente **$0.04 USD por imagen** en calidad estándar (1024x1024)
- **Cada respuesta del chat generará una imagen**
- Monitoreá tu uso en el [Panel de OpenAI](https://platform.openai.com/usage)
- **Consejo**: Cargá créditos suficientes antes de comenzar a jugar

## 🔍 Verificación de Funcionamiento

Después de configurar, verificá estos mensajes en la consola del navegador (F12):

- ✅ `🎨 Generating image for step...` - La generación comenzó
- ✅ `✅ Image generated successfully` - Imagen generada exitosamente
- ⚠️ `⚠️ Image generation failed or returned null` - La generación falló

## 🛠️ Solución de Problemas

Si las imágenes no se generan:

1. **Verificá la API Key**: Asegurate que `VITE_OPENAI_API_KEY` esté correctamente configurada en tu `.env`
2. **Verificá los créditos**: Confirmá que tu cuenta de OpenAI tenga créditos disponibles
3. **Revisá la consola**: Abrí la consola del navegador (F12) y buscá mensajes de error
4. **Reiniciá el servidor**: Después de modificar el `.env`, reiniciá el servidor de desarrollo (`npm run dev`)

### Errores Comunes

**Error: "OPENAI_API_KEY is not configured"**
- Solución: Agregá `VITE_OPENAI_API_KEY` a tu archivo `.env`

**Error: "Incorrect API key provided"**
- Solución: Verificá que la API key sea correcta y esté activa en tu cuenta de OpenAI

**Error: "You exceeded your current quota"**
- Solución: Necesitás agregar créditos a tu cuenta de OpenAI

## ⚙️ Deshabilitar la Generación de Imágenes

Si querés deshabilitar temporalmente la generación de imágenes:

1. Eliminá o comentá la línea `VITE_OPENAI_API_KEY` de tu `.env`:
   ```env
   # VITE_OPENAI_API_KEY=sk-tu-api-key-aqui
   ```
2. El chat seguirá funcionando normalmente, solo sin las imágenes

## 📊 Almacenamiento en Firebase

Las imágenes se almacenan como cadenas de texto base64 en Firestore, dentro de cada `step` de la aventura:

```typescript
{
  stepId: 0,
  narrative: "...",
  imagePrompt: "...",
  imageBase64: "iVBORw0KGgoAAAANS..." // cadena muy larga en base64
}
```

**Nota**: Las imágenes en base64 ocupan aproximadamente 1.4 veces más espacio que el archivo original. Una imagen de 1024x1024 puede ocupar entre 200KB y 500KB en base64.

## 🎮 Mejora de la Experiencia

Con este sistema, cada escena de tu aventura Zork Argento tendrá una imagen única y generada automáticamente, creando una experiencia más inmersiva y visual.

¡Disfrutá de tu aventura con imágenes! 🧉✨

