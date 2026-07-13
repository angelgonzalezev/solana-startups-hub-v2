import About from '@/components/solana-hub/About';
import CTA from '@/components/solana-hub/CTA';
import Hero from '@/components/solana-hub/Hero';
import Process from '@/components/solana-hub/Process';
import Features from '@/components/solana-hub/Features';
import ProjectStatus from '@/components/solana-hub/ProjectStatus';
import FooterOne from '@/components/shared/footer/FooterOne';
import NavbarOne from '@/components/shared/header/NavbarOne';
import { Metadata } from 'next';
import { Fragment } from 'react';

export const metadata: Metadata = {
  title: 'Solana Startups Hub - The Directory for Solana Startups',
  description:
    'A structured directory where Solana founders can create startup profiles, publish reviewed projects, and make their work easier to discover.',
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
        <ProjectStatus />
        <About />
        <Process />
        <Features />
        <CTA />
      </main>
      <FooterOne className="bg-black border-t border-white/10" />
    </Fragment>
  );
};

export default Homepage;
