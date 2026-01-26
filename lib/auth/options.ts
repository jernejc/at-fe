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

          // Call API validation to get user role
          const response = await fetch(`${API_BASE}/api/v1/users/validate-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: decoded.email }),
          });

          if (!response.ok) {
            console.error("Failed to validate email:", response.statusText);
            return null; // Reject login if validation API fails
          }

          const validationData = await response.json();

          if (!validationData.valid) {
            console.warn("Login rejected:", validationData.reason);
            return null;
          }

          return {
            id: decoded.uid,
            email: decoded.email,
            name: (decoded as any).name ?? undefined,
            image: (decoded as any).picture ?? undefined,
            role: validationData.user_type,
            partner_id: validationData.partner_id,
            partner_name: validationData.partner_name,
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
        token.uid = (user as any).id;
        token.role = (user as any).role;
        token.partner_id = (user as any).partner_id;
        token.partner_name = (user as any).partner_name;
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
