import About from '@/components/solana-hub/About';
import Stats from '@/components/solana-hub/Stats';
import CTA from '@/components/solana-hub/CTA';
import Hero from '@/components/solana-hub/Hero';
import Process from '@/components/solana-hub/Process';
import Features from '@/components/solana-hub/Features';
import Partners from '@/components/solana-hub/Partners';
import Projects from '@/components/solana-hub/Projects';
// import Blog from '@/components/solana-hub/Blog';
import Testimonial from '@/components/solana-hub/Testimonial';
import FooterOne from '@/components/shared/footer/FooterOne';
import NavbarOne from '@/components/shared/header/NavbarOne';
import { Metadata } from 'next';
import { Fragment } from 'react';

export const metadata: Metadata = {
  title: 'Solana Startups Hub - Discover the Future of Web3',
  description:
    'The centralized discovery platform for founders, investors, and ecosystem participants to find and showcase startups building on Solana.',
};

const Homepage = () => {
  return (
    <Fragment>
      <NavbarOne
        className="bg-black/60 backdrop-blur-[25px] border border-white/10 top-5"
        btnClassName="btn-primary hover:btn-white"
      />
      <main className="bg-black text-white overflow-x-hidden">
        <Hero />
        <About />
        <Process />
        <Stats />
        <Partners />
        <Features />
        {/* <Projects /> */}
        {/* <Testimonial /> */}
        {/* <Blog /> */}
        <CTA />
      </main>
      <FooterOne className="bg-black border-t border-white/10" />
    </Fragment>
  );
};

export default Homepage;
