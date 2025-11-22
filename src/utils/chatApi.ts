interface ChatResponse {
  message: string;
  success: boolean;
  payload?: any;
  conversationId?: string;
  threadId?: string;
  timestamp?: string;
  imageBase64?: string | null;
  imageUrl?: string | null;
}

import { generateImageForStep, uploadImageToStorage } from './imageService';

const API_KEY = import.meta.env.ZORK_API_KEY || '';

export const buildAdventureGenerationPrompt = (userDescription: string, gameLength?:string): string => {
  gameLength = gameLength || 'media';
  const finalSeed = Math.floor(Math.random() * 1000000);
  return (
    'Sos un generador de aventuras tipo Zork. Devolvé SOLO un JSON válido y nada más, sin explicaciones, sin markdown.\n' +
    'Requisitos del objeto JSON:\n' +
    '- Campos a nivel raíz que siempre deben estar: version, adventureId, title, genre, language, createdAt, seed, state, juegoGanado, steps\n' +
    '- language siempre "es" y todo el texto en español.\n' +
    '- createdAt y los timestamps en formato ISO 8601.\n' +
    '- seed número entero.\n' +
    '- state es un snapshot con: location, inventory[], stats{salud, lucidez}, flags{}, objetivos[].\n' +
    '- juegoGanado es un booleano que representa si se ganó la partida.\n' +
    '- steps es un array con 1 elemento (el ultimo paso generado).\n' +
    '- Cada step tiene: stepId, turnIndex, timestamp, playerInput (null en el primer paso), narrative, imagePrompt, imageSeed, imageUrl (null si no está), suggestedActions[], stateAfter (snapshot completo).\n' +
    '- stepId y turnIndex comienzan en 0 y se incrementan por paso.\n' +
    '\n' +
    'Instrucciones de contenido:\n' +
    '- Usá la descripción del usuario para definir título, género, ubicación inicial y objetivo principal del juego.\n' +
    '- El primer step debe presentar la escena inicial y terminar con una pregunta o decisión al jugador.\n' +
    '- suggestedActions con 3 a 5 acciones cortas y relevantes.\n' +
    '- imagePrompt detallado, estilo ilustración cinematográfica de fantasía, conciso.\n' +
    '- imageSeed entero, imageUrl null en el primer paso.\n' +
    '- state y stateAfter del primer step deben coincidir.\n' +
    '\n' +
    'Plan narrativo y progresión:\n' +
    '- La aventura debe tener una secuencia lógica de progresión hacia un objetivo final claro, definido al inicio.\n' +
    '- Dividí internamente la historia en etapas: introducción → desarrollo → clímax → resolución.\n' +
    '- En cada paso, asegurate de que las acciones y consecuencias acerquen o alejen al jugador de cumplir su objetivo, evitando desvíos irrelevantes. No permitir tomar atajos del tipo "ganar juego" antes de la cantidad de pasos definida segun la duracion del juego elegida, en caso de usarse penalizarlo en algun stat (lucidez o salud).\n' +
    '- La narrativa debe reflejar consecuencias de las decisiones del jugador. En caso de que una accion repercuta en los stats (lucidez, salud) ser consistente en los pasos siguientes y explicar brevemente qué causo la modificacion en los stats\n' +
    '\n' +
    'Duración parametrizable:\n' +
    '- Parámetro "duración": puede ser "corta" (5 a 8 decisiones), "media" (9 a 12 decisiones) o "larga" (13 a 16 decisiones).\n' +
    '- Usá este parámetro para planificar la complejidad de los desafíos, el número de ubicaciones y la profundidad del desarrollo narrativo.\n' +
    '- En partidas cortas, la historia debe avanzar rápido hacia la resolución; en las largas, incorporar más exploración y subeventos antes del final.\n' +
    '\n' +
    'Coherencia y control:\n' +
    '- Evitá cambios bruscos de tono, género o ambientación.\n' +
    '- Mantené continuidad en personajes, objetos y objetivos.\n' +
    '- Asegurate de que cada historia tenga un posible desenlace donde el jugador gane o fracase según sus decisiones.\n' +
    '\n' +
    `Parámetros:\n- seed: ${finalSeed}\n- duración: "${gameLength}"\n- descripción_del_usuario: "${userDescription}"\n`
  );
};

export const buildAdventureContinuationPrompt = (
  adventureJson: string,
  userInput: string,
  nextStepId: number,
  nextTurnIndex: number
): string => {
  let summary = '';
  try {
    const adv = JSON.parse(adventureJson);
    const last = adv?.steps?.[adv.steps.length - 1];
    const s = last?.stateAfter ?? adv?.state;
    const inv = Array.isArray(s?.inventory) && s.inventory.length ? s.inventory.join(', ') : 'ninguno';
    const objetivos = Array.isArray(s?.objetivos) && s.objetivos.length ? s.objetivos.join('; ') : 'ninguno';
    const flags = s?.flags ? Object.keys(s.flags).filter(k => s.flags[k]).join(', ') : '';
    summary = `Ubicación: ${s?.location ?? 'desconocida'}. Inventario: ${inv}. Objetivos: ${objetivos}. Salud: ${s?.stats?.salud ?? 0}, Lucidez: ${s?.stats?.lucidez ?? 0}. Flags: ${flags}`;
  } catch {}

  return (
    'Sos un narrador de aventuras tipo Zork. Devolvé SOLO un JSON válido y nada más.\n' +
    `Resumen de contexto: ${summary}\n` +
    'Contexto (JSON compacto):\n' +
    adventureJson +
    '\n' +
    'Generá SOLO el próximo step con los campos exactos: stepId, turnIndex, timestamp (ISO), playerInput, narrative, imagePrompt, imageSeed, imageUrl, suggestedActions, stateAfter.\n' +
    'Todos los textos deben ser en español.\n' +
    `Usá estos valores: stepId=${nextStepId}, turnIndex=${nextTurnIndex}, playerInput="${userInput}".\n`  );
};

type StepMeta = { stepId?: number; turnIndex?: number };

export const sendChatMessage = async (
  message: string, 
  conversationId?: string, 
  step?: StepMeta, 
  threadId?: string,
  userId?: string,
  adventureId?: string
): Promise<ChatResponse> => {
  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
  
    });

    const response = await fetch('https://zork-argento-api.onrender.com/api/chat', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(
        {
          message,
          ...(conversationId ? { conversationId } : {}),
          ...(threadId ? { threadId } : {}),
          ...(step ? { step } : {}),
        }
      ),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);
    const root: any = data && typeof data === 'object' ? data : {};
    const inner: any = 'data' in root ? root.data : root;

    const nestedMessage = inner?.message ?? inner?.response;
    const finalMessageValue = nestedMessage ?? root.message ?? root.response ?? 'No response received';
    const finalMessage = typeof finalMessageValue === 'string' ? finalMessageValue : JSON.stringify(finalMessageValue);

    const convId = inner?.conversationId ?? root.conversationId;
    const apiThreadId = inner?.threadId ?? root.threadId;
    const timestamp = inner?.timestamp ?? root.timestamp;

    return {
      message: finalMessage,
      success: true,
      payload: nestedMessage,
      conversationId: convId,
      threadId: apiThreadId,
      timestamp,
      imageBase64: null,
      imageUrl: null,
    };
  } catch (error) {
    console.error('Error calling chat API:', error);
    return {
      message: 'Error al conectar con el servidor. Intentá de nuevo.',
      success: false,
    };
  }
};

export const generateImageForChatStep = async (
  narrative: string,
  imagePrompt: string,
  stepId: number,
  userId?: string,
  adventureId?: string
): Promise<{ imageBase64: string | null; imageUrl: string | null }> => {
  let imageBase64: string | null = null;
  let imageUrl: string | null = null;
  
  try {
    console.log('🎨 Generating image for step...');
    imageBase64 = await generateImageForStep(narrative, imagePrompt);
    if (imageBase64) {
      console.log('✅ Image generated successfully');
      
      if (userId && adventureId) {
        console.log('📤 Uploading image to Firebase Storage...');
        imageUrl = await uploadImageToStorage(imageBase64, userId, adventureId, stepId);
        if (imageUrl) {
          console.log('✅ Image uploaded to Storage:', imageUrl);
        } else {
          console.log('⚠️ Image upload failed, but base64 is available');
        }
      } else {
        console.log('⚠️ userId or adventureId not provided, skipping upload');
      }
    } else {
      console.log('⚠️ Image generation failed or returned null');
    }
  } catch (imageError) {
    console.error('Error during image generation:', imageError);
  }
  
  return { imageBase64, imageUrl };
};
