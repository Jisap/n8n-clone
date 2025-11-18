import { channel, topic } from "@inngest/realtime";


export const MANUAL_TRIGGER_CHANNEL_NAME = "manual-trigger-execution"


// Channel para enviar y recibir mensajes de estado de ejecución de nodos HTTP
export const manualTriggerChannel = channel(MANUAL_TRIGGER_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  )