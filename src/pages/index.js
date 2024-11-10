import React from 'react';
import {
  FaReadme,
  FaInfoCircle,
  FaDocker,
  FaDatabase,
  FaChartLine,
  FaCode,
  FaArrowRight,
  FaBook,
  FaGithub,
  FaYoutube,
  FaMedium,
  FaFileAlt,
  FaTools,
  FaGraduationCap,
  FaBug,
  FaRocket,
  FaCloud,
  FaServer,
  FaChartBar
} from 'react-icons/fa';
import { SiKubernetes } from 'react-icons/si';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroContainer}>
        <div className={styles.heroWrapper}>
          <div className={styles.heroContent}>
            <Heading as="h1" className={styles.heroTitle}>
              {siteConfig.title}
            </Heading>
            <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>

            <div className={styles.buttonGroup}>
              <Link
                className={clsx(styles.buttonPrimary)}
                to="/docs/k8s/1intro">
                <FaReadme className={styles.buttonIcon} />
                开始阅读
              </Link>
              <Link
                className={clsx(styles.buttonSecondary)}
                to="/about">
                <FaInfoCircle className={styles.buttonIcon} />
                关于
              </Link>
            </div>
          </div>

          <div className={styles.heroImage}>
            <img src="https://pic.netbian.com/uploads/allimg/240322/233416-1711121656e5bd.jpg" alt="Hero" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Features() {
  const features = [
    {
      title: '容器编排利器',
      icon: <FaDocker className={styles.featureIcon} />,
      description: '深入探讨 Kubernetes 生态系统，包括容器编排、服务发现、负载均衡、自动扩缩容等核心特性，助您构建现代化云原生应用。',
      link: '/docs/k8s/1intro'
    },
    {
      title: '数据库架构',
      icon: <FaDatabase className={styles.featureIcon} />,
      description: '涵盖关系型(MySQL/PostgreSQL)与非关系型(MongoDB/Redis)数据库，从性能优化到高可用架构，全方位提升数据管理能力。',
      link: '/docs/database/1intro'
    },
    {
      title: '监控告警体系',
      icon: <FaChartLine className={styles.featureIcon} />,
      description: 'Prometheus 与 Grafana 实践指南，构建全方位的监控系统，包括性能指标采集、告警规则配置、可视化面板搭建等。',
      link: '/docs/monitoring/1install_prometheus'
    },
    {
      title: '编程语言合集',
      icon: <FaCode className={styles.featureIcon} />,
      description: '涵盖 Go、Python、Shell 等主流编程语言，从基础语法到高级特性，帮助您掌握核心开发技能。',
      link: '/docs/programming/create_tag'
    },
  ];

  return (
    <section className={styles.features}>
      <div className={styles.featuresContainer}>
        {features.map((feature, idx) => (
          <Link
            key={idx}
            to={feature.link}
            className={styles.featureLink}
          >
            <div className={styles.featureItem}>
              <h3>
                {feature.icon}
                {feature.title}
              </h3>
              <p>{feature.description}</p>
              <span className={styles.featureArrow}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ResourceSection() {
  const resources = [
    {
      title: '技术文档',
      icon: <FaBook className={styles.resourceIcon} />,
      items: [
        {
          name: 'Kubernetes 官方文档',
          description: '容器编排平台完整指南',
          link: 'https://kubernetes.io/docs/home/',
          icon: <SiKubernetes className={styles.itemIcon} />
        },
        {
          name: 'Prometheus 文档',
          description: '监控系统使用指南',
          link: 'https://prometheus.io/docs/introduction/overview/',
          icon: <FaChartBar className={styles.itemIcon} />
        }
      ]
    },
    {
      title: '开源项目',
      icon: <FaGithub className={styles.resourceIcon} />,
      items: [
        {
          name: 'Argo CD',
          description: 'Kubernetes 的声明式 GitOps 工具',
          link: 'https://github.com/argoproj/argo-cd',
          icon: <FaRocket className={styles.itemIcon} />
        },
        {
          name: 'Grafana',
          description: '可视化监控面板',
          link: 'https://github.com/grafana/grafana',
          icon: <FaChartLine className={styles.itemIcon} />
        }
      ]
    },
    {
      title: '学习资源',
      icon: <FaGraduationCap className={styles.resourceIcon} />,
      items: [
        {
          name: '云原生课程',
          description: 'Kubernetes 实战教程',
          link: '/docs/k8s/1intro',
          icon: <FaDocker className={styles.itemIcon} />
        },
        {
          name: '监控系统搭建',
          description: 'Prometheus + Grafana 实践',
          link: '/docs/monitoring/1install_prometheus',
          icon: <FaServer className={styles.itemIcon} />
        }
      ]
    },
    {
      title: '技术博客',
      icon: <FaFileAlt className={styles.resourceIcon} />,
      items: [
        {
          name: '最佳实践',
          description: '云原生应用部署案例',
          link: '/blog',
          icon: <FaTools className={styles.itemIcon} />
        },
        {
          name: '故障排查',
          description: '常见问题解决方案',
          link: '/docs/troubleshooting/intro',
          icon: <FaBug className={styles.itemIcon} />
        }
      ]
    }
  ];

  return (
    <section className={styles.resources}>
      <div className={styles.resourcesContainer}>
        <h2 className={styles.sectionTitle}>
          资源导航
          <span className={styles.sectionSubtitle}>精选技术资源，助力学习提升</span>
        </h2>
        <div className={styles.resourceGrid}>
          {resources.map((category, idx) => (
            <div key={idx} className={styles.resourceCategory}>
              <h3 className={styles.categoryTitle}>
                {category.icon}
                {category.title}
              </h3>
              <div className={styles.resourceItems}>
                {category.items.map((item, itemIdx) => (
                  <Link
                    key={itemIdx}
                    to={item.link}
                    className={styles.resourceItem}
                  >
                    <div className={styles.resourceItemHeader}>
                      {item.icon}
                      <h4>{item.name}</h4>
                    </div>
                    <p>{item.description}</p>
                    <span className={styles.resourceArrow}>
                      <FaArrowRight />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <Features />
        <ResourceSection />
      </main>
    </Layout>
  );
}
