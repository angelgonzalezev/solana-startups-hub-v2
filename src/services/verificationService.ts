import { getSupabaseAccessToken } from '@/lib/auth/tokenBridge';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const runDevVerification = async (startupId: string, action: 'approve' | 'reject', reason?: string) => {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error('Authentication required.');

  const response = await fetch('/api/dev/verification', {
    body: JSON.stringify({ action, reason, startupId }),
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    method: 'POST',
  });

  const result = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new Error(result?.error || 'Verification action failed.');
};

export const verificationService = {
  requestVerification: async (startupId: string): Promise<void> => {
    const { error } = await getSupabaseBrowserClient().rpc('request_startup_verification', {
      startup_id: startupId,
    });
    if (error) throw error;
  },

  mockApproveVerification: async (startupId: string): Promise<void> => {
    await runDevVerification(startupId, 'approve');
  },

  mockRejectVerification: async (startupId: string, reason: string): Promise<void> => {
    await runDevVerification(startupId, 'reject', reason);
  },
};
