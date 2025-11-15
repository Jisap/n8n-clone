

import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from './utils';
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executor-registry";





export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute.workflow" },
  async ({ event, step }) => {

    const workflowId = event.data.workflowId;
    if(!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async() => {
      const workflow = await prisma.workflow.findUniqueOrThrow({           // Se obtiene el workflow
        where: { id: workflowId },
        include: { 
          nodes: true, 
          connections: true 
        }
      });

      return topologicalSort(workflow.nodes, workflow.connections);       // Se ordena los nodos de acuerdo a las conexiones
    });

    let context = event.data.initialData || {}                            // Se crea una variable context para almacenar los datos en tiempo de ejecución.
    
    for(const node of sortedNodes) {                                      // Se recorren los nodos ordenados y se ejecutan 
      const executor = getExecutor(node.type as NodeType);                // 1º se obtiene el ejecutor correspondiente al tipo de nodo
      
      context = await executor({                                          // 2º se ejecuta el ejecutor con los datos del nodo
        data: node.data as Record<string, unknown>,                       // Se le pasa data expecífica de ese nodo (url, headers, etc)
        nodeId: node.id,                                                  // Se le pasa el id del nodo
        context,                                                          // Se le pasa el contexto actual  
        step,                                                             // Se le pasa la herramienta de ejecución en inngest
      })
    }                                      

    return {
      workflowId,                                                         // 3º se devuelve el id del workflow que se ejecutó
      result: context                                                     // y el valor final de la variable context. Este objeto
    }                                                                     // contiene el resultado acumulado de la ejecución de todos l 
  },                                                                      // os nodos, representando la salida final de todo el flujo de trabajo.
)