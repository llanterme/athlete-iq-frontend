'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <NextAuthSessionProvider
        refetchInterval={0}
        refetchOnWindowFocus={false}
      >
        {children}
      </NextAuthSessionProvider>
    </QueryClientProvider>
  );
}