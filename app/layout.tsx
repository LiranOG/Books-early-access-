import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk, Heebo } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--font-heebo' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
  title: 'Cosmic Interface | The Great Forgetting',
  description: 'A unified interface for conscious cosmic self-discovery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${heebo.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} dark`}>
      <body className="antialiased bg-[#050505] text-zinc-300 selection:bg-emerald-500/30 min-h-[100dvh] flex flex-col overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
