
import { Connection, Node } from "@/generated/prisma/client";
import toposort from "toposort";
import { inngest } from "./client";
import { createId } from "@paralleldrive/cuid2"

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[]
): Node[] => {
  
  if(connections.length === 0) {                                          // Si no hay conexiones, devolver los nodos sin ordenar
    return nodes;
  }

  const edges: [string, string][] = connections.map((conn) => [           // Transforma el arreglo connections a un formato de [origen, destino] que la librería toposort pueda entender.
    conn.fromNodeId,
    conn.toNodeId
  ]);
  
  const connectedNodeIds = new Set<string>();                             // Crear un set para almacenar los IDs de los nodos conectados
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {                                             // Recorrer los nodos 
    if (!connectedNodeIds.has(node.id)) {                                 // Si un nodo no esta en la lista de conectados,
      edges.push([node.id, node.id]);                                     // se añade una auto-conexion. (Este nodo existe pero no depende de nadie más)
    }
  }

  let sortedNodeIds: string[] = [];                                       // Crear una lista para almacenar los IDs de los nodos ordenados
  try {
    sortedNodeIds = toposort(edges);                                      // Ordenamos los ids de los nodos usando toposort(edges)
    sortedNodeIds = [...new Set(sortedNodeIds)];                          // Eliminar los elementos repetidos con Set
  } catch (error) {
    if(error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("There is a cycle in the workflow");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))                    // Crear un map (índice) para buscar los nodos por su ID

  return sortedNodeIds.map((id) => nodeMap.get(id)!)                      // Se recorren los IDs ordenados y par cada id se obtiene el nodo correspondiente del map (índice)
    .filter(Boolean);                                                     // Se eliminan los nodos que no se encontraran en el map (índice)
}


export const sendWorkflowExecution = async(data: {
  workflowId: string;
  [key: string]: any;
}) => {
  return inngest.send({
    name: "workflow/execute.workflow",
    data,
    id: createId()
  })
}