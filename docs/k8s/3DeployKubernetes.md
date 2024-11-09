---
title: k8s集群部署 - docker
description: 使用kubeadm部署k8s高可用集群
keywords: [containerd, docker, k8s]
sidebar_position: 3
---

## **安装 HAProxy**

利用 HAProxy 实现 Kubeapi 服务的负载均衡 

```plain
#修改内核参数
[root@ha1 ~]#cat >> /etc/sysctl.conf <<EOF
net.ipv4.ip_nonlocal_bind = 1
EOF
[root@ha1 ~]#sysctl -p

#安装配置haproxy
[root@ha1 ~]#apt update
[root@ha1 ~]#apt -y install haproxy

##添加下面行
[root@ha1 ~]#cat >> /etc/haproxy/haproxy.cfg <<EOF
listen stats
  mode http
  bind 0.0.0.0:8888
  stats enable
  log global
  stats uri /status
  stats auth admin:123456
   
listen kubernetes-api-6443
  bind 192.168.91.29:6443
  mode tcp
  server master1 192.168.91.31:6443 check inter 3s fall 3 rise 3
EOF
```

## **安装 Keepalived**

安装 keepalived 实现 HAProxy的高可用

```plain
[root@ha1 ~]#apt update
[root@ha1 ~]#apt -y install keepalived
[root@ha1 ~]#vim /etc/keepalived/keepalived.conf
! Configuration File for keepalived
global_defs {
  router_id ha1.wang.org  #指定router_id,#在ha2上为ha2.wang.org
}
vrrp_script check_haproxy { #定义脚本
  script "/etc/keepalived/check_haproxy.sh"
  interval 1
  weight -30
  fall 3
  rise 2
  timeout 2
}
vrrp_instance VI_1 {
  state MASTER #在ha2上为BACKUP
  interface eth0
  garp_master_delay 10
  smtp_alert
  virtual_router_id 66   #指定虚拟路由器ID,ha1和ha2此值必须相同
  priority 100           #在ha2上为80
  advert_int 1
  authentication {
      auth_type PASS
      auth_pass 123456   #指定验证密码,ha1和ha2此值必须相同
  }
  virtual_ipaddress {
       10.0.0.100/24 dev eth0 label eth0:1  #指定VIP,ha1和ha2此值必须相同
  }
  track_script {
      check_haproxy #调用上面定义的脚本
}
}

[root@ha1 ~]# cat > /etc/keepalived/check_haproxy.sh <<EOF
#!/bin/bash
/usr/bin/killall -0 haproxy || systemctl restart haproxy
EOF
[root@ha1 ~]# chmod a+x /etc/keepalived/check_haproxy.sh
[root@ha1 ~]# systemctl restart keepalived 
```

## **所有主机初始化**

### **配置 ssh key 验证**

```plain
ssh-keygen 
apt install -y sshpass

#!/bin/bash
#⽬标主机列表
IP="
192.168.91.34
192.168.91.32
192.168.91.33
192.168.91.31
192.168.91.30
"
for node in ${IP};do
 sshpass -p <passwd> ssh-copy-id root@${node} -o StrictHostKeyChecking=no
 echo "${node} 秘钥copy完成"
done
```

### 设置主机名和解析

```plain
hostnamectl set-hostname master01.k8s.local
cat > /etc/hosts <<EOF
192.168.91.30 haproxy.k8s.local
192.168.91.31 master01.k8s.local
192.168.91.32 node01.k8s.local
192.168.91.33 node02.k8s.local
192.168.91.34 node03.k8s.local
192.168.91.29 kubeapi.k8s.local
EOF
```

### 禁用swap

```plain
swapoff -a
sed -i '/swap/s/^/#/' /etc/fstab 

或者
systemctl disable --now swap.img.swap
systemctl mask swap.target
```

### 时间同步

```plain
#借助于chronyd服务（程序包名称chrony）设定各节点时间精确同步
apt -y install chrony
chronyc sources -v 
```

### 禁用防火墙

```plain
#禁用默认配置的iptables防火墙服务
ufw disable
ufw status
```

### 内核参数调整

```plain
sudo modprobe br_netfilter
lsmod | grep br_netfilter 

cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# 设置所需的 sysctl 参数，参数在重新启动后保持不变
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1
EOF

# 应用 sysctl 参数而不重新启动
sudo sysctl --system 
```

### 安装docker

```plain
配置安装源：
  参考阿里源：https://developer.aliyun.com/mirror/docker-ce?spm=a2c6h.13651102.0.0.71171b11NnAUhi
  
apt update
apt install -y docker-ce

#自Kubernetes v1.22版本开始，未明确设置kubelet的cgroup driver时，则默认即会将其设置为systemd。所有主机修改加速和cgroupdriver
cat > /etc/docker/daemon.json <<EOF
{
"registry-mirrors": [
"https://docker.mirrors.ustc.edu.cn",
"https://hub-mirror.c.163.com",
"https://reg-mirror.qiniu.com",
"https://registry.docker-cn.com"
],
"exec-opts": ["native.cgroupdriver=systemd"]
}
EOF

systemctl restart docker.service

#验证修改是否成功
docker info |grep Cgroup 
```

### 安装kubeadm、kubelet、kubectl

```plain
通过国内镜像站点阿里云安装的参考链接:
  https://developer.aliyun.com/mirror/kubernetes 
  
范例: Ubuntu 安装
apt-get update && apt-get install -y apt-transport-https
curl https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | apt-key add -
cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
EOF

apt-get update
#查看版本
apt-cache madison kubeadm|head
  kubeadm |  1.24.3-00 | https://mirrors.aliyun.com/kubernetes/apt kubernetes
xenial/main amd64 Packages
  kubeadm |  1.24.2-00 | https://mirrors.aliyun.com/kubernetes/apt kubernetes
xenial/main amd64 Packages
  kubeadm |  1.24.1-00 | https://mirrors.aliyun.com/kubernetes/apt kubernetes
xenial/main amd64 Packages
  kubeadm |  1.24.0-00 | https://mirrors.aliyun.com/kubernetes/apt kubernetes
xenial/main amd64 Packages
#安装指定版本
apt install -y  kubeadm=1.24.3-00 kubelet=1.24.3-00 kubectl=1.24.3-00

#安装最新版本
apt-get install -y kubelet kubeadm kubectl 
```

### 安装cri-dockerd

```plain
# 下载
wget https://github.com/Mirantis/cri-dockerd/releases/download/v0.2.5/cri-dockerd_0.2.5.3-0.ubuntu-focal_amd64.deb

# 安装
dpkg -i cri-dockerd_0.2.5.3-0.ubuntu-focal_amd64.deb

#完成安装后，相应的服务cri-dockerd.service便会自动启动。
```

### 配置cri-dockerd

```plain
# 需要修改cri-dockerd使用国内镜像源
vim /lib/systemd/system/cri-docker.service 

# 修改ExecStart行如下
ExecStart=/usr/bin/cri-dockerd --container-runtime-endpoint fd:// --pod-infra-container-image registry.aliyuncs.com/google_containers/pause:3.7

# 重新加载某个服务的配置文件
systemctl daemon-reload && systemctl restart cri-docker.service

# 同步至所有节点
```

### 准备镜像

```plain
kubeadm config images list

# 查看国内镜像
kubeadm config images list --image-repository registry.aliyuncs.com/google_containers

# 从国内镜像站拉取镜像,1.24以上还需要指定--cri-socket路径
kubeadm config images pull --kubernetes-version=v1.24.3 --image-repository registry.aliyuncs.com/google_containers   --cri-socket unix:///run/cri-dockerd.sock
```

### 初始化集群

```plain
kubeadm init --control-plane-endpoint="kubeapi.k8s.local" --kubernetes-version=v1.24.3 --pod-network-cidr=10.244.0.0/16 --service-cidr=10.96.0.0/12 --token-ttl=0   --cri-socket unix:///run/cri-dockerd.sock --image-repository registry.aliyuncs.com/google_containers --upload-certs
```

