
// server component by default
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ChunkReloader } from '@/components/chunk-reloader';
import { I18nProvider } from '@/components/i18n-provider';
import ErrorBoundary from '@/components/error-boundary';
import { EducationalChatbot } from '@/components/chat/educational-chatbot';
import './globals.css';
// i18n is initialized on the client in AppLayoutClient
import { Outfit, Manrope, DM_Sans } from 'next/font/google';
// Client-only widgets are rendered in pages to avoid bundling heavy server deps globally

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-outfit',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-dm-sans',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '800'],
  variable: '--font-manrope',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${outfit.variable} ${dmSans.variable} ${manrope.variable} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <ErrorBoundary>
              <I18nProvider>
                <AuthProvider>
                  <ChunkReloader />
                  {children}
                  <EducationalChatbot />
                  <Toaster />
                </AuthProvider>
              </I18nProvider>
            </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
