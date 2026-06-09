'use client';

import RevealAnimation from '../animation/RevealAnimation';
import NumberCounter from '../ui/NumberCounter';

const stats = [
  {
    value: 250,
    suffix: '+',
    label: 'Active Startups',
    delay: 0.2,
  },
  {
    value: 1500,
    suffix: '+',
    label: 'Verified Builders',
    delay: 0.3,
  },
  {
    value: 50,
    prefix: '$',
    suffix: 'M+',
    label: 'Ecosystem Volume',
    delay: 0.4,
  },
  {
    value: 12,
    suffix: 'k+',
    label: 'Community Members',
    delay: 0.5,
  },
];

const Stats = () => {
  return (
    <section className="py-16 bg-black">
      <div className="main-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <RevealAnimation key={index} delay={stat.delay}>
              <div className="text-center space-y-2">
                <NumberCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  className="text-white"
                  numberClassName="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent"
                  labelClassName="text-white/60 text-sm md:text-base font-medium uppercase tracking-wider"
                  label={stat.label}
                  triggerOnScroll={true}
                />
              </div>
            </RevealAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
