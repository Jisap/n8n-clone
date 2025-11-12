"use client"

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import {
  GlobeIcon,
  MousePointerIcon,
  WebhookIcon,
} from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NodeType } from "@/generated/prisma/enums";
import { Separator } from "./ui/separator";
import { NodeSelect } from '../generated/prisma/models/Node';
import { id } from "zod/v4/locales";


export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
}

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Tigger manually",
    description: "Runs the flow on clicking a button. Good for getting started quickly",
    icon: MousePointerIcon,
  },
];

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Makes an HTTP request to a specified URL",
    icon: GlobeIcon,
  },
]

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({ // Su función no es renderizar un componente sino actualizar el estado de nodes que vive en editor.tsx
  open, 
  onOpenChange, 
  children 
}: NodeSelectorProps) {

  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

  const handleNodeSelect = useCallback((selection: NodeTypeOption) => {      // Agrega un nuevo nodo al flujo cuando se selecciona una opción de selección
   
    if (selection.type === NodeType.MANUAL_TRIGGER) {                        // Comprueba si el usuario está intentando agregar un trigger manual
      const nodes = getNodes();
      const hasManualTrigger = nodes.some(                                   // Si es así, verifica si ya existe un trigger manual en el flujo de trabajo.
        (node) => node.type === NodeType.MANUAL_TRIGGER
      )

      if (hasManualTrigger) {                                                // Si ya existe un trigger manual, muestra un mensaje de error y detiene la ejecución. 
        toast.error("You can only have one manual trigger node");            // Esto asegura que solo haya un trigger manual en el flujo.
        return;
      }
    }

    setNodes((nodes) => {                                                    // Si no hay un trigger manual existente, la función continúa con la creación del nuevo nodo (InitialTrigger)
      
      const hasInitialTrigger = nodes.some(                                  // Comprobamos si ya existe un nodo inicial en el flujo de trabajo.
        (node) => node.type === NodeType.INITIAL
      )

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const flowPosition = screenToFlowPosition({                             // Calcula la posición del nuevo nodo en el lienzo de React Flow.
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 200,
      });

      const newNode = {                                                      // Crea un objeto de datos para el nuevo nodo
        id: createId(),
        data: {},
        position: flowPosition,
        type: selection.type,                                                // y se le asigna el tipo de nodo seleccionado
      }

      if(hasInitialTrigger){                                                 // Si ya existe un nodo inicial, se agrega al final del flujo de trabajo.
        return [newNode]
      }

      return [
        ...nodes,                                                            // El estado en editor.tsx se actualiza -> ReactFlow se vuelve a renderizar -> 
        newNode,                                                             // nodes encuentra el nuevo nodo cuyo type a cambiado -> renderiza el componente asociado al type
      ]
    })

    onOpenChange(false);
  },[setNodes, getNodes, screenToFlowPosition, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>What triggers this workfow?</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow.
          </SheetDescription>
        </SheetHeader>

        {/* Nodes de tipo trigger */}
        <div>
          {triggerNodes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                onClick={() => handleNodeSelect(nodeType)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string"
                    ? (
                      <img 
                        src={Icon}
                        alt={nodeType.label}
                        className="size-5 object-contain rounded-sm"
                      />
                    ):(
                      <Icon className="size-5" />
                    )
                  }

                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">
                      {nodeType.label}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Nodes de tipo execution */}
        <div>
          {executionNodes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                onClick={() => handleNodeSelect(nodeType)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string"
                    ? (
                      <img
                        src={Icon}
                        alt={nodeType.label}
                        className="size-5 object-contain rounded-sm"
                      />
                    ) : (
                      <Icon className="size-5" />
                    )
                  }

                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">
                      {nodeType.label}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}