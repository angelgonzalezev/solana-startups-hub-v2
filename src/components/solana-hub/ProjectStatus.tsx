import RevealAnimation from '../animation/RevealAnimation';

const statusItems = [
  { label: 'Product focus', value: 'Founder-managed startup directory' },
  { label: 'Founder flow', value: 'Profiles and startup drafts available' },
  { label: 'Directory access', value: 'Protected by wallet sign-in' },
  { label: 'Listing quality', value: 'Structured review before publication' },
];

const ProjectStatus = () => (
  <section className="border-y border-white/10 bg-[#050505]" aria-labelledby="project-status-title">
    <h2 id="project-status-title" className="sr-only">
      Current project status
    </h2>
    <div className="main-container">
      <RevealAnimation delay={0.1} offset={20}>
        <dl className="grid md:grid-cols-2 xl:grid-cols-4">
          {statusItems.map((item, index) => (
            <div
              key={item.label}
              className={`border-b border-white/10 py-6 md:px-6 xl:border-b-0 ${
                index % 2 === 0 ? 'md:border-r' : ''
              } ${index < 2 ? 'xl:border-r' : index === 2 ? 'xl:border-r' : ''} ${index === 0 ? 'md:pl-0' : ''} ${
                index === statusItems.length - 1 ? 'border-b-0 md:pr-0' : ''
              }`}>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">{item.label}</dt>
              <dd className="mt-2 text-sm font-medium leading-6 text-white/75">{item.value}</dd>
            </div>
          ))}
        </dl>
      </RevealAnimation>
    </div>
  </section>
);

export default ProjectStatus;
