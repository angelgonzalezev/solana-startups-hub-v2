import React from 'react';
import Link from 'next/link';

export const LoadingState: React.FC = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Something went wrong while loading data.',
  onRetry,
}) => (
  <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-red-500/10 bg-[#0A0A0A] p-5 text-center sm:min-h-[400px] sm:p-8">
    <div className="space-y-6">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Oops!</h3>
        <p className="text-white/60">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary btn-md">
          Try Again
        </button>
      )}
    </div>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
}> = ({ title, description, actionHref, actionLabel, icon }) => (
  <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-white/10 bg-[#0A0A0A] p-5 text-center sm:min-h-[400px] sm:p-8">
    <div className="space-y-8 max-w-[400px]">
      {icon ? (
        <div className="mx-auto">{icon}</div>
      ) : (
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-base leading-7 text-white/60 sm:text-lg">{description}</p>
      </div>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn btn-primary btn-md w-full sm:w-auto">
          {actionLabel}
        </Link>
      )}
    </div>
  </div>
);
