import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";


type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async({
  data,
  nodeId,
  context,
  step
}) => {
  // TODO: Publish "loading" state for http request

  if(!data.endpoint){
    // TODO: Publish error state for http request
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  if(!data.variableName){
    // TODO: Publish error state for http request
    throw new NonRetriableError("Variable name is not configured");
  }

  const result = await step.run(`http-request`, async () => {             // Run the http request step
    const endpoint = data.endpoint!;                                      // Get the endpoint from the data
    const method = data.method || "GET";                                  // Get the method from the data

    const options: KyOptions = { method};                                 // Create a KyOptions object with the method

    if(["POST", "PUT", "PATCH"].includes(method)){                        // If the method is POST, PUT or PATCH add the body to the options
        options.body = data.body;
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

    if(data.variableName){                                                 // If a variable name is provided, add the payload to the context
      return {
        ...context,
       [data.variableName]: responsePayload,
      }
    }

    return {                                                              // Otherwise, return the context with the payload
      ...context, 
      ...responsePayload
    }

  }) 

  // TODO: Publish "success" state for http request

  return result;
}