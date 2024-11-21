import React from 'react';
import Link from '@docusaurus/Link';
import { 
  FaCloud,
  FaCloudDownloadAlt,
  FaDatabase,
  FaJava,
  FaJs,
  FaServer,
  FaWarehouse,
  FaBoxes,
  FaNetworkWired
} from 'react-icons/fa';
import { 
  AiFillCloud,
  AiOutlineCloud,
  AiFillDatabase
} from 'react-icons/ai';
import styles from './TutorialSection.module.css';

const tutorials = [
  {
    title: '阿里源',
    description: '阿里云开源镜像站，提供各类开源软件的下载加速',
    icon: <AiFillCloud />,
    link: 'https://developer.aliyun.com/mirror/'
  },
  {
    title: '网易源',
    description: '网易开源镜像站，提供 Linux 发行版和开源软件镜像',
    icon: <AiOutlineCloud />,
    link: 'https://mirrors.163.com/'
  },
  {
    title: '腾讯源',
    description: '腾讯云软件源，提供开源软件、操作系统镜像加速',
    icon: <FaCloud />,
    link: 'https://mirrors.tencent.com/'
  },
  {
    title: '华为源',
    description: '华为云镜像站，提供开源软件、操作系统等资源加速',
    icon: <FaCloudDownloadAlt />,
    link: 'https://mirrors.huaweicloud.com/home'
  },
  {
    title: '清华源',
    description: '清华大学开源软件镜像站，更新及时，资源丰富',
    icon: <FaServer />,
    link: 'https://mirrors.tuna.tsinghua.edu.cn/'
  },
  {
    title: 'maven中央仓库',
    description: 'Maven 中央仓库，Java 生态系统的依赖包管理',
    icon: <FaWarehouse />,
    link: 'https://mvnrepository.com/'
  },
  {
    title: 'mvn阿里仓库',
    description: '阿里云 Maven 仓库服务，提供 Java 依赖包加速',
    icon: <FaJava />,
    link: 'https://developer.aliyun.com/mvn/guide'
  },
  {
    title: 'npm淘宝源',
    description: 'NPM 包管理工具的淘宝镜像，提供 Node.js 依赖加速',
    icon: <FaBoxes />,
    link: 'https://npmmirror.com/'
  }
];

export default function ImageMirror() {
  return (
    <section className={styles.tutorialSection}>
      <div className={styles.tutorialContainer}>
        <h2 className={styles.tutorialTitle}>
          镜像加速
          <span className={styles.tutorialSubtitle}>软件源与包管理镜像</span>
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