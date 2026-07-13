import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Orbital Docs',
  tagline: 'Discover startups orbiting the Solana ecosystem.',
  favicon: 'img/orbital-logo.png',
  url: 'https://solanastartupshub.com',
  baseUrl: '/docs/',
  organizationName: 'angelgonzalezev',
  projectName: 'solana-startups-hub-v2',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/angelgonzalezev/solana-startups-hub-v2/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/social-card.png',
    navbar: {
      title: 'Orbital',
      logo: {
        alt: 'Orbital',
        src: 'img/orbital-logo.png',
      },
      items: [
        { to: '/', label: 'Docs', position: 'left' },
        { to: '/product/vision', label: 'Product', position: 'left' },
        { to: '/roadmap/current-roadmap', label: 'Roadmap', position: 'left' },
        { to: '/tasks/progress', label: 'Tasks', position: 'left' },
        { to: '/technology/stack', label: 'Technology', position: 'left' },
        { href: 'https://solanastartupshub.com', label: 'App', position: 'right' },
        {
          href: 'https://github.com/angelgonzalezev/solana-startups-hub-v2',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Product',
          items: [
            { label: 'Overview', to: '/' },
            { label: 'Vision', to: '/product/vision' },
            { label: 'Scope', to: '/product/scope' },
            { label: 'Flows', to: '/flows/application-flow' },
          ],
        },
        {
          title: 'Delivery',
          items: [
            { label: 'Roadmap', to: '/roadmap/current-roadmap' },
            { label: 'Tasks', to: '/tasks/progress' },
            { label: 'Contributing', to: '/contributing/working-with-tasks' },
          ],
        },
        {
          title: 'Project',
          items: [
            { label: 'App', href: 'https://solanastartupshub.com' },
            { label: 'Marketplace', href: 'https://solanastartupshub.com/startups' },
            { label: 'GitHub', href: 'https://github.com/angelgonzalezev/solana-startups-hub-v2' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Orbital.`,
    },
    prism: {
      theme: {
        plain: {
          color: '#f7f3ff',
          backgroundColor: '#11111f',
        },
        styles: [],
      },
      darkTheme: {
        plain: {
          color: '#f7f3ff',
          backgroundColor: '#11111f',
        },
        styles: [],
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
