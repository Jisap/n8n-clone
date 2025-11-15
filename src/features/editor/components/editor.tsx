"use client"

import React, { useMemo } from 'react'
import { useState, useCallback } from 'react';
import { ErrorView, LoadingView } from '@/components/entity-components'
import { useSuspenseWorkflow } from '@/features/workflows/hooks/use-workflows'
import { 
  ReactFlow, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge, 
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Background,
  Controls,
  MiniMap,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeComponents } from '@/config/node-components';
import { AddNodeButton } from './add-node-button';
import { useSetAtom } from 'jotai';
import { editorAtom } from '../store/atoms';
import { NodeType } from '@/generated/prisma/enums';
import { ExecuteWorkflowButton } from './execute-workflow-button';

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />
};


const Editor = ({ workflowId }: { workflowId: string }) => {

  const { data: workflow } = useSuspenseWorkflow(workflowId);  // Carga de datos del workflow

  const setEditor = useSetAtom(editorAtom);                    // Se establece el estado del editor de React Flow

  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);  // Se inicializas los nodos del workflow
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);  // Se inicializas las conexiones (lineas) del workflow

  // Callback para actualizar los nodos del workflow
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  // Callback para actualizar las conexiones (lineas) del workflow
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  // Callback para crear una nueva conexión (linea) entre dos nodos
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  }, [nodes])

  return (
    <div className='size-full'>
      <ReactFlow
        nodes={nodes} // Lista de nodos que se deben renderizar en el lienzo de React Flow
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents} // Le dice a React Flow qué componente de React debe usar para renderizar cada tipo de nodo. INITIAL -> initial-node -> NodeSelector ->workflow-node -> placeholder-node
        fitView
        onInit={setEditor} // Se establece el estado de la instancia del editor de React Flow
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId} />
          </Panel>
        )}

      </ReactFlow>
    </div>
  )
}

export default Editor