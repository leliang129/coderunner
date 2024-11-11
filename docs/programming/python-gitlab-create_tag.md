---
title: Python-GitLab创建tag
---
```python
import gitlab


class ManagerTag:
    def __init__(self, gitlab_url, gitlab_token, project_name, branch, tag):
        """
        初始化Gitlab连接和项目信息

        参数:
        gitlab_url: str - Gitlab的URL地址
        gitlab_token: str - 访问Gitlab的个人访问令牌
        project_name: str - Gitlab上的项目名称或ID
        branch: str - 代码分支名称
        tag: str - 代码标签名称
        """

        # 创建Gitlab实例
        self.gl = gitlab.Gitlab(gitlab_url, private_token=gitlab_token)

        # 项目名称或者ID
        self.project_name = project_name

        # 代码分支
        self.branch = branch

        # 标签名称
        self.tag = tag

    def create_tag(self):
        project = self.gl.projects.get(self.project_name)

        commit = project.commits.get(self.branch)

        tag = project.tags.create({"tag_name": self.tag, "ref": commit.id})

        print(f"标签：{self.tag} 创建成功。")


if __name__ == "__main__":
    """
    工程名                     分支名                 项目ID
    example                    main                  216
    """
    gitlab_url = "https://gitlab.1cobot.com"
    access_token = "xxxxxxxxxxxxx"
    project = "216"
    branch = "main"
    tag = "v0.0.1"

    create_tag_obj = ManagerTag(
        gitlab_url=gitlab_url,
        gitlab_token=access_token,
        project_name=project,
        branch=branch,
        tag=tag,
    )

    create_tag_obj.create_tag()

```