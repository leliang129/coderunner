import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { FaMusic, FaUser, FaThumbsUp, FaClock, FaHeadphones, FaCompactDisc } from 'react-icons/fa';

// 模拟数据，作为备用
const fallbackData = {
  songName: "起风了",
  artist: "买辣椒也用券",
  url: "https://music.163.com/#/song?id=1330348068",
  comment: {
    content: "我一路向北，离开有你的季节...",
    user: "网易云用户",
    likes: 66666,
    time: "2024-01-01"
  }
};

export default function HotNews() {
  const [news, setNews] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = async () => {
    try {
      const response = await fetch('https://api.uomg.com/api/comments.163', {
        mode: 'no-cors'
      });
      
      if (!response.ok) {
        setNews(fallbackData);
        return;
      }

      const data = await response.json();
      if (data.code === 1) {
        const rawData = data.data;
        const parts = rawData.title.split(' - ');
        const formattedData = {
          songName: parts[0]?.trim() || rawData.title,
          artist: parts[1]?.trim() || '',
          url: rawData.url,
          comment: {
            content: rawData.content,
            user: rawData.name,
            likes: rawData.like_count,
            time: rawData.time
          }
        };
        setNews(formattedData);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setNews(fallbackData);
      }
    } catch (err) {
      console.log('Using fallback data due to error:', err);
      setNews(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const timer = setInterval(fetchNews, 2 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.newsSection}>
        <h2><FaMusic /> 网易云音乐热评</h2>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>正在获取热评...</span>
        </div>
      </div>
    );
  }

  const displayData = news || fallbackData;

  return (
    <div className={styles.newsSection}>
      <h2>
        <FaMusic /> 网易云音乐热评
        {lastUpdated && (
          <span className={styles.updateTime}>
            最后更新: {lastUpdated}
          </span>
        )}
      </h2>
      <div className={styles.newsCard}>
        <div className={styles.musicInfo}>
          <div className={styles.musicTitle}>
            <FaHeadphones className={styles.icon} />
            <a href={displayData.url} target="_blank" rel="noopener noreferrer">
              {displayData.songName}
            </a>
          </div>
          {displayData.artist && (
            <div className={styles.songInfo}>
              <FaCompactDisc className={styles.icon} />
              <span>{displayData.artist}</span>
            </div>
          )}
        </div>
        <div className={styles.comment}>
          <div className={styles.commentMeta}>
            <span><FaUser /> {displayData.comment.user}</span>
            <span><FaClock /> {displayData.comment.time}</span>
          </div>
          <p className={styles.commentContent}>{displayData.comment.content}</p>
          <div className={styles.commentFooter}>
            <span><FaThumbsUp /> {displayData.comment.likes}</span>
            <button onClick={fetchNews} className={styles.refreshButton}>
              刷新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 