import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

// À utiliser dans les composants client (front) : authClient.signIn.email(), authClient.signIn.username(), authClient.useSession()…
export const authClient = createAuthClient({ plugins: [usernameClient()] });
