import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';

// export const appRouter = createTRPCRouter({
//   getUsers: baseProcedure
//     .query(() => {
//       return prisma.user.findMany();
//     }),
// });

export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .query(({ ctx }) => {    
      return prisma.user.findMany({
        where: {
          id: ctx.auth.user.id
        }
      });
    }),
  createWorkflow: protectedProcedure
    .mutation(async() => {

      await inngest.send({
        name: "test/hello.world",
        data: {
          email: "test@test.com"
        }
      });

      return { sucess: true, message: "Workflow created" };

      
    }),
  getWorkflows: protectedProcedure
    .query(({ ctx }) => {
      return prisma.workflow.findMany()
    })
});


export type AppRouter = typeof appRouter;