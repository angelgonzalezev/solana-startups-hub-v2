import directoryImg from '@public/images/solana-hub/centralized-directory.png';
import marketplaceImg from '@public/images/solana-hub/adquisition-marketplace.png';
import insightsImg from '@public/images/solana-hub/ecosystem-insight.png';
import usdcMarketplaceImg from '@public/images/solana-hub/future-usdc-marketplace.png';
import verifiedImg from '@public/images/solana-hub/verified-ownership.png';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const Features = () => {
  return (
    <section className="xl:py-[100px] lg:py-[90px] md:py-20 py-16 bg-black" id="features">
      <div className="main-container">
        <div className="text-center space-y-3 mb-10 md:mb-[70px]">
          <RevealAnimation delay={0.2}>
            <h2 className="text-heading-3 md:text-heading-2 font-bold text-white">Platform Core Features</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <p className="max-w-[776px] mx-auto text-lg text-white/70">
              Everything you need to discover, showcase, and trade Solana-based startups in one single place.
            </p>
          </RevealAnimation>
        </div>
        <div className="mb-[72px]">
          <div className="grid grid-cols-12 sm:gap-8 gap-y-8">
            <RevealAnimation delay={0.4}>
              <div className="col-span-12 lg:col-span-4 sm:col-span-6">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[20px] md:p-8 p-6 h-full flex flex-col justify-between space-y-6 hover:border-primary-500/30 transition-colors">
                  <div className="space-y-3">
                    <h3 className="text-heading-6 md:text-heading-5 font-bold text-white">Centralized Directory</h3>
                    <p className="text-white/60 text-base">
                      Filter projects by category, stage, and maturity to find exactly what you are looking for.
                    </p>
                  </div>
                  <div>
                    <figure className="sm:max-w-[345px] max-w-full w-full rounded-2xl overflow-hidden shadow-sm transition-all">
                      <Image src={directoryImg} alt="Directory" className="w-full h-full object-cover" />
                    </figure>
                  </div>
                </div>
              </div>
            </RevealAnimation>
            <RevealAnimation delay={0.5}>
              <div className="col-span-12 lg:col-span-4 sm:col-span-6">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[20px] md:p-8 p-6 h-full flex flex-col justify-between space-y-6 hover:border-primary-500/30 transition-colors">
                  <div className="space-y-3">
                    <h3 className="text-heading-6 md:text-heading-5 font-bold text-white">Verified Ownership</h3>
                    <p className="text-white/60 text-base">
                      Connect your Solana wallet to verify your identity as a founder and maintain control over your
                      project profile.
                    </p>
                  </div>
                  <div>
                    <figure className="sm:max-w-[345px] max-w-full w-full rounded-2xl overflow-hidden shadow-sm transition-all">
                      <Image src={verifiedImg} alt="Verified Profiles" className="w-full h-full object-cover" />
                    </figure>
                  </div>
                </div>
              </div>
            </RevealAnimation>
            <RevealAnimation delay={0.6}>
              <div className="col-span-12 lg:col-span-4 sm:col-span-6">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[20px] md:p-8 p-6 h-full flex flex-col justify-between space-y-6 hover:border-primary-500/30 transition-colors">
                  <div className="space-y-3">
                    <h3 className="text-heading-6 md:text-heading-5 font-bold text-white">Acquisition Marketplace</h3>
                    <p className="text-white/60 text-base">
                      Discover projects open to acquisition and connect directly with founders to discuss deals.
                    </p>
                  </div>
                  <div>
                    <figure className="sm:max-w-[345px] max-w-full w-full rounded-2xl overflow-hidden shadow-sm transition-all">
                      <Image src={marketplaceImg} alt="Marketplace" className="w-full h-full object-cover" />
                    </figure>
                  </div>
                </div>
              </div>
            </RevealAnimation>
            <RevealAnimation delay={0.7}>
              <div className="col-span-12 lg:col-span-4 sm:col-span-6">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[20px] md:p-8 p-6 h-full flex flex-col justify-between space-y-6 hover:border-primary-500/30 transition-colors">
                  <div className="space-y-3">
                    <h3 className="text-heading-6 md:text-heading-5 font-bold text-white">Ecosystem Insights</h3>
                    <p className="text-white/60 text-base">
                      Get a bird&apos;s-eye view of where the Solana ecosystem is growing and which niches are
                      underserved.
                    </p>
                  </div>
                  <div>
                    <figure className="sm:max-w-[345px] max-w-full w-full overflow-hidden rounded-2xl shadow-sm transition-all">
                      <Image src={insightsImg} alt="Insights" className="w-full h-full object-cover" />
                    </figure>
                  </div>
                </div>
              </div>
            </RevealAnimation>
            <RevealAnimation delay={0.8}>
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[20px] md:p-8 p-6 h-full flex flex-col justify-between space-y-6 hover:border-primary-500/30 transition-colors">
                  <div className="space-y-3">
                    <h3 className="text-heading-6 md:text-heading-5 font-bold text-white">Future USDC Marketplace</h3>
                    <p className="text-white/60 text-base">
                      Native Solana payments for premium listings and startup acquisitions processed directly on-chain.
                    </p>
                  </div>
                  <div>
                    <figure className="max-w-[784px] overflow-hidden rounded-2xl w-full shadow-sm transition-all">
                      <Image src={usdcMarketplaceImg} alt="USDC Marketplace" className="w-full h-full object-cover" />
                    </figure>
                  </div>
                </div>
              </div>
            </RevealAnimation>
          </div>
        </div>
        <RevealAnimation delay={0.9}>
          <div className="flex flex-col md:flex-row items-center gap-y-5 md:gap-x-3 justify-center">
            <LinkButton href="/startups" className="btn btn-primary btn-md hover:btn-white w-[90%] md:w-auto">
              Explore the Hub
            </LinkButton>
            <LinkButton href="/dashboard/startups/new" className="btn btn-white-dark btn-md hover:btn-primary w-[90%] md:w-auto">
              Register Startup
            </LinkButton>
          </div>
        </RevealAnimation>
      </div>
    </section>
  );
};

export default Features;
