"use client"

import { useSuspenseWorkflow } from '@/features/workflows/hooks/use-workflows'
import React from 'react'




const Editor = ({ workflowId }: { workflowId: string }) => {

  const { data: workflow } = useSuspenseWorkflow(workflowId);

  return (
    <p>
      {JSON.stringify(workflow, null ,2)}
    </p>
  )
}

export default Editor