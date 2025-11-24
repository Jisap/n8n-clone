
import { PAGINATION } from "@/config/constants";
import { CredentialType, NodeType } from "@/generated/prisma/client";
import type { Node, Edge } from "@xyflow/react"
import prisma from "@/lib/db";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs"
import z from "zod";




export const credentialsRouter = createTRPCRouter({
  
  create: premiumProcedure
    .input(
      z.object({ 
        name: z.string().min(1, "Name is required"), 
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"), // apiKey
      }))
    .mutation(({ ctx, input }) => {

      const { name, type, value } = input;

      return prisma.credential.create({
        data: {
          name,
          userId: ctx.auth.user.id,
          type,
          value // TODO: Consider encrypting in production
        }
      })
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input  }) => {
      return prisma.credential.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id
        }
      })
  }),
  update: protectedProcedure
    .input(
      z.object({ 
        id: z.string(), 
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      })
    )
    .mutation(async({ ctx, input  }) => {

      const { id, name, type, value } = input;

      return prisma.credential.update({
        where: { id, userId: ctx.auth.user.id },
        data: {
          name,
          type,
          value, // TODO: Consider encrypting in production
        }
      })
    }),
    getOne: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async({ ctx, input }) => {
        return prisma.credential.findUniqueOrThrow({
          where: {
            id: input.id,            // Se permite ver la credential especificado
            userId: ctx.auth.user.id // Solo permite ver las credentials que le pertenecen
          },      
        });       
      }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const[items, totalCount] = await Promise.all([
        prisma.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id, // Se permite ver todos las credentials que le pertenecen
            name: {
              contains: search,       // Filtra los credentials que contengan la cadena de búsqueda
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.credential.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,       // Filtra los credentials que contengan la cadena de búsqueda
              mode: "insensitive",
            }
          }
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        totalCount,
      };
    }),
  getByType: protectedProcedure
    .input(
      z.object({ 
        type: z.enum(CredentialType),
      })
    )
    .query(({ ctx, input }) => {
      const { type } = input;

      return prisma.credential.findMany({
        where: {
          type,
          userId: ctx.auth.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),
    
})