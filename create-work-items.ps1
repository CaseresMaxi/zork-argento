# Script para crear Work Items principales del MVP Zork Argento
# Ejecutar línea por línea en PowerShell

# Issues para ÉPICA 1: Fundación y Autenticación (ID: 2)
Write-Host "Creando Issues para ÉPICA 1: Autenticación..." -ForegroundColor Green

# PBI-002: Login con email/password  
az boards work-item create --title "PBI-002: Login con email/password" --type "Issue" --description "Como usuario quiero hacer login con email/password para acceder. AC: Login exitoso, redirección a home, mantener sesión. Status: ✅ Implementado (95%). Files: useLoginForm.ts, AuthContext.tsx"
$pbi002 = $(az boards work-item create --title "PBI-002: Login con email/password" --type "Issue" --description "Como usuario quiero hacer login con email/password para acceder" --query "id" -o tsv)
az boards work-item relation add --id $pbi002 --relation-type "Child" --target-id 2

# PBI-003: Google Sign-In
az boards work-item create --title "PBI-003: Google Sign-In" --type "Issue" --description "Como usuario quiero hacer login con Google para acceso rápido. AC: Botón Google, popup auth, datos usuario sincronizados. Status: ❌ Pendiente. Files: AuthContext.tsx"
$pbi003 = $(az boards work-item create --title "PBI-003: Google Sign-In" --type "Issue" --description "Como usuario quiero hacer login con Google para acceso rápido" --query "id" -o tsv)
az boards work-item relation add --id $pbi003 --relation-type "Child" --target-id 2

# PBI-004: Onboarding de usuarios
az boards work-item create --title "PBI-004: Onboarding usuarios nuevos" --type "Issue" --description "Como usuario nuevo quiero ver un onboarding que me explique el juego. AC: 3 pasos explicativos, skip option, animaciones suaves. Status: ❌ Pendiente. Files: AppRouter.tsx, Tutorial component"
$pbi004 = $(az boards work-item create --title "PBI-004: Onboarding usuarios nuevos" --type "Issue" --description "Como usuario nuevo quiero ver un onboarding que me explique el juego" --query "id" -o tsv)
az boards work-item relation add --id $pbi004 --relation-type "Child" --target-id 2

Write-Host "Issues para ÉPICA 1 creados ✅" -ForegroundColor Green

# Issues para ÉPICA 2: Motor de Aventuras Básico (ID: 3)
Write-Host "Creando Issues para ÉPICA 2: Motor de Aventuras..." -ForegroundColor Green

# PBI-005: Crear aventura desde prompt
az boards work-item create --title "PBI-005: Crear aventura desde prompt inicial" --type "Issue" --description "Como jugador quiero crear una aventura desde un prompt inicial. AC: Campo texto, validación min 10 chars, botón 'Crear Aventura'. Status: ✅ Implementado (80%). Files: HomeScreen.tsx, validation.ts"
$pbi005 = $(az boards work-item create --title "PBI-005: Crear aventura desde prompt inicial" --type "Issue" --description "Como jugador quiero crear una aventura desde un prompt inicial" --query "id" -o tsv)
az boards work-item relation add --id $pbi005 --relation-type "Child" --target-id 3

# PBI-006: Recibir introducción generada por IA
az boards work-item create --title "PBI-006: Recibir introducción de IA inmediatamente" --type "Issue" --description "Como jugador quiero recibir la introducción generada por IA inmediatamente. AC: Respuesta < 10s, narrativa coherente, estado inicial creado. Status: ✅ Implementado (85%). Files: chatApi.ts, buildAdventureGenerationPrompt"
$pbi006 = $(az boards work-item create --title "PBI-006: Recibir introducción de IA inmediatamente" --type "Issue" --description "Como jugador quiero recibir la introducción generada por IA inmediatamente" --query "id" -o tsv)
az boards work-item relation add --id $pbi006 --relation-type "Child" --target-id 3

# PBI-007: Ver lista de aventuras existentes  
az boards work-item create --title "PBI-007: Ver mis aventuras existentes en home" --type "Issue" --description "Como jugador quiero ver mis aventuras existentes en el home. AC: Lista ordenada por fecha, título, preview, botón continuar. Status: ✅ Implementado (70%). Files: AdventureList.tsx, AdventureService.ts"
$pbi007 = $(az boards work-item create --title "PBI-007: Ver mis aventuras existentes en home" --type "Issue" --description "Como jugador quiero ver mis aventuras existentes en el home" --query "id" -o tsv)
az boards work-item relation add --id $pbi007 --relation-type "Child" --target-id 3

# PBI-008: Continuar aventura donde la dejé
az boards work-item create --title "PBI-008: Continuar aventura donde la dejé" --type "Issue" --description "Como jugador quiero continuar una aventura donde la dejé. AC: Cargar último estado, historial visible, continuar desde último nodo. Status: ✅ Implementado (75%). Files: ChatScreen.tsx, AdventureService.ts"
$pbi008 = $(az boards work-item create --title "PBI-008: Continuar aventura donde la dejé" --type "Issue" --description "Como jugador quiero continuar una aventura donde la dejé" --query "id" -o tsv)
az boards work-item relation add --id $pbi008 --relation-type "Child" --target-id 3

Write-Host "Issues para ÉPICA 2 creados ✅" -ForegroundColor Green

# Issues para ÉPICA 3: Sistema de Juego Interactivo (ID: 4)
Write-Host "Creando Issues para ÉPICA 3: Sistema de Juego..." -ForegroundColor Green

# PBI-009: Escribir comandos en lenguaje natural
az boards work-item create --title "PBI-009: Escribir comandos en lenguaje natural" --type "Issue" --description "Como jugador quiero escribir comandos en lenguaje natural. AC: Input libre, submit con Enter, placeholder dinámico. Status: ✅ Implementado (90%). Files: ChatScreen.tsx"
$pbi009 = $(az boards work-item create --title "PBI-009: Escribir comandos en lenguaje natural" --type "Issue" --description "Como jugador quiero escribir comandos en lenguaje natural" --query "id" -o tsv)
az boards work-item relation add --id $pbi009 --relation-type "Child" --target-id 4

# PBI-010: Ver respuestas narrativas coherentes
az boards work-item create --title "PBI-010: Ver respuestas narrativas coherentes" --type "Issue" --description "Como jugador quiero ver respuestas narrativas coherentes. AC: Narrativa fluida, consecuencias lógicas, tono consistente. Status: ✅ Implementado (85%). Files: buildAdventureContinuationPrompt, chatApi.ts"
$pbi010 = $(az boards work-item create --title "PBI-010: Ver respuestas narrativas coherentes" --type "Issue" --description "Como jugador quiero ver respuestas narrativas coherentes" --query "id" -o tsv)
az boards work-item relation add --id $pbi010 --relation-type "Child" --target-id 4

# PBI-011: Trackear inventario y estado del jugador
az boards work-item create --title "PBI-011: Trackear inventario y estado del jugador" --type "Issue" --description "Como jugador quiero que se trackee mi inventario y estado. AC: Inventario visible, stats jugador, flags de progreso. Status: ✅ Implementado (60%). Files: AdventureStateSnapshot, types/index.ts"
$pbi011 = $(az boards work-item create --title "PBI-011: Trackear inventario y estado del jugador" --type "Issue" --description "Como jugador quiero que se trackee mi inventario y estado" --query "id" -o tsv)
az boards work-item relation add --id $pbi011 --relation-type "Child" --target-id 4

# PBI-012: Ver acciones sugeridas cuando no sepa qué hacer
az boards work-item create --title "PBI-012: Ver acciones sugeridas contextuales" --type "Issue" --description "Como jugador quiero ver acciones sugeridas cuando no sepa qué hacer. AC: 2-3 sugerencias contextual, botones clickeables, ayuda dinámica. Status: ❌ Pendiente. Files: chatApi.ts, ChatScreen.tsx"
$pbi012 = $(az boards work-item create --title "PBI-012: Ver acciones sugeridas contextuales" --type "Issue" --description "Como jugador quiero ver acciones sugeridas cuando no sepa qué hacer" --query "id" -o tsv)
az boards work-item relation add --id $pbi012 --relation-type "Child" --target-id 4

Write-Host "Issues para ÉPICA 3 creados ✅" -ForegroundColor Green

Write-Host "🎉 Todos los Work Items del MVP han sido creados exitosamente!" -ForegroundColor Magenta
Write-Host "Puedes verlos en: https://dev.azure.com/zork-argento/Zork%20Argento/_workitems/" -ForegroundColor Cyan
