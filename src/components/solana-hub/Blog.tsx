import getMarkDownData from '@/utils/getMarkDownData';
import RevealAnimation from '../animation/RevealAnimation';
import BlogCardV4 from '../shared/card/BlogCardV4';
import BlogCardV5 from '../shared/card/BlogCardV5';
import LinkButton from '../ui/button/LinkButton';

const blogs = getMarkDownData('src/data/blogs').slice(7, 10);

const Blog = () => {
  return (
    <section className="xl:py-[100px] lg:py-[90px] md:py-20 py-16 bg-black" id="blog">
      <div className="main-container">
        <div className="text-center space-y-5 mb-10 md:mb-[70px]">
          <RevealAnimation delay={0.2}>
            <span className="badge border border-primary-500/30 text-primary-400 bg-primary-500/5 uppercase tracking-widest text-xs">
              Ecosystem Journal
            </span>
          </RevealAnimation>
          <div className="space-y-3">
            <RevealAnimation delay={0.3}>
              <h2 className="text-heading-3 md:text-heading-2 font-bold text-white italic">Ecosystem Insights</h2>
            </RevealAnimation>
            <RevealAnimation delay={0.4}>
              <p className="max-w-[600px] mx-auto text-white/70 text-lg">
                Stay updated with the latest trends, deep dives, and founder stories from the Solana ecosystem.
              </p>
            </RevealAnimation>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-12 items-start lg:gap-8 gap-y-12">
            <RevealAnimation delay={0.5}>
              <div className="col-span-12 xl:col-span-6 lg:col-span-5">
                <BlogCardV4
                  blog={blogs[0]}
                  className="bg-[#0A0A0A] border border-white/5 hover:border-primary-500/20 transition-all text-white grayscale hover:grayscale-0"
                />
              </div>
            </RevealAnimation>

            <div className="col-span-12 xl:col-span-6 lg:col-span-7 space-y-8">
              <RevealAnimation delay={0.6}>
                <BlogCardV5
                  blog={blogs[1]}
                  className="bg-[#0A0A0A] border border-white/5 hover:border-primary-500/20 transition-all text-white grayscale hover:grayscale-0"
                />
              </RevealAnimation>

              <RevealAnimation delay={0.7}>
                <BlogCardV5
                  blog={blogs[2]}
                  className="bg-[#0A0A0A] border border-white/5 hover:border-primary-500/20 transition-all text-white grayscale hover:grayscale-0"
                />
              </RevealAnimation>
            </div>
          </div>
          <RevealAnimation delay={0.8}>
            <div className="flex justify-center mt-10 md:mt-14">
              <LinkButton
                href="/blog-01"
                className="btn btn-white-dark btn-md hover:btn-primary w-[90%] md:w-auto border border-white/10">
                Explore All Articles
              </LinkButton>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

export default Blog;
