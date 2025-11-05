import 'server-only'; 
import { createTRPCOptionsProxy, TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { cache } from 'react'; // Cache, se utiliza para evitar que se cree una nueva instancia de QueryClient en cada petición.
import { createCallerFactory, createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { createTRPCClient, httpLink } from '@trpc/client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

// Creación de un cliente de React Query con caché
// Devuelve siempre la misma instancia de React Query dentro de la misma petición.
export const getQueryClient = cache(makeQueryClient);

// Creación de un "caller" para ejecutar procedimientos de tRPC en el servidor
// Genera una función para llamar procedimientos de tRPC sin cliente HTTP.
export const caller = createCallerFactory(appRouter)(createTRPCContext);                  


/**
 * Proxy fuertemente tipado para interactuar con el router tRPC desde Server Components.
 *
 * Este objeto `trpc` no es un cliente HTTP. Permite llamar a procedimientos tRPC
 * directamente en el servidor y generar `queryOptions` para TanStack Query,
 * facilitando el Server-Side Rendering (SSR) y la hidratación de datos.
 *
 * @property {function} ctx - Función que crea el contexto para cada llamada tRPC en el servidor.
 * @property {object} router - La definición del router principal de la API tRPC.
 * @property {function} queryClient - Función que obtiene la instancia de `QueryClient` para la caché de TanStack Query.
 */
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});



// prefetch: Su objetivo es iniciar la obtención de datos de un procedimiento tRPC y guardarlos en la caché
// de TanStack Query (QueryClient) antes de que la página se envíe al cliente.
// Esto permite que, cuando el componente se renderice en el navegador, los datos ya estén disponibles, 
// evitando así estados de carga

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {

  const queryClient = getQueryClient();                           // 1. Obtiene una instancia del QueryClient 
  
  if(queryOptions.queryKey[1]?.type === "infinite"){              // 2. Comprueba si es una "infinite query" o una consulta normal
    void queryClient.prefetchInfiniteQuery(queryOptions as any);  // Si es infinita, precarga la primera página
  }else{
    void queryClient.prefetchQuery(queryOptions);                 // Si es normal, precarga los datos
  }
}


// HydrateClient es un Componente de Servidor de React cuya única responsabilidad es capturar el estado de la caché 
// de TanStack Query en el servidor (que ahora contiene los datos precargados por prefetch) 
// y prepararlo para que sea enviado al cliente.

export function HydrateClient(props: { children: React.ReactNode }) {

  const queryClient = getQueryClient();                            // 1. Obtiene la instancia de QueryClient (contiene los datos de los workflows)
  
  return (
    // 2º Dehydrate -> Toma el estado de la caché de TanStack Query y lo serializa en un objeto JSON
    // 3º HydrationBoundary recibe el estado serializado y lo renderiza en el cliente
    <HydrationBoundary state={dehydrate(queryClient)}> 
      {props.children}
    </HydrationBoundary>
  )
}
