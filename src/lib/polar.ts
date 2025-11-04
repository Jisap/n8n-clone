import { Polar } from "@polar-sh/sdk";

console.log("🔍 POLAR_ACCESS_TOKEN existe:", !!process.env.POLAR_ACCESS_TOKEN);
console.log("🔍 Longitud del token:", process.env.POLAR_ACCESS_TOKEN?.length);
console.log("🔍 Primeros 10 caracteres:", process.env.POLAR_ACCESS_TOKEN?.substring(0, 10));


export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox"
})