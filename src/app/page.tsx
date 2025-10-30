"use client"

import { requireAuth } from "@/lib/auth-utils"
import { caller } from "@/trpc/server";
import { LogoutButton } from "./logout-button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";


const Page = () => {

  //await requireAuth();

  //const data = await caller.getUsers()

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
    }
  }));


  return (
    <div className='min-h-screen min-w-screen flex flex-col items-center justify-center'>
      Protected server component

      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <Button 
        disabled={create.isPending}  
        onClick={() => create.mutate()}
      >
        Create
      </Button>

      {/* <LogoutButton /> */}

    </div>
  )
}


export default Page