import { auth } from '@/lib/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
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

export const protectedProcedure = baseProcedure.use(           // Procedimiento protegido, solo permite llamarlo si el usuario está autenticado.
  async({ ctx, next }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if(!session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }

    return next({ctx: { ...ctx, auth: session }});
})