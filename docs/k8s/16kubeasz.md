---
title: kubeasz部署k8s集群
description: 使用开源开源项目kubeasz部署k8s集群
keywords: [containerd,docker,k8s,kubeasz]
sidebar_position: 4
---
## kubeasz简介
kubeasz 致力于提供快速部署高可用 `k8s` 集群的工具。   
基于二进制方式部署和利用`ansible-playbook`实现自动化；既提供一键安装脚本, 也可以分步执行安装各个组件。
:::info
GitHub地址：[https://github.com/easzlab/kubeasz/blob/master/docs/setup/00-planning_and_overall_intro.md](https://github.com/easzlab/kubeasz/blob/master/docs/setup/00-planning_and_overall_intro.md)
:::

## 基础环境配置

### 主机规划
> 本次部署为单master，且机器规格仅为测试规格
   
| 主机名 | IP地址 | 角色 | 规格 | 组件 |
|--------|--------|------|------|------|
| deploy-k8s | 192.168.91.70| deploy | 2C4G | ansible,kuboard |
| master01 | 192.168.91.71 | master | 2C4G | etcd, kube-apiserver, kube-controller-manager, kube-scheduler |
| node01 | 192.168.91.72 | worker | 2C4G | kubelet, kube-proxy, containerd |
| node02 | 192.168.91.73 | worker | 2C4G | kubelet, kube-proxy, containerd |
| node03 | 192.168.91.74 | worker | 2C4G | kubelet, kube-proxy, containerd |
| node04 | 192.168.91.75 | worker | 2C4G | kubelet, kube-proxy, containerd |

### 配置ssh免密登录
> 仅在deploy-k8s主机上生成密钥对，并将公钥分发到其他主机
```bash
# 在deploy-k8s主机上生成密钥对
root@deploy-k8s:~# ssh-keygen 
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): 
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_rsa
Your public key has been saved in /root/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:Z6upNhKZWR5ahxZxTfQ1irQN6XS18d2D7clonEfS11k root@deploy-k8s
The key's randomart image is:
+---[RSA 3072]----+
|      ...+=. .= E|
|      .. .+*.o+=*|
|       o oo.+o.**|
|      * . . . B +|
|     X oS o  = = |
|    * .  o .. .  |
|     .    .      |
|    . o  o       |
|     o.oo        |
+----[SHA256]-----+

# 安装sshpass
root@deploy-k8s:~# apt install -y sshpass
```
```bash
# 将公钥分发到其他主机
#!/bin/bash
#⽬标主机列表
IP="
192.168.91.70
192.168.91.71
192.168.91.72
192.168.91.73
192.168.91.74
192.168.91.75
"
for node in ${IP};do
 sshpass -p <passwd> ssh-copy-id root@${node} -o StrictHostKeyChecking=no
 echo "${node} 秘钥copy完成"
done

# 执行脚本
root@deploy-k8s:~# sh ssh-copy.sh 
......
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/root/.ssh/id_rsa.pub"
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh -o 'StrictHostKeyChecking=no' 'root@192.168.91.70'"
and check to make sure that only the key(s) you wanted were added.

192.168.91.70 秘钥copy完成

```

### 配置hosts文件
> 在所有主机上配置hosts文件，将其他主机名与IP地址映射
```bash
root@deploy-k8s:~# vim /etc/hosts
192.168.91.70 deploy-k8s
192.168.91.71 master01
192.168.91.72 node01
192.168.91.73 node02
192.168.91.74 node03
192.168.91.75 node04

# 测试连通性
root@master01:~# ping deploy-k8s
PING deploy-k8s (192.168.91.70) 56(84) bytes of data.
64 bytes from deploy-k8s (192.168.91.70): icmp_seq=1 ttl=64 time=0.464 ms
64 bytes from deploy-k8s (192.168.91.70): icmp_seq=2 ttl=64 time=0.380 ms
64 bytes from deploy-k8s (192.168.91.70): icmp_seq=3 ttl=64 time=0.256 ms
64 bytes from deploy-k8s (192.168.91.70): icmp_seq=4 ttl=64 time=0.343 ms
......
```

### 配置时间同步
> 在所有主机上配置时间同步
```bash
root@deploy-k8s:~# apt install -y chrony

# 修改配置文件
root@deploy-k8s:~# vim /etc/chrony/chrony.conf

# 重启服务
root@deploy-k8s:~# systemctl restart chrony

# 查看状态
root@deploy-k8s:~# chronyc sources -v
210 Number of sources = 2

  .-- Source mode  '^' = server, '=' = peer, '#' = local clock.
 / .- Source state '*' = current synced, '+' = combined , '-' = not combined,
| /   '?' = unreachable, 'x' = time may be in error, '~' = time too variable.
||                                                 .- xxxx [ yyyy ] +/- zzzz
||      Reachability register (octal) -.           |  xxxx = adjusted offset,
||      Log2(Polling interval) --.      |          |  yyyy = measured offset,
||                                \     |          |  zzzz = estimated error.
||                                 |    |           \
MS Name/IP address         Stratum Poll Reach LastRx Last sample               
===============================================================================
^? 203.107.6.88                  2   6     3     1   +995us[ +995us] +/-   29ms
^? 120.25.115.20                 2   6     1     1   +723us[ +723us] +/- 5271us
```
### 禁用swap分区
> 在所有主机上禁用swap分区
```bash
root@deploy-k8s:~# swapoff -a
root@deploy-k8s:~# sed -ri 's/.*swap.*/#&/' /etc/fstab
# 或者
root@deploy-k8s:~# systemctl disable --now swap.img.swap
root@deploy-k8s:~# systemctl mask swap.target
```

### 禁用防火墙
> 在所有主机上禁用防火墙
```bash
# 禁用防火墙
root@deploy-k8s:~# ufw disable
# 查看状态
root@deploy-k8s:~# ufw status
```

## 下载kubeasz
### 下载项目源码、二进制及离线镜像
> 在deploy-k8s主机上下载kubeasz
```bash
root@deploy-k8s:~# export release=3.5.0
root@deploy-k8s:~# wget https://github.com/easzlab/kubeasz/releases/download/${release}/ezdown
root@deploy-k8s:~# chmod +x ./ezdown
```
> 因部署方式采用 ansible-in-docker，可以事先安装docker-ce
```bash
# 安装docker-ce和ansible
root@deploy-k8s:~# apt install -y docker-ce ansible
# 启动docker
root@deploy-k8s:~# systemctl enable --now docker
Synchronizing state of docker.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable docker
```
> 下载kubeasz代码、二进制、默认容器镜像（更多关于ezdown的参数，运行./ezdown 查看）
```bash
root@deploy-k8s:~# ./ezdown -D
```
:::tip
上述脚本运行成功后，所有文件（kubeasz代码、二进制、离线镜像）均已整理好放入目录`/etc/kubeasz`
:::

### 创建集群配置实例
> 在deploy-k8s主机上创建集群配置实例
```bash
root@deploy-k8s:~# cd /etc/kubeasz/
root@deploy-k8s:/etc/kubeasz# ./ezctl new local-k8s
2024-11-11 21:01:16 DEBUG generate custom cluster files in /etc/kubeasz/clusters/local-k8s
2024-11-11 21:01:16 DEBUG set versions
2024-11-11 21:01:16 DEBUG disable registry mirrors
2024-11-11 21:01:16 DEBUG cluster local-k8s: files successfully created.
2024-11-11 21:01:16 INFO next steps 1: to config '/etc/kubeasz/clusters/local-k8s/hosts'
2024-11-11 21:01:16 INFO next steps 2: to config '/etc/kubeasz/clusters/local-k8s/config.yml'

```
### 配置集群配置文件
> 在deploy-k8s主机上配置集群配置文件
```bash
# 修改主机列表
root@deploy-k8s:/etc/kubeasz# vim clusters/local-k8s/hosts
# 修改集群组件等配置项
root@deploy-k8s:/etc/kubeasz# vim clusters/local-k8s/config.yml
```
### 执行部署
> 在deploy-k8s主机上执行部署
```bash
# 01-创建证书以及环境准备
root@deploy-k8s:/etc/kubeasz# ./ezctl setup local-k8s 01
# 02-部署etcd集群
root@deploy-k8s:/etc/kubeasz# ./ezctl setup local-k8s 02
# 03-安装容器运行时
root@deploy-k8s:/etc/kubeasz# ./ezctl setup local-k8s 03
# 04-部署master节点
root@deploy-k8s:/etc/kubeasz# ./ezctl setup local-k8s 04
# 05-部署node节点
root@deploy-k8s:/etc/kubeasz# ./ezctl setup local-k8s 05
# 06-部署网络插件
root@deploy-k8s:/etc/kubeasz# ./ezctl setup local-k8s 06
# 07-部署集群组件
root@deploy-k8s:/etc/kubeasz# ./ezctl setup local-k8s 07
```
### 验证集群
> 在deploy-k8s主机上验证集群
```bash
root@deploy-k8s:/etc/kubeasz# kubectl get nodes
NAME            STATUS                     ROLES    AGE   VERSION
192.168.91.71   Ready,SchedulingDisabled   master   13m   v1.26.0
192.168.91.72   Ready                      node     12m   v1.26.0
192.168.91.73   Ready                      node     12m   v1.26.0
192.168.91.74   Ready                      node     12m   v1.26.0
192.168.91.75   Ready                      node     12m   v1.26.0
```