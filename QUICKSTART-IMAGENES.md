# 🚀 Quick Start - Sistema de Imágenes

## Pasos Rápidos (5 minutos)

### 1. Obtener API Key de OpenAI
1. Ir a https://platform.openai.com/
2. Sign in o crear cuenta
3. Ir a "API Keys"
4. Crear nueva key
5. Copiar la key

### 2. Configurar .env
Crear o editar el archivo `.env` en la raíz del proyecto:

```env
VITE_OPENAI_API_KEY=sk-tu-api-key-aqui
```

### 3. Probar (Opcional)
```bash
node test-openai.js
```

### 4. Iniciar
```bash
npm run dev
```

## ✅ Ya está!

Ahora cada respuesta del chat generará automáticamente una imagen para ambientar la escena.

## 📖 Más Info

- Configuración completa: `CONFIGURACION-IMAGENES.md`
- Detalles técnicos: `CHANGELOG-IMAGENES.md`
- Guía en inglés: `OPENAI-CONFIG.md`

## 💰 Costos

~$0.04 USD por imagen (cada respuesta del chat)

## ⚙️ Desactivar

Comentar en `.env`:
```env
# VITE_OPENAI_API_KEY=sk-...
```







