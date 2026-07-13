'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import NavbarOne from './header/NavbarOne';
import FooterOne from './footer/FooterOne';
import RevealAnimation from '../animation/RevealAnimation';
import { LayoutDashboard, Rocket, Store, UserRound } from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/dashboard/profile', icon: UserRound },
  { label: 'My Startups', href: '/dashboard/startups', icon: Rocket },
  { label: 'Marketplace', href: '/startups', icon: Store },
];

const DashboardShell: React.FC<DashboardShellProps> = ({ children, title, subtitle, actions }) => {
  const pathname = usePathname();
  const isItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    if (href === '/startups') return pathname === href || pathname.startsWith('/startups/');
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavbarOne
        className="bg-black/60 backdrop-blur-[25px] border border-white/10 top-5"
        btnClassName="btn-primary hover:btn-white"
      />

      <main className="flex-grow pb-16 pt-[112px] md:pt-[130px] lg:pb-20 lg:pt-[150px]">
        <div className="main-container">
          <nav
            aria-label="Dashboard sections"
            className="scroll-bar sticky top-[82px] z-30 -mx-5 mb-8 flex gap-2 overflow-x-auto border-y border-white/10 bg-black/95 px-5 py-3 backdrop-blur-md lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary-500/40 bg-primary-500/10 text-white'
                      : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white',
                  )}>
                  <Icon aria-hidden="true" className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-10 lg:flex-row">
            {/* Sidebar Navigation */}
            <aside className="hidden flex-shrink-0 lg:block lg:w-64">
              <nav className="sticky top-[130px] space-y-2" aria-label="Dashboard sections">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-base font-medium transition-colors',
                        isActive
                          ? 'border-primary-500/30 bg-primary-500/10 text-primary-400'
                          : 'bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white',
                      )}>
                      <Icon aria-hidden="true" className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="min-w-0 flex-grow space-y-8 md:space-y-10">
              {(title || subtitle || actions) && (
                <RevealAnimation delay={0.1}>
                  <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:pb-8">
                    <div className="space-y-2">
                      {title && <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{title}</h1>}
                      {subtitle && <p className="text-base leading-7 text-white/60 md:text-lg">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{actions}</div>}
                  </div>
                </RevealAnimation>
              )}

              <RevealAnimation delay={0.2}>
                <div>{children}</div>
              </RevealAnimation>
            </div>
          </div>
        </div>
      </main>

      <FooterOne className="bg-black border-t border-white/10" />
    </div>
  );
};

export default DashboardShell;
