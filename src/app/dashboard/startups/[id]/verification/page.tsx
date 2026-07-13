'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { verificationService } from '@/services/verificationService';
import { Startup } from '@/interface/startup';
import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import { VerificationStatusBadge, ListingStatusBadge } from '@/components/shared/Badges';
import { LoadingState, ErrorState } from '@/components/shared/States';
import { canRequestVerification } from '@/utils/validation';
import { cn } from '@/utils/cn';

export default function VerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { walletAddress, user } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshStartup = useCallback(async () => {
    if (!walletAddress || !id) {
      setStartup(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await startupService.getStartupById(id);
      if (data && data.ownerWallet === walletAddress) {
        setStartup(data);
      } else {
        setStartup(null);
      }
    } catch (error) {
      console.error('Error loading startup:', error);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, id]);

  useEffect(() => {
    void refreshStartup();
  }, [refreshStartup]);

  const handleRequestVerification = async () => {
    if (!startup || !walletAddress) return;
    setIsActionLoading(true);
    setMessage(null);
    try {
      await verificationService.requestVerification(startup.id);
      setMessage({ type: 'success', text: 'Verification requested successfully!' });
      await refreshStartup();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request verification.';
      setMessage({ type: 'error', text: message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!startup || !walletAddress) return;
    setIsActionLoading(true);
    setMessage(null);
    try {
      await startupService.publishStartup(startup.id);
      setMessage({ type: 'success', text: 'Startup published to marketplace!' });
      await refreshStartup();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish.';
      setMessage({ type: 'error', text: message });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Mock helpers for development
  const handleMockApprove = async () => {
    if (!startup) return;
    setIsActionLoading(true);
    try {
      await verificationService.mockApproveVerification(startup.id);
      await refreshStartup();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMockReject = async () => {
    if (!startup) return;
    setIsActionLoading(true);
    try {
      await verificationService.mockRejectVerification(startup.id, 'Mock rejection reason');
      await refreshStartup();
    } finally {
      setIsActionLoading(false);
    }
  };

  const canRequest = startup && user ? canRequestVerification(startup, user) : false;

  const getStatusMessage = () => {
    if (!startup) return '';
    switch (startup.verificationStatus) {
      case 'draft':
        return 'Complete your startup profile and request verification.';
      case 'pending':
        return 'Verification is pending. We are reviewing your website and X profile.';
      case 'verified':
        return 'Your startup is verified and can be published.';
      case 'rejected':
        return 'Verification was rejected. Update the required information and request verification again.';
      default:
        return '';
    }
  };

  return (
    <AuthGate>
      <DashboardShell
        title="Verification & Publication"
        subtitle={startup ? `Status for ${startup.name}` : 'Verification management.'}>
        {isLoading ? (
          <LoadingState />
        ) : !startup ? (
          <ErrorState message="Startup not found." />
        ) : (
          <div className="max-w-4xl space-y-8">
            {/* Status Overview */}
            <div className="bg-[#0A0A0A] p-8 md:p-10 border border-white/5 rounded-[30px] space-y-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-white/40 uppercase tracking-widest font-medium">Verification</p>
                  <VerificationStatusBadge status={startup.verificationStatus} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/40 uppercase tracking-widest font-medium">Listing</p>
                  <ListingStatusBadge status={startup.listingStatus} />
                </div>
              </div>
              <p className="text-xl text-white font-medium">{getStatusMessage()}</p>
            </div>

            {/* Verification Checklist */}
            <div className="bg-[#0A0A0A] p-8 md:p-10 border border-white/5 rounded-[30px] space-y-8">
              <h3 className="text-2xl font-bold text-white">Verification Checklist</h3>
              <div className="space-y-4">
                <CheckItem label="Profile Minimum Complete" isDone={!!user?.displayName && !!user?.jobTitle} />
                <CheckItem label="Startup Name & One-Liner" isDone={!!startup.name && !!startup.oneLiner} />
                <CheckItem
                  label="Full Description (min 200 chars)"
                  isDone={!!startup.description && startup.description.length >= 200}
                />
                <CheckItem label="Valid Website URL" isDone={!!startup.website} />
                <CheckItem label="Valid X (Twitter) URL" isDone={!!startup.twitter} />
                <CheckItem
                  label="Categories & Tech Stack"
                  isDone={startup.category.length > 0 && startup.techStack.length > 0}
                />
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4">
                {startup.verificationStatus !== 'verified' && (
                  <button
                    onClick={handleRequestVerification}
                    disabled={!canRequest || isActionLoading || startup.verificationStatus === 'pending'}
                    className="btn btn-primary btn-xl disabled:opacity-50">
                    {startup.verificationStatus === 'pending' ? 'Verification Pending' : 'Request Verification'}
                  </button>
                )}

                {startup.verificationStatus === 'verified' && startup.listingStatus !== 'published' && (
                  <button
                    onClick={handlePublish}
                    disabled={isActionLoading}
                    className="btn btn-primary btn-xl shadow-lg shadow-primary-500/20">
                    Publish to Marketplace
                  </button>
                )}

                {startup.listingStatus === 'published' && (
                  <div className="px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500 font-bold">
                    ALREADY PUBLISHED
                  </div>
                )}
              </div>
            </div>

            {/* Dev Mock Actions */}
            {process.env.NEXT_PUBLIC_ENABLE_DEV_VERIFICATION === 'true' && (
              <div className="bg-white/5 p-8 md:p-10 border border-white/10 rounded-[30px] border-dashed space-y-6">
                <h3 className="text-lg font-bold text-white/60 uppercase tracking-widest">Dev Mock Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleMockApprove}
                    disabled={isActionLoading}
                    className="btn btn-white-dark btn-md border-green-500/20 hover:bg-green-500/10 text-green-500">
                    Mock Approve
                  </button>
                  <button
                    onClick={handleMockReject}
                    disabled={isActionLoading}
                    className="btn btn-white-dark btn-md border-red-500/20 hover:bg-red-500/10 text-red-500">
                    Mock Reject
                  </button>
                </div>
                <p className="text-white/30 text-xs">
                  These actions are only for development/demo purposes to simulate a reviewer approving or rejecting the
                  startup.
                </p>
              </div>
            )}

            {message && (
              <div
                className={cn(
                  'p-4 rounded-2xl text-center font-medium border',
                  message.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-500'
                    : 'bg-red-500/10 border-red-500/20 text-red-500',
                )}>
                {message.text}
              </div>
            )}
          </div>
        )}
      </DashboardShell>
    </AuthGate>
  );
}

const CheckItem = ({ label, isDone }: { label: string; isDone: boolean }) => (
  <div className="flex items-center gap-4">
    <div
      className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center border',
        isDone ? 'bg-green-500/20 border-green-500/40 text-green-500' : 'bg-white/5 border-white/10 text-white/20',
      )}>
      {isDone && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
    <span className={cn('text-lg', isDone ? 'text-white/80' : 'text-white/30')}>{label}</span>
  </div>
);
