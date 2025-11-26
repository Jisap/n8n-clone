import { channel, topic } from "@inngest/realtime";


export const DISCORD_CHANNEL_NAME = "discord-execution"


// Channel para enviar y recibir mensajes de estado de ejecución de Gemini
export const discordChannel = channel(DISCORD_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  )