import { channel, topic } from "@inngest/realtime";


export const OPENAI_CHANNEL_NAME = "openai-execution"


// Channel para enviar y recibir mensajes de estado de ejecución de OpenAI
export const openaiChannel = channel(OPENAI_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  )