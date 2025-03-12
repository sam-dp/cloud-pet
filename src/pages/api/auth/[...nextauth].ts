import NextAuth, { DefaultUser, TokenSet } from "next-auth";
import CognitoProvider, { CognitoProfile } from "next-auth/providers/cognito";
import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;        // Cognito User ID (sub)
      username: string;  // Cognito username
      email: string;
    };
    accessToken?: string; // Access token to be included in the session
  }
  interface User extends DefaultUser {
    username?: string; // Add username to the User type
  }

  interface JWT {
    accessToken?: string;  // Access token to be included in the JWT
    id?: string;           // Cognito User ID (sub)
    username?: string;     // Cognito username
  }
}


export default NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID as string,
      clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
      issuer: process.env.COGNITO_ISSUER,
      profile(profile, tokens) {
        return {
          id: profile.sub,                  // Cognito User ID (sub)
          username: profile["cognito:username"], // Cognito username
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;         // Cognito sub
        token.username = user.username; // Cognito username
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;         // Cognito sub
      session.user.username = token.username as string; // Cognito username
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});