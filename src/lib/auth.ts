import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";


export const auth = betterAuth({      // Crea una instancia de betterAuth
  database: prismaAdapter(prisma, {   // Conecta con la base de datos de prisma
    provider: "postgresql", 
  }),
  emailAndPassword: {                 // Configura la autenticación de email y contraseña
    enabled: true,
    autoSignIn: true,
    //disableEmailVerification: true 
  }
});