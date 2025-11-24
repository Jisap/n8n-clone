import { credentialsParamsLoader } from '@/features/credentials/server/params-loader';
import { prefetchCredentials } from '@/features/credentials/server/prefetch';
import { requireAuth } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server';
import { SearchParams } from 'nuqs';
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';


type Props = {
  searchParams: Promise<SearchParams>
}

const page = async({ searchParams }: Props) => {

  await requireAuth();

  const params = await credentialsParamsLoader(searchParams); // Carga los parámetros de la URL
  prefetchCredentials(params); // Precarga las credenciales

  


  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <p>TODO: Credentials page</p>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  )
}

export default page