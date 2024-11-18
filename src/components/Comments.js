import React, { useState, useEffect } from 'react';
import styles from './Comments.module.css';

export default function Comments() {
  const [musicData, setBgImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    fetch('https://tenapi.cn/v2/comment')
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
    return <div className={styles.commentsContainer}>
      <div className={styles.loading}>Loading...</div>
    </div>;
  }

  if (!musicData) return null;

  return (
    <section className={styles.commentsSection}>
      <div className={styles.commentsContainer}>
        <h2 className={styles.sectionTitle}>
          网易云音乐热评
          <span className={styles.sectionSubtitle}>每日分享一条网易云音乐热评</span>
        </h2>
        <div className={styles.musicComment}>
          <div className={styles.musicInfo}>
            <img 
              src={musicData.cover} 
              alt={musicData.songs} 
              className={styles.albumCover}
            />
            <div className={styles.songDetails}>
              <a 
                href={musicData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.songTitle}
              >
                {musicData.songs}
              </a>
              <div className={styles.singer}>
                <span className={styles.label}>歌手：</span>
                {musicData.sings}
              </div>
              <div className={styles.album}>
                <span className={styles.label}>专辑：</span>
                {musicData.album}
              </div>
            </div>
          </div>
          <div className={styles.commentContent}>
            <div className={styles.commentHeader}>
              <span className={styles.username}>评论者：{musicData.name}</span>
            </div>
            <p className={styles.comment}>{musicData.comment}</p>
          </div>
        </div>
      </div>
    </section>
  );
} 