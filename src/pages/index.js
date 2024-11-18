import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';
import Comments from '../components/Comments';
import Navigation from '../components/Navigation';
import ResourceSection from '../components/ResourceSection';
import ProjectSection from '../components/ProjectSection';
import TutorialSection from '../components/TutorialSection';

function HomepageHeader() {
  const [bgImage, setBgImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    fetch('https://tenapi.cn/v2/bing')
      .then(res => res.json())
      .then(data => {
        if(data.code === 200) {
          setBgImage(data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className={styles.heroLoading}>Loading...</div>;
  }

  if (!bgImage) return null;

  return (
    <header className={clsx(styles.heroBanner, styles.heroBackground)}>
      <div 
        className={styles.heroBackgroundImage}
        style={{
          backgroundImage: `url(${bgImage.url})`
        }}
      />
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <h1>{bgImage.title}</h1>
        <p>{bgImage.copyright}</p>
      </div>
    </header>
  );
}

function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <Comments />
        <Navigation />
        <ResourceSection />
        <ProjectSection />
        <TutorialSection />
      </main>
    </Layout>
  );
}

export default Home;
