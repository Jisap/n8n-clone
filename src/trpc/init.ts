import { initTRPC } from '@trpc/server';
import { cache } from 'react';

export const createTRPCContext = cache(async () => {           // Crea el contexto para tRPC, que incluirá información del usuario autenticado.
  return { userId: 'user_123' };
});


const t = initTRPC.create({                                    // Inicializa tRPC con el contexto y una transformación para manejar serialización de datos complejos.
  // transformer: superjson,
});



export const createTRPCRouter = t.router;                      // Constructor de routes para agrupar procedimientos                   
export const createCallerFactory = t.createCallerFactory;      // Exportamos una fabrical para crear callers -> permite llamar procedimientos desde el server
export const baseProcedure = t.procedure;                      // Base para crear procedimientos
