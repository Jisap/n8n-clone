"use client"

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Workflow } from "@/generated/prisma/client";
import { WorkflowIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";


export const WorkflowsSearch = () => {

  const [params, setParams] = useWorkflowsParams();          // Lee y gestiona el estado de los parámetros de la URL.
  const { searchValue, onSearchChange } = useEntitySearch({  // Debounce para establecer el valor del search
    params,
    setParams
  })

  return (
    <EntitySearch 
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows"
    />
  )
}

export const WorkflowsPagination = () => {

  const workflows = useSuspenseWorkflows();                 // Suspende la renderización del componente hasta que los datos sean recibidos
  const[params, setParams] = useWorkflowsParams();          // Lee y gestiona el estado de los parámetros de la URL.


  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({ ...params, page })}  // Actualiza el estado de los parámetros de la URL gracias a nuqs
    />

  )
}


export const WorkflowsList = () => {

  const workflows = useSuspenseWorkflows();

  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
    />
  )
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  
  const  createWorkflow  = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();


  const handleCreate = () => {
    createWorkflow.mutate( undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        // handleError -> setOpen=true -> modal
        handleError(error)
      }
    });
  }


  return(
    <>
      {modal}
      <EntityHeader 
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  )
}

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  )
}

export const WorkflowsLoading = () => {
  return ( 
    <LoadingView message="Loading workflows"/>
  )
}

export const WorkflowsError = () => {
  return ( 
    <ErrorView message="Error Loading workflows"/>
  )
}

export const WorkflowsEmpty = () => {

  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        handleError(error)
      }
    })
  }

  return ( 
    <>
      {modal}
      <EmptyView 
        message="You haven't created any workflows yet. Get started by creating your first workflow."
        onNew={handleCreate}
      />
    </>
  )
}

export const WorkflowItem = ({data }: { data: Workflow }) => {

  const removeWorkflow = useRemoveWorkflow();

  const handleRemove = () => {
    removeWorkflow.mutate({id: data.id}, {
      onSuccess: () => {
        toast.success(`Workflow "${data.name}" deleted successfully!`);
      },
      onError: (error) => {
        toast.error(`Failed to delete workflow: ${error.message}`);
        console.error(error);
      }
    })
  }

  return (
    <EntityItem 
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={false}
    />
  )
}