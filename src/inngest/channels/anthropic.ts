import { channel, topic } from "@inngest/realtime";


export const ANTHROPIC_CHANNEL_NAME = "anthropic-execution"


// Channel para enviar y recibir mensajes de estado de ejecución de OpenAI
export const anthropicChannel = channel(ANTHROPIC_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  )