import { channel, topic } from "@inngest/realtime";


export const HTTP_REQUEST_CHANNEL_NAME = "http-request-execution"


// Channel para enviar y recibir mensajes de estado de ejecución de nodos HTTP
export const httpRequestChannel = channel(HTTP_REQUEST_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  )