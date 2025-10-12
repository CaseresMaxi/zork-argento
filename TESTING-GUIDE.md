# 🧪 Guía de Pruebas - Azure DevOps Integration

## ✅ Pasos para probar la integración manualmente

### 1. **Verificar instalación de extensiones**
En VS Code, ve a `Extensiones` (Ctrl+Shift+X) y verifica que tienes instaladas:
- ✅ DevOps Boards
- ✅ Azure Pipelines Runner

### 2. **Configurar conexión manualmente**
1. Abre la **Paleta de Comandos** (`Ctrl+Shift+P`)
2. Busca comandos que empiecen con:
   - `Azure DevOps:`
   - `DevOps Boards:`
   - `Azure Pipelines:`

### 3. **Posibles comandos a probar:**
- `Azure DevOps: Sign In`
- `DevOps Boards: Connect`
- `Azure Pipelines: Configure Pipeline`

### 4. **Verificaciones de conectividad**

#### A) Verificar que el proyecto existe:
```bash
# Abrir en navegador para verificar manualmente:
https://dev.azure.com/zork-argento/zork-argento
```

#### B) Verificar el Personal Access Token:
1. Ve a: https://dev.azure.com/zork-argento/_usersSettings/tokens
2. Verifica que el token tenga estos permisos:
   - ✅ Build: Read & Execute
   - ✅ Code: Read 
   - ✅ Work Items: Read & Write
   - ✅ Project and Team: Read

#### C) Probar conexión desde terminal:
```powershell
# Probar conectividad básica (reemplaza TU_PAT con tu token real)
curl -u ":TU_PAT_AQUI" https://dev.azure.com/zork-argento/_apis/projects
```

### 5. **Usar las funciones integradas**

Una vez conectado, podrás:
- 📋 Ver work items en el panel lateral
- 🏗️ Ejecutar pipelines desde VS Code  
- 📝 Crear nuevos work items
- 🔄 Sincronizar cambios con Azure DevOps

### 6. **Crear tu primer pipeline**
Si no tienes pipelines, el archivo `azure-pipelines.yml` ya está configurado. Solo necesitas:
1. Subir los cambios a tu repositorio
2. Ir a Azure DevOps > Pipelines
3. Crear nuevo pipeline y seleccionar tu repositorio
4. VS Code detectará automáticamente el pipeline

## 🐛 Solución de problemas comunes

### Error: "Project not found"
- Verifica que el proyecto existe en Azure DevOps
- Asegúrate de tener acceso al proyecto
- Verifica que el nombre del proyecto es correcto (case-sensitive)

### Error: "401 Unauthorized"  
- Verifica que el Personal Access Token es válido
- Asegúrate de que el token tiene los permisos necesarios
- Regenera el token si es necesario

### Error: "403 Forbidden"
- Tu token necesita más permisos
- Contacta al administrador del proyecto para obtener acceso

## 📞 Próximos pasos
1. Abre Azure DevOps en el navegador para verificar acceso
2. Prueba los comandos de la paleta de comandos
3. Si todo funciona, podrás gestionar work items y pipelines desde VS Code
