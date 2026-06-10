import hero1 from '@public/images/solana-hub/hero1.png';
import hero2 from '@public/images/solana-hub/hero2.png';
import hero3 from '@public/images/solana-hub/hero3.png';
import hero4 from '@public/images/solana-hub/hero4.png';
import hero5 from '@public/images/solana-hub/hero-5.png';
import hero6 from '@public/images/solana-hub/hero6.png';
import hero7 from '@public/images/solana-hub/hero7.png';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';
import LineExpand from '../homepage-15/LineExpand';
import ScrollExpand from '../homepage-15/ScrollExpand';

const Hero = () => {
  return (
    <section className="lg:pb-[100px] pb-16 lg:pt-[234px] pt-[150px] relative overflow-hidden bg-black" id="hero">
      <LineExpand />
      <div className="main-container mb-[100px]">
        <div className="space-y-14 text-center">
          <div className="space-y-4">
            <RevealAnimation delay={0.2}>
              <h1 className="mx-auto max-w-[886px] w-full text-heading-2 md:text-heading-1 font-bold leading-tight text-white">
                The Central Hub for <br />
                <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                  Solana Startups
                </span>
              </h1>
            </RevealAnimation>
            <RevealAnimation delay={0.3}>
              <p className="mx-auto max-w-[750px] w-full text-lg text-white/70">
                Discover, showcase, and connect with the most promising projects building on Solana. A centralized
                directory for founders, investors, and the community.
              </p>
            </RevealAnimation>
          </div>
          <ul className="flex flex-col md:flex-row items-center justify-center gap-4">
            <RevealAnimation delay={0.3} direction="left" offset={50}>
              <li className="w-full sm:w-auto">
                <LinkButton
                  href="/login-01"
                  className="btn btn-primary btn-md md:btn-xl hover:btn-white w-[90%] md:w-auto shadow-lg shadow-primary-500/20">
                  Connect Wallet
                </LinkButton>
              </li>
            </RevealAnimation>
            <RevealAnimation delay={0.5} direction="left" offset={60}>
              <li className="w-full sm:w-auto">
                <LinkButton
                  href="/startups"
                  className="btn btn-white-dark btn-md md:btn-xl hover:btn-primary w-[90%] md:w-auto border border-white/10">
                  Explore Startups
                </LinkButton>
              </li>
            </RevealAnimation>
          </ul>
        </div>
      </div>
      <RevealAnimation delay={0.2} offset={90}>
        <div>
          <div className="flex gap-4 justify-center items-center overflow-y-auto overflow-x-hidden scroll-bar">
            <figure className="rounded-[20px] overflow-hidden max-h-[380px] min-w-[257px] w-full ml-4 border border-white/10 grayscale hover:grayscale-0 transition-all duration-500">
              <Image src={hero1} className="w-full h-full object-cover" alt="Solana project 1" />
            </figure>
            <figure className="rounded-[20px] overflow-hidden max-h-[380px] min-w-[257px] w-full border border-white/10 grayscale hover:grayscale-0 transition-all duration-500">
              <Image src={hero2} className="w-full h-full object-cover" alt="Solana project 2" />
            </figure>
            <figure className="rounded-[20px] overflow-hidden max-h-[380px] min-w-[257px] w-full border border-white/10 grayscale hover:grayscale-0 transition-all duration-500">
              <Image src={hero3} className="w-full h-full object-cover" alt="Solana project 3" />
            </figure>
            <ScrollExpand image={hero4} />
            <figure className="rounded-[20px] overflow-hidden max-h-[380px] min-w-[257px] w-full border border-white/10 grayscale hover:grayscale-0 transition-all duration-500">
              <Image src={hero5} className="w-full h-full object-cover" alt="Solana project 5" />
            </figure>
            <figure className="rounded-[20px] overflow-hidden max-h-[380px] min-w-[257px] w-full border border-white/10 grayscale hover:grayscale-0 transition-all duration-500">
              <Image src={hero6} className="w-full h-full object-cover" alt="Solana project 6" />
            </figure>
            <figure className="rounded-[20px] overflow-hidden max-h-[380px] min-w-[257px] w-full border border-white/10 grayscale hover:grayscale-0 transition-all duration-500">
              <Image src={hero7} className="w-full h-full object-cover" alt="Solana project 7" />
            </figure>
          </div>
        </div>
      </RevealAnimation>
    </section>
  );
};

export default Hero;
