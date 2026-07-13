import RevealAnimation from '../animation/RevealAnimation';

const Process = () => {
  return (
    <section className="xl:py-[100px] lg:py-[90px] md:py-20 py-16 bg-black" id="process">
      <div className="main-container">
        <div className="text-center space-y-3 mb-10 md:mb-[70px]">
          <RevealAnimation delay={0.2}>
            <h2 className="text-heading-3 md:text-heading-2 font-bold text-white">How it Works</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <p className="max-w-[776px] mx-auto text-lg text-white/70">
              Get your Solana startup listed and discovered in three simple steps.
            </p>
          </RevealAnimation>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <RevealAnimation delay={0.4} direction="up">
            <div className="space-y-6 text-center p-8 bg-[#0A0A0A] border border-white/5 rounded-[20px] h-full hover:border-primary-500/20 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#9945FF] to-[#14F195] text-white rounded-full flex items-center justify-center text-heading-4 font-bold mx-auto shadow-lg shadow-primary-500/20">
                1
              </div>
              <div className="space-y-3">
                <h3 className="text-heading-5 font-bold text-white">Connect Wallet</h3>
                <p className="text-white/60">
                  Securely sign in using your Solana wallet. We support Phantom, Solflare, and other major wallets.
                </p>
              </div>
            </div>
          </RevealAnimation>
          <RevealAnimation delay={0.5} direction="up">
            <div className="space-y-6 text-center p-8 bg-[#0A0A0A] border border-white/5 rounded-[20px] h-full hover:border-primary-500/20 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#9945FF] to-[#14F195] text-white rounded-full flex items-center justify-center text-heading-4 font-bold mx-auto shadow-lg shadow-primary-500/20">
                2
              </div>
              <div className="space-y-3">
                <h3 className="text-heading-5 font-bold text-white">Create Profile</h3>
                <p className="text-white/60">
                  Fill in your project details, category, and stage. Upload assets and link your social channels.
                </p>
              </div>
            </div>
          </RevealAnimation>
          <RevealAnimation delay={0.6} direction="up">
            <div className="space-y-6 text-center p-8 bg-[#0A0A0A] border border-white/5 rounded-[20px] h-full hover:border-primary-500/20 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#9945FF] to-[#14F195] text-white rounded-full flex items-center justify-center text-heading-4 font-bold mx-auto shadow-lg shadow-primary-500/20">
                3
              </div>
              <div className="space-y-3">
                <h3 className="text-heading-5 font-bold text-white">Gain Visibility</h3>
                <p className="text-white/60">
                  Investors and partners can now find you. Indicate if you are open to acquisitions or partnerships.
                </p>
              </div>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

export default Process;
