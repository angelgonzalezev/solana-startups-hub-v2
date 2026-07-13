import FooterOne from '@/components/shared/footer/FooterOne';
import NavbarOne from '@/components/shared/header/NavbarOne';
import Link from 'next/link';

export const metadata = {
  title: 'Page not found | Solana Startups Hub',
};

const NotFound = () => {
  return (
    <>
      <NavbarOne
        className="top-5 border border-white/10 bg-black/60 backdrop-blur-[25px]"
        btnClassName="btn-primary hover:btn-white"
      />
      <main className="flex min-h-[75vh] items-center bg-black px-5 pt-36 pb-20 text-white">
        <section className="main-container text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14F195]">Error 404</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-heading-3 font-bold leading-tight md:text-heading-2">
            This page is not part of Solana Startups Hub.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/65">
            Return to the hub or browse the verified startups building across the Solana ecosystem.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary btn-md hover:btn-white w-full sm:w-auto">
              Back to the hub
            </Link>
            <Link href="/startups" className="btn btn-white-dark btn-md hover:btn-primary w-full sm:w-auto">
              Explore startups
            </Link>
          </div>
        </section>
      </main>
      <FooterOne className="border-t border-white/10 bg-black" />
    </>
  );
};

export default NotFound;
