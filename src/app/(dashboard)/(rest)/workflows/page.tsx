import { WorkflowsContainer, WorkflowsError, WorkflowsList, WorkflowsLoading } from "@/features/workflows/components/workflows";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary"


type Props = {
  searchParams: Promise<SearchParams>;
}



const page = async({ searchParams }: Props) => {

  await requireAuth();

  // /page.tsx -> prefetchWorkFlows -> getMany (desde el server) -> 
  // cache QueryClient -> HydrateCliente recibe cache -> serializa en un JSON -> 
  // HydrateClient incrusta el JSON en el html -> el cliente lo renderiza

  const params = await workflowsParamsLoader(searchParams);

  prefetchWorkflows(params)

  return (
    // WorkflowsContainer -> EntityContainer -> WorkflowsHeader -> EntityHeader -> title, description & button
    // idem para search y pagination
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<WorkflowsError />}>
          {/* Suspense maneja la renderización de componentes mientras se están cargando los datos */}
          <Suspense fallback={<WorkflowsLoading />}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  )
}

export default page