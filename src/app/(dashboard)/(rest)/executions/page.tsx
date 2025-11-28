
import { executionsParamsLoader } from '@/features/executions/server/params-loader';
import { prefetchExecutions } from '@/features/executions/server/prefetch';
import { requireAuth } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server';
import { SearchParams } from 'nuqs';
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';


type Props = {
  searchParams: Promise<SearchParams>
}

const page = async ({ searchParams }: Props) => {

  await requireAuth();

  const params = await executionsParamsLoader(searchParams); // Carga los parámetros de la URL
  prefetchExecutions(params); // Precarga las executions




  return (
    <>
      <HydrateClient>
        <ErrorBoundary fallback={<></>}>
          <Suspense fallback={<></>}>
            TODO: Listado de executions
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </>
  )
}

export default page