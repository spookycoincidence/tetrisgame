import './globals.css';

export const metadata = {
  title: 'Tetris Game',
  description: 'Juego Tetris en Next.js con React y Tailwind',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
