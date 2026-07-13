import RevealAnimation from '@/components/animation/RevealAnimation';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';
import FooterDivider from './FooterDivider';
import FooterLeftGradient from './FooterLeftGradient';
import FooterRightGradient from './FooterRightGradient';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Explore startups', href: '/startups' },
      { label: 'Founder dashboard', href: '/dashboard' },
      { label: 'List your startup', href: '/dashboard/startups/new' },
      { label: 'Edit profile', href: '/dashboard/profile' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Roadmap', href: '/docs/roadmap/current-roadmap' },
      { label: 'Task progress', href: '/docs/tasks/progress' },
      { label: 'Technology stack', href: '/docs/technology/stack' },
    ],
  },
  {
    title: 'Hub',
    links: [
      { label: 'Overview', href: '/#about' },
      { label: 'How it works', href: '/#process' },
      { label: 'Available now', href: '/#features' },
    ],
  },
];

const FooterOne = ({ className }: { className?: string }) => {
  return (
    <footer className={cn('relative overflow-hidden bg-black text-white', className)}>
      <FooterRightGradient />
      <FooterLeftGradient />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="main-container relative z-10 px-5">
        <div className="grid grid-cols-12 justify-between gap-x-0 gap-y-10 pt-16 pb-12 xl:pt-[90px]">
          <div className="col-span-12 xl:col-span-5">
            <RevealAnimation delay={0.3}>
              <div className="max-w-[470px] rounded-[20px] border border-white/5 bg-[#0A0A0A] p-6 md:p-8">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                  <span className="sr-only">Solana Startups Hub home</span>
                  <span className="text-2xl font-bold leading-none tracking-tighter text-white md:text-3xl">
                    Solana
                    <span className="ml-1.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text py-1 pr-1 italic text-transparent">
                      Hub
                    </span>
                  </span>
                </Link>
                <p className="mt-5 text-base leading-7 text-white/70">
                  A structured directory for founders building on Solana. Create and manage a startup profile, then
                  publish reviewed projects to the protected marketplace.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/dashboard/startups/new"
                    className="btn btn-primary btn-md hover:btn-white w-full shadow-lg shadow-primary-500/20 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto">
                    <span>List your startup</span>
                  </Link>
                  <Link
                    href="/startups"
                    className="btn btn-white-dark btn-md hover:btn-primary w-full border border-white/10 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto">
                    <span>Explore startups</span>
                  </Link>
                </div>
              </div>
            </RevealAnimation>
          </div>
          <div className="col-span-12 grid grid-cols-1 gap-6 md:grid-cols-3 xl:col-span-7">
            {footerSections.map((section, index) => (
              <RevealAnimation key={section.title} delay={0.4 + index * 0.1}>
                <nav
                  aria-label={`${section.title} footer links`}
                  className="h-full rounded-[20px] border border-white/5 bg-[#0A0A0A] p-6 transition-colors duration-300 hover:border-primary-500/30">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">{section.title}</p>
                  <ul className="mt-6 space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="inline-flex min-h-10 items-center rounded-md text-tagline-1 font-normal text-white/70 transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </RevealAnimation>
            ))}
          </div>
        </div>
        <div className="relative flex flex-col items-center justify-between gap-4 pt-[26px] pb-12 text-center md:flex-row md:text-left xl:pb-[100px]">
          <FooterDivider />
          <RevealAnimation delay={0.7} offset={10} start="top 105%">
            <p className="text-tagline-1 font-normal text-white/55">
              Copyright &copy; Solana Startups Hub. Directory for the Solana founder ecosystem.
            </p>
          </RevealAnimation>
          <RevealAnimation delay={0.75} offset={10} start="top 105%">
            <Link
              href="/docs/product/vision"
              className="inline-flex min-h-10 items-center rounded-md text-tagline-1 font-normal text-white/55 transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
              Read the product vision
            </Link>
          </RevealAnimation>
        </div>
      </div>
      <ThemeToggle />
    </footer>
  );
};

FooterOne.displayName = 'FooterOne';
export default FooterOne;
