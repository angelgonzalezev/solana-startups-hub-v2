import React from 'react';
import { cn } from '@/utils/cn';
import {
  VerificationStatus,
  ListingStatus,
  StartupStage,
  AcquisitionStatus,
} from '@/interface/startup';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className }) => (
  <span
    className={cn(
      'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      className
    )}
  >
    {children}
  </span>
);

export const VerificationStatusBadge: React.FC<{ status: VerificationStatus }> = ({
  status,
}) => {
  const styles = {
    draft: 'bg-white/5 border-white/10 text-white/60',
    pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    verified: 'bg-green-500/10 border-green-500/20 text-green-500',
    rejected: 'bg-red-500/10 border-red-500/20 text-red-500',
  };

  return <Badge className={styles[status]}>{status.toUpperCase()}</Badge>;
};

export const ListingStatusBadge: React.FC<{ status: ListingStatus }> = ({
  status,
}) => {
  const styles = {
    draft: 'bg-white/5 border-white/10 text-white/60',
    published: 'bg-primary-500/10 border-primary-500/20 text-primary-500',
    archived: 'bg-red-500/10 border-red-500/20 text-red-500',
  };

  return <Badge className={styles[status]}>{status.toUpperCase()}</Badge>;
};

export const StartupStageBadge: React.FC<{ stage: StartupStage }> = ({
  stage,
}) => {
  return (
    <Badge className="bg-white/5 border-white/10 text-white/80">
      {stage}
    </Badge>
  );
};

export const MarketSignalBadge: React.FC<{
  type: 'raising' | 'acquisition';
  status?: AcquisitionStatus;
}> = ({ type, status }) => {
  if (type === 'raising') {
    return (
      <Badge className="bg-[#14F195]/10 border-[#14F195]/20 text-[#14F195]">
        IS RAISING
      </Badge>
    );
  }

  if (type === 'acquisition' && status === 'open_to_discuss') {
    return (
      <Badge className="bg-[#9945FF]/10 border-[#9945FF]/20 text-[#9945FF]">
        OPEN TO ACQUISITION
      </Badge>
    );
  }

  return null;
};
