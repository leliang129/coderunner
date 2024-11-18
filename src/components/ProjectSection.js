import React from 'react';
import Link from '@docusaurus/Link';
import { FaSearch } from 'react-icons/fa';
import styles from './ProjectSection.module.css';

const projects = [
  {
    title: 'IP工具箱',
    description: '',
    icon: <FaSearch />,
    link: 'https://ipinfo.ing/'
  },
  {
    title: '可视化正则表达式',
    description: '',
    icon: <FaSearch />,
    link: 'https://devtoolcafe.com/tools/regex#!flags=img&re='
  },
  {
    title: 'JSON格式校验',
    description: '',
    icon: <FaSearch />,
    link: 'http://json.jsrun.cn/'
  },
  {
    title: '常用工具合集',
    description: '',
    icon: <FaSearch />,
    link: 'https://ctool.dev/'
  },
  {
    title: 'crontab 可视化',
    description: '',
    icon: <FaSearch />,
    link: 'https://crontab-generator.org/'
  },
  {
    title: '快速参考备忘清单',
    description: '',
    icon: <FaSearch />,
    link: 'https://quick.1cobot.com/'
  },
  {
    title: '在线工具合集',
    description: '',
    icon: <FaSearch />,
    link: 'https://www.ricocc.com/todo/'
  },
  {
    title: 'IP 测试工具',
    description: '',
    icon: <FaSearch />,
    link: 'https://ping.sx/ping'
  },
  {
    title: 'Excalidraw制图',
    description: '',
    icon: <FaSearch />,
    link: 'https://excalidraw.com/'
  },
  {
    title: 'Github个人主页生成器',
    description: '',
    icon: <FaSearch />,
    link: 'https://githubprofile.com/zh'
  },
  {
    title: 'openjdk镜像站',
    description: '',
    icon: <FaSearch />,
    link: 'https://adoptium.net/zh-CN/'
  },
  {
    title: 'JDK下载站',
    description: '',
    icon: <FaSearch />,
    link: 'https://www.injdk.cn/'
  },
  {
    title: 'OPENJDK下载站',
    description: '',
    icon: <FaSearch />,
    link: 'https://mirrors.tuna.tsinghua.edu.cn/Adoptium/'
  },
  {
    title: '临时邮箱',
    description: '',
    icon: <FaSearch />,
    link: 'https://tempmail.plus/zh/#!'
  },
  {
    title: 'Email Once',
    description: '',
    icon: <FaSearch />,
    link: 'https://email-once.com/'
  },
  {
    title: 'CURL命令转Python代码',
    description: '',
    icon: <FaSearch />,
    link: 'https://curlconverter.com/'
  }
];

export default function ProjectSection() {
  return (
    <section className={styles.projectSection}>
      <div className={styles.projectContainer}>
        <h2 className={styles.projectTitle}>
          实用工具
          <span className={styles.projectSubtitle}>个人项目与实践案例</span>
        </h2>
        <div className={styles.projectGrid}>
          {projects.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={styles.projectItem}
            >
              <div className={styles.projectIcon}>{item.icon}</div>
              <div className={styles.projectContent}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span className={styles.projectArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 