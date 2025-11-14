'use client';

import { useEffect, useMemo, useState } from 'react';

type DaisyRequestStatus = 'new' | 'on progress' | 'done' | 'on hold';

type DaisyRequest = {
  id: string;
  title: string;
  requester: string;
  city: string;
  status: DaisyRequestStatus;
  date: string;
  deadline: string;
  description: string;
};

const statusMeta: Record<
  DaisyRequestStatus,
  { badgeClass: string; icon: string; label: string }
> = {
  new: { badgeClass: 'badge-info', icon: '➕', label: 'New' },
  'on progress': { badgeClass: 'badge-warning', icon: '⏳', label: 'In Progress' },
  done: { badgeClass: 'badge-success', icon: '✔︎', label: 'Completed' },
  'on hold': { badgeClass: 'badge-neutral', icon: '⏸︎', label: 'On Hold' },
};

type DaisyRequestCardProps = {
  requestId: string;
};

export function DaisyRequestCard({ requestId }: DaisyRequestCardProps) {
  const [request, setRequest] = useState<DaisyRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRequest() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/requests/${requestId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to load request details.');
        }

        const payload = (await response.json()) as DaisyRequest;
        setRequest(payload);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Unexpected error loading request.';
        setError(message);
        setRequest(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRequest();

    return () => controller.abort();
  }, [requestId, reloadToken]);

  const status = request ? statusMeta[request.status] : null;

  const timeline = useMemo(() => {
    if (!request) return null;

    const submitted = new Date(request.date).toLocaleDateString();
    const due = new Date(request.deadline).toLocaleDateString();

    return { submitted, due };
  }, [request]);

  if (isLoading) {
    return (
      <div className="card bg-base-200 shadow-lg animate-pulse">
        <div className="card-body gap-4">
          <div className="h-6 w-1/2 rounded bg-base-300" />
          <div className="h-4 w-1/3 rounded bg-base-300" />
          <div className="space-y-2">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-3 w-full rounded bg-base-300" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded bg-base-300" />
            <div className="h-8 flex-1 rounded bg-base-300" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="card border border-error/20 bg-base-100 shadow-lg">
        <div className="card-body gap-4">
          <div>
            <h3 className="card-title text-error">Unable to load request</h3>
            <p className="text-sm text-base-content/70">{error}</p>
          </div>
          <div className="card-actions justify-end">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setReloadToken((token) => token + 1)}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="card-title">{request.title}</h3>
            <p className="text-sm text-base-content/70">
              {request.requester} · {request.city}
            </p>
          </div>
          {status && (
            <span className={`badge badge-outline ${status.badgeClass}`}>
              <span className="mr-1">{status.icon}</span>
              {status.label}
            </span>
          )}
        </div>

        {timeline && (
          <div className="grid gap-2 text-sm text-base-content/70 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-base-content">Requested:</span>{' '}
              {timeline.submitted}
            </p>
            <p>
              <span className="font-semibold text-base-content">Deadline:</span>{' '}
              {timeline.due}
            </p>
          </div>
        )}

        <p className="text-sm leading-relaxed">{request.description}</p>

        <div className="divider my-0" />

        <div className="card-actions justify-end">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setReloadToken((token) => token + 1)}
          >
            Refresh
          </button>
          <button className="btn btn-sm btn-primary">View Details</button>
        </div>
      </div>
    </div>
  );
}
