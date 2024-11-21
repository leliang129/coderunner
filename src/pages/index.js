import React, { useState, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';
import { 
  FaBook, 
  FaRocket, 
  FaTools, 
  FaDocker, 
  FaPython,
  FaAngleRight,
  FaQuoteLeft,
  FaChartBar,
  FaDatabase,
  FaServer,
  FaCloud,
  FaCode,
  FaCogs,
  FaGithub,
  FaChartLine,
  FaNetworkWired,
  FaLaptopCode,
  FaBrain
} from 'react-icons/fa';
import { 
  SiKubernetes, 
  SiPrometheus, 
  SiGrafana, 
  SiDocker, 
  SiMysql, 
  SiPython,
  SiGit,
  SiJenkins,
  SiAnsible,
  SiTerraform,
  SiElasticsearch,
  SiNginx,
  SiRedis,
  SiPostgresql,
  SiMongodb,
  SiRabbitmq
} from 'react-icons/si';
import {
  GrStorage,
  GrCloudCompute,
  GrMonitor,
  GrOptimize
} from 'react-icons/gr';
import {
  AiOutlineCloudServer,
  AiOutlineDatabase,
  AiOutlineDeploymentUnit,
  AiOutlineCluster
} from 'react-icons/ai';
import {
  BiNetworkChart,
  BiData,
  BiCodeBlock,
  BiGitBranch
} from 'react-icons/bi';

function Hero() {
  const { siteConfig } = useDocusaurusContext();
  const [dailyQuote, setDailyQuote] = useState('');

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://tenapi.cn/v2/yiyan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'format=json'
        });
        const data = await response.json();
        if (data && data.data) {
          setDailyQuote(data.data.hitokoto || '学习永无止境');
        }
      } catch (error) {
        console.error('获取每日一言失败:', error);
        setDailyQuote('学习永无止境');
      }
    };

    fetchQuote();
  }, []);

  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              技术文档库
            </h1>
            <p className={styles.heroSubtitle}>
              从基础设施到应用开发的技术文档与最佳实践
            </p>
          </div>
          <div className={styles.heroActions}>
            {dailyQuote && (
              <div className={styles.dailyQuote}>
                <FaQuoteLeft className={styles.quoteIcon} />
                <span>{dailyQuote}</span>
              </div>
            )}
            <div className={styles.heroButtons}>
              <Link
                className={styles.primaryButton}
                to="/docs/intro">
                开始探索
              </Link>
              <Link
                className={styles.secondaryButton}
                to="/nav">
                资源导航
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Features() {
  const features = [
    {
      title: '云原生技术',
      icon: <AiOutlineCloudServer />,
      description: '容器化、微服务、服务网格等云原生技术实践'
    },
    {
      title: '监控告警',
      icon: <GrMonitor />,
      description: '系统监控、日志分析、性能优化解决方案'
    },
    {
      title: '数据库',
      icon: <AiOutlineDatabase />,
      description: '数据库运维、优化、高可用架构设计'
    },
    {
      title: '自动化运维',
      icon: <FaCogs />,
      description: 'CI/CD、自动化部署、配置管理最佳实践'
    }
  ];

  return (
    <section className={styles.features}>
      <div className={styles.featuresInner}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureItem}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TechStack() {
  const techItems = [
    { icon: <SiKubernetes />, name: 'Kubernetes' },
    { icon: <SiPrometheus />, name: 'Prometheus' },
    { icon: <SiDocker />, name: 'Docker' },
    { icon: <SiPython />, name: 'Python' },
    { icon: <SiGit />, name: 'Git' },
    { icon: <SiJenkins />, name: 'Jenkins' },
    { icon: <SiAnsible />, name: 'Ansible' },
    { icon: <SiTerraform />, name: 'Terraform' }
  ];

  return (
    <section className={styles.techStack}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.titleBar}>|</span>
          技术栈
        </h2>
        <div className={styles.techGrid}>
          {techItems.map((item, index) => (
            <div key={index} className={styles.techItem}>
              <div className={styles.techIcon}>{item.icon}</div>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestUpdates() {
  const recentPosts = [
    {
      id: '1',
      title: 'Docusaurus代码块使用',
      description: '在 Docusaurus 中实现代码块的多个选项卡可以使用其提供的 Tabs 和 TabItem 组件...',
      date: '2024-01-20',
      permalink: '/blog/docusaurus'
    },
    {
      id: '2',
      title: 'buildx构建多平台镜像',
      description: 'docker buildx构建多平台镜像',
      date: '2024-11-14',
      permalink: '/blog/2024/11/14/buildx'
    },
    {
      id: '3',
      title: 'GitLab 集成钉钉扫码登录',
      description: 'GitLab 集成钉钉扫码登录...',
      date: '2024-11-14',
      permalink: '/blog/2024/11/14/gitlab-login'
    }
  ];

  return (
    <section className={styles.updates}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.titleBar}>|</span>
          最新动态
        </h2>
        <div className={styles.updateGrid}>
          {recentPosts.map((post) => (
            <Link 
              key={post.id} 
              to={post.permalink} 
              className={styles.updateItem}
            >
              <div className={styles.updateContent}>
                <span className={styles.updateDate}>{post.date}</span>
                <h4>{post.title}</h4>
                <p>{post.description}</p>
                <span className={styles.readMore}>
                  阅读更多 <FaAngleRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.viewAllWrapper}>
          <Link to="/blog" className={styles.viewAllButton}>
            查看全部文章 <FaAngleRight />
          </Link>
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
      <main className={styles.main}>
        <Hero />
        <Features />
        <TechStack />
        <LatestUpdates />
      </main>
    </Layout>
  );
}
