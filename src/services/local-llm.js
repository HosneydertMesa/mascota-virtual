'use strict';

/**
 * Micro-LLM Neural Service (0.13B / 0.5B) using Transformers.js & ONNX
 */
let pipelineInstance = null;
let modelStatus = 'unloaded';
let modelError = null;

const DEFAULT_LOCAL_MODEL = 'HuggingFaceTB/SmolLM2-135M-Instruct';

async function initLocalModel(modelName = DEFAULT_LOCAL_MODEL) {
  if (pipelineInstance) return { status: 'ready', model: modelName };
  if (modelStatus === 'loading') return { status: 'loading' };

  modelStatus = 'loading';
  try {
    const { pipeline, env } = await import('@huggingface/transformers');
    env.allowLocalModels = true;
    
    pipelineInstance = await pipeline('text-generation', modelName, {
      dtype: 'q4+',
      device: 'cpu'
    });
    modelStatus = 'ready';
    return { status: 'ready', model: modelName };
  } catch (error) {
    modelStatus = 'error';
    modelError = error.message;
    console.warn('[LocalLLM] No se pudo cargar el modelo ONNX, usando motor heuristico:', error.message);
    return { status: 'error', error: error.message };
  }
}

async function generateWithLocalLLM(petType, userMessage, petName) {
  if (!pipelineInstance) {
    initLocalModel().catch(() => {});
    return null;
  }

  const isCat = petType === 'cat';
  const name = petName || (isCat ? 'Luna' : 'Max');

  const systemPrompt = `Eres ${name}, una mascota virtual ${isCat ? 'gatita sabia y cariñosa' : 'perrito alegre y juguetón'}. Responde siempre en objeto JSON: {"emotion":"happy|calm|sleepy|excited","action":"jump|sit|lay|stretch|wag|none","sound":"${isCat ? 'meow|purr|none' : 'bark|sniff|none'}","intent":"approach|stay|play|sleep|rest_sit|rest_lay|rest_stretch","content":"frase corta de 1-2 oraciones"}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: String(userMessage).slice(0, 300) }
  ];

  try {
    const output = await pipelineInstance(messages, {
      max_new_tokens: 80,
      temperature: 0.7,
      top_p: 0.9,
      return_full_text: false
    });

    const generated = output && output[0] && output[0].generated_text;
    if (typeof generated === 'string') {
      const jsonMatch = generated.match(/\{[\s\S]*?\}/);
      if (jsonMatch) return jsonMatch[0];
    }
    return null;
  } catch (error) {
    console.warn('[LocalLLM] Error de generacion:', error.message);
    return null;
  }
}

module.exports = {
  initLocalModel,
  generateWithLocalLLM,
  getLocalModelStatus: () => ({ status: modelStatus, error: modelError })
};