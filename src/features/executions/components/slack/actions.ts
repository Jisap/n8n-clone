"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client";
import { slackChannel } from "@/inngest/channels/slack";

export type SlackToken = Realtime.Token<
  typeof slackChannel,
  ["status"]
  >;


// Sirve para obtener un token de autenticación que permite a un cliente suscribirse al canal http-request-execution 
// y recibir mensajes del tópico status. Este token es necesario para establecer una conexión segura y autorizada con 
// el servicio de Inngest Realtime. De esta manera el frontend puede escuchar los eventos de estado de los nodos http.

  export async function fetchSlackRealtimeToken(): Promise<SlackToken> { 
    
    const token = await getSubscriptionToken(inngest, {
      channel: slackChannel(),
      topics: ["status"],
    });

    return token;
  }