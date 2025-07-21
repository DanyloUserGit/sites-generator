import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/hooks/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className={inter.className}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
