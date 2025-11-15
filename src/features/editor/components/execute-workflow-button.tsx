import { Button } from "@/components/ui/button";
import { FlaskConicalIcon } from "lucide-react";
import { webhooks } from '@polar-sh/better-auth';
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";



export const ExecuteWorkflowButton = ({ workflowId }: { workflowId: string }) => {
  
  const executeWorkflow = useExecuteWorkflow();

  const handleExecute = () => {
    executeWorkflow.mutateAsync({
      id: workflowId
    })
  }
  
  return (
    <Button
      size="lg"
      onClick={ handleExecute }
      disabled={executeWorkflow.isPending}
    >
      <FlaskConicalIcon className="size-4" />
      Execute workflow
    </Button>
  )
}