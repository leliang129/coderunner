const axios = require('axios');

// 从标题中提取歌曲信息
function extractMusicInfo(title) {
  const parts = title.split(' - ');
  return {
    songName: parts[0]?.trim() || title,
    artist: parts[1]?.trim() || ''
  };
}

async function fetchNews() {
  try {
    const response = await axios.get('https://api.uomg.com/api/comments.163', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      maxRedirects: 5,
      timeout: 5000
    });

    if (response.data.code === 1) {
      const rawData = response.data.data;
      const { songName, artist } = extractMusicInfo(rawData.title);

      // 构建格式化的返回数据
      const formattedData = {
        songName,
        artist,
        url: rawData.url,
        comment: {
          content: rawData.content,
          user: rawData.name,
          likes: rawData.like_count,
          time: rawData.time
        }
      };

      console.log('\n=== 网易云音乐热评 ===');
      console.log('歌曲名称:', songName);
      console.log('歌手:', artist);
      console.log('音乐链接:', rawData.url);
      console.log('\n评论信息:');
      console.log('用户:', rawData.name);
      console.log('内容:', rawData.content);
      console.log('点赞数:', rawData.like_count);
      console.log('时间:', rawData.time);
      console.log('===================\n');

      return formattedData;
    } else {
      throw new Error(`API Error: ${response.data.msg || '未知错误'}`);
    }
  } catch (error) {
    if (error.response) {
      console.error('Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// 直接运行测试
fetchNews()
  .then(data => {
    console.log('格式化后的数据:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(error => console.error('Final Error:', error));

module.exports = fetchNews;
  