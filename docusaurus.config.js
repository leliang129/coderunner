// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '1cobot',
  tagline: '技术分享与学习平台',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://1cobot.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'leliang129', // Usually your GitHub org/user name.
  projectName: '1cobot', // Usually your repo name.

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '1cobot',
        logo: {
          alt: 'CodeRunner Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'k8sSidebar',
            position: 'left',
            label: 'Kubernetes',
          },
          {
            type: 'docSidebar',
            sidebarId: 'prometheusSidebar',
            position: 'left',
            label: 'Prometheus',
          },
          {
            type: 'docSidebar',
            sidebarId: 'databaseSidebar',
            position: 'left',
            label: 'Database',
          },
          {
            type: 'docSidebar',
            sidebarId: 'programmingSidebar',
            position: 'left',
            label: 'Programming',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'left'
          },
          {
            to: 'https://github.com/leliang129/1cobot',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Argo CD',
                to: 'https://argoproj.github.io/cd/',
              },
              {
                label: 'GitLab',
                to: 'https://docs.gitlab.com/ee/ci/yaml/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Kubernetes',
                to: 'https://kubernetes.io',
              },
              {
                label: 'Prometheus',
                to: 'https://prometheus.io',
              },
              {
                label: 'Docker',
                to: 'https://docs.docker.com/reference/cli/docker',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                to: 'https://github.com/leliang129/1cobot',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 1cobot.com 版权所有`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
