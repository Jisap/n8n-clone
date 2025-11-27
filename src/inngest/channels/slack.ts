import { channel, topic } from "@inngest/realtime";


export const SLACK_CHANNEL_NAME = "slack-execution"


// Channel para enviar y recibir mensajes de estado de ejecución de Gemini
export const slackChannel = channel(SLACK_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  )