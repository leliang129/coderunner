import React from 'react';
import styles from './styles.module.css';
import Comments from '../Comments';
import Navigation from '../Navigation';
import ResourceSection from '../ResourceSection';
import ProjectSection from '../ProjectSection';
import TutorialSection from '../TutorialSection';
import Imagemirror from '../Imagemirror';

export default function Nav() {
  return (
    <div className={styles.navContainer}>
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
    </div>
  );
} 