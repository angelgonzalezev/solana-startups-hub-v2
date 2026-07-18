'use client';

import { useAuth } from '@/context/AuthContext';
import { useMobileMenuContext } from '@/context/MobileMenuContext';
import { navigationItems, platformNavigationItems } from '@/data/header';
import { cn } from '@/utils/cn';
import { isNavItemActive } from '@/utils/isNavItemActive';
import { LayoutGrid, LogOut, Store, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import WalletConnectButton from './WalletConnectButton';
import Logo from './header/Logo';

const MobileMenu = () => {
  const { isOpen, closeMenu } = useMobileMenuContext();
  const { isAuthenticated, signOut } = useAuth();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const items = isAuthenticated ? platformNavigationItems : navigationItems;

  useEffect(() => {
    if (!isOpen) return;

    sidebarRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  return (
    <div className={cn('fixed inset-0 z-[999] lg:hidden', !isOpen && 'pointer-events-none')} aria-hidden={!isOpen}>
      <button
        type="button"
        onClick={closeMenu}
        aria-label="Close mobile menu"
        tabIndex={isOpen ? 0 : -1}
        className={cn(
          'absolute inset-0 bg-black/60 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        tabIndex={-1}
        className={cn(
          'scroll-bar absolute top-0 right-0 h-dvh w-full max-w-sm border-l border-white/10 bg-[#080808] shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}>
        <div className="flex h-full flex-col gap-8 p-5 sm:p-8">
          <div className="flex items-center justify-between">
            <div onClick={closeMenu}>
              <Logo />
            </div>
            <button
              type="button"
              onClick={closeMenu}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/25 hover:text-white"
              aria-label="Close mobile menu">
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="flex-1 border-t border-white/10 pt-6">
            <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/35">
              {isAuthenticated ? 'Your workspace' : 'Explore Orbital'}
            </p>
            <ul className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon ?? LayoutGrid;
                const isActive = isAuthenticated && isNavItemActive(pathname, item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex min-h-14 items-center gap-3 rounded-md px-4 text-base font-medium transition-colors',
                        isActive ? 'bg-white/5 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
                      )}>
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          'size-5',
                          isActive ? 'text-white' : 'text-white/35',
                          item.highlight && 'text-[#9945FF]',
                        )}
                      />
                      <span
                        className={cn(
                          item.highlight &&
                            'bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text font-semibold text-transparent',
                        )}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="space-y-3 border-t border-white/10 pt-5">
            <Link
              href="/startups"
              onClick={closeMenu}
              className="btn btn-white-dark btn-md flex w-full items-center justify-center gap-2 border border-white/10">
              <Store aria-hidden="true" className="size-4" />
              <span>Marketplace</span>
            </Link>
            <div onClick={closeMenu}>
              <WalletConnectButton className="w-full" />
            </div>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  void signOut();
                  closeMenu();
                }}
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 text-sm font-medium text-white/60 transition-colors hover:border-white/25 hover:text-white">
                <LogOut aria-hidden="true" className="size-4" />
                Sign out
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MobileMenu;
