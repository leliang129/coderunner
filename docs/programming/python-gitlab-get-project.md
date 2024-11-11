---
title: Python-获取GitLab项目
description: 获取GitLab项目并输出到文件
---
## 安装gitlab模块
```bash
pip install python-gitlab
```

## 安装pandas模块
```bash
pip install pandas
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
from typing import List, Dict
import pandas as pd
from datetime import datetime

class GitLabClient:
    def __init__(self, url: str, private_token: str):
        """
        初始化GitLab客户端
        :param url: GitLab服务器URL
        :param private_token: GitLab访问令牌
        """
        self.gl = gitlab.Gitlab(url=url, private_token=private_token)
    
    def get_group_path(self, project) -> tuple:
        """
        获取项目的组和子组信息
        :param project: GitLab项目对象
        :return: (组名, 一级子组名, 二级子组名)
        """
        path_parts = project.path_with_namespace.split('/')
        if len(path_parts) == 1:
            return ('', '', '')  # 无组和子组
        elif len(path_parts) == 2:
            return (path_parts[0], '', '')  # 只有组
        elif len(path_parts) == 3:
            return (path_parts[0], path_parts[1], '')  # 组和一级子组
        else:
            return (path_parts[0], path_parts[1], '/'.join(path_parts[2:-1]))  # 组和两级子组
    
    def get_projects(self) -> List[Dict]:
        """
        获取所有可访问的项目，只包含s d k de mo组下的项目
        :return: 项目列表
        """
        # 获取所有项目
        projects = self.gl.projects.list(all=True)
        project_list = []
        
        for project in projects:
            group, subgroup1, subgroup2 = self.get_group_path(project)
            
            # 只处理sdkdemo组下的项目
            if group.lower() == 'sdkdemo':
                project_info = {
                    'group': group,
                    'subgroup1': subgroup1,
                    'subgroup2': subgroup2,
                    'name': project.name,
                    'description': project.description or '',
                    'maintainer': self.get_project_maintainer(project),
                    'is_delivered': '',
                    'dependencies': ''
                }
                project_list.append(project_info)
        
        # 按二级子组排序
        project_list.sort(key=lambda x: (x['subgroup2'] or '', x['subgroup1'] or '', x['name']))
        
        return project_list
    
    def get_project_maintainer(self, project) -> str:
        """
        获取项目的主要维护者
        :param project: GitLab项目对象
        :return: 维护者用户名
        """
        try:
            members = project.members.list(all=True)
            maintainers = [member.username for member in members 
                         if member.access_level >= 40]  # 40表示Maintainer级别
            return ', '.join(maintainers) if maintainers else ''
        except:
            return ''

    @staticmethod
    def read_projects_from_excel(file_path: str) -> None:
        """
        从Excel文件读取项目信息并打印
        :param file_path: Excel文件路径
        """
        try:
            df = pd.read_excel(file_path)
            print(f"从文件 {file_path} 中读取到 {len(df)} 个项目:")
            
            projects = df.to_dict('records')
            for project in projects:
                print(f"\n组: {project['组']}")
                print(f"一级子组: {project['一级子组']}")
                print(f"二级子组: {project['二级子组']}")
                print(f"项目名称: {project['项目名称']}")
                print(f"项目描述: {project['项目描述']}")
                print(f"主程序员: {project['主程序员']}")
                print(f"是否交付: {project['是否交付']}")
                print(f"依赖工程: {project['依赖工程']}")
                
        except FileNotFoundError:
            print(f"错误: 文件 {file_path} 不存在")
        except Exception as e:
            print(f"读取文件时发生错误: {str(e)}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description='GitLab项目信息处理工具')
    parser.add_argument('--read-excel', type=str, help='从指定的Excel文件读取项目信息')
    args = parser.parse_args()

    if args.read_excel:
        GitLabClient.read_projects_from_excel(args.read_excel)
    else:
        gitlab_url = os.getenv('GITLAB_URL', 'https://gitlab.example.com')
        gitlab_token = os.getenv('GITLAB_TOKEN')
        
        if not gitlab_token:
            raise ValueError("请设置GITLAB_TOKEN环境变量")
        
        client = GitLabClient(gitlab_url, gitlab_token)
        projects = client.get_projects()
        
        # 创建DataFrame
        df = pd.DataFrame(projects)
        
        # 生成输出文件名（包含时间戳）
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = f'sdkdemo_projects_{timestamp}.xlsx'
        
        # 设置Excel列的顺序和中文列名
        column_mapping = {
            'group': '组',
            'subgroup1': '一级子组',
            'subgroup2': '二级子组',
            'name': '项目名称',
            'description': '项目描述',
            'maintainer': '主程序员',
            'is_delivered': '是否交付',
            'dependencies': '依赖工程'
        }
        
        # 重新排序并重命名列
        df = df[column_mapping.keys()]
        df.rename(columns=column_mapping, inplace=True)
        
        # 导出到Excel，添加样式
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='GitLab项目列表')
            
            # 获取工作表
            worksheet = writer.sheets['GitLab项目列表']
            
            # 设置列宽
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = (max_length + 2)
                worksheet.column_dimensions[column_letter].width = adjusted_width
        
        print(f"\n数据已导出到文件: {output_file}")
        
        # 按二级子组分组打印项目信息
        current_subgroup2 = None
        for project in projects:
            if project['subgroup2'] != current_subgroup2:
                current_subgroup2 = project['subgroup2']
                print(f"\n\n=== 二级子组: {current_subgroup2 or '无'} ===")
            
            print(f"\n项目名称: {project['name']}")
            print(f"一级子组: {project['subgroup1']}")
            print(f"项目描述: {project['description']}")
            print(f"主程序员: {project['maintainer']}")

if __name__ == '__main__':
    main()

```