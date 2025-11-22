"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { inngest } from "@/inngest/client";

export type HttpRequestToken = Realtime.Token<
  typeof httpRequestChannel,
  ["status"]
  >;


// Sirve para obtener un token de autenticación que permite a un cliente suscribirse al canal http-request-execution 
// y recibir mensajes del tópico status. Este token es necesario para establecer una conexión segura y autorizada con 
// el servicio de Inngest Realtime. De esta manera el frontend puede escuchar los eventos de estado de los nodos http.

  export async function fetchHttpRequestRealtimeToken(): Promise<HttpRequestToken> { 
    
    const token = await getSubscriptionToken(inngest, {
      channel: httpRequestChannel(),
      topics: ["status"],
    });

    return token;
  }