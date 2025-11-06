import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";


type EntitHeaderProps = {
  title: string;
  description?: string;
  newButtonLabel?: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { 
    onNew: () => void;        // Si pasas una función, no se usara el href
    newButtonHref?: never;
  }
  | {
    newButtonHref: string;  // Si pasas un href, no se usara la función
    onNew?: never;
  }
  | {
    onNew?: never;          // Puede suceder que no se pase ni función ni hreg
    newButtonHref?: never;
  }
)

export const EntityHeader = ({
  title,
  description,
  newButtonLabel,
  disabled,
  isCreating,
  onNew,
  newButtonHref,
}: EntitHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="tex-lg md:text-xl font-semibold">
          {title}
        </h1>

        {description && (
          <p className="text-xs md:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Si tenemos una función para crear, se muestra el botón de creación */}
      {onNew && !newButtonHref && (
        <Button
          disabled={isCreating || disabled}
          size="sm"
          onClick={onNew}
        >
          <PlusIcon className="size-4" />
          {newButtonLabel}
        </Button>
      )}

      {/* Si tenemos un link para crear se muesta un button con ese link incorporado */}
      {newButtonHref && !onNew && (
        <Button
          size="sm"
          asChild
        >
          <Link href={newButtonHref} prefetch>
            <PlusIcon className="size-4" />
            {newButtonLabel}
          </Link>
        </Button>
      )}
    </div>
  )
}

type EntityContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
}

export const EntityContainer = ( { 
  children, 
  header, 
  search, 
  pagination 
}: EntityContainerProps) => {
  return(
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-y-8 h-full">
        {header}
      </div>
    </div>
  )
}