// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./context/ThemeContext";
import { PartnerProvider } from "./context/PartnerContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PlanAmWell Admin",
  description: "Admin back-office for PlanAmWell",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          // Runs before paint to apply a saved dark-mode choice immediately,
          // avoiding a light-then-dark flash on load. See ThemeToggle.tsx.
          dangerouslySetInnerHTML={{
            __html: `try {
              var t = localStorage.getItem('admin-theme');
              if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
            } catch (e) {}`,
          }}
        />
        <ThemeProvider>
           {/* Remove PartnerProvider from here */}
           {children}
           <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
