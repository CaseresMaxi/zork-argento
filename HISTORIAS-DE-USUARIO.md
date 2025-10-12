# 📚 Historias de Usuario - Zork Argento

## 🎯 **Visión del Producto**

**Zork Argento** es una aventura de texto dinámica impulsada por IA que permite a los jugadores crear y vivir historias interactivas únicas a través de comandos en lenguaje natural, con generación automática de narrativa e imágenes ilustrativas.

---

## 🚀 **Roadmap de Épicas**

### **ÉPICA 1: Fundación y Autenticación** 
*Milestone: MVP Core - Semana 1-2*

**Descripción**: Sistema de autenticación completo y onboarding de usuarios. Base fundamental para el acceso seguro y gestión de usuarios.

#### **PBI-001: Registro con email/password**
**Como** usuario  
**Quiero** registrarme con email y password  
**Para** crear mi cuenta personal y guardar mi progreso

**Criterios de Aceptación:**
- Email debe ser válido (formato correcto)
- Password mínimo 8 caracteres con al menos 1 mayúscula, 1 minúscula y 1 número
- Confirmación de password debe coincidir
- Manejo de errores claro (email ya registrado, password débil)
- Redirección automática al home después del registro exitoso
- Validación tanto client-side como server-side

**Archivos Impactados:** `useSignupForm.ts`, `validation.ts`, `AuthContext.tsx`  
**Status:** ✅ Implementado (95%) - Falta solo validación de confirmación

---

#### **PBI-002: Login con email/password**
**Como** usuario registrado  
**Quiero** hacer login con mi email y password  
**Para** acceder a mis aventuras guardadas

**Criterios de Aceptación:**
- Login exitoso con credenciales válidas
- Mensaje de error claro para credenciales incorrectas
- Redirección automática al home después del login
- Mantener sesión activa (remember me)
- Opción de "¿Olvidaste tu password?" (futuro)
- Loading state durante el proceso de autenticación

**Archivos Impactados:** `useLoginForm.ts`, `AuthContext.tsx`  
**Status:** ✅ Implementado (95%) - Funcional, falta polish UI

---

#### **PBI-003: Google Sign-In**
**Como** usuario  
**Quiero** hacer login con mi cuenta de Google  
**Para** tener acceso rápido sin crear nueva password

**Criterios de Aceptación:**
- Botón "Continuar con Google" visible y accesible
- Popup de Google Auth funcional
- Datos del usuario sincronizados automáticamente
- Creación automática de perfil si es primera vez
- Mismo flujo de redirección que login normal
- Manejo de errores si Google Auth falla

**Archivos Impactados:** `AuthContext.tsx`, `firebase.ts`  
**Status:** ❌ Pendiente

---

#### **PBI-004: Onboarding para usuarios nuevos**
**Como** usuario nuevo  
**Quiero** ver una introducción que me explique cómo funciona el juego  
**Para** entender rápidamente las mecánicas y comenzar mi primera aventura

**Criterios de Aceptación:**
- Tutorial de 3 pasos máximo
- Paso 1: "¿Qué es Zork Argento?" - Explicación básica
- Paso 2: "Crea tu primera aventura" - Demo de prompt
- Paso 3: "Comandos básicos" - Ejemplos de interacción
- Opción "Saltar tutorial" visible
- Animaciones suaves entre pasos
- Solo se muestra en primer login

**Archivos Impactados:** `AppRouter.tsx`, `Tutorial.tsx` (nuevo)  
**Status:** ❌ Pendiente

---

### **ÉPICA 2: Motor de Aventuras Básico**
*Milestone: MVP Funcional - Semana 3-4*

**Descripción**: Sistema básico de creación y gestión de aventuras. Funcionalidad core para que los usuarios puedan crear, listar y continuar sus aventuras.

#### **PBI-005: Crear aventura desde prompt inicial**
**Como** jugador  
**Quiero** crear una nueva aventura escribiendo un prompt inicial  
**Para** comenzar una historia personalizada según mis preferencias

**Criterios de Aceptación:**
- Campo de texto amplio para el prompt (mínimo 10 caracteres)
- Placeholder con ejemplos: "Una aventura medieval en un castillo encantado..."
- Validación de longitud mínima y máxima
- Botón "Crear Aventura" bien visible
- Loading state con mensaje "Generando tu aventura..."
- Timeout de 15 segundos máximo
- Navegación automática al chat una vez creada

**Archivos Impactados:** `HomeScreen.tsx`, `validation.ts`  
**Status:** ✅ Implementado (80%) - Funcional, falta mejoras UX

---

#### **PBI-006: Recibir introducción generada por IA inmediatamente**
**Como** jugador  
**Quiero** recibir la introducción de mi aventura generada por IA inmediatamente después de crearla  
**Para** comenzar a jugar sin demoras

**Criterios de Aceptación:**
- Respuesta de IA en menos de 10 segundos
- Narrativa coherente y relacionada con el prompt
- Estado inicial del jugador creado (ubicación, inventario básico)
- Descripción ambiental rica e inmersiva
- Tono consistente con el género solicitado
- Primer conjunto de acciones disponibles

**Archivos Impactados:** `chatApi.ts`, `buildAdventureGenerationPrompt`  
**Status:** ✅ Implementado (85%) - Funcional, optimizable

---

#### **PBI-007: Ver mis aventuras existentes en el home**
**Como** jugador  
**Quiero** ver una lista de mis aventuras existentes en la pantalla principal  
**Para** continuar jugando donde dejé o revisar aventuras anteriores

**Criterios de Aceptación:**
- Lista ordenada por fecha de última actividad
- Cada aventura muestra: título, fecha de creación, preview del último estado
- Botón "Continuar" claramente visible
- Indicador visual de progreso (turnos jugados)
- Opción de "Eliminar aventura" con confirmación
- Estado de carga mientras obtiene las aventuras
- Mensaje amigable si no hay aventuras ("¡Crea tu primera aventura!")

**Archivos Impactados:** `AdventureList.tsx`, `AdventureService.ts`  
**Status:** ✅ Implementado (70%) - Lista básica funcional

---

#### **PBI-008: Continuar aventura donde la dejé**
**Como** jugador  
**Quiero** continuar una aventura exactamente donde la dejé  
**Para** mantener la continuidad de mi experiencia de juego

**Criterios de Aceptación:**
- Carga del último estado guardado
- Historial de toda la conversación visible
- Scroll automático al último mensaje
- Estado del jugador (inventario, ubicación) preservado
- Contexto de IA mantenido para coherencia narrativa
- Transición suave desde la lista al juego

**Archivos Impactados:** `ChatScreen.tsx`, `AdventureService.ts`  
**Status:** ✅ Implementado (75%) - Funcional, mejoras pendientes

---

### **ÉPICA 3: Sistema de Juego Interactivo**
*Milestone: Core Gameplay - Semana 5-6*

**Descripción**: Loop de juego principal con chat mejorado y estado avanzado del jugador. El corazón de la experiencia interactiva.

#### **PBI-009: Escribir comandos en lenguaje natural**
**Como** jugador  
**Quiero** escribir comandos en lenguaje natural  
**Para** interactuar intuitivamente con la aventura sin memorizar sintaxis específica

**Criterios de Aceptación:**
- Input de texto libre sin restricciones de formato
- Submit con Enter o botón "Enviar"
- Placeholder dinámico con sugerencias contextuales
- Soporte para comandos complejos: "abrir la puerta lentamente y escuchar"
- Manejo de comandos ambiguos con clarificaciones
- Historial de comandos con flecha arriba/abajo

**Archivos Impactados:** `ChatScreen.tsx`  
**Status:** ✅ Implementado (90%) - Muy funcional

---

#### **PBI-010: Ver respuestas narrativas coherentes**
**Como** jugador  
**Quiero** recibir respuestas narrativas coherentes y envolventes  
**Para** mantenerme inmerso en la historia

**Criterios de Aceptación:**
- Narrativa fluida que responde lógicamente a mis acciones
- Consecuencias coherentes con acciones anteriores
- Tono y estilo consistente durante toda la aventura
- Descripciones ricas del ambiente y personajes
- Diálogos naturales y contextuales
- Manejo inteligente de acciones imposibles o ilógicas

**Archivos Impactados:** `buildAdventureContinuationPrompt`, `chatApi.ts`  
**Status:** ✅ Implementado (85%) - Muy buena calidad

---

#### **PBI-011: Trackear inventario y estado del jugador**
**Como** jugador  
**Quiero** que el juego trackee automáticamente mi inventario y estado  
**Para** tener una experiencia RPG completa con progresión

**Criterios de Aceptación:**
- Inventario visible en sidebar o panel dedicado
- Stats del jugador: vida, mana, experiencia (si aplica)
- Flags de progreso de la historia
- Ubicación actual claramente identificada
- Items obtenidos/perdidos se reflejan inmediatamente
- Estado persistente entre sesiones

**Archivos Impactados:** `AdventureStateSnapshot`, `types/index.ts`  
**Status:** ✅ Implementado (60%) - Estructura básica lista

---

#### **PBI-012: Ver acciones sugeridas contextuales**
**Como** jugador  
**Quiero** ver acciones sugeridas cuando no sepa qué hacer  
**Para** no quedarme bloqueado y mantener el flujo de juego

**Criterios de Aceptación:**
- 2-3 sugerencias contextuales basadas en la situación actual
- Botones clickeables para acciones comunes
- Sugerencias cambian según el contexto (combate vs exploración)
- Opción de ocultar/mostrar sugerencias
- Ayuda dinámica para nuevos jugadores
- Sugerencias no repetitivas

**Archivos Impactados:** `chatApi.ts`, `ChatScreen.tsx`  
**Status:** ❌ Pendiente

---

### **ÉPICA 4: Experiencia Visual Rica**
*Milestone: Enhanced Experience - Semana 7-8*

**Descripción**: Generación de imágenes por escena y mejoras visuales de la interfaz para una experiencia más inmersiva.

#### **PBI-013: Ver una imagen por cada escena**
**Como** jugador  
**Quiero** ver una imagen generada que represente cada escena  
**Para** tener una experiencia visual más rica e inmersiva

**Criterios de Aceptación:**
- Imagen generada automáticamente por cada nodo/escena
- Estilo visual consistente durante toda la aventura
- Tiempo de generación menor a 15 segundos
- Fallback a imagen placeholder si generación falla
- Resolución adecuada para web (optimizada)
- Alt text descriptivo para accesibilidad

**Archivos Impactados:** `chatApi.ts`, `ImageService.ts` (nuevo)  
**Status:** ❌ Pendiente

---

#### **PBI-014: Imágenes que reflejen mi estado actual**
**Como** jugador  
**Quiero** que las imágenes reflejen mi inventario y estado actual  
**Para** ver visualmente el progreso de mi personaje

**Criterios de Aceptación:**
- Personaje consistente a lo largo de la aventura
- Equipamiento visible en las imágenes
- Ambiente coherente con la ubicación actual
- Estados especiales reflejados (heridas, buff, etc.)
- Estilo artístico consistente
- Detalles del inventario importantes visibles

**Archivos Impactados:** `chatApi.ts`, `ImageService.ts`  
**Status:** ❌ Pendiente

---

#### **PBI-015: Interfaz inmersiva y responsive**
**Como** jugador  
**Quiero** una interfaz visualmente atractiva que funcione en cualquier dispositivo  
**Para** jugar cómodamente desde cualquier lugar

**Criterios de Aceptación:**
- Design responsive mobile-first
- Transiciones y animaciones suaves
- Tema dark/light toggle
- Tipografía clara y legible
- Contraste adecuado para accesibilidad
- Performance fluida en dispositivos móviles
- Soporte para gestos táctiles

**Archivos Impactados:** `App.css`, todos los componentes  
**Status:** ✅ Implementado (60%) - Base sólida

---

### **ÉPICA 5: Persistencia y Performance**
*Milestone: Production Ready - Semana 9-10*

**Descripción**: Sistema robusto de guardado automático, funcionalidades offline básicas y optimizaciones de performance.

#### **PBI-016: Guardado automático silencioso**
**Como** jugador  
**Quiero** que cada turno se guarde automáticamente sin interrumpir mi experiencia  
**Para** nunca perder progreso y poder continuar desde cualquier dispositivo

**Criterios de Aceptación:**
- Guardado después de cada interacción exitosa
- Indicador sutil de estado de guardado
- Recovery automático si se pierde conexión
- Sincronización entre dispositivos
- No bloqueo de UI durante el guardado
- Rollback en caso de error de guardado

**Archivos Impactados:** `AdventureService.ts`, `useAutoSave.ts` (nuevo)  
**Status:** ✅ Implementado (75%) - Funcional básico

---

#### **PBI-017: Funcionalidad básica offline**
**Como** jugador  
**Quiero** poder continuar jugando básicamente sin conexión a internet  
**Para** no interrumpir mi aventura en lugares sin conectividad

**Criterios de Aceptación:**
- Lectura de aventuras guardadas sin conexión
- Navegación por historial offline
- Cache inteligente de respuestas recientes
- Sync automático cuando vuelve la conexión
- Notificación clara del estado de conexión
- Funciones limitadas pero útiles offline

**Archivos Impactados:** `ServiceWorker.js` (nuevo), `OfflineService.ts` (nuevo)  
**Status:** ❌ Pendiente

---

#### **PBI-018: Historial navegable de aventura**
**Como** jugador  
**Quiero** navegar fácilmente por toda la historia de mi aventura  
**Para** revisar decisiones anteriores y releer momentos favoritos

**Criterios de Aceptación:**
- Scroll infinito por nodos anteriores
- Timeline visual de la aventura
- Búsqueda de texto en el historial
- Bookmarks en momentos importantes
- Salto rápido a escenas específicas
- Export de aventura completa a PDF/texto

**Archivos Impactados:** `Timeline.tsx` (nuevo), `ChatScreen.tsx`  
**Status:** ❌ Pendiente

---

### **ÉPICA 6: Calidad y Límites**
*Milestone: Sustainable Product - Semana 11-12*

**Descripción**: Sistema de límites para controlar costos, moderación de contenido y analytics para mejorar el producto.

#### **PBI-019: Control de costos por usuario**
**Como** administrador del sistema  
**Quiero** controlar los costos de IA por usuario  
**Para** mantener el servicio sostenible económicamente

**Criterios de Aceptación:**
- Límite de turnos por día/mes por usuario
- Diferentes tiers: Free, Premium, Pro
- Advertencias al usuario cuando se acerca al límite
- Upgrade options claramente presentadas
- Analytics de uso por usuario
- Sistema de tokens/créditos

**Archivos Impactados:** `RateLimitService.ts` (nuevo), `UserTierService.ts` (nuevo)  
**Status:** ❌ Pendiente

---

#### **PBI-020: Moderación de contenido**
**Como** administrador  
**Quiero** prevenir y moderar contenido inapropiado  
**Para** mantener una comunidad segura y cumplir con políticas

**Criterios de Aceptación:**
- Filtro automático de palabras/temas NSFW
- Detección de contenido violento extremo
- Sistema de reportes de usuarios
- Queue de moderación para casos borderline
- Auto-suspensión de cuentas problemáticas
- Appeals process para usuarios

**Archivos Impactados:** `ModerationService.ts` (nuevo), `ContentFilter.ts` (nuevo)  
**Status:** ❌ Pendiente

---

#### **PBI-021: Analytics y monitoring**
**Como** administrador  
**Quiero** tener métricas detalladas de uso y performance  
**Para** tomar decisiones informadas sobre el producto

**Criterios de Aceptación:**
- Dashboard con métricas clave (usuarios activos, aventuras creadas, etc.)
- Alertas automáticas para errores críticos
- Tiempo de respuesta de APIs monitorizado
- Heat maps de uso de features
- Retention rate y engagement metrics
- Performance budgets y alertas

**Archivos Impactados:** `Analytics.ts` (nuevo), `Monitoring.ts` (nuevo)  
**Status:** ❌ Pendiente

---

### **ÉPICA 7: Funciones Avanzadas**
*Milestone: Advanced Features - Semana 13+*

**Descripción**: Características avanzadas de personalización, funciones sociales y herramientas para creadores de contenido.

#### **PBI-022: Personalización de aventuras**
**Como** jugador avanzado  
**Quiero** personalizar profundamente el estilo y mecánicas de mis aventuras  
**Para** crear experiencias únicas adaptadas a mis preferencias

**Criterios de Aceptación:**
- Selector de géneros predefinidos (Fantasy, Sci-Fi, Horror, etc.)
- Configuración de tono (Serio, Cómico, Dark, etc.)
- Templates de aventura populares
- Configuración avanzada de IA (creatividad vs estructura)
- Sistema de tags y categorías
- Preferencias guardadas por usuario

**Archivos Impactados:** `GenreService.ts` (nuevo), `AdvancedSettings.tsx` (nuevo)  
**Status:** ❌ Futuro

---

#### **PBI-023: Compartir aventuras**
**Como** jugador  
**Quiero** compartir mis aventuras favoritas con otros jugadores  
**Para** mostrar historias interesantes y descubrir contenido de otros

**Criterios de Aceptación:**
- Links de sharing para aventuras completas
- Galería pública de aventuras destacadas
- Sistema de likes y comentarios
- Búsqueda y filtros en galería pública
- Aventuras destacadas por staff
- Opciones de privacidad (público, privado, solo con link)

**Archivos Impactados:** `SharingService.ts` (nuevo), `PublicGallery.tsx` (nuevo)  
**Status:** ❌ Futuro

---

## 📊 **Priorización y Planning**

### **Sprint Planning Sugerido**

#### **Sprint 1 (Semanas 1-2): Fundación MVP**
- **MUST HAVE**: PBI-001, PBI-002 (Autenticación básica)
- **SHOULD HAVE**: PBI-004 (Onboarding)  
- **COULD HAVE**: PBI-003 (Google Auth)

#### **Sprint 2 (Semanas 3-4): Core Aventuras**
- **MUST HAVE**: PBI-005, PBI-006 (Crear y generar aventuras)
- **MUST HAVE**: PBI-007, PBI-008 (Listar y continuar)
- **SHOULD HAVE**: PBI-011 (Estado básico)

#### **Sprint 3 (Semanas 5-6): Gameplay Interactivo**
- **MUST HAVE**: PBI-009, PBI-010 (Chat natural y narrativa)
- **SHOULD HAVE**: PBI-012 (Acciones sugeridas)
- **COULD HAVE**: PBI-015 (UI mejorada)

#### **Sprint 4 (Semanas 7-8): Experiencia Visual**
- **MUST HAVE**: PBI-013, PBI-014 (Generación de imágenes)
- **MUST HAVE**: PBI-016 (Guardado robusto)
- **SHOULD HAVE**: PBI-018 (Historial navegable)

---

## 🎯 **Definición de Done**

Para que un PBI se considere **DONE**, debe cumplir:

### **Código y Testing**
- ✅ Código implementado siguiendo estándares del proyecto
- ✅ Unit tests con coverage mínimo 80%
- ✅ Integration tests para flujos críticos
- ✅ Code review aprobado por al menos 1 reviewer

### **QA y UX**
- ✅ Testing manual completado
- ✅ Acceptance criteria validados por Product Owner
- ✅ UI/UX review aprobado
- ✅ Responsive testing en mobile/desktop

### **Deployment y Docs**
- ✅ Deploy exitoso en staging environment
- ✅ Smoke tests passing en staging
- ✅ Documentación técnica actualizada
- ✅ Release notes actualizadas

### **Performance y Seguridad**
- ✅ Performance benchmark cumplido
- ✅ Security review si maneja datos sensibles
- ✅ Accessibility básica verificada
- ✅ Error handling y edge cases cubiertos

---

## 📈 **Métricas de Éxito**

### **MVP (Primeras 4 semanas)**
- **Usuarios registrados**: 50+ usuarios beta
- **Aventuras creadas**: 100+ aventuras
- **Retention D7**: >40% usuarios que vuelven en 7 días
- **Time to first adventure**: <3 minutos desde registro

### **V1.0 (8 semanas)**
- **MAU (Monthly Active Users)**: 500+
- **Aventuras completadas**: 20% completion rate
- **User satisfaction**: >4.2/5 en reviews
- **Technical uptime**: >99% availability

### **V2.0 (12 semanas)**
- **MAU**: 2000+
- **Revenue per user**: $5+ monthly (freemium model)
- **Content generation cost**: <$0.50 per adventure
- **Support tickets**: <5% of MAU monthly

---

## 🔗 **Enlaces y Referencias**

### **Proyecto Azure DevOps**
- **Boards**: https://dev.azure.com/zork-argento/Zork%20Argento/_boards/
- **Work Items**: https://dev.azure.com/zork-argento/Zork%20Argento/_workitems/
- **Sprints**: https://dev.azure.com/zork-argento/Zork%20Argento/_sprints

### **Documentación Técnica**
- **Arquitectura**: `STRUCTURE.md`
- **React Hook Form**: `REACT-HOOK-FORM-GUIDE.md`  
- **Validación**: `YUP-VALIDATION.md`
- **Firebase Setup**: `firebase-config-example.txt`

### **Estado Actual del Código**
- **Autenticación**: ✅ 95% completa
- **Aventuras**: ✅ 80% core funcional
- **Chat**: ✅ 90% muy funcional
- **UI/UX**: ✅ 60% base sólida
- **Persistencia**: ✅ 75% funcional

---

## 🎮 **¡A desarrollar Zork Argento!**

Este roadmap te llevará desde un MVP básico hasta un producto completo y escalable. Cada épica está diseñada para agregar valor incremental y validar hipótesis del producto.

**¡Que comience la aventura! ⚔️✨**
