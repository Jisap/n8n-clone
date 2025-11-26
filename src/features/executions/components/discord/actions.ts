"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client";
import { discordChannel } from "@/inngest/channels/discord";

export type DiscordToken = Realtime.Token<
  typeof discordChannel,
  ["status"]
  >;


// Sirve para obtener un token de autenticación que permite a un cliente suscribirse al canal http-request-execution 
// y recibir mensajes del tópico status. Este token es necesario para establecer una conexión segura y autorizada con 
// el servicio de Inngest Realtime. De esta manera el frontend puede escuchar los eventos de estado de los nodos http.

  export async function fetchDiscordtRealtimeToken(): Promise<DiscordToken> { 
    
    const token = await getSubscriptionToken(inngest, {
      channel: discordChannel(),
      topics: ["status"],
    });

    return token;
  }