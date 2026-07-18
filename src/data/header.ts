import type { LucideIcon } from 'lucide-react';
import { CircleHelp, Globe, Info, LayoutDashboard, LayoutGrid, Rocket, UserRound } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  highlight?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/#about',
    icon: Info,
  },
  {
    id: 'process',
    label: 'How it works',
    href: '/#process',
    icon: CircleHelp,
  },
  {
    id: 'features',
    label: 'Available now',
    href: '/#features',
    icon: LayoutGrid,
  },
  {
    id: 'orbital',
    label: 'The Orbital',
    href: '/orbital',
    icon: Globe,
    highlight: true,
  },
];

// Marketplace is not listed here: it renders as the persistent pill button
// next to the session button, same style and position in both auth states.
export const platformNavigationItems: NavigationItem[] = [
  {
    id: 'orbital',
    label: 'The Orbital',
    href: '/orbital',
    icon: Globe,
    highlight: true,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/dashboard/profile',
    icon: UserRound,
  },
  {
    id: 'my-startups',
    label: 'My Startups',
    href: '/dashboard/startups',
    icon: Rocket,
  },
];
