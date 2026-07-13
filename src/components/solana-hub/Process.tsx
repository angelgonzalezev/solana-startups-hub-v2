import RevealAnimation from '../animation/RevealAnimation';

const Process = () => {
  return (
    <section className="bg-[#050505] py-16 md:py-24" id="process">
      <div className="main-container">
        <div className="text-center space-y-3 mb-10 md:mb-[70px]">
          <RevealAnimation delay={0.2}>
            <h2 className="text-heading-3 font-bold text-white md:text-heading-2">How it works today</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <p className="max-w-[776px] mx-auto text-lg text-white/70">
              The current founder workflow, from wallet sign-in to a reviewed listing.
            </p>
          </RevealAnimation>
        </div>
        <RevealAnimation delay={0.4} direction="up">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="h-full space-y-6 rounded-[20px] border border-white/5 bg-[#0A0A0A] p-6 text-left transition-colors hover:border-primary-500/20 md:p-8">
              <div className="flex size-12 items-center justify-center rounded-full border border-primary-500/50 bg-primary-500/10 text-xl font-bold text-white">
                1
              </div>
              <div className="space-y-3">
                <h3 className="text-heading-5 font-bold text-white">Connect Wallet</h3>
                <p className="text-white/60">
                  Sign a free message with a compatible Solana wallet. The wallet address becomes the account identity.
                </p>
              </div>
            </div>
            <div className="h-full space-y-6 rounded-[20px] border border-white/5 bg-[#0A0A0A] p-6 text-left transition-colors hover:border-primary-500/20 md:p-8">
              <div className="flex size-12 items-center justify-center rounded-full border border-primary-500/50 bg-primary-500/10 text-xl font-bold text-white">
                2
              </div>
              <div className="space-y-3">
                <h3 className="text-heading-5 font-bold text-white">Create your listing</h3>
                <p className="text-white/60">
                  Complete a founder profile, add startup details, upload a logo, and save the project as a draft.
                </p>
              </div>
            </div>
            <div className="h-full space-y-6 rounded-[20px] border border-white/5 bg-[#0A0A0A] p-6 text-left transition-colors hover:border-primary-500/20 md:p-8">
              <div className="flex size-12 items-center justify-center rounded-full border border-primary-500/50 bg-primary-500/10 text-xl font-bold text-white">
                3
              </div>
              <div className="space-y-3">
                <h3 className="text-heading-5 font-bold text-white">Request review</h3>
                <p className="text-white/60">
                  Submit the completed listing for review. Approved projects can then be published to the protected
                  directory.
                </p>
              </div>
            </div>
          </div>
        </RevealAnimation>
      </div>
    </section>
  );
};

export default Process;
