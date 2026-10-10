import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Toutes les routes de Better Auth : /api/auth/sign-up/email, /api/auth/sign-in/social, etc.
export const { GET, POST } = toNextJsHandler(auth);
