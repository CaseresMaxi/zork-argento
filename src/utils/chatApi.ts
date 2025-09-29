interface ChatResponse {
  message: string;
  success: boolean;
  payload?: any;
  conversationId?: string;
  threadId?: string;
  timestamp?: string;
}

// interface ChatRequest {
//   message: string;
// }

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
    'Generá SOLO el próximo step con los campos exactos: stepId, turnIndex, timestamp (ISO), playerInput, narrative, imagePrompt, imageSeed, imageUrl, suggestedActions, contextSummary, stateAfter.\n' +
    'Todos los textos deben ser en español.\n' +
    `Usá estos valores: stepId=${nextStepId}, turnIndex=${nextTurnIndex}, playerInput="${userInput}".\n` +
    'Actualizá stateAfter coherentemente y escribí contextSummary con una frase corta con ubicación, inventario clave, objetivos y stats principales.\n'
  );
};

type StepMeta = { stepId?: number; turnIndex?: number };

export const sendChatMessage = async (message: string, conversationId?: string, step?: StepMeta, threadId?: string): Promise<ChatResponse> => {
  try {
    const response = await fetch('https://zork-argento-api.onrender.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    return {
      message: finalMessage,
      success: true,
      payload: nestedMessage,
      conversationId: convId,
      threadId: apiThreadId,
      timestamp,
    };
  } catch (error) {
    console.error('Error calling chat API:', error);
    return {
      message: 'Error al conectar con el servidor. Intentá de nuevo.',
      success: false,
    };
  }
};
