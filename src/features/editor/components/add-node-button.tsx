"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { memo, useState } from "react"



export const AddNodeButton = memo(() => {
  return (
    <Button 
      onClick={() => {}}
      size="icon"
      variant="outline"
      className="bg-background"  
    >
      <PlusIcon className="size-4" />
    </Button>
  )
})

AddNodeButton.displayName = "AddNodeButton"; // Nombre de la función para ayudar a identificarla en la aplicación