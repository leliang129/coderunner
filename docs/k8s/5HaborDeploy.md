---
title: Harbor部署
description: 使用Harbor部署镜像仓库
keywords: [harbor, docker, k8s]
sidebar_position: 4
---
# Harbor

## 安装docker-ce

```plain
1.安装必要的系统工具
apt update 
apt-get -y install apt-transport-https ca-certificates curl software-properties-common

2.安装GPG证书
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -

3.写入软件源信息
sudo add-apt-repository "deb [arch=amd64] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"

4.更新并安装Docker-CE
sudo apt-get -y update
sudo apt-get -y install docker-ce

# 安装指定版本的Docker-CE:
# Step 1: 查找Docker-CE的版本:
# apt-cache madison docker-ce
#   docker-ce | 17.03.1~ce-0~ubuntu-xenial | https://mirrors.aliyun.com/docker-ce/linux/ubuntu xenial/stable amd64 Packages
#   docker-ce | 17.03.0~ce-0~ubuntu-xenial | https://mirrors.aliyun.com/docker-ce/linux/ubuntu xenial/stable amd64 Packages
# Step 2: 安装指定版本的Docker-CE: (VERSION例如上面的17.03.1~ce-0~ubuntu-xenial)
# sudo apt-get -y install docker-ce=[VERSION]
```
## 安装docker-compose
```plain
1.下载docker-compose
wget https://github.com/docker/compose/releases/download/v2.9.0/docker-compose-linux-x86_64

2.安装并授权
mv docker-compose-linux-x86_64 /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```
## 安装harbor
```plain
1.下载harbor离线安装包
wget https://github.com/goharbor/harbor/releases/download/v2.4.3/harbor-offline-installer-v2.4.3.tgz

2.解压缩
tar xvf harbor-offline-installer-v2.4.3.tgz

3.harbor之https

cd harbor
mkdir certs
openssl genrsa -out ca.key 4096 #私有CA key

openssl req -x509 -new -nodes -sha512 -days 3650 \
-subj "/C=CN/ST=Beijing/L=Beijing/O=example/OU=Personal/CN=example.com" \
-key ca.key \
-out ca.crt  #自签发CA crt证书

openssl genrsa -out example.com.key 4096 #harbor服务器私钥

openssl req -sha512 -new \
-subj "/C=CN/ST=Beijing/L=Beijing/O=example/OU=Personal/CN=example.com" \
-key example.com.key \
-out example.com.csr  #harbor csr文件

cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1=example.com
DNS.2=harbor.example.com
DNS.3=harbor.example.local
EOF   #签发SAN文件

openssl x509 -req -sha512 -days 3650 \
-extfile v3.ext \
-CA ca.crt -CAkey ca.key -CAcreateserial \
-in example.com.csr \
-out example.com.crt  #自签发harbor证书
 

4.创建配置文件
cd harbor
cp harbor.yml.tmpl harbor.yml

5.修改域名，密码和镜像存储路径即可

6.安装
./install.sh --with-trivy --with-chartmuseum

7.查看状态
docker-compose ps
```

## 分发harbor crt证书到客户端

```plain
1.客户端创建证书目录
mkdir -p /etc/docker/certs.d/harbor.example.com

2.复制harbor crt证书到目录下（docker）
scp 172.16.41.108:/root/harbor/certs/example.com.crt /etc/docker/certs.d/harbor.example.com

#https镜像仓库配置 （containerd）
[plugins."io.containerd.grpc.v1.cri".registry.configs]
[plugins."io.containerd.grpc.v1.cri".registry.configs."easzlab.io.local:5000".tls]
insecure_skip_verify = true
[plugins."io.containerd.grpc.v1.cri".registry.mirrors."harbor.example.com"]
endpoint = ["https://harbor.example.com"]
[plugins."io.containerd.grpc.v1.cri".registry.configs."harbor.example.com".tls]
insecure_skip_verify = true
[plugins."io.containerd.grpc.v1.cri".registry.configs."harbor.example.com".auth]
username = "admin"
password = "123456"

3.客户端添加域名解析

cat /etc/hosts|grep example
172.16.41.87 harbor.example.com

4.重启docker服务

systemctl restart docker
```

