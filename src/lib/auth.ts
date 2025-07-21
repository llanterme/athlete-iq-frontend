import NextAuth, { type AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: token.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token,
      expiresAt: refreshedTokens.expires_at,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    {
      id: 'strava',
      name: 'Strava',
      type: 'oauth',
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        url: 'https://www.strava.com/oauth/authorize',
        params: {
          scope: 'read,activity:read_all,profile:read_all',
          approval_prompt: 'force',
          response_type: 'code',
        },
      },
      token: {
        url: 'https://www.strava.com/oauth/token',
        async request(context) {
          const { provider, params } = context;
          
          const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: provider.clientId!,
              client_secret: provider.clientSecret!,
              code: params.code!,
              grant_type: 'authorization_code',
            }),
          });

          const tokens = await response.json();
          
          if (!response.ok) {
            throw new Error(`Token request failed: ${response.status} ${JSON.stringify(tokens)}`);
          }

          return {
            tokens: {
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_at: tokens.expires_at,
              token_type: tokens.token_type,
              scope: tokens.scope,
            },
          };
        },
      },
      userinfo: {
        url: 'https://www.strava.com/api/v3/athlete',
        async request(context) {
          const response = await fetch('https://www.strava.com/api/v3/athlete', {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch user info: ${response.status}`);
          }

          return response.json();
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: `${profile.firstname} ${profile.lastname}`,
          email: null,
          image: profile.profile_medium || profile.profile,
          stravaId: profile.id,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          stravaId: user.stravaId,
          ...token,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.expiresAt = token.expiresAt as number;
        session.user.id = token.sub as string; // Ensure user.id is set
        session.user.stravaId = token.stravaId as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions);