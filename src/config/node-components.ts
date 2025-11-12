import { InitialNode } from "@/components/initial-node"; // Placeholder de react-flow
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react";

// nodeComponents es un objeto que actúa como un diccionario o mapa. 
// Cada clave de este objeto representa un NodeType (tipo de nodo) definido en la aplicación, 
// y su valor asociado es el componente React que se encargará de renderizar ese tipo específico 
// de nodo en el lienzo de React Flow. 

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode ,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;