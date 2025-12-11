import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAdminAuth } from "./firebaseAdmin";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Firebase",
      credentials: { idToken: { label: "ID Token", type: "text" } },
      async authorize(credentials) {
        if (!credentials?.idToken) return null;
        const decoded = await getAdminAuth().verifyIdToken(credentials.idToken);
        return {
          id: decoded.uid,
          email: decoded.email ?? undefined,
          name: (decoded as any).name ?? undefined,
          image: (decoded as any).picture ?? undefined,
        } as any;
      },
    }),
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = (user as any).id;
      return token as any;
    },
    async session({ session, token }) {
      if (session?.user && token?.uid)
        (session.user as any).id = token.uid as string;
      return session;
    },
  },
};
