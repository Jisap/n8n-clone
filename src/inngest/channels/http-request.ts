import { channel, topic } from "@inngest/realtime";

// Channel para enviar y recibir mensajes de estado de ejecución de nodos HTTP
export const httpRequestChannel = channel("http-request-execution")
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  )