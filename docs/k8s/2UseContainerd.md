---
title: Containerd的使用
description: containerd的安装与基本使用
keywords: [containerd, k8s]
sidebar_position: 3
---

# containerd的安装


## 下载包含runc的安装包

```plain
wget https://github.com/containerd/containerd/releases/download/v1.5.5/cri-containerd-cni-1.5.5-linux-amd64.tar.gz
```
## 解压

```plain
tar xvf cri-containerd-cni-1.5.5-linux-amd64.tar.gz -C /
```
## 生成默认配置

```plain
mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
```
## 配置根容器仓库地址

```plain
sandbox_image = "k8s.gcr.io/pause:3.5"
修改为：
sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.5"
```
## 配置镜像加速器

```plain
[plugins."io.containerd.grpc.v1.cri".registry]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
    [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
      endpoint = ["https://bqr1dr1n.mirror.aliyuncs.com"]
```
## 查看systemd文件

```plain
root@ubuntu:~# cat /etc/systemd/system/containerd.service
# Copyright The containerd Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

[Unit]
Description=containerd container runtime
Documentation=https://containerd.io
After=network.target local-fs.target

[Service]
ExecStartPre=-/sbin/modprobe overlay
ExecStart=/usr/local/bin/containerd

Type=notify
Delegate=yes
KillMode=process
Restart=always
RestartSec=5
# Having non-zero Limit*s causes performance problems due to accounting overhead
# in the kernel. We recommend using cgroups to do container-local accounting.
LimitNPROC=infinity
LimitCORE=infinity
LimitNOFILE=infinity
# Comment TasksMax if your systemd version does not supports it.
# Only systemd 226 and above support this version.
TasksMax=infinity
OOMScoreAdjust=-999

[Install]
WantedBy=multi-user.target
```

## 
## 启动并查看服务状态

```plain
root@ubuntu:~# systemctl enable --now containerd.service 
Created symlink /etc/systemd/system/multi-user.target.wants/containerd.service → /etc/systemd/system/containerd.service.

root@ubuntu:~# systemctl status containerd.service 
● containerd.service - containerd container runtime
     Loaded: loaded (/etc/systemd/system/containerd.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2022-07-21 10:43:39 UTC; 4s ago
       Docs: https://containerd.io
    Process: 3172 ExecStartPre=/sbin/modprobe overlay (code=exited, status=0/SUCCESS)
   Main PID: 3183 (containerd)
      Tasks: 10
     Memory: 16.6M
     CGroup: /system.slice/containerd.service
             └─3183 /usr/local/bin/containerd

Jul 21 10:43:39 ubuntu containerd[3183]: time="2022-07-21T10:43:39.424183631Z" level=info msg=serving... address=/run/containerd/containerd.sock.ttrpc
Jul 21 10:43:39 ubuntu containerd[3183]: time="2022-07-21T10:43:39.424379054Z" level=info msg=serving... address=/run/containerd/containerd.sock
Jul 21 10:43:39 ubuntu containerd[3183]: time="2022-07-21T10:43:39.424459558Z" level=info msg="containerd successfully booted in 0.076936s"
Jul 21 10:43:39 ubuntu systemd[1]: Started containerd container runtime.
Jul 21 10:43:39 ubuntu containerd[3183]: time="2022-07-21T10:43:39.424220475Z" level=info msg="Start subscribing containerd event"
Jul 21 10:43:39 ubuntu containerd[3183]: time="2022-07-21T10:43:39.427220395Z" level=info msg="Start recovering state"
Jul 21 10:43:39 ubuntu containerd[3183]: time="2022-07-21T10:43:39.427268758Z" level=info msg="Start event monitor"
Jul 21 10:43:39 ubuntu containerd[3183]: time="2022-07-21T10:43:39.427294929Z" level=info msg="Start snapshots syncer"
Jul 21 10:43:39 ubuntu containerd[3183]: time="2022-07-21T10:43:39.427303375Z" level=info msg="Start cni network conf syncer"
Jul 21 10:43:39 ubuntu containerd[3183]: time="2022-07-21T10:43:39.427310139Z" level=info msg="Start streaming server"
```
## 测试

```plain
root@ubuntu:~# ctr i pull docker.io/library/nginx:alpine
docker.io/library/nginx:alpine:                                                   resolved       |++++++++++++++++++++++++++++++++++++++| 
index-sha256:87fb6f4040ffd52dd616f360b8520ed4482930ea75417182ad3f76c4aaadf24f:    done           |++++++++++++++++++++++++++++++++++++++| 
manifest-sha256:96a447b9474aff02d4e3b642f5fdb10ff7ff25d409e8132e536c71f494f59617: done           |++++++++++++++++++++++++++++++++++++++| 
layer-sha256:a46fd6a16a7c6563c064f8ad9197db0bcf1191095cc3af29e75fb5e9b007f168:    done           |++++++++++++++++++++++++++++++++++++++| 
config-sha256:e46bcc69753105cfd75905056666b92cee0d3e96ebf134b19f1b38de53cda93e:   done           |++++++++++++++++++++++++++++++++++++++| 
layer-sha256:530afca65e2ea04227630ae746e0c85b2bd1a179379cbf2b6501b49c4cab2ccc:    done           |++++++++++++++++++++++++++++++++++++++| 
layer-sha256:323a7915bc0486f17181676df748e5c3571103eb8ac38137aa60ea87e9d70b19:    done           |++++++++++++++++++++++++++++++++++++++| 
layer-sha256:b5b558620e4027e2a918abda48eb0d3ecae77b6ced0f5244a55d78a02bcea87b:    done           |++++++++++++++++++++++++++++++++++++++| 
layer-sha256:b37be0d2bf3c46c2d42cf536fcf0eb53cc8a5b7f8f0ee74abaf3e57610ae3f97:    done           |++++++++++++++++++++++++++++++++++++++| 
layer-sha256:ba036c7f95ecc063c84fbe789765b97feefdbc331a31abf90153da5e16fe7264:    done           |++++++++++++++++++++++++++++++++++++++| 
elapsed: 8.8 s                                                                    total:  8.0 Mi (932.5 KiB/s)                                     
unpacking linux/amd64 sha256:87fb6f4040ffd52dd616f360b8520ed4482930ea75417182ad3f76c4aaadf24f...
done: 373.261657ms
```
# 镜像相关命令

```plain
#拉取镜像
#也可以使用--platform指定对应平台镜像
ctr image pull <image_name>
ctr image pull docker.io/library/nginx:alpine

#推送镜像
#--user 自定义仓库用户名和密码
ctr image push <image_name>

#列出本地镜像
#使用-q(--quiet)选项可以只打印镜像名称
ctr image ls

#检测本地镜像
#status状态为complete表示镜像是完整可用的状态
ctr image check

#重新打标签
ctr image tag <old_image_tag> <new_image_tag>

#删除镜像
#--sync选项可以同步删除镜像和所有相关资源
ctr image rm <image_name>

#将镜像挂载到主机目录
ctr image mount <image_name> <mount_dir>

#将镜像从主机目录卸载
ctr image unmount <mount_dir>

#将镜像导出成压缩包
ctr image export --all-platforms <image_name.tgz> <image_name>

#从压缩包导入镜像
ctr image import <image_name.tgz>
直接导入可能会出现类似于ctr：content digest sha256:xxxxx not found的错误，要解决这个办法需要pull所有平台镜像
ctr image pull --all-platforms <image_name>
ctr image export --all-platforms <image_name>
ctr image rm <image_name>
ctr image import <image_name.tgz>

```


# 容器相关命令

```plain
#容器操作
ctr container create <image_name>

#列出容器
#-q选项可精简列表内容
ctr container ls

#查看容器详细配置
#类似于docker inspect
ctr container info <container_name>

#删除容器
#除了rm自命令之外，也可以使用delete或者del删除容器
ctr container rm <container_name>

#启动容器
ctr task start -d <container_name>

#查看运行中的容器
ctr task ls

#进入容器
#--exec-id必须要指定，且唯一
ctr task exec --exec-id <id_num> -t <container_name>

#暂停容器
ctr task pause <container_name>

#恢复容器
ctr task resume <container_name>

#杀死容器
ctr task kill <container_name>

#删除task
ctr task rm <container_name>

#获取cgroup相关信息
ctr task metrics <container_name>

#获取进程信息
ctr task ps <container_name>

#查看命名空间
ctr ns ls

#创建命名空间
ctr ns create <ns_name>

#删除命名空间
ctr ns rm <ns_name>
ctr ns remove <ns_name>

#指定namespace
ctr -n <ns_name> image ls
#docker的默认命令空间是moby，而不是default
#k8s下的默认命名空间是k8s.io
```

