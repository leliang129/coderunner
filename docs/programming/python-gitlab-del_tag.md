---
title: Python-删除GitLab指定标签
---
```python
import gitlab

# 配置 GitLab 服务器 URL 和私人访问令牌
GITLAB_URL = 'https://gitlab.1cobot.com'
PRIVATE_TOKEN = '---'
PROJECT_ID = '216'
TAG_NAME = 'v0.0.1'

# 通过私人访问令牌登录 GitLab
gl = gitlab.Gitlab(GITLAB_URL, private_token=PRIVATE_TOKEN)

# 获取项目对象
project = gl.projects.get(PROJECT_ID)

# 删除指定标签
try:
    tag = project.tags.get(TAG_NAME)
    tag.delete()
    print(f'Tag {TAG_NAME} has been deleted successfully.')
except gitlab.exceptions.GitlabGetError:
    print(f'Tag {TAG_NAME} does not exist.')

```