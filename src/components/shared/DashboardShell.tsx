'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import NavbarOne from './header/NavbarOne';
import FooterOne from './footer/FooterOne';
import RevealAnimation from '../animation/RevealAnimation';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const navItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My Profile', href: '/dashboard/profile' },
  { label: 'My Startups', href: '/dashboard/startups' },
  { label: 'Marketplace', href: '/startups' },
];

const DashboardShell: React.FC<DashboardShellProps> = ({ children, title, subtitle, actions }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavbarOne
        className="bg-black/60 backdrop-blur-[25px] border border-white/10 top-5"
        btnClassName="btn-primary hover:btn-white"
      />

      <main className="flex-grow pt-[150px] pb-20">
        <div className="main-container">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="space-y-2 sticky top-[150px]">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'block px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-300 border',
                        isActive
                          ? 'bg-primary-500/10 border-primary-500/30 text-primary-500 shadow-lg shadow-primary-500/5'
                          : 'bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white',
                      )}>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-grow space-y-10">
              {(title || subtitle || actions) && (
                <RevealAnimation delay={0.1}>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                    <div className="space-y-2">
                      {title && <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{title}</h1>}
                      {subtitle && <p className="text-white/60 text-lg">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap gap-4">{actions}</div>}
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
