import "@/lib/polyfills";
import { AuthProvider } from "@/hooks/useAuth";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Almost the best Dashboard",
  description: "Created by an Almost expert Next.js developer",
};

const themeInitializer = `(function () {
  const THEME_KEY = 'theme-preference';
  const root = document.documentElement;
  if (!root) return;

  const applyTheme = (isDark) => {
    if (isDark) {
      root.classList.add('dark');
      root.removeAttribute('data-theme');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  };

  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const addMediaListener = (handler) => {
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handler);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handler);
      }
    };
    const removeMediaListener = (handler) => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handler);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(handler);
      }
    };

    let systemListenerAttached = false;
    const handleMediaChange = (event) => {
      if (window.localStorage.getItem(THEME_KEY) === 'system') {
        applyTheme(event.matches);
      }
    };

    const ensureSystemListener = () => {
      if (!systemListenerAttached) {
        addMediaListener(handleMediaChange);
        systemListenerAttached = true;
      }
    };

    const dropSystemListener = () => {
      if (systemListenerAttached) {
        removeMediaListener(handleMediaChange);
        systemListenerAttached = false;
      }
    };

    const setTheme = (mode) => {
      if (mode === 'light') {
        dropSystemListener();
        window.localStorage.setItem(THEME_KEY, 'light');
        applyTheme(false);
      } else if (mode === 'dark') {
        dropSystemListener();
        window.localStorage.setItem(THEME_KEY, 'dark');
        applyTheme(true);
      } else {
        window.localStorage.setItem(THEME_KEY, 'system');
        ensureSystemListener();
        applyTheme(mediaQuery.matches);
      }
    };

    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setTheme(stored);
    } else {
      setTheme('system');
    }

    window.__setAppTheme = setTheme;
  } catch (error) {
    applyTheme(false);
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitializer,
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
