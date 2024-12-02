import React from 'react';
import Link from '@docusaurus/Link';
import { 
  FaSearch, 
  FaNetworkWired, 
  FaCode, 
  FaTools,
  FaClock,
  FaListAlt,
  FaGlobe,
  FaPencilAlt,
  FaGithub,
  FaJava,
  FaEnvelope,
  FaEnvelopeOpen,
  FaTerminal,
  FaRegular,
  FaStream,
  FaPython
} from 'react-icons/fa';
import { 
  SiJson,
  SiOpenjdk,
  SiEclipseadoptium
} from 'react-icons/si';
import { VscRegex } from 'react-icons/vsc';
import styles from './ProjectSection.module.css';

const projects = [
  {
    title: 'IP工具箱',
    description: 'IP地址查询、DNS解析、Ping测试等网络工具集合',
    icon: <FaNetworkWired />,
    link: 'https://ipinfo.ing/'
  },
  {
    title: '可视化正则表达式',
    description: '在线正则表达式测试和可视化工具，帮助理解正则语法',
    icon: <VscRegex />,
    link: 'https://devtoolcafe.com/tools/regex#!flags=img&re='
  },
  {
    title: 'JSON格式校验',
    description: 'JSON数据格式化、验证和美化工具',
    icon: <SiJson />,
    link: 'http://json.jsrun.cn/'
  },
  {
    title: '常用工具合集',
    description: '开发者常用工具集，包含编码、加密、格式化等功能',
    icon: <FaTools />,
    link: 'https://ctool.dev/'
  },
  {
    title: 'crontab 可视化',
    description: '可视化生成和验证 crontab 定时任务表达式',
    icon: <FaClock />,
    link: 'https://crontab-generator.org/'
  },
  {
    title: '快速参考备忘清单',
    description: '各类编程语言和工具的速查手册',
    icon: <FaListAlt />,
    link: 'https://quick.1cobot.com/'
  },
  {
    title: '在线工具合集',
    description: '提供各种实用的在线开发工具和效率工具',
    icon: <FaStream />,
    link: 'https://www.ricocc.com/todo/'
  },
  {
    title: 'IP 测试工具',
    description: '网络连通性测试，支持 Ping、MTR、DNS 查询等',
    icon: <FaGlobe />,
    link: 'https://ping.sx/ping'
  },
  {
    title: 'Excalidraw制图',
    description: '手绘风格的在线绘图工具，适合技术架构图',
    icon: <FaPencilAlt />,
    link: 'https://excalidraw.com/'
  },
  {
    title: 'Github个人主页生成器',
    description: '快速生成美观的 GitHub 个人主页 README',
    icon: <FaGithub />,
    link: 'https://githubprofile.com/zh'
  },
  {
    title: 'openjdk镜像站',
    description: 'Eclipse Adoptium OpenJDK 官方下载站',
    icon: <SiOpenjdk />,
    link: 'https://adoptium.net/zh-CN/'
  },
  {
    title: 'JDK下载站',
    description: '各版本 JDK 下载镜像站，包含多个厂商发行版',
    icon: <FaJava />,
    link: 'https://www.injdk.cn/'
  },
  {
    title: 'OPENJDK下载站',
    description: '清华大学 Adoptium OpenJDK 镜像站',
    icon: <SiEclipseadoptium />,
    link: 'https://mirrors.tuna.tsinghua.edu.cn/Adoptium/'
  },
  {
    title: '临时邮箱',
    description: '提供临时邮箱服务，用于测试和注册',
    icon: <FaEnvelope />,
    link: 'https://tempmail.plus/zh/#!'
  },
  {
    title: 'Email Once',
    description: '一次性临时邮箱服务，注重隐私保护',
    icon: <FaEnvelopeOpen />,
    link: 'https://email-once.com/'
  },
  {
    title: 'CURL命令转Python代码',
    description: '将 cURL 命令自动转换为 Python 请求代码',
    icon: <FaTerminal />,
    link: 'https://curlconverter.com/'
  },
  {
    title: 'Python标准库文档',
    description: 'Python 标准库文档，包含所有内置模块和函数',
    icon: <FaPython />,
    link: 'https://docs.python.org/zh-cn/3/library/index.html'
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