import { CheckCircle2 } from 'lucide-react';
import RevealAnimation from '../animation/RevealAnimation';

const principles = [
  'Prioritize trustworthy, maintained listings over vanity growth.',
  'Keep startup data protected behind wallet authentication.',
  'Keep the product focused on clear founder and discovery workflows.',
];

const About = () => {
  return (
    <section className="bg-black py-16 md:py-24" id="about">
      <div className="main-container">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-20">
          <div className="space-y-6">
            <RevealAnimation delay={0.1}>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#14F195]">Why this exists</p>
            </RevealAnimation>
            <div className="space-y-5">
              <RevealAnimation delay={0.2}>
                <h2 className="max-w-[720px] text-heading-3 font-bold leading-tight text-white md:text-heading-2">
                  Startup information is scattered. The first goal is simply to organize it.
                </h2>
              </RevealAnimation>
              <RevealAnimation delay={0.3}>
                <p className="max-w-[720px] text-lg leading-8 text-white/65">
                  Solana projects are often introduced across X, Telegram, Discord, demo days, and private groups.
                  Solana Startups Hub is being built as a structured directory where founders can maintain one clear
                  profile for their work.
                </p>
              </RevealAnimation>
            </div>
          </div>
          <RevealAnimation delay={0.35} direction="right">
            <div className="border-l border-white/10 pl-6 md:pl-8">
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.16em] text-white/45">Product principles</p>
              <ul className="space-y-6">
                {principles.map((principle) => (
                  <li key={principle} className="flex gap-4 text-base leading-7 text-white/70">
                    <CheckCircle2 aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#14F195]" />
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

export default About;
