import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";



export const executorRegistry: Record<NodeType, NodeExecutor> = {             // Registro de ejecutores, cada NodeType tiene un ejecutor
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor // TODO: fix types
}


export const getExecutor = (type: NodeType): NodeExecutor => {                // Función para obtener el ejecutor correspondiente a un nodo
  const executor = executorRegistry[type];
  if(!executor) {
    throw new Error(`Executor not found for node type ${type}`);
  }

  return executor;
}