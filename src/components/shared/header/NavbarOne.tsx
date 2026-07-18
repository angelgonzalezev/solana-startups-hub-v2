'use client';

// Header v1
import { MobileMenuProvider } from '@/context/MobileMenuContext';
import { useAuth } from '@/context/AuthContext';
import { navigationItems, platformNavigationItems } from '@/data/header';
import { useNavbarScroll } from '@/hooks/useScrollHeader';
import { cn } from '@/utils/cn';
import { isNavItemActive } from '@/utils/isNavItemActive';
import { Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import MobileMenu from '../MobileMenu';
import Logo from './Logo';
import MobileMenuButton from './MobileMenuButton';
import WalletConnectButton from '../WalletConnectButton';
import NavItemLink from './NavItemLink';

interface NavbarOneProps {
  className?: string;
  btnClassName?: string;
}

const NavbarOne: FC<NavbarOneProps> = ({ className, btnClassName }) => {
  const { isScrolled } = useNavbarScroll(100);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const items = isAuthenticated ? platformNavigationItems : navigationItems;

  return (
    <MobileMenuProvider>
      <header>
        <div
          className={cn(
            'lp:!max-w-[1290px] fixed top-5 left-1/2 z-50 mx-auto flex w-full max-w-[350px] -translate-x-1/2 items-center justify-between rounded-full px-4 py-2 transition-all duration-500 ease-in-out min-[425px]:max-w-[400px] min-[500px]:max-w-[450px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] xl:py-1.5',
            isScrolled && 'top-2 transition-all duration-500 ease-in-out',
            className,
          )}>
          {/* logo */}
          <Logo />
          {/* navigation */}
          <nav className="hidden items-center lg:flex">
            <ul className="flex items-center">
              {items.map((item) => (
                <li key={item.id} className="group/nav py-2.5">
                  <NavItemLink item={item} isActive={isAuthenticated && isNavItemActive(pathname, item.href)} />
                </li>
              ))}
            </ul>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/startups"
              className="btn btn-white-dark btn-md inline-flex items-center gap-2 border border-white/10 hover:btn-primary">
              <Store aria-hidden="true" className="size-4" />
              <span>Marketplace</span>
            </Link>
            <WalletConnectButton className={cn('btn-sm', btnClassName)} />
          </div>
          {/* mobile menu btn */}
          <MobileMenuButton />
        </div>
        <MobileMenu />
      </header>
    </MobileMenuProvider>
  );
};

NavbarOne.displayName = 'NavbarOne';
export default NavbarOne;
