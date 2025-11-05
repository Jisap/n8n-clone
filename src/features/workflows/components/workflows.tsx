"use client"

import { useSuspenseWorkflows } from "../hooks/use-workflows";


export const WorkflowsList = () => {

  const workflows = useSuspenseWorkflows();

  return (
    <div>
      <p>
        {JSON.stringify(workflows.data, null, 2)}
      </p>
    </div>
  )
}