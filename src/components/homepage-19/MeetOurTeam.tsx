'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

gsap.registerPlugin(ScrollTrigger);

const MeetOurTeam = () => {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const characterSpansRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!titleRef.current) return;

    const originalText = titleRef.current.textContent || '';
    const characterSpans = createCharacterSpans(originalText);

    replaceTitleWithSpans(characterSpans);

    // Start animation after DOM update
    setTimeout(() => {
      animateCharacters(characterSpans);
    }, 100);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const createCharacterSpans = (text: string): HTMLSpanElement[] => {
    return text.split('').map((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0.1';
      span.style.transform = 'translateY(0)';
      return span;
    });
  };

  const replaceTitleWithSpans = (spans: HTMLSpanElement[]) => {
    if (!titleRef.current) return;

    titleRef.current.innerHTML = '';
    spans.forEach((span) => {
      titleRef.current?.appendChild(span);
      characterSpansRef.current.push(span);
    });
  };

  const animateCharacters = (spans: HTMLSpanElement[]) => {
    gsap.to(spans, {
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 80%',
        end: 'top 20%',
        scrub: true,
      },
      opacity: 1,
      stagger: 0.2,
      duration: 1,
      ease: 'power3.out',
    });
  };

  return (
    <section className="pb-[50px] md:pb-[80px] lg:pb-[100px]" aria-label="Team Introduction">
      <div className="main-container">
        <div className="space-y-7 md:space-y-14">
          <h2 ref={titleRef} className="split-text-team-title text-center">
            From intuitive dashboards to data-driven automation, NextSaaS is built for modern businesses that want to
            simplify workflows and scale effortlessly.
          </h2>

          <RevealAnimation delay={0.2}>
            <div className="text-center">
              <LinkButton
                href="/our-team-01"
                className="btn btn-primary btn-md w-[85%] md:w-auto hover:btn-secondary dark:hover:btn-accent">
                Meet NextSaaS team
              </LinkButton>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

export default MeetOurTeam;
