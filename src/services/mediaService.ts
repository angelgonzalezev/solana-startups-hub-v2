import { getAuthenticatedProfileId } from '@/lib/auth/tokenBridge';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSupabaseConfig } from '@/lib/supabase/config';

export const MEDIA_BUCKET = 'media';
export const MEDIA_MAX_FILE_SIZE = 2 * 1024 * 1024;
export const MEDIA_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

type MediaFile = Pick<File, 'size' | 'type'>;

export const toMediaStorageError = (error: unknown): Error => {
  const message = error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? error);

  if (message.toLowerCase().includes('bucket not found')) {
    return new Error('Image storage is temporarily unavailable. Please try again later.');
  }

  return error instanceof Error ? error : new Error(message);
};

export const validateMediaFile = (file: MediaFile): string | null => {
  if (!MEDIA_MIME_TYPES.includes(file.type as (typeof MEDIA_MIME_TYPES)[number])) {
    return 'Choose a JPG, PNG, or WebP image.';
  }

  if (file.size > MEDIA_MAX_FILE_SIZE) {
    return 'Image must be 2 MB or smaller.';
  }

  return null;
};

export const isManagedMediaPath = (value?: string | null): value is string =>
  Boolean(value && !/^(?:https?:|blob:|data:)/i.test(value) && value.split('/').length >= 4);

export const resolveMediaUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  if (!isManagedMediaPath(value)) return value;

  const encodedPath = value.split('/').map(encodeURIComponent).join('/');
  return `${getSupabaseConfig().url}/storage/v1/object/public/${MEDIA_BUCKET}/${encodedPath}`;
};

// Upload paths are namespaced by the profile id (the minted JWT's subject),
// which is what the storage RLS policies check ownership against.
const requireProfileId = async (): Promise<string> => {
  const profileId = await getAuthenticatedProfileId();
  if (!profileId) throw new Error('Authentication required.');
  return profileId;
};

const uploadWebp = async (path: string, blob: Blob): Promise<string> => {
  const { error } = await getSupabaseBrowserClient().storage.from(MEDIA_BUCKET).upload(path, blob, {
    cacheControl: '31536000',
    contentType: 'image/webp',
    upsert: false,
  });

  if (error) throw toMediaStorageError(error);
  return path;
};

const createAssetId = () => crypto.randomUUID();

export const mediaService = {
  deleteManagedObject: async (path?: string | null): Promise<void> => {
    if (!isManagedMediaPath(path)) return;

    const { error } = await getSupabaseBrowserClient().storage.from(MEDIA_BUCKET).remove([path]);
    if (error) throw toMediaStorageError(error);
  },

  uploadProfileAvatar: async (blob: Blob): Promise<string> => {
    const profileId = await requireProfileId();
    return uploadWebp(`${profileId}/profiles/avatar/${createAssetId()}.webp`, blob);
  },

  uploadStartupLogo: async (startupId: string, blob: Blob): Promise<string> => {
    const profileId = await requireProfileId();
    return uploadWebp(`${profileId}/startups/${startupId}/logo/${createAssetId()}.webp`, blob);
  },
};
