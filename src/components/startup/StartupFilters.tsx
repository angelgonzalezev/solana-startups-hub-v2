'use client';

import React from 'react';
import { StartupFilters as IStartupFilters } from '@/services/startupService';
import { STARTUP_STAGES, STARTUP_CATEGORIES, TECH_STACK_OPTIONS } from '@/data/startupTaxonomy';
import { cn } from '@/utils/cn';
import { Search } from 'lucide-react';

interface StartupFiltersProps {
  filters: IStartupFilters;
  onChange: (filters: IStartupFilters) => void;
  className?: string;
}

type ArrayFilterKey = 'category' | 'stage' | 'techStack';
type SignalFilterKey = 'isRaising' | 'acquisitionStatus';

const StartupFilters: React.FC<StartupFiltersProps> = ({ filters, onChange, className }) => {
  const handleToggle = <T extends ArrayFilterKey>(key: T, value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: updated as IStartupFilters[T] });
  };

  const handleSignalToggle = <T extends SignalFilterKey, V extends NonNullable<IStartupFilters[T]>>(
    key: T,
    value: V,
  ) => {
    const newValue = filters[key] === value ? undefined : value;
    onChange({ ...filters, [key]: newValue as IStartupFilters[T] });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const resetFilters = () => {
    onChange({});
  };

  return (
    <div className={cn('space-y-7 rounded-lg border border-white/10 bg-[#0A0A0A] p-5 sm:p-6', className)}>
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold text-white">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-xs text-white/40 hover:text-primary-500 uppercase tracking-widest font-bold transition-colors">
          Reset All
        </button>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <label className="text-xs text-white/40 uppercase tracking-widest font-bold ml-1">Search</label>
        <div className="relative">
          <input
            type="text"
            value={filters.search || ''}
            onChange={handleSearch}
            placeholder="Name or keyword..."
            className="w-full rounded-md border border-white/10 bg-black px-4 py-3 pr-11 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
          <Search aria-hidden="true" className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-white/25" />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <label className="text-xs text-white/40 uppercase tracking-widest font-bold ml-1">Categories</label>
        <div className="flex flex-wrap gap-2">
          {STARTUP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleToggle('category', cat)}
              className={cn(
                'rounded-md border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300',
                filters.category?.includes(cat)
                  ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                  : 'bg-black border-white/10 text-white/40 hover:border-white/30 hover:text-white',
              )}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-3">
        <label className="text-xs text-white/40 uppercase tracking-widest font-bold ml-1">Stage</label>
        <div className="flex flex-wrap gap-2">
          {STARTUP_STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => handleToggle('stage', stage)}
              className={cn(
                'rounded-md border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300',
                filters.stage?.includes(stage)
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-black border-white/10 text-white/40 hover:border-white/30 hover:text-white',
              )}>
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="space-y-3">
        <label className="text-xs text-white/40 uppercase tracking-widest font-bold ml-1">Tech Stack</label>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK_OPTIONS.map((tech) => (
            <button
              key={tech}
              onClick={() => handleToggle('techStack', tech)}
              className={cn(
                'rounded-md border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300',
                filters.techStack?.includes(tech)
                  ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                  : 'bg-black border-white/10 text-white/40 hover:border-white/30 hover:text-white',
              )}>
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Market Signals */}
      <div className="space-y-4 pt-2">
        <button
          onClick={() => handleSignalToggle('isRaising', true)}
          className={cn(
            'flex w-full items-center justify-between rounded-md border p-4 transition-all duration-300',
            filters.isRaising === true
              ? 'bg-[#14F195]/10 border-[#14F195]/40 text-[#14F195]'
              : 'bg-black border-white/5 text-white/40 hover:border-white/10',
          )}>
          <span className="text-sm font-bold uppercase tracking-widest">Raising Funds</span>
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              filters.isRaising === true ? 'bg-[#14F195] animate-pulse' : 'bg-white/10',
            )}
          />
        </button>

        <button
          onClick={() => handleSignalToggle('acquisitionStatus', 'open_to_discuss')}
          className={cn(
            'flex w-full items-center justify-between rounded-md border p-4 transition-all duration-300',
            filters.acquisitionStatus === 'open_to_discuss'
              ? 'bg-[#9945FF]/10 border-[#9945FF]/40 text-[#9945FF]'
              : 'bg-black border-white/5 text-white/40 hover:border-white/10',
          )}>
          <span className="text-sm font-bold uppercase tracking-widest">Open to Acquisition</span>
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              filters.acquisitionStatus === 'open_to_discuss' ? 'bg-[#9945FF] animate-pulse' : 'bg-white/10',
            )}
          />
        </button>
      </div>
    </div>
  );
};

export default StartupFilters;
