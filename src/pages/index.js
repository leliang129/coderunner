import React from 'react';
import {
  FaReadme,
  FaInfoCircle,
  FaDocker,
  FaDatabase,
  FaChartLine,
  FaCode,
  FaArrowRight,
  FaCalendar
} from 'react-icons/fa';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import { useBlogPosts } from '../utils/blogUtils';

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

function BlogSection() {
  const sortedPosts = useBlogPosts();

  return (
    <section className={styles.blogSection}>
      <div className={styles.blogContainer}>
        <div className={styles.sectionHeader}>
          <h2>最新博客</h2>
          <Link to="/blog" className={styles.viewAll}>
            查看全部 <FaArrowRight />
          </Link>
        </div>
        <div className={styles.blogGrid}>
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post, idx) => (
              <Link
                key={post.metadata.id || post.metadata.permalink}
                to={post.metadata.permalink}
                className={styles.blogCard}
              >
                <div className={styles.featureItem}>
                  <h3>{post.metadata.title}</h3>
                  <p>{post.metadata.description || ''}</p>
                  <div className={styles.blogMeta}>
                    <span className={styles.blogDate}>
                      <FaCalendar />
                      {post.metadata.date
                        ? new Date(post.metadata.date).toLocaleDateString('zh-CN')
                        : '无日期'}
                    </span>
                    <span className={styles.readMore}>
                      阅读更多 <FaArrowRight />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noPosts}>暂无博客文章</div>
          )}
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
        <BlogSection />
      </main>
    </Layout>
  );
}
