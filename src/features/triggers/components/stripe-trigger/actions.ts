"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

export type StripeTriggerToken = Realtime.Token<
  typeof stripeTriggerChannel,
  ["status"]
  >;


// Sirve para obtener un token de autenticación que permite a un cliente suscribirse al canal manual-trigger-execution 
// y recibir mensajes del tópic status. Este token es necesario para establecer una conexión segura y autorizada con 
// el servicio de Inngest Realtime. De esta manera el frontend puede escuchar los eventos de estado de los nodos http.

export async function fetchStripeTriggerRealtimeToken(): Promise<StripeTriggerToken> { 
    
    const token = await getSubscriptionToken(inngest, {
      channel: stripeTriggerChannel(),
      topics: ["status"],
    });

    return token;
  }