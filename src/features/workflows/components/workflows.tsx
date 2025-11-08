"use client"

import { EntityContainer, EntityHeader, EntityPagination, EntitySearch, LoadingView } from "@/components/entity-components";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Workflow } from "lucide-react";


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
    <div className="flex flex-1 justify-center items-center">
      <p>
        {JSON.stringify(workflows.data, null, 2)}
      </p>
    </div>
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
    <LoadingView entity="workflows"/>
  )
}