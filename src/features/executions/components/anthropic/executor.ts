import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import Handlebars from "handlebars"; // Lee los templates strings teniendo en cuenta el contexto de la respuesta del nodo anterior
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";



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


type AnthropicData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

export const anthropicExecutor: NodeExecutor<AnthropicData> = async({
  data,
  nodeId,
  context, // is the previous node's output
  step,
  publish,
  userId
}) => {
  
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading"
    })
  );

  if(!data.variableName) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw new NonRetriableError("Variable name is required");
  }

  if (!data.credentialId) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error"
      })
    );
    throw new NonRetriableError("Anthropic node: Credential is required");
  }

  if(!data.userPrompt){
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw new NonRetriableError("User prompt is required");
  }


  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant."

  const UserPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {          // Obtiene el credential que el usuario selecciono
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId
      }
    })
  });

  if (!credential) {
    throw new NonRetriableError("Anthropic node: Credential not found");
  }

  //const credentialValue = process.env.ANTHROPIC_API_KEY!;             // Esta apikey tiene que ser establecida en el dialog de creacion de credenciales

  const anthropic = createOpenAI({                                      // Aqui habría que usar createAnthropic como instancia la clase de la API de Anthropic
    apiKey: decrypt(credential.value),                                           // Como no tengo credenciales de Anthropic, estoy usando las apiKeys de prueba de Groq.com
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || "openai/gpt-oss-20b"),          // Estoy usando el modelo de código abierto de groq.com
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
      anthropicChannel().status({
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
      anthropicChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw error;
  }
}