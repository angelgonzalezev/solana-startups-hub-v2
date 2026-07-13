import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  return (
    <div className="flex-shrink-0">
      <Link href="/" className="flex items-center gap-2 py-1">
        <span className="sr-only">Solana Startups Hub</span>
        <Image
          src="/images/shared/solradar-logo.png"
          alt=""
          width={48}
          height={48}
          priority
          className="size-10 shrink-0 rounded-xl object-cover md:size-11"
        />
        <span className="flex items-center whitespace-nowrap text-xl font-bold leading-none tracking-tighter text-white md:text-2xl">
          Solana
          <span className="ml-1.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text py-1 pr-1 italic text-transparent">
            Hub
          </span>
        </span>
      </Link>
    </div>
  );
};

export default Logo;
