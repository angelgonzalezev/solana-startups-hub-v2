import Link from 'next/link';

const Logo = () => {
  return (
    <div className="flex-shrink-0">
      <Link href="/" className="flex items-center gap-2 py-1">
        <span className="sr-only">Solana Startups Hub</span>
        <span className="text-xl md:text-2xl font-bold tracking-tighter text-white whitespace-nowrap leading-none flex items-center">
          Solana
          <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent italic ml-1.5 py-1 pr-1">
            Hub
          </span>
        </span>
      </Link>
    </div>
  );
};

export default Logo;
