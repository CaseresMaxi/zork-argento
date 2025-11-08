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

const API_KEY = import.meta.env.ZORK_API_KEY || ''; // Ensure API key is a string

export const buildAdventureGenerationPrompt = (userDescription: string, seed?: number): string => {
  const finalSeed = typeof seed === 'number' ? seed : Math.floor(Math.random() * 1000000);
  return (
    'Sos un generador de aventuras tipo Zork. Devolvé SOLO un JSON válido y nada más, sin explicaciones, sin markdown.\n' +
    '\n' +
    'Requisitos del objeto JSON:\n' +
    '- Campos a nivel raíz: version, adventureId, title, genre, language, createdAt, seed, state, steps\n' +
    '- language siempre "es" y todo el texto en español.\n' +
    '- createdAt y los timestamps en formato ISO 8601.\n' +
    '- seed número entero.\n' +
    '- state es un snapshot con: location, inventory[], stats{salud, lucidez}, flags{}, objetivos[].\n' +
    '- steps es un array con al menos 1 elemento (el paso inicial).\n' +
    '- Cada step tiene: stepId, turnIndex, timestamp, playerInput (null en el primer paso), narrative, imagePrompt, imageSeed, imageUrl (null si no está), suggestedActions[], stateAfter (snapshot completo).\n' +
    '- stepId y turnIndex comienzan en 0 y se incrementan por paso.\n' +
    '\n' +
    'Instrucciones de contenido:\n' +
    '- Usá la descripción del usuario para definir título, género, ubicación inicial y objetivo inicial.\n' +
    '- El primer step debe presentar la escena inicial y terminar con una pregunta al jugador.\n' +
    '- suggestedActions con 3 a 5 acciones cortas.\n' +
    '- imagePrompt detallado, estilo ilustración cinematográfica de fantasía, conciso.\n' +
    '- imageSeed entero, imageUrl null en el primer paso.\n' +
    '- state y stateAfter del primer step deben coincidir.\n' +
    '\n' +
    `Parámetros:\n- seed: ${finalSeed}\n- descripción_del_usuario: "${userDescription}"\n`
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
      'x-api-key': API_KEY, // Add API key header
    });

    const response = await fetch('/api/chat', {
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
    // eslint-disable-next-line no-console
    console.log('API response:', data);
    const root: any = data && typeof data === 'object' ? data : {};
    const inner: any = 'data' in root ? root.data : root;

    const nestedMessage = inner?.message ?? inner?.response;
    const finalMessageValue = nestedMessage ?? root.message ?? root.response ?? 'No response received';
    const finalMessage = typeof finalMessageValue === 'string' ? finalMessageValue : JSON.stringify(finalMessageValue);

    const convId = inner?.conversationId ?? root.conversationId;
    const apiThreadId = inner?.threadId ?? root.threadId;
    const timestamp = inner?.timestamp ?? root.timestamp;

    let imageBase64: string | null = null;
    let imageUrl: string | null = null;
    try {
      const parsedPayload = typeof nestedMessage === 'string' ? JSON.parse(nestedMessage) : nestedMessage;
      
      let narrative = '';
      let imagePrompt = '';
      let stepId = step?.stepId ?? 0;
      
      if (parsedPayload && typeof parsedPayload === 'object') {
        if (Array.isArray(parsedPayload.steps) && parsedPayload.steps.length > 0) {
          const lastStep = parsedPayload.steps[parsedPayload.steps.length - 1];
          narrative = lastStep?.narrative || '';
          imagePrompt = lastStep?.imagePrompt || '';
          stepId = lastStep?.stepId ?? stepId;
        } else if (parsedPayload.narrative) {
          narrative = parsedPayload.narrative;
          imagePrompt = parsedPayload.imagePrompt || '';
          stepId = parsedPayload.stepId ?? stepId;
        }
      }
      
      if (narrative || imagePrompt) {
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
      }
    } catch (imageError) {
      console.error('Error during image generation:', imageError);
    }

    return {
      message: finalMessage,
      success: true,
      payload: nestedMessage,
      conversationId: convId,
      threadId: apiThreadId,
      timestamp,
      imageBase64,
      imageUrl,
    };
  } catch (error) {
    console.error('Error calling chat API:', error);
    return {
      message: 'Error al conectar con el servidor. Intentá de nuevo.',
      success: false,
    };
  }
};
