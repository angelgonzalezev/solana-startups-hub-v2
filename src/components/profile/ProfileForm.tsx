'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/interface/user';
import { validateProfile, ValidationError } from '@/utils/validation';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import ImageUploader from '@/components/shared/ImageUploader';
import { KEEP_MEDIA, type MediaMutation } from '@/interface/media';

interface ProfileFormProps {
  initialData: User | null;
  onSave?: (user: User) => void;
}

const normalizeProfileFormData = (user: User | null): Partial<User> => ({
  username: user?.username ?? '',
  displayName: user?.displayName ?? '',
  jobTitle: user?.jobTitle ?? '',
  twitterHandle: user?.twitterHandle ?? '',
  telegramHandle: user?.telegramHandle ?? '',
  bio: user?.bio ?? '',
  avatar: user?.avatar ?? '',
});

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSave }) => {
  const { refreshUser, walletAddress } = useAuth();
  const [formData, setFormData] = useState<Partial<User>>(() => normalizeProfileFormData(initialData));
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [avatarMutation, setAvatarMutation] = useState<MediaMutation>(KEEP_MEDIA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setFormData(normalizeProfileFormData(initialData));
    setAvatarMutation(KEEP_MEDIA);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Usernames are lowercase by definition; normalize while typing.
    setFormData((prev) => ({ ...prev, [name]: name === 'username' ? value.toLowerCase() : value }));
    // Clear error for this field
    setErrors((prev) => prev.filter((err) => err.field !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;

    const validationErrors = validateProfile(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const updatedUser = await userService.upsertProfile(formData, avatarMutation);
      setFormData(normalizeProfileFormData(updatedUser));
      setAvatarMutation(KEEP_MEDIA);
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      if (onSave) onSave(updatedUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile.';
      setMessage({ type: 'error', text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6 md:p-8">
      {/* Username */}
      <div className="space-y-2">
        <label htmlFor="profile-username" className="text-sm font-medium text-white/60 ml-1">
          Username
        </label>
        <div className="relative">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 text-lg">@</span>
          <input
            id="profile-username"
            type="text"
            name="username"
            value={formData.username ?? ''}
            onChange={handleChange}
            placeholder="username"
            autoComplete="username"
            maxLength={30}
            className={cn(
              'w-full rounded-2xl border bg-black py-3.5 pl-10 pr-4 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:py-4 sm:pl-11 sm:pr-5',
              getError('username') ? 'border-red-500/50' : 'border-white/10',
            )}
          />
        </div>
        {getError('username') ? (
          <p className="text-red-500 text-xs mt-1 ml-1">{getError('username')}</p>
        ) : formData.username ? (
          <p className="text-white/30 text-xs mt-1 ml-1">Your public page: orbitalhub.dev/{formData.username}</p>
        ) : (
          <p className="text-white/30 text-xs mt-1 ml-1">
            Claim a username to unlock your public page at orbitalhub.dev/username
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Display Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60 ml-1">Display Name *</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName ?? ''}
            onChange={handleChange}
            placeholder="Alex Rivera"
            className={cn(
              'w-full rounded-2xl border bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4',
              getError('displayName') ? 'border-red-500/50' : 'border-white/10',
            )}
          />
          {getError('displayName') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('displayName')}</p>}
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60 ml-1">Job Title *</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle ?? ''}
            onChange={handleChange}
            placeholder="Founder, Lead Dev, Designer..."
            className={cn(
              'w-full rounded-2xl border bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4',
              getError('jobTitle') ? 'border-red-500/50' : 'border-white/10',
            )}
          />
          {getError('jobTitle') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('jobTitle')}</p>}
        </div>

        {/* Twitter Handle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60 ml-1">X (Twitter) Handle</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 text-lg">@</span>
            <input
              type="text"
              name="twitterHandle"
              value={formData.twitterHandle ?? ''}
              onChange={handleChange}
              placeholder="username"
              className={cn(
                'w-full rounded-2xl border bg-black py-3.5 pl-10 pr-4 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:py-4 sm:pl-11 sm:pr-5',
                getError('twitterHandle') ? 'border-red-500/50' : 'border-white/10',
              )}
            />
          </div>
          {getError('twitterHandle') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('twitterHandle')}</p>}
        </div>

        {/* Telegram Handle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60 ml-1">Telegram Handle</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 text-lg">@</span>
            <input
              type="text"
              name="telegramHandle"
              value={formData.telegramHandle ?? ''}
              onChange={handleChange}
              placeholder="username"
              className={cn(
                'w-full rounded-2xl border bg-black py-3.5 pl-10 pr-4 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:py-4 sm:pl-11 sm:pr-5',
                getError('telegramHandle') ? 'border-red-500/50' : 'border-white/10',
              )}
            />
          </div>
          {getError('telegramHandle') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('telegramHandle')}</p>}
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/60 ml-1">Bio</label>
        <textarea
          name="bio"
          value={formData.bio ?? ''}
          onChange={handleChange}
          placeholder="Tell the community about yourself..."
          rows={4}
          className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4"
        />
      </div>

      <ImageUploader
        label="Profile image"
        value={formData.avatar}
        mutation={avatarMutation}
        onMutation={setAvatarMutation}
      />

      {message && (
        <div
          className={cn(
            'rounded-2xl border p-4 text-center font-medium',
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-500'
              : 'bg-red-500/10 border-red-500/20 text-red-500',
          )}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary btn-xl w-full sm:w-auto shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;
