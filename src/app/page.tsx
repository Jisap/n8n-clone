import { getQueryClient, trpc } from '@/trpc/server'
import { Client } from './client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';





const Page = async() => {

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.getUsers.queryOptions()); // PreCarga los datos en la caché de React Query.

  return (
    <div className='text-red-500'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Client />
      </HydrationBoundary>
    </div>
  )
}

export default Page