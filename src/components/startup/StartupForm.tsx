'use client';

import Image from 'next/image';
import { Search, Trash2, UserPlus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Startup, TeamMember } from '@/interface/startup';
import { User } from '@/interface/user';
import { validateStartup, ValidationError } from '@/utils/validation';
import { startupService } from '@/services/startupService';
import { userService } from '@/services/userService';
import { resolveMediaUrl } from '@/services/mediaService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import { STARTUP_STAGES, STARTUP_CATEGORIES, TECH_STACK_OPTIONS } from '@/data/startupTaxonomy';
import ImageUploader from '@/components/shared/ImageUploader';
import { KEEP_MEDIA, type MediaMutation } from '@/interface/media';

interface StartupFormProps {
  initialData?: Partial<Startup>;
  onSave?: (startup: Startup) => void;
  isEditing?: boolean;
}

const StartupForm: React.FC<StartupFormProps> = ({ initialData, onSave, isEditing = false }) => {
  const { walletAddress } = useAuth();
  const [formData, setFormData] = useState<Partial<Startup>>(
    initialData || {
      name: '',
      logo: '',
      oneLiner: '',
      description: '',
      website: '',
      twitter: '',
      discord: '',
      github: '',
      stage: 'Idea',
      isRaising: false,
      acquisitionStatus: 'not_open',
      mrr: 0,
      showMrr: false,
      teamSize: 1,
      techStack: [],
      category: [],
    },
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [logoMutation, setLogoMutation] = useState<MediaMutation>(KEEP_MEDIA);
  const [isTeamSearchOpen, setIsTeamSearchOpen] = useState(false);
  const [teamQuery, setTeamQuery] = useState('');
  const [teamResults, setTeamResults] = useState<User[]>([]);
  const [isSearchingTeam, setIsSearchingTeam] = useState(false);
  const [teamSearchError, setTeamSearchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    let val: string | number | boolean | undefined = value;
    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    } else if (name === 'teamSize' || name === 'mrr') {
      val = value === '' ? undefined : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => prev.filter((err) => err.field !== name));
  };

  const handleToggle = (name: 'showMrr' | 'isRaising') => {
    setFormData((prev) => ({ ...prev, [name]: !Boolean(prev[name]) }));
  };

  const handleArrayToggle = (name: 'category' | 'techStack', value: string) => {
    setFormData((prev) => {
      const current = (prev[name] as string[]) || [];
      const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
      return { ...prev, [name]: updated };
    });
    setErrors((prev) => prev.filter((err) => err.field !== name));
  };

  useEffect(() => {
    if (!isTeamSearchOpen || teamQuery.trim().length < 2) {
      setTeamResults([]);
      setTeamSearchError(null);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setIsSearchingTeam(true);
      setTeamSearchError(null);
      try {
        const results = await userService.searchUsers(teamQuery);
        if (!cancelled) {
          const selectedWallets = new Set((formData.team || []).map((member) => member.walletAddress));
          setTeamResults(results.filter((profile) => !selectedWallets.has(profile.walletAddress)));
        }
      } catch (error) {
        if (!cancelled) {
          setTeamSearchError(error instanceof Error ? error.message : 'Unable to search users.');
        }
      } finally {
        if (!cancelled) setIsSearchingTeam(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [formData.team, isTeamSearchOpen, teamQuery]);

  const addTeamMember = (user: User) => {
    const nextMember: TeamMember = {
      avatar: user.avatar,
      displayName: user.displayName,
      jobTitle: user.jobTitle,
      role: 'Collaborator',
      walletAddress: user.walletAddress,
    };

    setFormData((prev) => {
      const currentTeam = prev.team || [];
      if (currentTeam.some((member) => member.walletAddress === user.walletAddress)) return prev;
      const nextTeam = [...currentTeam, nextMember];
      return { ...prev, team: nextTeam, teamSize: Math.max(Number(prev.teamSize) || 1, nextTeam.length) };
    });
    setTeamQuery('');
    setTeamResults([]);
    setIsTeamSearchOpen(false);
  };

  const removeTeamMember = (wallet: string) => {
    setFormData((prev) => {
      const nextTeam = (prev.team || []).filter((member) => member.walletAddress !== wallet);
      return { ...prev, team: nextTeam, teamSize: Math.max(1, nextTeam.length) };
    });
  };

  const updateTeamMemberRole = (wallet: string, role: string) => {
    setFormData((prev) => ({
      ...prev,
      team: (prev.team || []).map((member) => (member.walletAddress === wallet ? { ...member, role } : member)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;

    const validationErrors = validateStartup(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstError = document.getElementsByName(validationErrors[0].field)[0];
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      let result: Startup;
      if (isEditing && formData.id) {
        result = await startupService.updateStartup(formData.id, formData, logoMutation);
        setMessage({ type: 'success', text: 'Startup updated successfully!' });
      } else {
        result = await startupService.createStartup(formData, logoMutation);
        setMessage({ type: 'success', text: 'Startup created as draft!' });
      }
      if (onSave) onSave(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save startup.';
      setMessage({
        type: 'error',
        text: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getError = (field: string) => errors.find((e) => e.field === field)?.message;
  const teamMembers = formData.team || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="space-y-8 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Startup Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name ?? ''}
              onChange={handleChange}
              placeholder="e.g. Solana Pay Pro"
              className={cn(
                'w-full rounded-2xl border bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4',
                getError('name') ? 'border-red-500/50' : 'border-white/10',
              )}
            />
            {getError('name') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('name')}</p>}
          </div>

          <ImageUploader
            label="Startup logo"
            value={formData.logo}
            mutation={logoMutation}
            onMutation={setLogoMutation}
          />

          {/* One Liner */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">One-Liner (High Concept Pitch) *</label>
            <input
              type="text"
              name="oneLiner"
              value={formData.oneLiner ?? ''}
              onChange={handleChange}
              placeholder="The ultimate payment gateway for Solana merchants."
              maxLength={160}
              className={cn(
                'w-full rounded-2xl border bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4',
                getError('oneLiner') ? 'border-red-500/50' : 'border-white/10',
              )}
            />
            <div className="flex justify-between mt-1 px-1">
              {getError('oneLiner') && <p className="text-red-500 text-xs">{getError('oneLiner')}</p>}
              <p className="text-white/20 text-xs ml-auto">{formData.oneLiner?.length || 0}/160</p>
            </div>
          </div>

          {/* Description */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">
              Description (200-2000 chars for verification)
            </label>
            <textarea
              name="description"
              value={formData.description ?? ''}
              onChange={handleChange}
              placeholder="Describe your startup, the problem it solves, and its unique value proposition..."
              rows={6}
              className={cn(
                'w-full rounded-2xl border bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4',
                getError('description') ? 'border-red-500/50' : 'border-white/10',
              )}
            />
            <div className="flex justify-between mt-1 px-1">
              {getError('description') && <p className="text-red-500 text-xs">{getError('description')}</p>}
              <p className="text-white/20 text-xs ml-auto">{formData.description?.length || 0}/2000</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-4">Links & Socials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Website */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Website URL *</label>
            <input
              type="text"
              name="website"
              value={formData.website ?? ''}
              onChange={handleChange}
              placeholder="https://..."
              className={cn(
                'w-full rounded-2xl border bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4',
                getError('website') ? 'border-red-500/50' : 'border-white/10',
              )}
            />
            {getError('website') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('website')}</p>}
          </div>

          {/* Twitter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">X (Twitter) URL *</label>
            <input
              type="text"
              name="twitter"
              value={formData.twitter ?? ''}
              onChange={handleChange}
              placeholder="https://x.com/..."
              className={cn(
                'w-full rounded-2xl border bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4',
                getError('twitter') ? 'border-red-500/50' : 'border-white/10',
              )}
            />
            {getError('twitter') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('twitter')}</p>}
          </div>

          {/* Discord */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Discord URL</label>
            <input
              type="text"
              name="discord"
              value={formData.discord ?? ''}
              onChange={handleChange}
              placeholder="https://discord.gg/..."
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4"
            />
          </div>

          {/* GitHub */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">GitHub URL</label>
            <input
              type="text"
              name="github"
              value={formData.github ?? ''}
              onChange={handleChange}
              placeholder="https://github.com/..."
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-4">Stage & Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stage */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Startup Stage *</label>
            <select
              name="stage"
              value={formData.stage ?? 'Idea'}
              onChange={handleChange}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4">
              {STARTUP_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Team Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Team Size *</label>
            <input
              type="number"
              name="teamSize"
              value={formData.teamSize ?? ''}
              onChange={handleChange}
              min={1}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4"
            />
          </div>

          {/* MRR */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Monthly Recurring Revenue (USD)</label>
            <input
              type="number"
              name="mrr"
              value={formData.mrr ?? ''}
              onChange={handleChange}
              min={0}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4"
            />
          </div>

          {/* Show MRR Toggle */}
          <div className="flex items-center space-x-4 h-full pt-6">
            <button
              type="button"
              onClick={() => handleToggle('showMrr')}
              className={cn(
                'w-12 h-6 rounded-full transition-all duration-300 relative',
                formData.showMrr ? 'bg-primary-500' : 'bg-white/10',
              )}>
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300',
                  formData.showMrr ? 'left-7' : 'left-1',
                )}
              />
            </button>
            <label className="text-sm font-medium text-white/80 cursor-pointer" onClick={() => handleToggle('showMrr')}>
              Show MRR publicly to logged in users
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-8 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-4">Market Signals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Is Raising */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => handleToggle('isRaising')}
              className={cn(
                'w-12 h-6 rounded-full transition-all duration-300 relative',
                formData.isRaising ? 'bg-[#14F195]' : 'bg-white/10',
              )}>
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300',
                  formData.isRaising ? 'left-7' : 'left-1',
                )}
              />
            </button>
            <div className="space-y-0.5">
              <label className="text-lg font-bold text-white cursor-pointer" onClick={() => handleToggle('isRaising')}>
                Is Raising Funds
              </label>
              <p className="text-white/40 text-sm">Public signal that you are looking for investors.</p>
            </div>
          </div>

          {/* Acquisition Status */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    acquisitionStatus: prev.acquisitionStatus === 'open_to_discuss' ? 'not_open' : 'open_to_discuss',
                  }))
                }
                className={cn(
                  'w-12 h-6 rounded-full transition-all duration-300 relative',
                  formData.acquisitionStatus === 'open_to_discuss' ? 'bg-[#9945FF]' : 'bg-white/10',
                )}>
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300',
                    formData.acquisitionStatus === 'open_to_discuss' ? 'left-7' : 'left-1',
                  )}
                />
              </button>
              <div className="space-y-0.5">
                <label
                  className="text-lg font-bold text-white cursor-pointer"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      acquisitionStatus: prev.acquisitionStatus === 'open_to_discuss' ? 'not_open' : 'open_to_discuss',
                    }))
                  }>
                  Open to Acquisition
                </label>
                <p className="text-white/40 text-sm">Open to initial conversations about acquisition.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Team & Collaborators</h2>
            <p className="mt-2 text-sm text-white/40">
              Tag registered users so they appear on the startup detail page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsTeamSearchOpen((value) => !value)}
            className="btn btn-white-dark btn-sm !inline-flex items-center justify-center gap-2 self-start sm:self-auto">
            {isTeamSearchOpen ? (
              <X aria-hidden="true" className="size-4" />
            ) : (
              <UserPlus aria-hidden="true" className="size-4" />
            )}
            {isTeamSearchOpen ? 'Close' : 'Add collaborator'}
          </button>
        </div>

        {isTeamSearchOpen && (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
            <label className="text-sm font-medium text-white/60">Search by user name or wallet</label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30"
              />
              <input
                type="search"
                value={teamQuery}
                onChange={(event) => setTeamQuery(event.target.value)}
                placeholder="Type a name or wallet address"
                className="w-full rounded-2xl border border-white/10 bg-[#0A0A0A] py-3.5 pl-11 pr-4 text-white transition-all placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>

            {teamSearchError && <p className="text-sm text-red-400">{teamSearchError}</p>}
            {isSearchingTeam && <p className="text-sm text-white/40">Searching users...</p>}
            {!isSearchingTeam && teamQuery.trim().length >= 2 && teamResults.length === 0 && (
              <p className="text-sm text-white/40">No registered users found.</p>
            )}

            {teamResults.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {teamResults.map((user) => {
                  const avatarUrl = resolveMediaUrl(user.avatar);

                  return (
                    <button
                      type="button"
                      key={user.walletAddress}
                      onClick={() => addTeamMember(user)}
                      className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-primary-500/50 hover:bg-primary-500/5">
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt={user.displayName} fill className="object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white/20">
                            {user.displayName.slice(0, 1).toUpperCase() || '?'}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-white">{user.displayName}</span>
                        <span className="block truncate text-xs text-white/35">{user.walletAddress}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {teamMembers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black p-5 text-sm text-white/40">
              No collaborators added yet. The startup owner is kept as the founder when the startup is created.
            </div>
          ) : (
            teamMembers.map((member) => {
              const avatarUrl = resolveMediaUrl(member.avatar);
              const isOwner = member.walletAddress === walletAddress;

              return (
                <div
                  key={member.walletAddress}
                  className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-black p-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={member.displayName || member.walletAddress}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/20">
                          {(member.displayName || member.walletAddress).slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{member.displayName || 'Registered user'}</p>
                      <p className="truncate text-xs text-white/35">{member.walletAddress}</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={member.role}
                    onChange={(event) => updateTeamMemberRole(member.walletAddress, event.target.value)}
                    placeholder="Role"
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0A] px-3 py-2.5 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />

                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => removeTeamMember(member.walletAddress)}
                    className="btn btn-white-dark btn-sm !inline-flex items-center justify-center gap-2 border-red-500/20 text-red-400 disabled:cursor-not-allowed disabled:opacity-40">
                    <Trash2 aria-hidden="true" className="size-4" />
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="space-y-8 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-4">Taxonomy</h2>

        {/* Categories */}
        <div className="space-y-4">
          <label className="text-lg font-bold text-white ml-1">Categories (1-5) *</label>
          <div className="flex flex-wrap gap-3">
            {STARTUP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleArrayToggle('category', cat)}
                className={cn(
                  'rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300',
                  formData.category?.includes(cat)
                    ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                    : 'bg-black border-white/10 text-white/50 hover:border-white/30 hover:text-white',
                )}>
                {cat}
              </button>
            ))}
          </div>
          {getError('category') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('category')}</p>}
        </div>

        {/* Tech Stack */}
        <div className="space-y-4">
          <label className="text-lg font-bold text-white ml-1">Tech Stack (1-10) *</label>
          <div className="flex flex-wrap gap-3">
            {TECH_STACK_OPTIONS.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => handleArrayToggle('techStack', tech)}
                className={cn(
                  'rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300',
                  formData.techStack?.includes(tech)
                    ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                    : 'bg-black border-white/10 text-white/50 hover:border-white/30 hover:text-white',
                )}>
                {tech}
              </button>
            ))}
          </div>
          {getError('techStack') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('techStack')}</p>}
        </div>
      </div>

      <div className="z-30 sm:sticky sm:bottom-6">
        <div className="flex flex-col items-stretch justify-between gap-5 rounded-[30px] border border-white/10 bg-black/90 p-5 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:p-6">
          <div className="text-white/60 text-sm">* Required fields for verification.</div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-xl w-full sm:w-auto shadow-lg shadow-primary-500/20 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Draft'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={cn(
              'mt-6 rounded-2xl border p-4 text-center font-medium animate-in fade-in slide-in-from-bottom-4 duration-300',
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                : 'bg-red-500/10 border-red-500/20 text-red-500',
            )}>
            {message.text}
          </div>
        )}
      </div>
    </form>
  );
};

export default StartupForm;
