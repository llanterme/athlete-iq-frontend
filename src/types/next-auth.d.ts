import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      stravaId?: number;
    };
  }

  interface Account {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    token_type: string;
    scope: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    stravaId?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    stravaId?: number;
  }
}