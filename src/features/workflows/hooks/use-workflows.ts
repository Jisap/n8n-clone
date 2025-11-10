
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";
import { use } from 'react';

// Hook to fetch all workflows using suspense

export const useSuspenseWorkflows = () => {

  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params)); // Suspende la renderización del componente hasta que los datos sean recibidos
}

// Hook to create a new workflow

export const useCreateWorkflow = () => {
  
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow" ${data.name} "created successfully!`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to create workflow: ${error.message}`);
        console.error(error);
      }
    })
  )
}

// Hook to remove a workflow

export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow" ${data.name} "deleted successfully!`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.workflows.getOne.queryOptions({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Failed to delete workflow: ${error.message}`);
        console.error(error);
      }
    })
  )
}

// Hook to fetch a single workflow using suspense

export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
}