import marketplaceDemo from '@public/images/solana-hub/orbital-marketplace-demo.png';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';

const ProductPreview = () => (
  <section
    id="product-preview"
    className="border-b border-white/10 bg-black py-16 md:py-24"
    aria-labelledby="product-preview-title">
    <div className="main-container">
      <div className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.6fr)] lg:items-end lg:gap-20">
        <div className="space-y-4">
          <RevealAnimation delay={0.1}>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Product preview</p>
          </RevealAnimation>
          <RevealAnimation delay={0.2}>
            <h2
              id="product-preview-title"
              className="text-heading-4 font-bold leading-tight text-white sm:text-heading-3 md:text-heading-2">
              See the ecosystem in one focused view.
            </h2>
          </RevealAnimation>
        </div>
        <RevealAnimation delay={0.3} direction="right">
          <p className="text-base leading-7 text-white/60 md:text-lg md:leading-8">
            Filter the directory, compare structured project signals, and move from an overview to a startup profile
            without losing context.
          </p>
        </RevealAnimation>
      </div>

      <RevealAnimation delay={0.35} direction="up" offset={24}>
        <figure className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-x-8 -top-8 bottom-8 rounded-[40px] bg-gradient-to-r from-primary-500/15 via-transparent to-accent/10 blur-3xl"
          />
          <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#050505] p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-2.5">
            <Image
              src={marketplaceDemo}
              alt="Orbital marketplace interface with filters and startup listing cards"
              sizes="(max-width: 767px) 100vw, 1280px"
              className="h-auto w-full rounded-[14px]"
            />
          </div>
          <figcaption className="relative mt-4 flex items-center gap-2 text-xs leading-5 text-white/40 sm:text-sm">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
            Interface preview with illustrative demo data.
          </figcaption>
        </figure>
      </RevealAnimation>
    </div>
  </section>
);

export default ProductPreview;
