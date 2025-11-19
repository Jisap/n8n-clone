"use server"

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"
import { inngest } from "@/inngest/client";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

export type GoogleFormTriggerToken = Realtime.Token<
  typeof googleFormTriggerChannel,
  ["status"]
  >;


// Sirve para obtener un token de autenticación que permite a un cliente suscribirse al canal manual-trigger-execution 
// y recibir mensajes del tópic status. Este token es necesario para establecer una conexión segura y autorizada con 
// el servicio de Inngest Realtime. De esta manera el frontend puede escuchar los eventos de estado de los nodos http.

export async function fetchGoogleFormTriggerRealtimeToken(): Promise<GoogleFormTriggerToken> { 
    
    const token = await getSubscriptionToken(inngest, {
      channel: googleFormTriggerChannel(),
      topics: ["status"],
    });

    return token;
  }