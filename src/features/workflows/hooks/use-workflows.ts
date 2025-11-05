import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";


export const useSuspenseWorkflows = () => {

  const trpc = useTRPC();

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions()); // Suspende la renderización del componente hasta que los datos sean recibidos
}