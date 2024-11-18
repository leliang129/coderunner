import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';
import Comments from '../components/Comments';
import Navigation from '../components/Navigation';
import ResourceSection from '../components/ResourceSection';
import ProjectSection from '../components/ProjectSection';
import TutorialSection from '../components/TutorialSection';
import Imagemirror from '../components/Imagemirror';

function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}
      wrapperClassName={styles.customPage}
    >
      <div className={styles.bgAnimation}>
        <div className={styles.bgAnimationEffect1}></div>
        <div className={styles.bgAnimationEffect2}></div>
        <div className={styles.bgAnimationEffect3}></div>
      </div>
      <main className={styles.mainContent}>
        <Comments />
        <Navigation />
        <ResourceSection />
        <ProjectSection />
        <TutorialSection />
        <Imagemirror />
      </main>
    </Layout>
  );
}

export default Home;
