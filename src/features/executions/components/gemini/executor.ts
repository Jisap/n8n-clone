import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars"; // Lee los templates strings teniendo en cuenta el contexto de la respuesta del nodo anterior
import { AVAILABLE_MODELS } from "./dialog";
import { geminiChannel } from "@/inngest/channels/gemini";


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


type GeminiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

export const geminiExecutor: NodeExecutor<GeminiData> = async({
  data,
  nodeId,
  context, // is the previous node's output
  step,
  publish,
}) => {
  
  await publish(
    geminiChannel().status({
      nodeId,
      status: "loading"
    })
  );

  if(!data.variableName) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw new NonRetriableError("Variable name is required");
  }

  if(!data.userPrompt){
    await publish(
      geminiChannel().status({
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

  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY!; // apiKey

  const google = createGoogleGenerativeAI({                          // Instancia la clase de la API de Google Generative AI
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google(data.model || "gemini-pro"),            // Selecciona el modelo de la API de Google Generative AI
        system: systemPrompt,
        prompt: UserPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        }
      }
    );

    const text =                                                    // Extrae el texto de la respuesta
      steps[0].content[0].type === "text"                           // Comprueba si el tipo de contenido es "text"
        ? steps[0].content[0].text                                  // Si es "text", extrae el texto
        : ""                                                        // Si no es "text", devuelve una cadena vacía

    await publish(
      geminiChannel().status({
        nodeId,
        status: "success"
      })
    )

    return {
      ...context,                                                   // Devuelve el contexto actual
      [data.variableName]: { aiResponse: text }                     // Agrega el texto a la variable de contexto
    }

  } catch (error) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw error;
  }
}