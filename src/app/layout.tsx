import SmoothScrollProvider from '@/components/shared/SmoothScroll';
import { AppProviders } from '@/components/shared/AppProviders';
import { getInitialAuthState } from '@/lib/auth/initialState';
import { interTight } from '@/utils/font';
import { ReactNode, Suspense } from 'react';
import './globals.css';

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const initialAuth = await getInitialAuthState();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${interTight.variable} antialiased`}>
        <AppProviders initialAuth={initialAuth}>
          <Suspense fallback={<div>Loading...</div>}>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </Suspense>
        </AppProviders>
      </body>
    </html>
  );
}
