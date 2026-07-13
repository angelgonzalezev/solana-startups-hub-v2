'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/interface/user';
import { validateProfile, ValidationError } from '@/utils/validation';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

interface ProfileFormProps {
  initialData: User | null;
  onSave?: (user: User) => void;
}

const normalizeProfileFormData = (user: User | null): Partial<User> => ({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setFormData(normalizeProfileFormData(initialData));
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const updatedUser = await userService.upsertProfile(formData);
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
    <form onSubmit={handleSubmit} className="space-y-8 bg-[#0A0A0A] p-8 md:p-10 border border-white/5 rounded-[30px]">
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
              'w-full bg-black border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
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
              'w-full bg-black border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
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
                'w-full bg-black border rounded-2xl pl-11 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
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
                'w-full bg-black border rounded-2xl pl-11 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
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
          className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
        />
      </div>

      {/* Avatar URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/60 ml-1">Avatar URL</label>
        <input
          type="text"
          name="avatar"
          value={formData.avatar ?? ''}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
        />
      </div>

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
