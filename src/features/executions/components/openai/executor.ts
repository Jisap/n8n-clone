import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars"; // Lee los templates strings teniendo en cuenta el contexto de la respuesta del nodo anterior
import { openaiChannel } from "@/inngest/channels/openai";


Handlebars.registerHelper("json", (context) => {               // Se registra un "helper" de Handlebars llamado "json" que recibe como parametro un objeto context (respuesta del nodo anterior). 
  const jsonString = JSON.stringify(context, null, 2);         // Lo convierte a una cadena JSON 
  const safeString = new Handlebars.SafeString(jsonString);    // Lo envuelve en un SafeString para que Handlebars no escapue los caracteres especiales como ", { , }"
  return safeString;                                           // Lo retorna para usarlo en plantillas
});

// Con este helper se puede hacer esto:
// {
//   "user": { {json userData } }
// }
//
// Y se convertiría en:
//
// json{
//   "user": {
//     "name": "Juan"
//   }
// }


type OpenAiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

export const openaiExecutor: NodeExecutor<OpenAiData> = async({
  data,
  nodeId,
  context, // is the previous node's output
  step,
  publish,
}) => {
  
  await publish(
    openaiChannel().status({
      nodeId,
      status: "loading"
    })
  );

  if(!data.variableName) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw new NonRetriableError("Variable name is required");
  }

  if(!data.userPrompt){
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw new NonRetriableError("User prompt is required");
  }

  // TODO: Add throw is credential is missign

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant."

  const UserPrompt = Handlebars.compile(data.userPrompt)(context);

  //TODO: Fetch credential that user selected

  const credentialValue = process.env.OPEN_API_KEY!; // apiKey

  const openai = createOpenAI({                          // Instancia la clase de la API de Google Generative AI
    apiKey: credentialValue,
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const { steps } = await step.ai.wrap(
      "openai-generate-text",
      generateText,
      {
        model: openai(data.model || "openai/gpt-oss-20b"),            // Selecciona el modelo de la API de Google Generative AI
        system: systemPrompt,
        prompt: UserPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        }
      }
    );

    // Buscar el elemento con type: "text" en el array content
    // porque puede haber elementos de tipo "reasoning" primero
    const textContent = steps[0]?.content?.find(
      (item) => item.type === "text"
    );

    const text = (textContent && "text" in textContent) ? textContent.text : "";

    await publish(
      openaiChannel().status({
        nodeId,
        status: "success"
      })
    )

    return {
      ...context,                                                   // Devuelve el contexto actual
      [data.variableName]: { text }                                 // Agrega el texto a la variable de contexto
    }                                                               // La respuesta puede contener saltos de lineas y espacios en blanco asi como tres back ticks que habria que eliminar si se quiere usar en un template

  } catch (error) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw error;
  }
}