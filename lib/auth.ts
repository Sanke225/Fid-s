import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";

const env = process.env;

const socialProviders = {
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
    : {}),
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? { github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET } }
    : {}),
  // Apple : clientId = Services ID, clientSecret = JWT signé avec la clé .p8 (expire au bout de 6 mois maximum).
  // Désactivé tant que APPLE_ENABLED ne vaut pas "true" (abonnement Apple Developer pas encore pris).
  ...(env.APPLE_ENABLED === "true" && env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET
    ? {
        apple: {
          clientId: env.APPLE_CLIENT_ID,
          clientSecret: env.APPLE_CLIENT_SECRET,
          appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER || undefined,
        },
      }
    : {}),
};

/** Fournisseurs de connexion configurés, dans l'ordre d'affichage. */
export const enabledSocialProviders = (["google", "apple", "github"] as const).filter(p => p in socialProviders);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  advanced: {
    database: { generateId: "uuid" },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // Chaque fournisseur n'est activé que si ses identifiants sont configurés : l'e-mail suffit en développement.
  socialProviders,
  // Apple renvoie l'utilisateur par un POST depuis appleid.apple.com : origine à autoriser.
  trustedOrigins: "apple" in socialProviders ? ["https://appleid.apple.com"] : [],
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
