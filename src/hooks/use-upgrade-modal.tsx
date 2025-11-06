import UpgradeModal from "@/components/upgrade-modal";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";



export const useUpgradeModal = () => {
  const [open, setOpen] = useState(false);

  const handleError = (error: unknown) => {    
    if (error instanceof TRPCClientError) {     // Si el error es un TRPCClientError  
      if (error.data?.code === "FORBIDDEN") {   // y tiene el codigo FORBIDDEN,
        setOpen(true);                          // se abre el modal de actualización
        return true;
      }
    }

    return false;
  };

  // El modal de actualización se renderiza en el componente que llama a useUpgradeModal
  const modal = <UpgradeModal open={open} onOpenChange={setOpen} />;

  return {
    handleError,
    modal
  }
}