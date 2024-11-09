---
title: 基于nerdctl+buildkit+containerd构建镜像
description: 基于nerdctl+buildkit+containerd构建镜像
keywords: [containerd, k8s,buildkit]
sidebar_position: 7
---

# 基于nerdctl+buildkit+containerd构建镜像

> 容器技术除了的docker之外，还有coreOS的rkt、google的gvisor、以及docker开源的containerd、redhat
的podman、阿⾥的pouch等，为了保证容器⽣态的标准性和健康可持续发展，包括Linux 基⾦会、Docker、微软、
红帽、⾕歌和IBM等公司在2015年6⽉共同成⽴了⼀个叫open container（OCI）的组织，其⽬的就是制定开放的标
准的容器规范，⽬前OCI⼀共发布了两个规范，分别是runtime spec和image format spec，有了这两个规范，不
同的容器公司开发的容器只要兼容这两个规范，就可以保证容器的可移植性和相互可操作性。
> 

## **部署buildkitd**

### GITHUB地址

[GitHub - moby/buildkit: concurrent, cache-efficient, and Dockerfile-agnostic builder toolkit](https://github.com/moby/buildkit)

### buildkitd组成部分

```
1. buildkitd(服务端)，⽬前⽀持runc和containerd作为镜像构建环境，默认是runc，可以更换为containerd
2. buildctl(客户端)，负责解析Dockerfile⽂件，并向服务端buildkitd发出构建请求。
```

### 部署buildkitd

```bash
# 进入到指定目录
root@k8s-master1:/usr/local/src# pwd
/usr/local/src

# 下载安装包
root@k8s-master1:/usr/local/src# wget
https://github.com/moby/buildkit/releases/download/v0.10.3/buildkit-v0.10.3.linux-amd64.tar.gz

# 解压缩
root@k8s-master1:/usr/local/src# tar -xvf buildkit-v0.10.3.linux-amd64.tar.gz -C
/usr/local/bin/

# 复制到PATH路径下
root@k8s-master1:/usr/local/src# mv /usr/local/bin/bin/buildctl
/usr/local/bin/bin/buildkitd /usr/local/bin/

# 编写systemd管理service文件
root@k8s-master1:/usr/local/src# cat /lib/systemd/system/buildkitd.socket
[Unit]
Description=BuildKit
Documentation=https://github.com/moby/buildkit

[Socket]
ListenStream=%t/buildkit/buildkitd.sock

[Install]
WantedBy=sockets.target

root@k8s-master1:/usr/local/src# cat /lib/systemd/system/buildkitd.service
[Unit]
Description=BuildKit
Requires=buildkitd.socket
After=buildkitd.socket
Documentation=https://github.com/moby/buildkit
[Service]
ExecStart=/usr/local/bin/buildkitd --oci-worker=false --containerd-worker=true
[Install]
WantedBy=multi-user.target

# 重新加载某个服务的配置文件
root@k8s-master1:/usr/local/src# systemctl daemon-reload

# 启动服务并设置为开机自启动
root@k8s-master1:/usr/local/src# systemctl enable --now buildkitd

# 查看服务状态
root@k8s-master1:/usr/local/src# systemctl status buildkitd
```

## 测试镜像构建

### *nerdctl常用命令*

github地址

[GitHub - containerd/nerdctl: contaiNERD CTL - Docker-compatible CLI for containerd, with support for Compose, Rootless, eStargz, OCIcrypt, IPFS, ...](https://github.com/containerd/nerdctl)

```bash
vim /etc/profile
source <(nerdctl completion bash)
source /etc/profile

nerdctl login --insecure-registry harbor.k8s.local
nerdctl pull centos:7.9.2009
nerdctl tag centos:7.9.2009 harbor.k8s.local/baseimages/centos:7.9.2009
nerdctl --insecure-registry push harbor.k8s.local/baseimages/centos:7.9.2009
```

### ***harbor证书分发***

参考地址：

[Harbor &ndash; Configure HTTPS Access to Harbor](https://goharbor.io/docs/2.4.0/install-config/configure-https/)

```bash
# 镜像构建服务器创建证书⽬录：
root@k8s-master1:~# mkdir /etc/containerd/certs.d/harbor.k8s.local

# harbor证书分发过程：
root@k8s-harbor1:/apps/harbor/certs# pwd
/apps/harbor/certs

root@k8s-harbor1:/apps/harbor/certs# openssl x509 -inform PEM -in k8s.local.crt -out k8s.local.cert #格式转换

# 开始分发证书
root@k8s-harbor1:/apps/harbor/certs# scp ca.crt k8s.local.cert k8s.local.key 
172.31.7.110:/etc/containerd/certs.d/harbor.k8s.local/

# 镜像构建服务器验证证书
root@k8s-master1:~# cd /etc/containerd/certs.d/harbor.k8s.local
root@k8s-master1:/etc/containerd/certs.d/harbor.k8s.local# pwd
/etc/containerd/certs.d/harbor.k8s.local

# 登录harbor
root@k8s-master1:~# nerdctl login harbor.k8s.local
Enter Username: admin
Enter Password:
WARNING: Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store
Login Succeeded
```

### ***镜像构建***

```bash
# 进入指定目录
root@k8s-master1:/opt/dockerfile/ubuntu# pwd
/opt/dockerfile/ubuntu

# 查看当前路径下的文件
root@k8s-master1:/opt/dockerfile/ubuntu# ll
total 1108
drwxr-xr-x 3 root root 148 Aug 5 06:59 ./
drwxr-xr-x 3 root root 20 Aug 5 06:59 ../
-rw-r--r-- 1 root root 266 Aug 5 06:43 build-command.sh
-rw-r--r-- 1 root root 890 Aug 5 06:53 Dockerfile
-rw-r--r-- 1 root root 38751 Aug 5 06:39 frontend.tar.gz
drwxr-xr-x 3 root root 38 Aug 5 06:39 html/
-rw-r--r-- 1 root root 1073322 May 24 14:29 nginx-1.22.0.tar.gz
-rw-r--r-- 1 root root 2812 Oct 3 2020 nginx.conf
-rw-r--r-- 1 root root 1139 Aug 5 06:53 sources.list

#执行构建命令
root@k8s-master1:/opt/dockerfile/ubuntu# /usr/local/bin/nerdctl build -t
harbor.k8s.local/baseimages/nginx-base:1.22.0 .

# 上传到镜像仓库
root@k8s-master1:/opt/dockerfile/ubuntu# nerdctl push harbor.k8s.local/baseimages/nginx-base:1.22.0
```

## **基于nginx代理harbor并实现https**

<aside>
💡 需先停止harbor服务，并修改配置文件中的协议为https

</aside>

### nginx实现反向代理

***nginx安装配置***

```bash
# 进入指定目录
root@k8s-deploy:~# cd /usr/local/src

# 下载安装包
root@k8s-deploy:/usr/local/src# wget https://nginx.org/download/nginx-1.22.0.tar.gz

# 解压缩
root@k8s-deploy:/usr/local/src# tar xvf nginx-1.22.0.tar.gz
root@k8s-deploy:/usr/local/src# cd nginx-1.22.0/

# 编译安装
root@k8s-deploy:/usr/local/src# ./configure --prefix=/apps/nginx \
--with-http_ssl_module \
--with-http_v2_module \
--with-http_realip_module \
--with-http_stub_status_module \
--with-http_gzip_static_module \
--with-pcre \
--with-stream \
--with-stream_ssl_module \
--with-stream_realip_module

root@k8s-deploy:/usr/local/src/nginx-1.22.0# make && make install

# 创建证书目录并拷贝
root@k8s-deploy:/usr/local/src/nginx-1.22.0# mkdir /apps/nginx/certs
root@k8s-harbor1:/apps/harbor# scp certs/k8s.local.crt certs/k8s.local.key 172.31.7.110:/apps/nginx/certs/

# 编辑nginx配置⽂件
root@k8s-deploy:/usr/local/src/nginx-1.22.0# vim /apps/nginx/conf/nginx.conf
client_max_body_size 1000m;
#gzip on;
 server {
 listen 80;
 listen 443 ssl;
 ssl_certificate /apps/nginx/certs/k8s.local.crt;
 ssl_certificate_key /apps/nginx/certs/k8s.local.key;
 ssl_session_cache shared:sslcache:20m;
 ssl_session_timeout 10m;
 #charset koi8-r;
 #access_log logs/host.access.log main;
 location / {
 #root html;
 #index index.html index.htm;
 if ($scheme = http ){ #未加条件判断，会导致死循环
 rewrite / https://harbor.k8s.local permanent;
 proxy_pass http://172.31.7.104;
 }
 }

# 检查配置文件
root@k8s-deploy:/usr/local/src/nginx-1.22.0# /apps/nginx/sbin/nginx -t

# 启动服务
root@k8s-deploy:/usr/local/src/nginx-1.22.0# /apps/nginx/sbin/nginx
```

## 其它配置信息

### **buildkitd配置⽂件**

```bash
cat /etc/buildkit/buildkitd.toml

[registry."harbor.magedu.net"]
 http = true
 insecure = true
```

### nerdctl配置文件

```bash
cat /etc/nerdctl/nerdctl.toml

namespace = "k8s.io"
debug = false
debug_full = false
insecure_registry = true
```