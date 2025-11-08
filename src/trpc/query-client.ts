import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';
import superjson from 'superjson';

/**
 * Crea y configura una instancia de `QueryClient` para TanStack Query.
 * Esta función de fábrica (factory) es crucial para Server-Side Rendering (SSR),
 * ya que asegura que cada petición del servidor tenga su propia caché de queries,
 * evitando así que los datos de un usuario se filtren a otro.
 *
 * @returns Una nueva instancia de `QueryClient`.
 */

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {                                   // Opciones por defecto para todas las `queries`.
      queries: {                                        
        staleTime: 30 * 1000,                           // El tiempo en milisegundos durante el cual los datos de una query se consideran "frescos" y no se volverán a solicitar automáticamente. Aquí se establece en 30 segundos.
      },
      dehydrate: {                                      // Opciones para la deshidratación de los datos (extraer el estado de una query).
        serializeData: superjson.serialize,
       
        shouldDehydrateQuery: (query) =>                 // Determina qué consultas (queries) deben ser deshidratadas (serializadas) y enviadas al cliente.   
          defaultShouldDehydrateQuery(query) ||          // Además del comportamiento por defecto, también incluimos las queries
          query.state.status === 'pending',              // que están en estado 'pending' (pendientes). Esto es útil para que el
      },                                                 // cliente pueda continuar con las peticiones que el servidor no completó, // evitando un "flash" de estado de carga.
      hydrate: {
        deserializeData: superjson.deserialize,         // Opciones para la hidratación de los datos (extraer el estado de una query).
      }
    
    },                                                   
  });
}