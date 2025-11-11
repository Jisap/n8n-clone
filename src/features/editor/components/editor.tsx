"use client"

import React from 'react'
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
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeComponents } from '@/config/node-components';

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />
};


const Editor = ({ workflowId }: { workflowId: string }) => {

  const { data: workflow } = useSuspenseWorkflow(workflowId);  // Carga de datos del workflow

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

  return (
    <div className='size-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents} // Le dice a React Flow qué componente de React debe usar para renderizar cada tipo de nodo.
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

export default Editor