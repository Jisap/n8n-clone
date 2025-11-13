"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { SaveIcon } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  useSuspenseWorkflow, 
  useUpdateWorkflowName, 
  useUpdateWorkflow 
} from '@/features/workflows/hooks/use-workflows'
import { useAtomValue } from 'jotai'
import { editorAtom } from '../store/atoms'


export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  
  const editor = useAtomValue(editorAtom);  // Se obtiene la instancia del editor de React Flow
  const saveWorkflow = useUpdateWorkflow(); // Se obtiene la función para actualizar el workflow

  const handleSave = () => {
    if(!editor){
      return;
    }

    const nodes = editor.getNodes();         // Se obtienen los nodos del editor de React Flow
    const edges = editor.getEdges();         // Se obtienen las conexiones (lineas) del editor de React Flow

    saveWorkflow.mutate({                    // Se actualiza el workflow
      id: workflowId,
      nodes,
      edges
    })
  }

  return (
    <div className='ml-auto'>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={saveWorkflow.isPending}
      >
        <SaveIcon className='size-4' />
      </Button>
    </div>
  )
}


export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflowName();

  const[isEditing, setIsEditing] = useState(false);
  const[name, setName] = useState(workflow.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(workflow.name){         // Si el workflow tiene un nombre, se muestra el nombre en el breadcrumb
      setName(workflow.name);
    }
  },[workflow.name]);

  useEffect(() => {
    if(isEditing && inputRef.current){ // Si se está editando el nombre, se enfoca el input
      inputRef.current.focus();
      inputRef.current.select();
    }
  },[isEditing]);

  const handleSave = async() => {
    if(name === workflow.name){
      setIsEditing(false);
      return;
    }

    try {
      await updateWorkflow.mutateAsync({
        id: workflowId,
        name
      });
    } catch (error) {
      setName(workflow.name);
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter'){
      handleSave();
    } else if (e.key === 'Escape'){
      setName(workflow.name);
      setIsEditing(false);
    }
  }

  if(isEditing){
    return (
      <Input 
        disabled={updateWorkflow.isPending}
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className='h-7 w-auto min-w-[100px] px-2'
      />
    )
  }

  return (
    <BreadcrumbItem 
      onClick={() => setIsEditing(true)} // Se activa el input de edición cuando se hace clic en el breadcrumb
      className='cursor-pointer hover:text-foreground transition-colors'
    >
      {workflow.name}
    </BreadcrumbItem>
  )
}

export const EditorBreadcrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link prefetch href="/workflows">
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <EditorNameInput workflowId={workflowId} />

      </BreadcrumbList>
    </Breadcrumb>
  )
}


const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <header className='flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background'>
      <SidebarTrigger />

      <div className='flex flex-row items-center justify-between gap-x-4 w-full'>
        <EditorBreadcrumbs workflowId={workflowId} />
        <EditorSaveButton workflowId={workflowId} />
      </div>
    </header>
  )
}

export default EditorHeader