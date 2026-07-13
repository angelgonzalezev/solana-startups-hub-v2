'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image, { StaticImageData } from 'next/image';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const ScrollExpand = ({ image }: { image: StaticImageData }) => {
  const scrollExpandRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const element = scrollExpandRef.current;
      if (!element) return;

      if (window.innerWidth < 768) {
        gsap.set(element, { minWidth: 'auto' });
        return;
      }

      gsap.set(element, { minWidth: '500px' });

      const scrollTrigger = ScrollTrigger.create({
        trigger: element,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => gsap.to(element, { minWidth: '950px', duration: 0.5, ease: 'power2.out' }),
        onEnterBack: () => gsap.to(element, { minWidth: '950px', duration: 0.5, ease: 'power2.out' }),
        onLeaveBack: () => gsap.to(element, { minWidth: '500px', duration: 0.5, ease: 'power2.out' }),
      });

      return () => scrollTrigger.kill();
    },
    { scope: scrollExpandRef },
  );

  return (
    <figure ref={scrollExpandRef} className="max-h-[380px] min-w-[500px] w-full overflow-hidden rounded-[20px]">
      <Image src={image} className="h-full w-full object-cover" alt="Featured Solana startup" />
    </figure>
  );
};

export default ScrollExpand;
