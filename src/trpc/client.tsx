'use client';


import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

// Crea un contexto específico de tRPC para nuestra AppRouter.
// Exporta el `TRPCProvider` para envolver la aplicación y un hook `useTRPC`
// para acceder al cliente tRPC en los componentes.
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// Variable para almacenar la instancia singleton del QueryClient en el navegador.
let browserQueryClient: QueryClient;

/**
 * Obtiene una instancia de QueryClient.
 * - En el servidor (`window` es undefined), crea una nueva instancia en cada llamada
 *   para evitar compartir datos entre peticiones de diferentes usuarios (aislamiento de caché).
 * - En el cliente (navegador), crea una instancia singleton (`browserQueryClient`) y la reutiliza
 *   para que la caché de React Query persista durante la sesión del usuario.
 */
function getQueryClient() {
  if (typeof window === 'undefined') {  
    return makeQueryClient();                                      // Lado del servidor: siempre crea una nueva instancia.
  }

  
  if (!browserQueryClient) browserQueryClient = makeQueryClient(); // Lado del cliente: usa o crea la instancia singleton.
  return browserQueryClient;
}

/**
 * Construye la URL completa para el endpoint de la API tRPC.
 * - En el cliente (navegador), devuelve una ruta relativa (`/api/trpc`).
 * - En el servidor, construye una URL absoluta para poder hacer peticiones a sí mismo.
 *   Prioriza la variable de entorno `VERCEL_URL` si está disponible.
 */
function getUrl() {
  const base = (() => {
    
    if (typeof window !== 'undefined') return '';                           // Si se ejecuta en el navegador, la ruta es relativa al dominio actual.
    
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Si se despliega en Vercel, usa la URL de la instancia.
    
    return 'http://localhost:3000';                                         // En desarrollo local, usa localhost.
  })();
  return `${base}/api/trpc`;
}

/**
 * Provider principal que envuelve la aplicación para habilitar tRPC y React Query.
 * Configura y provee los clientes necesarios para que los componentes puedan
 * realizar llamadas a la API y gestionar el estado de la caché.
 */
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  
  const queryClient = getQueryClient();                                   // Obtiene la instancia de QueryClient (nueva en servidor, singleton en cliente).

  
  
  const [trpcClient] = useState(() =>                                     // Se usa useState con una función de inicialización, lo que significa que la función solo se ejecutará una vez, cuando el componente se monte.
    createTRPCClient<AppRouter>({                                         // Se usa createClient de tRPC para configurar el cliente.
      links: [                                                            // Configuracion de links -> links en tRPC define cómo se comunican las solicitudes con el backend.                                               
        httpBatchLink({                                                   // httpBatchLink es un link que permite permite agrupar varias solicitudes en una sola petición HTTP.
          // transformer: superjson,                                      // superjson permite serializar y deserializar datos complejos correctamente.
          url: getUrl(),                                                  // getUrl devuelve devuelve la URL del servidor tRPC. 
        }),
      ],
    }),
  );

  return (
    // El componente QueryClientProvider proporciona el QueryClient a la aplicación. 
    <QueryClientProvider client={queryClient}>
      {/* //trpc.Provider proporciona el cliente tRPC a la aplicación. */}
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}