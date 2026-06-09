import about1 from '@public/images/solana-hub/about-main.png';
import about2 from '@public/images/solana-hub/about-small.png';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const About = () => {
  return (
    <section className="xl:py-[100px] lg:py-[90px] md:py-20 py-16 bg-black" id="about">
      <div className="main-container">
        <div className="grid grid-cols-12 gap-y-10 lg:gap-10 items-center">
          <div className="col-span-12 lg:col-span-6">
            <div className="relative">
              <RevealAnimation delay={0.2} direction="left">
                <figure className="rounded-[20px] overflow-hidden max-w-[500px] w-full border border-white/10 grayscale hover:grayscale-0 transition-all duration-500">
                  <Image src={about1} alt="Solving fragmentation" className="w-full h-full object-cover" />
                </figure>
              </RevealAnimation>
              <RevealAnimation
                delay={0.4}
                direction="right"
                className="absolute -bottom-10 -right-5 md:right-10 hidden sm:block">
                <figure className="rounded-[20px] overflow-hidden max-w-[280px] w-full border-4 border-black dark:border-black shadow-2xl shadow-primary-500/10">
                  <Image src={about2} alt="Verified builders" className="w-full h-full object-cover" />
                </figure>
              </RevealAnimation>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <RevealAnimation delay={0.2}>
                <h2 className="text-heading-3 md:text-heading-2 font-bold text-white leading-tight">
                  Bridging the Gap in the <br />
                  <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                    Solana Ecosystem
                  </span>
                </h2>
              </RevealAnimation>
              <RevealAnimation delay={0.3}>
                <p className="text-lg text-white/70">
                  Today, information about Solana startups is fragmented across X, Telegram, Discord, and multiple
                  community channels. This makes it difficult for projects to gain visibility and for investors to
                  discover promising teams.
                </p>
              </RevealAnimation>
              <RevealAnimation delay={0.4}>
                <p className="text-lg font-medium text-accent">
                  Solana Startups Hub provides a centralized directory where founders can showcase their products,
                  verify ownership via their wallets, and explore acquisition opportunities.
                </p>
              </RevealAnimation>
            </div>
            <RevealAnimation delay={0.5}>
              <LinkButton
                href="/about-01"
                className="btn btn-primary btn-md hover:btn-white w-[90%] md:w-auto shadow-lg shadow-primary-500/20">
                Learn our mission
              </LinkButton>
            </RevealAnimation>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
