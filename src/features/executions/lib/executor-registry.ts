import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { openaiExecutor } from "../components/openai/executor";



export const executorRegistry: Record<NodeType, NodeExecutor> = {             // Registro de ejecutores, cada NodeType tiene un ejecutor
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.OPENAI]: openaiExecutor,   
  [NodeType.ANTHROPIC]: geminiExecutor,// TODO: fix later
}


export const getExecutor = (type: NodeType): NodeExecutor => {                // Función para obtener el ejecutor correspondiente a un nodo
  const executor = executorRegistry[type];
  if(!executor) {
    throw new Error(`Executor not found for node type ${type}`);
  }

  return executor;
}