import { InitialNode } from "@/components/initial-node"; // Placeholder de react-flow
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react";

// nodeComponents es un objeto que actúa como un diccionario o mapa. 
// Cada clave de este objeto representa un NodeType (tipo de nodo) definido en la aplicación, 
// y su valor asociado es el componente React que se encargará de renderizar ese tipo específico 
// de nodo en el lienzo de React Flow. 

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;