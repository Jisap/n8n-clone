import { WorkflowsContainer, WorkflowsList } from "@/features/workflows/components/workflows";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary"


const page = async() => {

  await requireAuth();

  // /page.tsx -> prefetchWorkFlows -> getMany (desde el server) -> 
  // cache QueryClient -> HydrateCliente recibe cache -> serializa en un JSON -> 
  // HydrateClient incrusta el JSON en el html -> el cliente lo renderiza

  prefetchWorkflows()

  return (
    // WorkflowsContainer -> EntityContainer -> WorkflowsHeader -> EntityHeader -> title, description & button
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<p>Error!</p>}>
          {/* Suspense maneja la renderización de componentes mientras se están cargando los datos */}
          <Suspense fallback={<p>Loading...</p>}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  )
}

export default page