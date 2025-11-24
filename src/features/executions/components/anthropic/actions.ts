"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client";
import { anthropicChannel } from "@/inngest/channels/anthropic";


export type AnthropicToken = Realtime.Token<
  typeof anthropicChannel,
  ["status"]
  >;


// Sirve para obtener un token de autenticación que permite a un cliente suscribirse al canal anthropic-execution 
// y recibir mensajes del tópico status. Este token es necesario para establecer una conexión segura y autorizada con 
// el servicio de Inngest Realtime. De esta manera el frontend puede escuchar los eventos de estado de los nodos de anthropic.

  export async function fetchAnthropicRealtimeToken(): Promise<AnthropicToken> { 
    
    const token = await getSubscriptionToken(inngest, {
      channel: anthropicChannel(),
      topics: ["status"],
    });

    return token;
  }