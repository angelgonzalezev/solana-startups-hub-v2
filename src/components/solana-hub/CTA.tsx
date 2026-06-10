import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const CTA = () => {
  return (
    <section className="xl:py-[100px] lg:py-[90px] md:py-20 py-16 bg-[#050505] border-t border-white/5">
      <div className="main-container text-center">
        <div className="max-w-[800px] mx-auto space-y-8">
          <RevealAnimation delay={0.2}>
            <h2 className="text-heading-3 md:text-heading-2 font-bold italic text-white">
              Ready to showcase your project on{' '}
              <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">Solana</span>
              ?
            </h2>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <p className="text-lg text-white/70 text-center">
              Join the official discovery platform for the Solana ecosystem. Gain visibility, connect with investors,
              and find your next big opportunity.
            </p>
          </RevealAnimation>
          <RevealAnimation delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LinkButton
                href="/dashboard/startups/new"
                className="btn btn-primary btn-md md:btn-xl hover:btn-white w-full sm:w-auto">
                List Your Startup
              </LinkButton>
              <LinkButton
                href="/contact-us"
                className="btn btn-white-dark btn-md md:btn-xl hover:btn-primary w-full sm:w-auto">
                Investor Access
              </LinkButton>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

export default CTA;
