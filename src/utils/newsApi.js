import axios from 'axios';

export async function fetchNews() {
  try {
    const response = await axios.get('https://tenapi.cn/v2/toutiaohotnew', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      maxRedirects: 5,
      timeout: 5000
    });

    if (response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(`API Error: ${response.data.msg || '未知错误'}`);
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
} 