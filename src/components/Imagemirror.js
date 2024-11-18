import React from 'react';
import Link from '@docusaurus/Link';
import { FaSearch } from 'react-icons/fa';
import styles from './TutorialSection.module.css';

const tutorials = [
  {
    title: '阿里源',
    description: '',
    icon: <FaSearch />,
    link: 'https://developer.aliyun.com/mirror/'
  },
  {
    title: '网易源',
    description: '',
    icon: <FaSearch />,
    link: 'https://mirrors.163.com/'
  },
  {
    title: '腾讯源',
    description: '',
    icon: <FaSearch />,
    link: 'https://mirrors.tencent.com/'
  },
  {
    title: '华为源',
    description: '',
    icon: <FaSearch />,
    link: 'https://mirrors.huaweicloud.com/home'
  },
  {
    title: '清华源',
    description: '',
    icon: <FaSearch />,
    link: 'https://mirrors.tuna.tsinghua.edu.cn/'
  },
  {
    title: 'maven中央仓库',
    description: '',
    icon: <FaSearch />,
    link: 'https://mvnrepository.com/'
  },
  {
    title: 'mvn阿里仓库',
    description: '',
    icon: <FaSearch />,
    link: 'https://developer.aliyun.com/mvn/guide'
  },
  {
    title: 'npm淘宝源',
    description: '',
    icon: <FaSearch />,
    link: 'https://npmmirror.com/'
  }
];

export default function TutorialSection() {
  return (
    <section className={styles.tutorialSection}>
      <div className={styles.tutorialContainer}>
        <h2 className={styles.tutorialTitle}>
          镜像加速
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