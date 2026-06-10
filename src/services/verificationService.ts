import { startupService } from './startupService';
import { userService } from './userService';
import { canRequestVerification } from '@/utils/validation';

export const verificationService = {
  requestVerification: async (startupId: string, ownerWallet: string): Promise<void> => {
    const startup = await startupService.getStartupById(startupId);
    const user = await userService.getUserByWallet(ownerWallet);

    if (!startup || !user) {
      throw new Error('Startup or user not found');
    }

    if (!canRequestVerification(startup, user)) {
      throw new Error('Startup does not meet verification requirements');
    }

    await startupService.updateStartup(startupId, ownerWallet, {
      verificationStatus: 'pending',
      domainVerificationStatus: 'pending',
      xVerificationStatus: 'pending',
    });
  },

  mockApproveVerification: async (startupId: string): Promise<void> => {
    const startup = await startupService.getStartupById(startupId);
    if (!startup) {
      throw new Error('Startup not found');
    }

    await startupService.updateStartup(startupId, startup.ownerWallet, {
      verificationStatus: 'verified',
      domainVerificationStatus: 'verified',
      xVerificationStatus: 'verified',
    });
  },

  mockRejectVerification: async (startupId: string, reason: string): Promise<void> => {
    const startup = await startupService.getStartupById(startupId);
    if (!startup) {
      throw new Error('Startup not found');
    }

    await startupService.updateStartup(startupId, startup.ownerWallet, {
      verificationStatus: 'rejected',
      domainVerificationStatus: 'failed',
      xVerificationStatus: 'failed',
    });
    
    // In a real app, we would save the reason somewhere
    console.log(`Startup ${startupId} rejected: ${reason}`);
  },
};
