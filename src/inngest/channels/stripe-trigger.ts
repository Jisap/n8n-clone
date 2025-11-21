import { channel, topic } from "@inngest/realtime";
import { SaveIcon } from 'lucide-react';


export const STRIPE_TRIGGER_CHANNEL_NAME = "stripe-trigger-execution"


// Channel para enviar y recibir mensajes de estado de ejecución de nodos HTTP
export const stripeTriggerChannel = channel(STRIPE_TRIGGER_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  )