---
title: Python-下载Gitlab Artifacts制品
---
## 安装gitlab模块
```bash
pip install python-gitlab
```
## 环境变量
```bash
cat /etc/profile.d/gitlab.sh

GITLAB_URL=https://gitlab.example.com
GITLAB_TOKEN=---
```
## 代码
```python
import gitlab
import os
import requests
from typing import Optional, List
from datetime import datetime

class GitlabClient:
    def __init__(self, url: str, private_token: str):
        """
        初始化GitLab客户端
        :param url: GitLab服务器URL
        :param private_token: GitLab访问令牌
        """
        self.gl = gitlab.Gitlab(url=url, private_token=private_token)
        self.token = private_token

    def get_project(self, project_id: int):
        """
        获取指定项目
        :param project_id: 项目ID
        :return: 项目对象
        """
        try:
            return self.gl.projects.get(project_id)
        except gitlab.exceptions.GitlabGetError:
            print(f"错误: 未找到ID为 {project_id} 的项目")
            return None

    def get_job_artifacts(self, project_id: int, job_id: Optional[int] = None, 
                         pipeline_id: Optional[int] = None, ref: str = 'main',
                         download_path: str = 'artifacts') -> List[str]:
        """
        下载项目制品
        :param project_id: 项目ID
        :param job_id: 指定的任务ID（可选）
        :param pipeline_id: 指定的流水线ID（可选）
        :param ref: 分支名称，默认为main
        :param download_path: 下载保存路径
        :return: 下载的文件路径列表
        """
        project = self.get_project(project_id)
        if not project:
            return []

        downloaded_files = []

        try:
            if job_id:
                # 如果指定了job_id，直接下载该job的制品
                job = project.jobs.get(job_id)
                file_path = self._download_artifact(project, job, download_path)
                if file_path:
                    downloaded_files.append(file_path)
            elif pipeline_id:
                # 如果指定了pipeline_id，下载该流水线所有job的制品
                pipeline = project.pipelines.get(pipeline_id)
                jobs = pipeline.jobs.list(all=True)
                for job in jobs:
                    if job.artifacts:
                        file_path = self._download_artifact(project, job, download_path)
                        if file_path:
                            downloaded_files.append(file_path)
            else:
                # 获取最新的成功流水线
                pipelines = project.pipelines.list(ref=ref, status='success')
                if pipelines:
                    latest_pipeline = pipelines[0]
                    jobs = latest_pipeline.jobs.list(all=True)
                    for job in jobs:
                        if job.artifacts:
                            file_path = self._download_artifact(project, job, download_path)
                            if file_path:
                                downloaded_files.append(file_path)

        except Exception as e:
            print(f"下载制品时发生错误: {str(e)}")

        return downloaded_files

    def _download_artifact(self, project, job, download_path: str) -> Optional[str]:
        """
        下载单个job的制品
        :param project: 项目对象
        :param job: 任务对象
        :param download_path: 下载保存路径
        :return: 下载的文件路径
        """
        try:
            # 创建下载目录
            os.makedirs(download_path, exist_ok=True)
            
            # 构建文件名，处理时间戳
            try:
                # 尝试将finished_at转换为时间戳
                if isinstance(job.finished_at, str):
                    # 如果是字符串，解析为datetime对象
                    finished_time = datetime.strptime(job.finished_at, '%Y-%m-%dT%H:%M:%S.%fZ')
                else:
                    # 如果已经是timestamp，直接使用
                    finished_time = datetime.fromtimestamp(job.finished_at)
                
                timestamp = finished_time.strftime('%Y%m%d_%H%M%S')
            except (TypeError, ValueError):
                # 如果时间解析失败，使用当前时间
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            filename = f"{project.path}_{job.name}_{timestamp}.zip"
            file_path = os.path.join(download_path, filename)

            # 下载制品
            with open(file_path, 'wb') as f:
                job.artifacts(streamed=True, action=f.write)

            print(f"成功下载制品: {file_path}")
            return file_path

        except Exception as e:
            print(f"下载制品 {job.name} 时发生错误: {str(e)}")
            return None

    def get_latest_job_artifacts(self, project_id: int, download_path: str = 'artifacts') -> List[str]:
        """
        获取项目最近一次运行的job制品
        :param project_id: 项目ID
        :param download_path: 下载保存路径
        :return: 下载的文件路径列表
        """
        project = self.get_project(project_id)
        if not project:
            return []

        downloaded_files = []

        try:
            # 获取最近的jobs（按ID倒序排列）
            jobs = project.jobs.list(all=False, order_by='id', sort='desc')
            
            if not jobs:
                print(f"项目 {project_id} 没有找到任何job")
                return []

            # 获取最近一次有制品的job
            latest_job_with_artifacts = None
            for job in jobs:
                if job.artifacts:
                    latest_job_with_artifacts = job
                    break

            if latest_job_with_artifacts:
                print(f"找到最近的job: {latest_job_with_artifacts.name} (ID: {latest_job_with_artifacts.id})")
                file_path = self._download_artifact(project, latest_job_with_artifacts, download_path)
                if file_path:
                    downloaded_files.append(file_path)
            else:
                print(f"项目 {project_id} 没有找到任何制品")

        except Exception as e:
            print(f"获取最近制品时发生错误: {str(e)}")

        return downloaded_files

def main():
    import argparse
    parser = argparse.ArgumentParser(description='GitLab制品下载工具')
    parser.add_argument('--project-id', type=int, required=True, help='项目ID')
    parser.add_argument('--job-id', type=int, help='指定的任务ID')
    parser.add_argument('--pipeline-id', type=int, help='指定的流水线ID')
    parser.add_argument('--ref', default='main', help='分支名称，默认为main')
    parser.add_argument('--path', default='artifacts', help='下载保存路径，默认为artifacts')
    parser.add_argument('--latest', action='store_true', help='获取最近一次运行的job制品')
    args = parser.parse_args()

    # 从环境变量获取GitLab配置
    gitlab_url = os.getenv('GITLAB_URL', 'https://gitlab.example.com')
    gitlab_token = os.getenv('GITLAB_TOKEN')
    
    if not gitlab_token:
        raise ValueError("请设置GITLAB_TOKEN环境变量")

    # 创建GitLab客户端实例
    client = GitlabClient(gitlab_url, gitlab_token)
    
    if args.latest:
        # 获取最近一次运行的job制品
        downloaded_files = client.get_latest_job_artifacts(
            project_id=args.project_id,
            download_path=args.path
        )
    else:
        # 原有的下载逻辑
        downloaded_files = client.get_job_artifacts(
            project_id=args.project_id,
            job_id=args.job_id,
            pipeline_id=args.pipeline_id,
            ref=args.ref,
            download_path=args.path
        )

    if downloaded_files:
        print(f"\n成功下载 {len(downloaded_files)} 个制品:")
        for file_path in downloaded_files:
            print(f"- {file_path}")
    else:
        print("未找到可下载的制品")

if __name__ == '__main__':
    main()

```

## 使用
```bash
python3 gitlab_download_artifacts.py --project-id 123 --job-id 456 --path ./artifacts
```