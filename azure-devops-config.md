# Azure DevOps Configuration

## Configuración de Azure DevOps

Este archivo contiene las variables de configuración necesarias para conectar con Azure DevOps.

### Variables requeridas:

```bash
# URL de tu organización de Azure DevOps
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/tu-organizacion

# Nombre del proyecto
AZURE_DEVOPS_PROJECT=nombre-del-proyecto

# Personal Access Token (PAT)
AZURE_DEVOPS_PAT=tu-personal-access-token-aqui

# URL del repositorio
AZURE_DEVOPS_REPO_URL=https://dev.azure.com/tu-organizacion/nombre-del-proyecto/_git/nombre-repo
```

### Instrucciones:

1. Ve a https://dev.azure.com
2. Accede a tu organización
3. Ve a User Settings > Personal Access Tokens
4. Crea un nuevo token con los siguientes permisos:
   - Work Items: Read & Write
   - Build: Read & Execute
   - Code: Read
   - Project and Team: Read

5. Copia las variables de arriba a tu archivo `.env.local`

### Nota de Seguridad:
Nunca subas el archivo .env.local al repositorio. Está incluido en .gitignore por seguridad.
