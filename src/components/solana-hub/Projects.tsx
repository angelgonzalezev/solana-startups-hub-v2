import { ICaseStudy } from '@/interface';
import getMarkDownData from '@/utils/getMarkDownData';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const Projects = () => {
  const featuredProjects: ICaseStudy[] = getMarkDownData('src/data/case-study')
    .filter((project) => project.featured === true)
    .slice(0, 4);
  return (
    <section className="xl:py-[100px] lg:py-[90px] md:py-20 py-16 bg-black" id="projects">
      <div className="main-container">
        <div className="text-center space-y-3 mb-10 md:mb-[70px]">
          <RevealAnimation delay={0.2}>
            <h2 className="text-heading-3 md:text-heading-2 font-bold text-white">Featured Startups</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.3}>
            <p className="max-w-[680px] mx-auto text-white/70">
              Discover the most promising projects currently building in the Solana ecosystem. From DeFi to Consumer
              Apps, these teams are pushing the boundaries.
            </p>
          </RevealAnimation>
        </div>
        <div className="mb-14">
          <div className="grid grid-cols-12 lg:gap-14 gap-y-12">
            {featuredProjects.map((project, index) => (
              <div
                key={project.slug}
                className={index === 0 || index === 3 ? 'col-span-12' : 'col-span-12 lg:col-span-6'}>
                <RevealAnimation delay={0.3 + index * 0.1}>
                  <figure className="space-y-6 group">
                    <div className="relative w-full aspect-video xl:h-[576px] h-full rounded-[20px] overflow-hidden border border-white/5">
                      <div className="absolute inset-0 bg-black/40 z-10 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" />
                      <Image
                        src={project.thumbnail}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-in-out grayscale group-hover:grayscale-0"
                        alt={project.title}
                        fill
                        priority={index === 0}
                      />
                      <LinkButton
                        href={`/case-study/${project.slug}`}
                        className="group-hover:opacity-100 opacity-0 transition-all duration-500 ease-in-out absolute top-[55%] group-hover:top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 btn btn-md btn-primary hover:btn-white group-hover:shadow-lg group-hover:shadow-primary-500/20 border-0 transform hover:scale-[102%] z-20">
                        View Profile
                      </LinkButton>
                    </div>
                    <div className="flex sm:items-center sm:flex-row flex-col sm:gap-4 gap-2 sm:justify-between justify-start">
                      <h3 className="text-heading-6 sm:text-heading-5 text-white font-bold">{project.title}</h3>
                      <p className="max-w-[350px] sm:text-right text-left line-clamp-2 text-white/60 text-sm">
                        {project.description}
                      </p>
                    </div>
                  </figure>
                </RevealAnimation>
              </div>
            ))}
          </div>
        </div>
        <RevealAnimation delay={0.6}>
          <div className="text-center">
            <LinkButton
              href="/case-study"
              className="btn btn-white-dark btn-xl hover:btn-primary w-[90%] md:w-auto border border-white/10">
              Browse All Startups
            </LinkButton>
          </div>
        </RevealAnimation>
      </div>
    </section>
  );
};

export default Projects;
