'use client';

import React, { useState } from 'react';
import { StartupFilters as IStartupFilters } from '@/services/startupService';
import { STARTUP_STAGES, CATEGORY_GROUPS, TECH_STACK_OPTIONS } from '@/data/startupTaxonomy';
import { cn } from '@/utils/cn';
import { ChevronDown, Search } from 'lucide-react';

interface StartupFiltersProps {
  filters: IStartupFilters;
  onChange: (filters: IStartupFilters) => void;
  className?: string;
}

type ArrayFilterKey = 'category' | 'stage' | 'techStack';
type SignalFilterKey = 'isRaising' | 'acquisitionStatus';
type SectionKey = 'category' | 'stage' | 'techStack';

const StartupFilters: React.FC<StartupFiltersProps> = ({ filters, onChange, className }) => {
  // The chip sections fold away by default - the sidebar stays short and the
  // active-count on each header keeps hidden selections visible.
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    category: false,
    stage: false,
    techStack: false,
  });

  const toggleSection = (key: SectionKey) => setOpenSections((current) => ({ ...current, [key]: !current[key] }));

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

  const chipButton = (key: ArrayFilterKey, value: string, activeClasses: string) => (
    <button
      key={value}
      onClick={() => handleToggle(key, value)}
      className={cn(
        'rounded-xl border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300',
        (filters[key] as string[] | undefined)?.includes(value)
          ? activeClasses
          : 'bg-black border-white/10 text-white/40 hover:border-white/30 hover:text-white',
      )}>
      {value}
    </button>
  );

  const sectionHeader = (key: SectionKey, label: string, count: number) => (
    <button
      type="button"
      onClick={() => toggleSection(key)}
      aria-expanded={openSections[key]}
      className="flex w-full cursor-pointer items-center justify-between py-1">
      <span className="text-xs font-bold uppercase tracking-widest text-white/40">
        {label}
        {count > 0 && <span className="text-primary-500"> · {count}</span>}
      </span>
      <ChevronDown
        aria-hidden="true"
        className={cn('size-4 text-white/30 transition-transform duration-300', openSections[key] && 'rotate-180')}
      />
    </button>
  );

  return (
    <div className={cn('space-y-5 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6', className)}>
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold text-white">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-xs text-white/40 hover:text-primary-500 uppercase tracking-widest font-bold transition-colors">
          Reset All
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={filters.search || ''}
          onChange={handleSearch}
          placeholder="Name or keyword..."
          className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 pr-11 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
        <Search aria-hidden="true" className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-white/25" />
      </div>

      {/* Categories */}
      <div className="border-b border-white/5 pb-4">
        {sectionHeader('category', 'Categories', filters.category?.length ?? 0)}
        {openSections.category && (
          <div className="space-y-3 pt-3">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.label} className="space-y-2">
                <span className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-white/25">
                  {group.label}
                </span>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((cat) =>
                    chipButton('category', cat, 'bg-primary-500/10 border-primary-500 text-primary-500'),
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stages */}
      <div className="border-b border-white/5 pb-4">
        {sectionHeader('stage', 'Stage', filters.stage?.length ?? 0)}
        {openSections.stage && (
          <div className="flex flex-wrap gap-2 pt-3">
            {STARTUP_STAGES.map((stage) => chipButton('stage', stage, 'bg-white/10 border-white/30 text-white'))}
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className="border-b border-white/5 pb-4">
        {sectionHeader('techStack', 'Tech Stack', filters.techStack?.length ?? 0)}
        {openSections.techStack && (
          <div className="flex flex-wrap gap-2 pt-3">
            {TECH_STACK_OPTIONS.map((tech) =>
              chipButton('techStack', tech, 'bg-primary-500/10 border-primary-500 text-primary-500'),
            )}
          </div>
        )}
      </div>

      {/* Market Signals */}
      <div className="space-y-3">
        <button
          onClick={() => handleSignalToggle('isRaising', true)}
          className={cn(
            'flex w-full items-center justify-between rounded-2xl border p-3.5 transition-all duration-300',
            filters.isRaising === true
              ? 'bg-[#14F195]/10 border-[#14F195]/40 text-[#14F195]'
              : 'bg-black border-white/5 text-white/40 hover:border-white/10',
          )}>
          <span className="text-xs font-bold uppercase tracking-widest">Raising Funds</span>
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              filters.isRaising === true ? 'animate-pulse bg-[#14F195]' : 'bg-white/10',
            )}
          />
        </button>

        <button
          onClick={() => handleSignalToggle('acquisitionStatus', 'open_to_discuss')}
          className={cn(
            'flex w-full items-center justify-between rounded-2xl border p-3.5 transition-all duration-300',
            filters.acquisitionStatus === 'open_to_discuss'
              ? 'bg-[#9945FF]/10 border-[#9945FF]/40 text-[#9945FF]'
              : 'bg-black border-white/5 text-white/40 hover:border-white/10',
          )}>
          <span className="text-xs font-bold uppercase tracking-widest">Open to Acquisition</span>
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              filters.acquisitionStatus === 'open_to_discuss' ? 'animate-pulse bg-[#9945FF]' : 'bg-white/10',
            )}
          />
        </button>
      </div>
    </div>
  );
};

export default StartupFilters;
