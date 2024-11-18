import React from 'react';
import Link from '@docusaurus/Link';
import { FaSearch } from 'react-icons/fa';
import styles from './TutorialSection.module.css';

const tutorials = [
  {
    title: 'K8s资源文件生成器',
    description: '',
    icon: <FaSearch />,
    link: 'https://k8syaml.com/'
  },
  {
    title: 'Dockerfile参考文档',
    description: '',
    icon: <FaSearch />,
    link: 'https://deepzz.com/post/dockerfile-reference.html'
  },
  {
    title: 'docker-compose参考文档',
    description: '',
    icon: <FaSearch />,
    link: 'https://deepzz.com/post/docker-compose-file.html'
  },
  {
    title: 'docker-compose文件生成器',
    description: '',
    icon: <FaSearch />,
    link: 'https://www.composerize.com/'
  },
  {
    title: 'Docker镜像加速',
    description: '',
    icon: <FaSearch />,
    link: 'https://dockerproxy.com/'
  },
  {
    title: 'k3s',
    description: '',
    icon: <FaSearch />,
    link: 'https://docs.k3s.io/zh/'
  },
  {
    title: 'kind',
    description: '',
    icon: <FaSearch />,
    link: 'https://kind.sigs.k8s.io/'
  },
  {
    title: 'Kubernetes Api',
    description: '',
    icon: <FaSearch />,
    link: 'https://k8s.mybatis.io/'
  },
  {
    title: 'Helm 仓库',
    description: '',
    icon: <FaSearch />,
    link: 'https://artifacthub.io/'
  },
  {
    title: 'Helm',
    description: '',
    icon: <FaSearch />,
    link: 'https://helm.sh'
  },
  {
    title: 'Registry Explorer',
    description: '',
    icon: <FaSearch />,
    link: 'https://explore.ggcr.dev/'
  },
  {
    title: '渡渡鸟镜像同步站',
    description: '',
    icon: <FaSearch />,
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