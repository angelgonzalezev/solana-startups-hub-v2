import { NavigationItem } from '@/data/header';
import { cn } from '@/utils/cn';
import Link from 'next/link';

export type NavItemVariant = 'default' | 'border' | 'white' | 'light';

interface NavItemLinkProps {
  item: NavigationItem;
  variant?: NavItemVariant;
  isActive?: boolean;
}

const getVariantClasses = (variant: NavItemVariant = 'default'): string => {
  const variants = {
    default:
      'flex items-center gap-1 px-4 py-2 border border-transparent group-hover/nav:border-stroke-2 group-hover/nav:dark:border-stroke-7 rounded-full group-hover/nav:bg-accent/20 group-hover/nav:dark:bg-transparent text-tagline-1 font-normal text-secondary/60 group-hover/nav:text-secondary dark:text-accent/60 group-hover/nav:dark:text-accent transition-all duration-200',
    border:
      "flex items-center gap-1 h-full relative text-tagline-1 font-normal text-secondary/60 group-hover/nav:text-secondary group-hover/nav:dark:text-accent dark:text-accent transition-all duration-200 overflow-hidden before:absolute before:bottom-0 before:left-0 before:h-px before:w-full before:origin-right before:scale-x-0 before:transition-transform before:duration-500 before:content-[''] hover:before:origin-left hover:before:scale-x-100 dark:before:bg-white before:bg-secondary",
    white:
      "flex items-center gap-1 h-full relative text-tagline-1 font-normal group-hover/nav:text-accent text-accent transition-all duration-200 before:absolute before:content-[''] before:bottom-0 before:left-0 before:h-px before:w-0 group-hover/nav:before:bg-accent before:transition-all before:duration-300 group-hover/nav:before:w-full ",
    light:
      'flex items-center gap-1 px-4 py-2 border border-transparent group-hover/nav:border-stroke-1 group-hover/nav:dark:border-transparent rounded-full group-hover/nav:bg-accent/20 group-hover/nav:dark:bg-secondary/20 text-tagline-1 font-normal text-accent/60 group-hover/nav:text-accent dark:text-accent/60 group-hover/nav:dark:text-accent transition-all duration-200',
  };

  return variants[variant];
};

const NavItemLink = ({ item, variant = 'default', isActive = false }: NavItemLinkProps) => {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        getVariantClasses(variant),
        isActive &&
          'border-stroke-2 dark:border-stroke-7 bg-accent/20 dark:bg-transparent text-secondary dark:text-accent',
      )}>
      <span
        className={cn(
          item.highlight && 'bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text font-semibold text-transparent',
        )}>
        {item.label}
      </span>
    </Link>
  );
};

export default NavItemLink;
