

import type { Realtime } from "@inngest/realtime";
import type { GetStepTools, Inngest } from "inngest";                   // Importa types de GetStepTools de Inngest

export type WorkflowContext = Record<string, unknown>;                  // Define el tipo de contexto de un flujo de trabajo

export type StepTools = GetStepTools<Inngest.Any>;                      // Define las herramientas de un paso de trabajo

export interface NodeExecutorParams<TData = Record<string, unknown>> {  // Define los parámetros de un ejecutor de nodo
  data: TData;
  nodeId: string;
  context: WorkflowContext;
  step: StepTools;
  publish: Realtime.PublishFn,
  userId: string
}

export type NodeExecutor<TData = Record<string, unknown>> = (           // Define el tipo de ejecutor de nodo
  params: NodeExecutorParams<TData>
) => Promise<WorkflowContext>;