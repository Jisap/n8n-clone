import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { checkout, polar, portal,webhooks } from "@polar-sh/better-auth";
import { polarClient } from "./polar"


export const auth = betterAuth({      // Crea una instancia de betterAuth
  database: prismaAdapter(prisma, {   // Conecta con la base de datos de prisma
    provider: "postgresql", 
  }),
  emailAndPassword: {                 // Configura la autenticación de email y contraseña
    enabled: true,
    autoSignIn: true,
    //disableEmailVerification: true 
  },
  plugins: [
    polar ({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "eebad5fd-ff58-4b61-b8d4-72bf11586329",
              slug: "pro"
            }
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
        
      ]
    })
  ]
});