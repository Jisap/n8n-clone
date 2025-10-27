import { getQueryClient, trpc } from '@/trpc/server'
import { Client } from './client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';





const Page = async() => {

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.getUsers.queryOptions()); // PreCarga los datos en la caché de React Query.

  return (
    <div className='text-red-500'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading...</p>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  )
}

export default Page