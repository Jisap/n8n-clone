"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { inngest } from "@/inngest/client";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

export type ManualTriggerToken = Realtime.Token<
  typeof manualTriggerChannel,
  ["status"]
  >;


// Sirve para obtener un token de autenticación que permite a un cliente suscribirse al canal manual-trigger-execution 
// y recibir mensajes del tópic status. Este token es necesario para establecer una conexión segura y autorizada con 
// el servicio de Inngest Realtime. De esta manera el frontend puede escuchar los eventos de estado de los nodos http.

export async function fetchManualTriggerRealtimeToken(): Promise<ManualTriggerToken> { 
    
    const token = await getSubscriptionToken(inngest, {
      channel: manualTriggerChannel(),
      topics: ["status"],
    });

    return token;
  }