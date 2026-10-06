import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  advanced: {
    database: { generateId: "uuid" },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // Google n'est activé que si ses identifiants sont configurés : l'e-mail suffit en développement.
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
  user: {
    additionalFields: {
      // input: false — le navigateur ne peut pas fixer le rôle à l'inscription (sinon n'importe qui
      // s'inscrirait « admin »). Il est choisi ensuite (dev ou client) par une route dédiée,
      // de la même façon pour un compte e-mail et un compte Google. admin : par script uniquement.
      role: { type: "string", required: false, input: false },
      phone: { type: "string", required: false },
      businessName: { type: "string", required: false },
    },
  },
  // Doit rester le dernier plugin : pose les cookies quand une server action appelle auth.api.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
