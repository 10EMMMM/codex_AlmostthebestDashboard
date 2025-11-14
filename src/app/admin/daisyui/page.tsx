"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/hooks/useAuth';
import { SplashScreen } from '@/components/ui/splash-screen';
import { ErrorSplashScreen } from '@/components/ui/error-splash-screen';
import { daisyUIComponents } from '@/lib/data/daisyui-components';
import { Sparkles } from 'lucide-react';

const paletteOptions = ['info', 'success', 'warning', 'error'] as const;
const themeName = 'forest';

export default function DaisyUIShowcasePage() {
  const router = useRouter();
  const { user, hasAdminAccess, loading } = useAuth();
  const [alertVariant, setAlertVariant] = useState<(typeof paletteOptions)[number]>('info');
  const highlightedComponent = daisyUIComponents.find((component) => component.slug === 'alert');

  const sampleMarkup = `<div class="alert alert-${alertVariant} shadow-lg">
  <span class="flex items-center gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 stroke-current">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m2-4h-.01"></path>
    </svg>
    <span>Heads up! This is the ${alertVariant} palette straight from daisyUI.</span>
  </span>
</div>`;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, router, user]);

  if (loading) {
    return <SplashScreen loading />;
  }

  if (!user) {
    return <SplashScreen loading />;
  }

  if (!hasAdminAccess) {
    return (
      <ErrorSplashScreen
        message="You need admin access to explore the daisyUI catalogue."
        actionText="Go to Dashboard"
        onActionClick={() => router.push('/dashboard')}
      />
    );
  }

  return (
    <DashboardLayout title="Admin - daisyUI Spotlight">
      <div data-theme={themeName} className="space-y-6">
        <div className="card border border-base-200 bg-base-100 shadow-2xl">
          <div className="card-body gap-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="card-title text-2xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {highlightedComponent?.name ?? 'daisyUI component'}
                </h2>
                <p className="text-sm text-base-content/70">
                  Rendered directly with daisyUI utilities and theme tokens.
                </p>
              </div>
              <a
                className="btn btn-outline btn-sm"
                href="https://daisyui.com/components/alert/"
                target="_blank"
                rel="noreferrer"
              >
                View docs
              </a>
            </header>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/70">
                Pick a palette
              </p>
              <div className="flex flex-wrap gap-2">
                {paletteOptions.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    className={`btn btn-sm capitalize ${
                      alertVariant === variant ? 'btn-primary' : 'btn-ghost'
                    }`}
                    onClick={() => setAlertVariant(variant)}
                  >
                    {variant} tone
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/70">
                Live preview
              </p>
              <div className="rounded-box border border-base-200 bg-base-200/60 p-6">
                <div className={`alert alert-${alertVariant} shadow-lg`}>
                  <span className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="h-6 w-6 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m2-4h-.01"
                      ></path>
                    </svg>
                    <span>Heads up! This alert uses the daisyUI {alertVariant} palette.</span>
                  </span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/70">
                Markup
              </p>
              <div className="mockup-code bg-base-200 text-sm">
                <pre>
                  <code>{sampleMarkup}</code>
                </pre>
              </div>
            </section>
          </div>
        </div>

        <div className="alert alert-info shadow-lg">
          <span className="text-sm">
            This page showcases a single daisyUI element without relying on any custom global CSS. Duplicate
            the preview card to compare additional components or themes inside the admin workspace.
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
