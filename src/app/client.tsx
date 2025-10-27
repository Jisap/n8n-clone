"use client"

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query"


export const Client = () => {

  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions())// Obtiene los datos precargados del servidor. React espera hasta que los datos estén listos (gracias a useSuspenseQuery).

  return (
    <div className="text-red-500">
      Client Component: { JSON.stringify(users) }
    </div>
  )
}