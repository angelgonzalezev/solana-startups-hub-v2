import { ContactRound, FilePenLine, ListFilter, WalletCards } from 'lucide-react';
import RevealAnimation from '../animation/RevealAnimation';

const features = [
  {
    icon: WalletCards,
    title: 'Wallet-based access',
    description: 'Sign in with a Solana wallet through SIWS. Startup data stays behind authenticated product routes.',
  },
  {
    icon: FilePenLine,
    title: 'Founder-managed profiles',
    description:
      'Create a professional profile, upload an avatar, and manage startup drafts and logos from the dashboard.',
  },
  {
    icon: ListFilter,
    title: 'Structured discovery',
    description: 'Browse published listings by category, stage, technology, fundraising, and acquisition interest.',
  },
  {
    icon: ContactRound,
    title: 'Direct founder context',
    description:
      'Review project details and use the founder’s public X or Telegram links when they choose to provide them.',
  },
];

const Features = () => (
  <section className="bg-black py-16 md:py-24" id="features">
    <div className="main-container">
      <div className="mb-10 max-w-[760px] space-y-4 md:mb-14">
        <RevealAnimation delay={0.1}>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#14F195]">Available now</p>
        </RevealAnimation>
        <RevealAnimation delay={0.2}>
          <h2 className="text-heading-3 font-bold text-white md:text-heading-2">
            Useful foundations, without inflated claims
          </h2>
        </RevealAnimation>
        <RevealAnimation delay={0.3}>
          <p className="text-lg leading-8 text-white/65">
            Founder profiles, managed startup listings, discovery filters, and direct contact context are available in
            one focused product experience.
          </p>
        </RevealAnimation>
      </div>

      <RevealAnimation delay={0.35} direction="up">
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="min-h-64 rounded-[20px] border border-white/5 bg-[#0A0A0A] p-6 transition-colors hover:border-primary-500/30 md:p-8">
              <Icon aria-hidden="true" className="size-7 text-primary-400" />
              <h3 className="mt-10 text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 max-w-[480px] leading-7 text-white/60">{description}</p>
            </article>
          ))}
        </div>
      </RevealAnimation>
    </div>
  </section>
);

export default Features;
