import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars"; // Lee los templates strings teniendo en cuenta el contexto de la respuesta del nodo anterior
import { httpRequestChannel } from "@/inngest/channels/http-request";

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


type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async({
  data,
  nodeId,
  context, // is the previous node's output
  step,
  publish,
}) => {
  
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading"
    })
  )

  if(!data.endpoint){
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  if(!data.variableName){
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw new NonRetriableError("Variable name is not configured");
  }

  if(!data.method){
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error"
      })
    )
    throw new NonRetriableError("Method is not configured");
  }

  try {
    const result = await step.run(`http-request`, async () => {             // Run the http request step
      const endpoint = Handlebars.compile(data.endpoint)(context)           // Get the endpoint from the data. Handlebars compila el endpoint teniendo encuenta el contexto del nodo anterior
      const method = data.method;                                           // Get the method from the data
  
      const options: KyOptions = { method};                                 // Create a KyOptions object with the method
  
      if(["POST", "PUT", "PATCH"].includes(method)){                        // Si el method es POST, PUT o PATCH,
          const resolved = Handlebars.compile(data.body || "{}")(context);  // obtenemos el body desde la data. Handlebars compila el body teniendo en cuenta el contexto del nodo anterior
          JSON.parse(resolved);                                             // Parse the body as JSON
          options.body = resolved;                                          // Set the body in the options
          options.headers = {
            "Content-Type": "application/json"
          }
      }
  
      const response = await ky(endpoint, options);                         // Make the request using ky
      const contentType = response.headers.get("content-type");             // Get the content type of the response
      const responseData = contentType?.includes("application/json")        // If the content type is application/json, parse the response as JSON
        ? await response.json()
        : await response.text();                                            // Otherwise, parse the response as text
  
      const responsePayload = {                                             // Create a payload with the response data
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        }
      }  
                                                    
      return {                                                              // Return the payload
        ...context,                                                         // Merge the context with the payload
        [data.variableName]: responsePayload,                               // Add the response payload to the context
      }
    })

    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success"
      })
    )
  
    return result;
  
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error"
      })
    )

    throw error;
  }

}