import React from 'react';
import Link from '@docusaurus/Link';
import { 
  FaSearch, 
  FaDocker, 
  FaFile, 
  FaRocket,
  FaCloud,
  FaCubes,
  FaChartLine,
  FaBoxes,
  FaServer,
  FaCloudDownloadAlt,
  FaLayerGroup
} from 'react-icons/fa';
import { 
  SiKubernetes, 
  SiDockercompose,
  SiHelm,
  SiK3S
} from 'react-icons/si';
import { DiDocker } from 'react-icons/di';
import styles from './TutorialSection.module.css';

const tutorials = [
  {
    title: 'K8s资源文件生成器',
    description: '在线生成 Kubernetes 资源配置文件，支持多种资源类型',
    icon: <SiKubernetes />,
    link: 'https://k8syaml.com/'
  },
  {
    title: 'Dockerfile参考文档',
    description: '详细的 Dockerfile 指令说明和最佳实践指南',
    icon: <DiDocker />,
    link: 'https://deepzz.com/post/dockerfile-reference.html'
  },
  {
    title: 'docker-compose参考文档',
    description: 'Docker Compose 配置文件完整参考手册',
    icon: <DiDocker />,
    link: 'https://deepzz.com/post/docker-compose-file.html'
  },
  {
    title: 'docker-compose文件生成器',
    description: '将 Docker 命令转换为 docker-compose 配置文件',
    icon: <DiDocker />,
    link: 'https://www.composerize.com/'
  },
  {
    title: 'Docker镜像加速',
    description: 'Docker Hub 镜像加速器，提高镜像下载速度',
    icon: <FaRocket />,
    link: 'https://dockerproxy.com/'
  },
  {
    title: 'k3s',
    description: '轻量级 Kubernetes 发行版，适用于边缘计算',
    icon: <FaCloud />,
    link: 'https://docs.k3s.io/zh/'
  },
  {
    title: 'kind',
    description: '使用 Docker 容器运行本地 Kubernetes 集群',
    icon: <FaCubes />,
    link: 'https://kind.sigs.k8s.io/'
  },
  {
    title: 'Kubernetes Api',
    description: 'Kubernetes API 参考文档中文版',
    icon: <SiKubernetes />,
    link: 'https://k8s.mybatis.io/'
  },
  {
    title: 'Helm 仓库',
    description: 'Kubernetes 应用程序包的公共仓库',
    icon: <FaLayerGroup />,
    link: 'https://artifacthub.io/'
  },
  {
    title: 'Helm',
    description: 'Kubernetes 的包管理器官方文档',
    icon: <FaLayerGroup />,
    link: 'https://helm.sh'
  },
  {
    title: 'Registry Explorer',
    description: '在线浏览和搜索 Docker 镜像仓库内容',
    icon: <FaBoxes />,
    link: 'https://explore.ggcr.dev/'
  },
  {
    title: '渡渡鸟镜像同步站',
    description: '提供 Docker 镜像同步服务，加速镜像拉取',
    icon: <FaCloudDownloadAlt />,
    link: 'https://docker.aityp.com/'
  }
];

export default function TutorialSection() {
  return (
    <section className={styles.tutorialSection}>
      <div className={styles.tutorialContainer}>
        <h2 className={styles.tutorialTitle}>
          容器相关
          <span className={styles.tutorialSubtitle}>系统化的学习资料</span>
        </h2>
        <div className={styles.tutorialGrid}>
          {tutorials.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={styles.tutorialItem}
            >
              <div className={styles.tutorialIcon}>{item.icon}</div>
              <div className={styles.tutorialContent}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span className={styles.tutorialArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 