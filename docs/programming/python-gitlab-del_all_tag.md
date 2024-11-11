---
title: Python-删除gitlab所有标签
---
```python
import gitlab

# 配置 GitLab 服务器 URL 和私人访问令牌
GITLAB_URL = 'https://gitlab.1cobot.com'
PRIVATE_TOKEN = '---'
PROJECT_ID = '216'

# 通过私人访问令牌登录 GitLab
gl = gitlab.Gitlab(GITLAB_URL, private_token=PRIVATE_TOKEN)

# 获取项目对象
project = gl.projects.get(PROJECT_ID)

# 获取所有标签并删除
tags = project.tags.list(all=True)

for tag in tags:
    print(f'Deleting tag: {tag.name}')
    tag.delete()

print('All tags have been deleted successfully.')

```