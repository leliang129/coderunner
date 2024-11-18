import React from 'react';
import Link from '@docusaurus/Link';
import { 
  FaTools, 
  FaDocker, 
  FaRocket,
  FaCloud,
  FaServer,
  FaDownload,
  FaBox,
  FaCogs,
  FaNetworkWired
} from 'react-icons/fa';
import { SiKubernetes, SiDockercompose } from 'react-icons/si';
import styles from './ToolSection.module.css';

const tools = [
  {
    title: '容器工具',
    description: 'Docker、Kubernetes、Containerd等容器相关工具的安装与使用指南',
    icon: <FaDocker />,
    link: '/docs/container/tools'
  },
  {
    title: '镜像加速',
    description: '国内镜像源配置，包括Docker Hub、GHCR、Quay等镜像加速方案',
    icon: <FaRocket />,
    link: '/docs/container/mirror'
  },
  {
    title: 'Docker Compose',
    description: '使用Docker Compose编排多容器应用，快速部署开发环境',
    icon: <SiDockercompose />,
    link: '/docs/container/compose'
  },
  {
    title: 'Kubernetes工具',
    description: 'kubectl、helm、k9s等K8s常用工具的配置与使用',
    icon: <SiKubernetes />,
    link: '/docs/container/k8s-tools'
  },
  {
    title: '容器运行时',
    description: 'Containerd、CRI-O等容器运行时的安装配置指南',
    icon: <FaBox />,
    link: '/docs/container/runtime'
  },
  {
    title: '网络工具',
    description: 'Calico、Flannel等容器网络方案的部署与配置',
    icon: <FaNetworkWired />,
    link: '/docs/container/network'
  },
  {
    title: '监控工具',
    description: 'Prometheus、Grafana等监控工具的部署与使用',
    icon: <FaServer />,
    link: '/docs/container/monitor'
  },
  {
    title: '实用工具集',
    description: '日常开发和运维中常用的工具和脚本集合',
    icon: <FaTools />,
    link: '/docs/tools/utils'
  }
];

export default function ToolSection() {
  return (
    <section className={styles.toolSection}>
      <div className={styles.toolContainer}>
        <h2 className={styles.toolTitle}>
          工具推荐
          <span className={styles.toolSubtitle}>提升效率的必备工具</span>
        </h2>
        <div className={styles.toolGrid}>
          {tools.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={styles.toolItem}
            >
              <div className={styles.toolIcon}>{item.icon}</div>
              <div className={styles.toolContent}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span className={styles.toolArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 