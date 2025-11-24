"use client"

import { 
  EmptyView, 
  EntityContainer, 
  EntityHeader, 
  EntityItem, 
  EntityList, 
  EntityPagination, 
  EntitySearch, 
  ErrorView, 
  LoadingView 
} from "@/components/entity-components";
import { useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Workflow } from "@/generated/prisma/client";
import { WorkflowIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";


export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();          // Lee y gestiona el estado de los parámetros de la URL.
  const { searchValue, onSearchChange } = useEntitySearch({    // Debounce para establecer el valor del search
    params,
    setParams
  })

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  )
}

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();                 // Suspende la renderización del componente hasta que los datos sean recibidos
  const [params, setParams] = useCredentialsParams();          // Lee y gestiona el estado de los parámetros de la URL.

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) => setParams({ ...params, page })}  // Actualiza el estado de los parámetros de la URL gracias a nuqs
    />

  )
}


export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  )
}

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
      <EntityHeader
        title="Credentials"
        description="Create and manage your credentials"
        newButtonHref="/credentials/new"
        newButtonLabel="New Credential"
        disabled={disabled}
      />
  )
}

export const CredentialsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  )
}

export const CredentialsLoading = () => {
  return (
    <LoadingView message="Loading workflows" />
  )
}

export const CredentialsError = () => {
  return (
    <ErrorView message="Error Loading workflows" />
  )
}

export const CredentialsEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/credentials/new`); 
  }

  return (  
      <EmptyView
        message="You haven't created any credentials yet. Get started by creating your first workflow."
        onNew={handleCreate}
      /> 
  )
}

export const CredentialItem = ({ data }: { data: Workflow }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id }, {
      onSuccess: () => {
        toast.success(`Credential "${data.name}" deleted successfully!`);
      },
      onError: (error) => {
        toast.error(`Failed to delete credential: ${error.message}`);
        console.error(error);
      }
    })
  }

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
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
      isRemoving={removeCredential.isPending}
    />
  )
}