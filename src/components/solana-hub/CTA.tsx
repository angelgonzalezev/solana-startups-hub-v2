import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const CTA = () => {
  return (
    <section className="border-t border-white/10 bg-[#050505] py-16 md:py-24">
      <div className="main-container text-left">
        <div className="max-w-[800px] space-y-8">
          <RevealAnimation delay={0.2}>
            <h2 className="text-heading-3 font-bold text-white md:text-heading-2">Bring your startup into orbit.</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <p className="max-w-[680px] text-lg leading-8 text-white/65">
              Give your project a clear place in the Solana ecosystem, or explore Orbital to discover the founders and
              startups already building there.
            </p>
          </RevealAnimation>
          <RevealAnimation delay={0.4}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton
                href="/dashboard/startups/new"
                className="btn btn-primary btn-md md:btn-xl hover:btn-white w-full sm:w-auto">
                List your startup
              </LinkButton>
              <LinkButton
                href="/#features"
                className="btn btn-white-dark btn-md md:btn-xl hover:btn-primary w-full sm:w-auto">
                Explore Orbital
              </LinkButton>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

export default CTA;
