import { createAuthClient } from "better-auth/react";

// À utiliser dans les composants client (front) : authClient.signIn.email(), authClient.useSession()…
export const authClient = createAuthClient();
