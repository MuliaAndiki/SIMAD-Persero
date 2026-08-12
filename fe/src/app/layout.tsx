import { metadata, siteConfig } from './metadata';
import '@aejkatappaja/phantom-ui/ssr.css';
import '@/styles/globals.css';
import { AppProviders } from './providers';

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.locale} suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
