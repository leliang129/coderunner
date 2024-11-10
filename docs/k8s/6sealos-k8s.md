---
title: sealos部署k8s集群
description: 使用kubeadm + containerd部署k8s高可用集群
keywords: [containerd, docker, k8s,sealos]
sidebar_position: 3
---

## Sealos 简介
Sealos 是一款以 Kubernetes 为内核的云操作系统发行版。它以云原生的方式，抛弃了传统的云计算架构，转向以 Kubernetes 为云内核的新架构，使企业能够像使用个人电脑一样简单地使用云。    
    
用户将可以像使用个人电脑一样在 Kubernetes 上一键安装任意高可用分布式应用，几乎不需要任何专业的交付和运维成本。同时，利用独特的集群镜像能力，用户可将任意分布式应用打包成 OCI 镜像，自由组合各种分布式应用，轻松订制所需的云。通过强大且灵活的应用商店功能，可满足各类用户的多样化需求。    
     
另外 `Sealos` 也提供了一套强大的工具，可以让我们便利地管理整个 Kubernetes 集群的生命周期。使用 Sealos，可以安装一个不包含任何组件的裸 Kubernetes 集群。此外，Sealos 还可以在 Kubernetes 之上，通过集群镜像能力组装各种上层分布式应用，如数据库、消息队列等。Sealos 不仅可以安装一个单节点的 Kubernetes 开发环境，还能构建数千节点的生产高可用集群。    
    
Sealos 具有自由伸缩集群、备份恢复、释放集群等功能，即使在离线环境中，Sealos 也能提供出色的 Kubernetes 运行体验。

## 集群安装
### 环境
这里我们将提供 3 个节点，都是 `Ubuntu 20.04.3` 系统，内核版本：`5.4.0-81-generic`，在每个节点上添加 hosts 信息：
```shell
# 查看系统版本
root@master01:~# lsb_release -a
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 20.04.3 LTS
Release:	20.04
Codename:	focal
# 查看内核信息
root@master01:~# uname -a
Linux ubuntu 5.4.0-81-generic #91-Ubuntu SMP Thu Jul 15 19:09:17 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux

# 写入hosts
root@master01:~# cat /etc/hosts
127.0.0.1 localhost
127.0.1.1 ubuntu

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
192.168.91.51 master01
192.168.91.52 node01
192.168.91.53 node02
```
:::tip
节点的 hostname 必须使用标准的 DNS 命名，另外千万别用默认 `localhost` 的 hostname，会导致各种错误出现的。在 Kubernetes 项目里，机器的名字以及一切存储在 `Etcd` 中的 API 对象，都必须使用标准的 DNS 命名（RFC 1123）。可以使用命令 `hostnamectl set-hostname xxx` 来修改 hostname。
:::
      
### 安装sealos
首先我们需要在 `master` 节点下载 `Sealos` 命令行工具，我们可以通过运行命令来获取版本列表：
```shell
root@master01:~# curl --silent "https://api.github.com/repos/labring/sealos/releases" | jq -r '.[].tag_name'
v5.0.0-beta4
v4.4.0-beta3
v5.0.0-beta3
v5.0.0-beta2
v5.0.0-beta1
v4.3.7
......
```
> 注意：在选择版本时，建议使用稳定版本例如 `v4.3.7`。像 `v5.0.0-beta1`、`v5.0.0-alpha1` 这样的版本是预发布版，请谨慎使用。   

设置 `VERSION` 环境变量为 `latest` 版本号，或者将 `VERSION` 替换为您要安装的 `Sealos` 版本：
```shell
root@master01:~# VERSION=`curl -s https://api.github.com/repos/labring/sealos/releases/latest | grep -oE '"tag_name": "[^"]+"' | head -n1 | cut -d'"' -f4`
root@master01:~# echo $VERSION
v4.3.7
```
这里我们使用的版本为 `v4.3.7`。
     
然后可以使用下面的命令**自动下载二进制**文件：
```shell
root@master01:~# curl -sfL https://mirror.ghproxy.com/https://raw.githubusercontent.com/labring/sealos/main/scripts/install.sh | PROXY_PREFIX=https://mirror.ghproxy.com sh -s ${VERSION} labring/sealos
[INFO]  Using v4.3.7 as release
[INFO]  Using labring/sealos as your repo
[INFO]  Downloading tar curl https://mirror.ghproxy.com/https://github.com/labring/sealos/releases/download/v4.3.7/sealos_4.3.7_linux_amd64.tar.gz
[INFO]  Downloading sealos, waiting...
sealos
[INFO]  Installing sealos to /usr/bin/sealos
SealosVersion:
  buildDate: "2023-10-30T16:19:05Z"
  compiler: gc
  gitCommit: f39b2339
  gitVersion: 4.3.7
  goVersion: go1.20.10
  platform: linux/amd64
```
以及**二进制手动下载**：
:::info[amd64下载]
```shell
wget https://mirror.ghproxy.com/https://github.com/labring/sealos/releases/download/${VERSION}/sealos_${VERSION#v}_linux_amd64.tar.gz \
  && tar zxvf sealos_${VERSION#v}_linux_amd64.tar.gz sealos && chmod +x sealos && mv sealos /usr/bin
```
:::
:::info[arm64下载]
```shell
wget https://mirror.ghproxy.com/https://github.com/labring/sealos/releases/download/${VERSION}/sealos_${VERSION#v}_linux_arm64.tar.gz \
  && tar zxvf sealos_${VERSION#v}_linux_arm64.tar.gz sealos && chmod +x sealos && mv sealos /usr/bin
```
:::
    
由于我们这里是 `Ubuntu` 系统，还可以使用包管理工具安装：
**DEB源**
```shell
# 添加软件源
echo "deb [trusted=yes] https://apt.fury.io/labring/ /" | sudo tee /etc/apt/sources.list.d/labring.list

# 更新软件源
sudo apt update

# 安装sealos
sudo apt install sealos
```
     
RPM源
```shell
# 添加软件源
sudo cat > /etc/yum.repos.d/labring.repo << EOF
[fury]
name=labring Yum Repo
baseurl=https://yum.fury.io/labring/
enabled=1
gpgcheck=0
EOF

# 更新软件源
sudo yum clean all

# 安装sealos
sudo yum install sealos
```

### 安装k8s集群
#### 先决条件
首先需要下载 [Sealos 命令行工具](https://sealos.run/docs/self-hosting/lifecycle-management/quick-start/install-cli)，sealos 是一个简单的 Golang 二进制文件，可以安装在大多数 Linux 操作系统中。    
     
以下是一些基本的安装要求：
  - 每个集群节点应该有不同的主机名。主机名不要带下划线。
  - 所有节点的时间需要同步。
  - 需要在 K8s 集群的第一个 master 节点上运行 sealos run 命令，目前集群外的节点不支持集群安装。
  - 建议使用干净的操作系统来创建集群。 **不要自己装 Docker！**
  - 支持大多数 Linux 发行版，例如：Ubuntu、CentOS、Rocky linux。
  - 支持 Docker Hub 中的所有 Kubernetes 版本。
  - 支持使用 Containerd 作为容器运行时。
  - 在公有云上安装请使用私有 IP。

#### 查看集群镜像
Sealos 所有的集群镜像都可以在 [cluster-image-docs](https://github.com/labring-actions/cluster-image-docs) 仓库里找到。除了推送到 Docker Hub 之外，这些镜像还被同步到了阿里云的镜像仓库。     
      
Docker Hub 上可以通过以下链接查看 Sealos 所有的集群镜像：[https://hub.docker.com/u/labring](https://hub.docker.com/u/labring).     
     
使用 [Registry Explorer](https://explore.ggcr.dev/) 可以查看 K8s 集群镜像的所有版本，直接输入 `registry.cn-shanghai.aliyuncs.com/labring/kubernetes`，然后点击 “Submit Query”：
![](https://pic.imgdb.cn/item/66041a759f345e8d03371e6e.jpg)
     
**查询结果如下**
![](https://pic.imgdb.cn/item/66041a3f9f345e8d0334882f.jpg)
     
就会看到这个集群镜像的所有 tag。   
    
Docker Hub 同理，输入 `docker.io/labring/kubernetes` 即可查看所有 tag。

:::tip 注意
K8s 的小版本号越高，集群越稳定。例如 v1.28.x，其中的 x 就是小版本号。建议使用小版本号比较高的 K8s 版本。
:::

#### 安装 K8s 单机版
```shell
# sealos version must >= v4.1.0
root@master01:~# sealos run registry.cn-shanghai.aliyuncs.com/labring/kubernetes:v1.27.7 registry.cn-shanghai.aliyuncs.com/labring/helm:v3.9.4 registry.cn-shanghai.aliyuncs.com/labring/cilium:v1.13.4 --single

```

#### 安装 K8s 集群
```shell
root@master01:~# sealos run registry.cn-shanghai.aliyuncs.com/labring/kubernetes:v1.27.7 registry.cn-shanghai.aliyuncs.com/labring/helm:v3.9.4 registry.cn-shanghai.aliyuncs.com/labring/cilium:v1.13.4 \
     --masters 192.168.91.51 \
     --nodes 192.168.91.52,192.168.91.53 -p [your-ssh-passwd]
```
执行成功即可在master节点执行命令查看:
```shell
root@master01:~# kubectl get nodes
NAME       STATUS   ROLES           AGE     VERSION
master01   Ready    control-plane   5m33s   v1.27.7
node01     Ready    <none>          5m11s   v1.27.7
node02     Ready    <none>          5m13s   v1.27.7
```
:::tip 注意
labring/helm 应当在 labring/cilium 之前。
:::
参数说明：   
| 参数名 | 参数值示例 | 参数说明 |
| :------: | :------: | :------: |
| --masters | 192.168.91.51 | K8s master 节点地址列表 |
| --nodes | 192.168.91.52 | K8s node 节点地址列表 |
| --ssh-passwd | [your-ssh-passwd] | ssh 登录密码 |
| kubernetes | labring/kubernetes:v1.25.0 | K8s 集群镜像 |
:::tip 注意
在干净的服务器上直接执行上面命令，不要做任何多余操作即可安装一个高可用 K8s 集群。
:::

#### 安装各种分布式应用
```shell
root@master01:~# sealos run registry.cn-shanghai.aliyuncs.com/labring/minio-operator:v4.5.5 registry.cn-shanghai.aliyuncs.com/labring/ingress-nginx:4.1.0
```
这样高可用的 Minio 等应用都有了，不用关心所有的依赖问题。

#### 增加 K8s 节点
*增加 node 节点：*
```shell
root@master01:~# sealos add --nodes 192.168.91.54
```
    
*增加 master 节点:*
```shell
root@master01:~# sealos add --masters 192.168.91.55
```
#### 删除 K8s 节点
*删除 node 节点：*
```shell
root@master01:~# sealos delete --nodes 192.168.91.54
```
     
*删除 master 节点:*
```shell
root@master01:~# sealos delete --masters 192.168.91.54
```

#### 清理 K8s 集群
```shell
root@master01:~# sealos reset
```

### 文档链接
  - [sealos安装kubernetes集群](https://sealos.run/docs/self-hosting/lifecycle-management/quick-start/deploy-kubernetes/)
  - [sealos命令行工具](https://sealos.run/docs/self-hosting/lifecycle-management/quick-start/install-cli/)