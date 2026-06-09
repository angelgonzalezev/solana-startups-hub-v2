import avatar2 from '@public/images/avatar/avatar-2.png';
import avatar3 from '@public/images/avatar/avatar-3.png';
import avatar4 from '@public/images/avatar/avatar-4.png';
import Image from 'next/image';
import Link from 'next/link';
import Marquee from 'react-fast-marquee';
import RevealAnimation from '../animation/RevealAnimation';

const Testimonial = () => {
  const testimonials = [
    {
      name: 'Anatoly Yakovenko',
      role: 'Solana Labs',
      avatar: avatar2,
      content:
        'Centralizing discovery for the ecosystem is a huge step forward. Fragmented info is the biggest barrier for new builders and investors.',
    },
    {
      name: 'Raj Gokal',
      role: 'Solana Foundation',
      avatar: avatar3,
      content:
        'A professional hub for startups building on Solana is exactly what the community needs to scale visibility beyond Discord and Telegram.',
    },
    {
      name: 'Mert Mumtaz',
      role: 'Helius Labs',
      avatar: avatar4,
      content:
        'Verified profiles and on-chain ownership are the right way to build a crypto-native startup directory. Essential tool for the hub.',
    },
  ];

  return (
    <section className="xl:py-[100px] lg:py-[90px] md:py-20 py-16 bg-black">
      <div className="mb-14 text-center">
        <div className="space-y-5">
          <RevealAnimation delay={0.2}>
            <span className="badge border border-primary-500/30 text-primary-400 bg-primary-500/5">
              Ecosystem Voices
            </span>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <h2 className="text-heading-3 md:text-heading-2 font-bold text-white italic">What builders are saying</h2>
          </RevealAnimation>
        </div>
      </div>
      <div>
        <RevealAnimation delay={0.4}>
          <Marquee autoFill pauseOnHover direction="left" gradient={false} className="w-full overflow-hidden">
            <div className="flex items-center justify-center gap-6 py-4">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="min-w-xs sm:min-w-md md:min-w-[600px] p-8 md:p-12 rounded-[20px] backdrop-blur-[22px] space-y-6 bg-[#0A0A0A] border border-white/5 hover:border-primary-500/20 transition-all duration-300 ml-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <figure className="size-14 md:size-16 rounded-full overflow-hidden bg-gradient-to-br from-[#9945FF] to-[#14F195] p-0.5">
                        <Image
                          src={t.avatar}
                          alt={t.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </figure>
                      <div className="space-y-1">
                        <h3 className="text-tagline-1 font-bold text-white">{t.name}</h3>
                        <p className="text-tagline-3 text-white/50">{t.role}</p>
                      </div>
                    </div>
                    <div>
                      <Link
                        href="#"
                        className="p-2 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 12 12" fill="none">
                          <path
                            d="M9.45202 0H11.2924L7.27177 5.08308L12.0017 12H8.29819L5.3975 7.80492L2.07844 12H0.236996L4.53741 6.56308L0 0H3.7975L6.41947 3.83446L9.45202 0ZM8.80612 10.7815H9.82587L3.24339 1.15446H2.1491L8.80612 10.7815Z"
                            className="fill-white"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/80 md:text-lg leading-relaxed italic">&quot;{t.content}&quot;</p>
                  </div>
                </div>
              ))}
            </div>
          </Marquee>
        </RevealAnimation>
      </div>
    </section>
  );
};

export default Testimonial;
