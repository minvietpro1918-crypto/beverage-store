import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import ClientShell from '@/components/layout/ClientShell';
import { buildMetadata, localBusinessSchema, websiteSchema } from '@/lib/seo';
import '@/styles/globals.css';

// ── Bổ sung 1: Tự động tạo Metadata SEO nâng cao thay vì code cứng ──
export const metadata = buildMetadata();

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        {/* ── Bổ sung 2: Khai báo cấu trúc dữ liệu JSON-LD cho Google (Rich Snippets) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* ── Bổ sung 3: Tăng tốc độ load Font chữ từ Google ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── Bổ sung 4: Màu sắc chủ đạo của thanh trạng thái trên trình duyệt mobile ── */}
        <meta name="theme-color" content="#09090b" />
        <meta name="msapplication-TileColor" content="#09090b" />
        
        {/* PWA manifest (tùy chọn cho ứng dụng di động) */}
        {/* <link rel="manifest" href="/manifest.json" /> */}
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <ClientShell>{children}</ClientShell>
            
            {/* ── Bổ sung 5: Tăng thời gian hiển thị thông báo (duration) từ 3000ms lên 3500ms ── */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3500,
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