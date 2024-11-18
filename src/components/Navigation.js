import React from 'react';
import Link from '@docusaurus/Link';
import {
  FaCloud,
  FaDatabase,
  FaChartLine,
  FaCode,
  FaBug,
  FaTools,
  FaBook,
  FaRocket,
} from 'react-icons/fa';
import styles from './Navigation.module.css';

const navigationItems = [
  {
    title: 'Kubernetes',
    description: '容器编排平台学习笔记',
    icon: <FaCloud />,
    link: '/docs/k8s/1intro',
  },
  {
    title: '数据库',
    description: '数据库相关知识整理',
    icon: <FaDatabase />,
    link: '/docs/database/1intro',
  },
  {
    title: '监控告警',
    description: 'Prometheus & Grafana',
    icon: <FaChartLine />,
    link: '/docs/monitoring/1install_prometheus',
  },
  {
    title: '编程语言',
    description: 'Python & Shell & Go',
    icon: <FaCode />,
    link: '/docs/programming/create_tag',
  },
  {
    title: '故障排查',
    description: '问题定位与解决方案',
    icon: <FaBug />,
    link: '/docs/troubleshooting/intro',
  },
  {
    title: '最佳实践',
    description: '工具使用与实践总结',
    icon: <FaTools />,
    link: '/docs/best-practices/intro',
  },
  {
    title: '学习笔记',
    description: '技术学习与读书笔记',
    icon: <FaBook />,
    link: '/docs/notes/intro',
  },
  {
    title: '项目实战',
    description: '实际项目经验分享',
    icon: <FaRocket />,
    link: '/docs/projects/intro',
  },
];

export default function Navigation() {
  return (
    <section className={styles.navigation}>
      <div className={styles.navigationContainer}>
        <h2 className={styles.navigationTitle}>
          导航目录
          <span className={styles.navigationSubtitle}>快速访问文档分类</span>
        </h2>
        <div className={styles.navigationGrid}>
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={styles.navigationItem}
            >
              <div className={styles.navigationIcon}>{item.icon}</div>
              <div className={styles.navigationContent}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span className={styles.navigationArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 