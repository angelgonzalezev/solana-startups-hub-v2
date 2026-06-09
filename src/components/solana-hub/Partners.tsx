import Image from 'next/image';
import Marquee from 'react-fast-marquee';
import RevealAnimation from '../animation/RevealAnimation';

// Reusing generic client logos but with real Solana startup names for alt text
import logo1 from '@public/images/icons/client-logo-1.svg';
import logo2 from '@public/images/icons/client-logo-2.svg';
import logo3 from '@public/images/icons/client-logo-3.svg';
import logo4 from '@public/images/icons/client-logo-4.svg';
import logo5 from '@public/images/icons/client-logo-5.svg';

const partners = [
  { name: 'Jupiter', logo: logo1 },
  { name: 'Phantom', logo: logo2 },
  { name: 'Magic Eden', logo: logo3 },
  { name: 'Tensor', logo: logo4 },
  { name: 'Drift', logo: logo5 },
  { name: 'Kamino', logo: logo1 },
  { name: 'Jito', logo: logo2 },
  { name: 'Helius', logo: logo3 },
];

const Partners = () => {
  return (
    <section className="py-10 bg-black border-y border-white/5">
      <RevealAnimation delay={0.2}>
        <div className="main-container mb-8 text-center">
          <p className="text-sm uppercase tracking-widest text-white/40 font-medium">
            Trusted by leading Solana Ecosystem Startups
          </p>
        </div>
      </RevealAnimation>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

        <Marquee speed={30} gradient={false} pauseOnHover>
          <div className="flex items-center gap-16 pr-16">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="w-10 h-10 relative">
                  <Image src={partner.logo} alt={`${partner.name} logo`} fill className="object-contain" />
                </div>
                <span className="text-xl font-bold text-white/60 tracking-tight">{partner.name}</span>
              </div>
            ))}
          </div>
        </Marquee>
      </div>
    </section>
  );
};

export default Partners;
