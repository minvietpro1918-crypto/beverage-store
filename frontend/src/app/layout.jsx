import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import ClientShell from '@/components/layout/ClientShell';
import '@/styles/globals.css';

export const metadata = {
  title: 'Sip & Brew — Beverage Store',
  description: 'Thức uống thượng hạng, tinh khiết từ nguồn gốc',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        {/* Fonts are loaded via globals.css @import */}
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <ClientShell>{children}</ClientShell>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#141414',
                  color: '#F5F0E8',
                  border: '1px solid rgba(201,169,110,0.2)',
                  borderRadius: 0,
                  padding: '14px 20px',
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  fontFamily: "'DM Sans', sans-serif",
                },
                success: { iconTheme: { primary: '#C9A96E', secondary: '#141414' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#141414' } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
