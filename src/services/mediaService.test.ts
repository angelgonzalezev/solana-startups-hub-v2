import { describe, expect, it } from 'vitest';
import {
  isManagedMediaPath,
  MEDIA_MAX_FILE_SIZE,
  resolveMediaUrl,
  toMediaStorageError,
  validateMediaFile,
} from './mediaService';

describe('mediaService helpers', () => {
  it('accepts supported images within the 2 MB limit', () => {
    expect(validateMediaFile({ size: MEDIA_MAX_FILE_SIZE, type: 'image/webp' })).toBeNull();
  });

  it('rejects unsupported formats and oversized images', () => {
    expect(validateMediaFile({ size: 100, type: 'image/svg+xml' })).toMatch(/JPG/);
    expect(validateMediaFile({ size: MEDIA_MAX_FILE_SIZE + 1, type: 'image/png' })).toMatch(/2 MB/);
  });

  it('distinguishes managed object paths from legacy and temporary URLs', () => {
    expect(isManagedMediaPath('auth-id/startups/startup-id/logo/asset.webp')).toBe(true);
    expect(isManagedMediaPath('https://api.dicebear.com/avatar.svg')).toBe(false);
    expect(isManagedMediaPath('blob:http://localhost/asset')).toBe(false);
    expect(isManagedMediaPath('short/path')).toBe(false);
  });

  it('resolves managed paths while preserving legacy URLs', () => {
    expect(resolveMediaUrl('auth-id/profiles/avatar/asset name.webp')).toBe(
      'http://127.0.0.1:54321/storage/v1/object/public/media/auth-id/profiles/avatar/asset%20name.webp',
    );
    expect(resolveMediaUrl('https://example.com/avatar.webp')).toBe('https://example.com/avatar.webp');
  });

  it('hides missing bucket infrastructure details from users', () => {
    expect(toMediaStorageError({ message: 'Bucket not found' }).message).toBe(
      'Image storage is temporarily unavailable. Please try again later.',
    );
  });
});
