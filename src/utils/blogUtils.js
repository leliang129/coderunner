import { usePluginData } from '@docusaurus/useGlobalData';
export function useBlogPosts() {
  try {
    // 获取博客插件数据
    const blogData = usePluginData('docusaurus-plugin-content-blog');
    console.log('Raw Blog Data:', JSON.stringify(blogData, null, 2));

    // 第三步检查：blogData 是否为空
    if (!blogData) {
      console.log('No blog data found');
      return [];
    }

    // 尝试获取默认博客数据
    const defaultBlog = blogData?.default;
    console.log('Default Blog:', JSON.stringify(defaultBlog, null, 2));

    if (!defaultBlog) {
      console.log('No default blog data found');
      return [];
    }

    // 尝试获取博客文章
    const posts = defaultBlog.blogPosts || [];
    console.log('Found Posts:', JSON.stringify(posts, null, 2));

    if (posts.length === 0) {
      console.log('No posts found in blog data');
      return [];
    }

    // 过滤和排序
    const validPosts = posts
      .filter(post => {
        const isValid = post && post.metadata && post.metadata.date;
        if (!isValid) {
          console.log('Invalid post:', post);
        }
        return isValid;
      })
      .sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));

    console.log('Valid sorted posts:', JSON.stringify(validPosts, null, 2));
    return validPosts;
  } catch (error) {
    console.error('Error in useBlogPosts:', error);
    return [];
  }
}