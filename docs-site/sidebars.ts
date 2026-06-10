import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Product',
      items: ['product/vision', 'product/scope', 'product/messaging'],
    },
    {
      type: 'category',
      label: 'Application Flows',
      items: ['flows/application-flow'],
    },
    {
      type: 'category',
      label: 'Roadmap',
      items: ['roadmap/current-roadmap'],
    },
    {
      type: 'category',
      label: 'Tasks',
      items: ['tasks/progress'],
    },
    {
      type: 'category',
      label: 'Technology',
      items: ['technology/stack', 'technology/architecture'],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: ['contributing/working-with-tasks'],
    },
  ],
};

export default sidebars;
