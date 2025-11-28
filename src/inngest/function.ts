

import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from './utils';
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";





export const executeWorkflow = inngest.createFunction(
  { 
    id: "execute-workflow",                  
    retries: 0, // Remove in production
    onFailure: async({ event, step }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack
        }
      })
    } 
  },
  { event: "workflow/execute.workflow",      // nombre del evento que activa la función.
    channels: [                              // Lista de los posibles origenes de ese evento.
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openaiChannel(),
      discordChannel(),
      slackChannel(),
    ] 

  },
  async ({ event, step, publish }) => {

    const inngestEventId = event.id;                                        // Se obtiene el id del evento de inngest

    const workflowId = event.data.workflowId;                               // Se obtiene el id del workflow
    if(!workflowId || !inngestEventId) {
      throw new NonRetriableError("Event ID or Workflow ID is missing");
    }

    await step.run("create-execution", async () => {                        // Se crea una entrada en la tabla execution de tu base de datos 
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId
        }
      })
    })

    const sortedNodes = await step.run("prepare-workflow", async() => {
      const workflow = await prisma.workflow.findUniqueOrThrow({           // Se obtiene de la base de datos el workflow completo incluyendo todos sus nodos y conexiones
        where: { id: workflowId },
        include: { 
          nodes: true, 
          connections: true 
        }
      });

      return topologicalSort(workflow.nodes, workflow.connections);       // Se ordena los nodos de acuerdo a las conexiones
    });

    const userId = await step.run("find-user-id", async () => {            // Se obtiene el id del usuario que ejecuta el workflow
      const workflow = await prisma.workflow.findUniqueOrThrow({           
        where: { id: workflowId },
        select: {
          userId: true
        }
      });

      return workflow.userId;
    })

    // Bucle principal de ejecución

    let context = event.data.initialData || {}                            // Se crea una variable context para almacenar los datos en tiempo de ejecución. Esta variable es un objeto que actúa como una "bolsa de datos" que se va pasando de nodo en nodo. Contiene los datos iniciales del trigger y se irá enriqueciendo con los resultados de cada nodo ejecutado.
    
    for(const node of sortedNodes) {                                      // Se recorren los nodos ordenados y se ejecutan 
      const executor = getExecutor(node.type as NodeType);                // 1º se obtiene el ejecutor correspondiente al tipo de nodo. Cada ejecutor devuelve la lógica específica que debe ejecutarse para ese nodo.
      
      context = await executor({                                          // 2º se ejecuta el ejecutor con los datos del nodo
        data: node.data as Record<string, unknown>,                       // Se le pasa data expecífica de ese nodo (url, method, etc)
        nodeId: node.id,                                                  // Se le pasa el id del nodo
        context,                                                          // Se le pasa el contexto actual  
        step,                                                             // Se le pasa la herramienta de ejecución en inngest
        publish,                                                          // Se le pasa la herramienta de publicación de mensajes 
        userId
      })
    }                                                                     // Este nuevo context se asigna de nuevo a la variable, listo para ser usado por el siguiente nodo en el bucle.   
    
    await step.run("update-execution", async () => {                      // Una vez que el bucle termina (todos los nodos se han ejecutado), se ejecuta un último paso para actualizar el registro de la ejecución en la base de datos, marcando su estado como SUCCESS.
      return prisma.execution.update({
        where: { inngestEventId, workflowId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context
        }
      })
    })

    return {
      workflowId,                                                         // 3º se devuelve el id del workflow que se ejecutó
      result: context                                                     // y el valor final de la variable context. Este objeto
    }                                                                     // contiene el resultado acumulado de la ejecución de todos 
  },                                                                      // los nodos, representando la salida final de todo el flujo de trabajo.
)