import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      partner_id?: number;
      partner_name?: string;
    };
  }

  interface User {
    id: string;
    role?: string;
    partner_id?: number;
    partner_name?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid: string;
    role?: string;
    partner_id?: number;
    partner_name?: string;
  }
}
