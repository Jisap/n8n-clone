"use client"


import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';


const Page = () => {

  const { data } = authClient.useSession();

  return (
    <div className='min-h-screen min-w-screen flex items-center justify-center'>
      {JSON.stringify(data)}

      {data && (
        <Button onClick={() => authClient.signOut()}>
          Logout
        </Button>
      )}
    </div>
  )
}

// const Page = async () => {

//   const queryClient = getQueryClient();

//   void queryClient.prefetchQuery(trpc.getUsers.queryOptions()); // PreCarga los datos en la caché de React Query.

//   return (
//     <div className='text-red-500'>
//       <HydrationBoundary state={dehydrate(queryClient)}>
//         <Suspense fallback={<p>Loading...</p>}>
//           <Client />
//         </Suspense>
//       </HydrationBoundary>
//     </div>
//   )
// }

export default Page