import type { AuthConfig } from "convex/server";

import { env } from "./_generated/server";

const clientId = env.WORKOS_CLIENT_ID;
const jwks = `https://api.workos.com/sso/jwks/${clientId}`;

export default {
  providers: [
    {
      algorithm: "RS256",
      applicationID: clientId,
      issuer: "https://api.workos.com/",
      jwks,
      type: "customJwt",
    },
    {
      algorithm: "RS256",
      issuer: `https://api.workos.com/user_management/${clientId}`,
      jwks,
      type: "customJwt",
    },
  ],
} satisfies AuthConfig;
