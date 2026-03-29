import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Editor de Vídeo com IA',
  description: 'Editor de vídeo inteligente com Claude AI e Remotion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-editor-bg text-white antialiased">
        {children}
      </body>
    </html>
  );
}
