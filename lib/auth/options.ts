import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAdminAuth } from "./firebaseAdmin";
import { API_BASE } from "@/lib/api/core";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Firebase",
      credentials: { idToken: { label: "ID Token", type: "text" } },
      async authorize(credentials) {
        if (!credentials?.idToken) return null;
        
        try {
          const decoded = await getAdminAuth().verifyIdToken(credentials.idToken);
          
          if (!decoded.email) return null;

          const userType = decoded.user_type;
          const partnerId = decoded.partner_id;
          const partnerName = decoded.partner_name;

          return {
            id: decoded.uid,
            email: decoded.email,
            name: decoded.name ?? undefined,
            image: decoded.picture ?? undefined,
            role: userType,
            partner_id: partnerId,
            partner_name: partnerName,
          } as any;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.partner_id = user.partner_id;
        token.partner_name = user.partner_name;
      }
      return token as any;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.uid as string;
        (session.user as any).role = token.role as string;
        (session.user as any).partner_id = token.partner_id as number | undefined;
        (session.user as any).partner_name = token.partner_name as string | undefined;
      }
      return session;
    },
  },
};
