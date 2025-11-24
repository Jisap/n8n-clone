
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { use } from 'react';

// Hook to fetch all credentials using suspense

export const useSuspenseCredentials = () => {

  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params)); // Suspende la renderización del componente hasta que los datos sean recibidos
}

// Hook to create a new credential

export const useCreateCredential = () => {
  
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential" ${data.name} "created successfully!`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to create credential: ${error.message}`);
        console.error(error);
      }
    })
  )
}

// Hook to remove a credential

export const useRemoveCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential" ${data.name} "deleted successfully!`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Failed to delete workflow: ${error.message}`);
        console.error(error);
      }
    })
  )
}

// Hook to fetch a single credential using suspense

export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
}

// Hook to update a credential 

export const useUpdateCcredentials = () => {

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential" ${data.name} "saved`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Failed to saved credential: ${error.message}`);
        console.error(error);
      }
    })
  )
}



