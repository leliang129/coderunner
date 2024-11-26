import React from 'react';
import Link from '@docusaurus/Link';
import {
  FaBook,
  FaGithub,
  FaGraduationCap,
  FaFileAlt,
  FaTools,
  FaBug,
  FaRocket,
  FaCloud,
  FaServer,
  FaChartBar,
  FaDocker,
  FaChartLine,
} from 'react-icons/fa';
import { SiKubernetes } from 'react-icons/si';
import styles from './ResourceSection.module.css';

const resources = [
  {
    title: 'Kubernetes文档',
    description: '容器编排平台完整指南',
    icon: <SiKubernetes />,
    link: 'https://kubernetes.io/docs/home/'
  },
  {
    title: 'Prometheus文档',
    description: '监控系统使用指南',
    icon: <FaChartBar />,
    link: 'https://prometheus.io/docs/introduction/overview/'
  },
  {
    title: 'Docker指南',
    description: '容器化应用开发指南',
    icon: <FaDocker />,
    link: 'https://docs.docker.com/'
  },
  {
    title: '云原生教程',
    description: '从入门到进阶的学习路径',
    icon: <FaCloud />,
    link: '/docs/cloud-native/intro'
  },
  {
    title: 'Grafana',
    description: '可视化监控面板',
    icon: <FaChartLine />,
    link: 'https://github.com/grafana/grafana'
  },
  {
    title: '故障排查',
    description: '常见问题解决方案',
    icon: <FaBug />,
    link: '/docs/linux/intro'
  }
];

export default function ResourceSection() {
  return (
    <section className={styles.resourceSection}>
      <div className={styles.resourceContainer}>
        <h2 className={styles.resourceTitle}>
          资源导航
          <span className={styles.resourceSubtitle}>精选技术资源，助力学习提升</span>
        </h2>
        <div className={styles.resourceGrid}>
          {resources.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={styles.resourceItem}
            >
              <div className={styles.resourceIcon}>{item.icon}</div>
              <div className={styles.resourceContent}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span className={styles.resourceArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 