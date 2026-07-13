import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const CTA = () => {
  return (
    <section className="border-t border-white/10 bg-[#050505] py-16 md:py-24">
      <div className="main-container text-left">
        <div className="max-w-[800px] space-y-8">
          <RevealAnimation delay={0.2}>
            <h2 className="text-heading-3 font-bold text-white md:text-heading-2">
              Build the directory with real projects, one listing at a time.
            </h2>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <p className="max-w-[680px] text-lg leading-8 text-white/65">
              Create and manage a startup profile if you are building on Solana, or explore the directory to discover
              other founders and projects.
            </p>
          </RevealAnimation>
          <RevealAnimation delay={0.4}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton
                href="/dashboard/startups/new"
                className="btn btn-primary btn-md md:btn-xl hover:btn-white w-full sm:w-auto">
                List Your Startup
              </LinkButton>
              <LinkButton
                href="/#features"
                className="btn btn-white-dark btn-md md:btn-xl hover:btn-primary w-full sm:w-auto">
                Explore features
              </LinkButton>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

export default CTA;
