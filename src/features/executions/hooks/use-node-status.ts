import type { Realtime } from "@inngest/realtime";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator"
import  { useInngestSubscription } from "@inngest/realtime/hooks";
import { useEffect, useState } from 'react';

interface useNodeStatusOptions {
  // El ID único del nodo cuyo estado queremos rastrear.
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<Realtime.Subscribe.Token>
}


/**
 * Hook de React para obtener en tiempo real el estado de ejecución de un nodo.
 * Se suscribe a un canal de Inngest y filtra los mensajes para encontrar el estado
 * más reciente del nodo especificado.
 */

export function useNodeStatus({ 
  nodeId,       // El ID del nodo del que se quiere recibir el estado
  channel,      // El canal de Inngest Realtime al que se debe suscribir. 
  topic,        // El tópico dentro del canal al que se debe suscribir.
  refreshToken  // Una función que devuelve una promesa que resuelve con un token de autenticación para la suscripción de tiempo real.
}: useNodeStatusOptions) {
  
  const [status, setStatus] = useState<NodeStatus>('initial');           // Estado local para almacenar el estado actual del nodo. Comienza como 'initial'.

  
  const { data } = useInngestSubscription({                              // Hook de Inngest para suscribirse a eventos en tiempo real.
    refreshToken,                                                        // Provee la función para autenticar la conexión.
    enabled: true,                                                       // Habilita la suscripción.
  })
  
  useEffect(() => {                                                      // Efecto que se ejecuta cada vez que llegan nuevos datos o cambian los parámetros.
    if (!data?.length) {                                                 // Si no hay datos, no hacemos nada.
      return;
    }
    
    const latestMessage = data                                           // Busca el mensaje más reciente para este nodo específico.
      .filter(                                                           // 1. Filtra los mensajes para quedarnos solo con los relevantes.
        (msg) => 
          msg.kind === "data" &&                                               // Debe ser un mensaje de datos.
          msg.channel === channel &&                                           // Debe pertenecer al canal correcto.
          msg.topic === topic &&                                               // Debe pertenecer al tópico correcto.
          msg.data.nodeId === nodeId                                           // Debe ser para nuestro nodo de interés.
      )
      .sort((a, b) => {                                                   // 2. Ordena los mensajes filtrados por fecha de creación, del más nuevo al más viejo.
        if(a.kind === "data" && b.kind === "data"){
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return 0
      })[0];                                                              // 3. Toma el primer elemento, que es el más reciente.

      
    if (latestMessage?.kind === "data") {                                 // Si encontramos un mensaje, actualizamos el estado local. 
        setStatus(latestMessage.data.status as NodeStatus)
    }
  },[data, nodeId, channel, topic])

  
  return status;                                                          // Devuelve el estado actual del nodo para que el componente lo pueda usar.
}