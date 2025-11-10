import Editor, { EditorError, EditorLoading } from "@/features/editor/components/editor";
import { WorkflowsError, WorkflowsLoading } from "@/features/workflows/components/workflows";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";


interface PageProps {
  params: Promise<{
    workflowId: string;
  }>
}

const page = async ({ params }: PageProps) => {

  await requireAuth();

  const { workflowId } = await params;
  prefetchWorkflow(workflowId); // Hidrata la cache del HydrateClient


  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        {/* Suspense maneja la renderización de componentes mientras se están cargando los datos */}
        <Suspense fallback={<EditorLoading />}>
          <Editor  workflowId={workflowId} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  )
}

export default page