import SmoothScrollProvider from '@/components/shared/SmoothScroll';
import { AppProviders } from '@/components/shared/AppProviders';
import { getInitialAuthState } from '@/lib/auth/initialState';
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/seo';
import { interTight } from '@/utils/font';
import { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['Solana', 'startups', 'web3', 'crypto', 'startup directory', 'marketplace', 'founders', 'investors'],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1672, height: 941, alt: SITE_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
