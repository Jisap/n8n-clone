
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";                 // Un tipo de error para detener el flujo de trabajo sin reintentos.
import Handlebars from "handlebars";                         // Librería para procesar plantillas de texto (templates).
import { slackChannel } from "@/inngest/channels/slack";     // Canal de comunicación para reportar el estado del nodo.
import { decode } from "html-entities";                      // Para decodificar caracteres HTML (ej: &amp; -> &).
import ky from "ky"; 

// --- Helper de Handlebars: `json` ---
// Este helper permite renderizar un objeto como una cadena de texto JSON formateada dentro de una plantilla.
// Es útil para depurar o visualizar datos complejos directamente en el mensaje de Discord.
Handlebars.registerHelper("json", (context) => {
  
  const jsonString = JSON.stringify(context, null, 2);       // Convierte el objeto de entrada a una cadena JSON con formato legible.
  return new Handlebars.SafeString(jsonString);              // Evita que Handlebars escape caracteres especiales del JSON
});

// Con este helper se puede hacer esto:
// {
//   "user": { {json userData } }
// }
// Y se convertiría en:
// {
//   "user": {
//     "name": "Juan"
//   }
// }


type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
}

// --- Lógica Principal del Executor ---
export const slackExecutor: NodeExecutor<SlackData> = async({
  data,
  nodeId,
  context, // is the previous node's output
  step,
  publish,
}) => {
  
  
  await publish(                                                                // 1. Notifica que el nodo ha comenzado a ejecutarse.
    slackChannel().status({
      nodeId,
      status: "loading"
    })
  );

  
  if (!data.content) {                                                           // 2. Valida que el contenido del mensaje no esté vacío.
    await publish(
      slackChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw new NonRetriableError("Slack node: Message content is required");
  }

  // 3. Procesa las plantillas de Handlebars para el contenido y el nombre de usuario.
  // Esto reemplaza variables como {{foo}} con los datos del 'context' (salida del nodo anterior).
  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent); // Decodifica entidades HTML para un mensaje limpio.
  

  try {
    const result = await step.run("slack-webhook", async () => {
      
      if (!data.webhookUrl) {                                                    // 4. Valida que la URL del Webhook de Discord se haya proporcionado.
        await publish(
          slackChannel().status({
            nodeId,
            status: "error"
          })
        )
        throw new NonRetriableError("Slack node: Webhook URL is required");
      }
      
      
      await ky.post(data.webhookUrl!, {                                           // 5. Envía la petición POST al webhook de Discord con el mensaje.
        json: {
          content: content // The key depended on workflow config
        }
      })

            
      if (!data.variableName) {                                                   // 6. Valida que se haya definido un nombre de variable para guardar la salida.
        await publish(                                                            // Este nombre se usa para que los nodos siguientes puedan acceder al resultado de este.
          slackChannel().status({
            nodeId,
            status: "error"
          })
        )
        throw new NonRetriableError("Variable name is required");
      }

      
      return {                                                                     // 7. Prepara el resultado que se pasará al siguiente nodo.
        ...context,                                                                // Mantiene toda la salida de los nodos anteriores.
        [data.variableName]: {                                                     // Agrega un nuevo objeto con el nombre especificado.
          messageContent: content.slice(0, 2000)                                   // Guarda el contenido del mensaje enviado.
        }
      }
    })
    
    
    await publish(                                                                  // 8. Si todo fue bien, notifica que el nodo ha terminado con éxito.
      slackChannel().status({
        nodeId,
        status: "success"
      })
    )

    
    return result;                                                                  // Devuelve el resultado para que el siguiente nodo en el flujo pueda usarlo.

  } catch (error) {
    
    await publish(                                                                  // 9. Si ocurre cualquier error durante la ejecución, lo captura.
      slackChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw error;
    // Vuelve a lanzar el error para que el sistema de flujos de trabajo sepa que la ejecución ha fallado.
  }
}