'use client';

import React, { useState } from 'react';
import { Startup } from '@/interface/startup';
import { validateStartup, ValidationError } from '@/utils/validation';
import { startupService } from '@/services/startupService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import { STARTUP_STAGES, STARTUP_CATEGORIES, TECH_STACK_OPTIONS } from '@/data/startupTaxonomy';

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
        result = await startupService.updateStartup(formData.id, formData);
        setMessage({ type: 'success', text: 'Startup updated successfully!' });
      } else {
        result = await startupService.createStartup(formData);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="bg-[#0A0A0A] p-8 md:p-10 border border-white/5 rounded-[30px] space-y-10">
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
                'w-full bg-black border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
                getError('name') ? 'border-red-500/50' : 'border-white/10',
              )}
            />
            {getError('name') && <p className="text-red-500 text-xs mt-1 ml-1">{getError('name')}</p>}
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Logo URL</label>
            <input
              type="text"
              name="logo"
              value={formData.logo ?? ''}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>

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
                'w-full bg-black border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
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
                'w-full bg-black border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
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

      <div className="bg-[#0A0A0A] p-8 md:p-10 border border-white/5 rounded-[30px] space-y-10">
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
                'w-full bg-black border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
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
                'w-full bg-black border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
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
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
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
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0A0A0A] p-8 md:p-10 border border-white/5 rounded-[30px] space-y-10">
        <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-4">Stage & Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stage */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Startup Stage *</label>
            <select
              name="stage"
              value={formData.stage ?? 'Idea'}
              onChange={handleChange}
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none">
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
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
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
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
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

      <div className="bg-[#0A0A0A] p-8 md:p-10 border border-white/5 rounded-[30px] space-y-10">
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

      <div className="bg-[#0A0A0A] p-8 md:p-10 border border-white/5 rounded-[30px] space-y-10">
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
                  'px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300',
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
                  'px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300',
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

      <div className="sticky bottom-10 z-30">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-6 rounded-[30px] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
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
              'mt-6 p-4 rounded-2xl text-center font-medium border animate-in fade-in slide-in-from-bottom-4 duration-300',
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
