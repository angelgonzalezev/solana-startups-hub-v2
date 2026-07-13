import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  return (
    <div className="flex-shrink-0">
      <Link href="/" className="flex items-center gap-2 py-1">
        <span className="sr-only">Orbital</span>
        <Image
          src="/images/shared/orbital-logo.png"
          alt=""
          width={48}
          height={48}
          priority
          className="size-10 shrink-0 rounded-xl object-cover md:size-11"
        />
        <span className="whitespace-nowrap text-xl font-bold leading-none text-white md:text-2xl">Orbital</span>
      </Link>
    </div>
  );
};

export default Logo;
