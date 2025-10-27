import 'server-only'; 
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react'; // Cache, se utiliza para evitar que se cree una nueva instancia de QueryClient en cada petición.
import { createCallerFactory, createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { createTRPCClient, httpLink } from '@trpc/client';

// Creación de un cliente de React Query con caché
// Devuelve siempre la misma instancia de React Query dentro de la misma petición.
export const getQueryClient = cache(makeQueryClient);

// Creación de un "caller" para ejecutar procedimientos de tRPC en el servidor
// Genera una función para llamar procedimientos de tRPC sin cliente HTTP.
const caller = createCallerFactory(appRouter)(createTRPCContext);                  


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
