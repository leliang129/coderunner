---
title: k8s集群部署 - containerd
description: 使用kubeadm + containerd部署k8s高可用集群
keywords: [containerd, docker, k8s]
sidebar_position: 3
---
# Kubernetes 集群部署
使用 kubeadm 从头搭建一个使用 containerd 作为容器运行时的 Kubernetes 集群，这里我们安装最新的 `v1.24.3` 版本

## 环境准备
### 添加hosts解析
```shell
# 查看系统信息
[root@master-1 ~]# uname -a
Linux master-1 3.10.0-1160.el7.x86_64 #1 SMP Mon Oct 19 16:18:59 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
[root@master-1 ~]# uname -r
3.10.0-1160.el7.x86_64

# 添加hosts解析
[root@master-1 ~]# cat /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
192.168.91.47 master-1
192.168.91.48 node-1
192.168.91.49 node-2
```
:::tip HOSTNAME
节点的 hostname 必须使用标准的 DNS 命名，另外千万不用什么默认的 `localhost` 的 hostname，会导致各种错误出现的。在 Kubernetes 项目里，机器的名字以及一切存储在 Etcd 中的 API 对象，都必须使用标准的 DNS 命名（RFC 1123）。可以使用命令 `hostnamectl set-hostname master-1` 来修改 hostname。
:::
     
### 禁用防火墙
```shell
[root@master-1 ~]# systemctl stop firewalld
[root@master-1 ~]# systemctl disable firewalld
```
       
### 禁用 SELINUX
```shell
[root@master-1 ~]# setenforce 0
setenforce: SELinux is disabled
[root@master-1 ~]# cat /etc/selinux/config

# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=disabled
# SELINUXTYPE= can take one of three values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected. 
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted
```
          
### 加载 br_netfilter 模块
      
由于开启内核 ipv4 转发需要加载 br_netfilter 模块，所以加载下该模块：
```shell
[root@master-1 ~]# modprobe br_netfilter
```
将上面的命令设置成开机启动，因为重启后模块失效，下面是开机自动加载模块的方式。首先新建 /etc/rc.sysinit 文件，内容如下所示：
```shell
# 创建并编辑文件
[root@master-1 ~]# vim /etc/rc.sysinit

# 查看文件内容
[root@master-1 ~]# cat /etc/rc.sysinit
#!/bin/bash
for file in /etc/sysconfig/modules/*.modules ; do
[ -x $file ] && $file
done
```
    
然后在 /etc/sysconfig/modules/ 目录下新建如下文件：
```shell
[root@master-1 ~]# cat /etc/sysconfig/modules/br_netfilter.modules
modprobe br_netfilter
```
增加权限：
```shell
[root@master-1 ~]# chmod 755 /etc/sysconfig/modules/br_netfilter.modules
```
然后重启后，模块就可以自动加载了：
```shell
[root@master-1 ~]# lsmod |grep br_netfilter
br_netfilter           22256  0 
bridge                151336  1 br_netfilter
```
    
### 修改内核参数
创建 `/etc/sysctl.d/k8s.conf` 文件，添加如下内容:
```shell
[root@master-1 ~]# vim /etc/sysctl.d/k8s.conf
[root@master-1 ~]# cat /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
vm.swappiness = 0
# 下面的内核参数可以解决ipvs模式下长连接空闲超时的问题
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 10
net.ipv4.tcp_keepalive_time = 600
```
:::tip
`bridge-nf` 使得 netfilter 可以对 Linux 网桥上的 IPv4/ARP/IPv6 包过滤。比如，设置 `net.bridge.bridge-nf-call-iptables＝1` 后，二层的网桥在转发包时也会被 iptables 的 FORWARD 规则所过滤。常用的选项包括：
  - net.bridge.bridge-nf-call-arptables：是否在 arptables 的 FORWARD 中过滤网桥的 ARP 包
  - net.bridge.bridge-nf-call-ip6tables：是否在 ip6tables 链中过滤 IPv6 包
  - net.bridge.bridge-nf-call-iptables：是否在 iptables 链中过滤 IPv4 包
  - net.bridge.bridge-nf-filter-vlan-tagged：是否在 iptables/arptables 中过滤打了 vlan 标签的包。
:::

执行命令使修改生效：
```shell
[root@master-1 ~]# sysctl -p /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
vm.swappiness = 0
```
### 安装 ipvs
         
创建 `/etc/sysconfig/modules/ipvs.modules` 文件，保证在节点重启后能自动加载所需模块。使用 `lsmod | grep -e ip_vs -e nf_conntrack_ipv4` 命令查看是否已经正确加载所需的内核模块。
```shell title=/etc/sysconfig/modules/ipvs.modules
[root@master-1 ~]# cat > /etc/sysconfig/modules/ipvs.modules <<EOF
#!/bin/bash
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack_ipv4
EOF

[root@master-1 ~]# chmod 755 /etc/sysconfig/modules/ipvs.modules && bash /etc/sysconfig/modules/ipvs.modules && lsmod | grep -e ip_vs -e nf_conntrack_ipv4

# 查看内核模块加载信息
[root@master-1 ~]# lsmod | grep -e ip_vs -e nf_conntrack_ipv4
nf_conntrack_ipv4      15053  0 
nf_defrag_ipv4         12729  1 nf_conntrack_ipv4
ip_vs_sh               12688  0 
ip_vs_wrr              12697  0 
ip_vs_rr               12600  0 
ip_vs                 145458  6 ip_vs_rr,ip_vs_sh,ip_vs_wrr
nf_conntrack          139264  2 ip_vs,nf_conntrack_ipv4
libcrc32c              12644  3 xfs,ip_vs,nf_conntrack
```
     
接下来还需要确保各个节点上已经安装了 `ipset` 软件包
```shell
# 安装 ipset 软件包
[root@master-1 ~]# yum install ipset -y
```
     
为了便于查看 ipvs 的代理规则，最好安装一下管理工具 `ipvsadm` ：
```shell
# 安装 ipvsadm 工具
[root@master-1 ~]# yum install ipvsadm -y
```
     
### 配置时间同步
```shell
# 调整时区
[root@master-1 ~]# timedatectl set-timezone Asia/Shanghai

# 安装chrony服务
[root@master-1 ~]# yum install chrony -y

# 设置开机启动并立即启动
[root@master-1 ~]# systemctl enable --now chronyd
[root@master-1 ~]# systemctl status chronyd.service 
● chronyd.service - NTP client/server
   Loaded: loaded (/usr/lib/systemd/system/chronyd.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2023-07-17 19:46:51 CST; 1h 3min ago
     Docs: man:chronyd(8)
           man:chrony.conf(5)
 Main PID: 699 (chronyd)
   CGroup: /system.slice/chronyd.service
           └─699 /usr/sbin/chronyd

Jul 17 19:47:31 localhost.localdomain chronyd[699]: Selected source 203.107.6.88
Jul 17 19:47:31 localhost.localdomain chronyd[699]: System clock wrong by 2.505396 seconds, adjustment started
Jul 17 19:47:34 localhost.localdomain chronyd[699]: System clock was stepped by 2.505396 seconds
Jul 17 19:48:09 localhost.localdomain chronyd[699]: Selected source 120.25.115.20
Jul 17 19:51:08 localhost.localdomain chronyd[699]: Source 203.107.6.88 offline
Jul 17 19:51:08 localhost.localdomain chronyd[699]: Source 120.25.115.20 offline
Jul 17 19:51:08 localhost.localdomain chronyd[699]: Can't synchronise: no selectable sources
Jul 17 19:51:08 localhost.localdomain chronyd[699]: Source 203.107.6.88 online
Jul 17 19:51:08 localhost.localdomain chronyd[699]: Source 120.25.115.20 online
Jul 17 19:51:32 localhost.localdomain chronyd[699]: Selected source 120.25.115.20

# 查看时间同步状态
[root@master-1 ~]# chronyc sources -v
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
^- 203.107.6.88                  2   9   377   146   +760us[ +760us] +/-   33ms
^* 120.25.115.20                 2   9   377   484   +486us[ +803us] +/- 4362us
```
### 关闭 swap 分区
```shell
[root@master-1 ~]# swapoff -a

[root@master-1 ~]# free -h
              total        used        free      shared  buff/cache   available
Mem:           1.8G        217M        1.2G        9.6M        411M        1.4G
Swap:            0B          0B          0B
```
修改 `/etc/fstab` 文件，注释掉 SWAP 的自动挂载，使用 `free -m` 确认 swap 已经关闭。swappiness 参数调整，修改 `/etc/sysctl.d/k8s.conf` 添加下面一行：
```shell
vm.swappiness = 0
```
执行 `sysctl -p /etc/sysctl.d/k8s.conf` 使修改生效。
     
## 安装containerd
>如果这安装集群的过程出现了容器运行时的问题，启动不起来，可以尝试使用 yum install containerd.io 来安装 Containerd。
      
### 安装依赖
```shell
[root@master-1 ~]# rpm -qa |grep libseccomp
libseccomp-2.3.1-4.el7.x86_64

# 如果没有安装 libseccomp 包则执行下面的命令安装依赖
[root@master-1 ~]# yum install wget -y
[root@master-1 ~]# wget http://mirror.centos.org/centos/7/os/x86_64/Packages/libseccomp-2.3.1-4.el7.x86_64.rpm
[root@master-1 ~]# yum install libseccomp-2.3.1-4.el7.x86_64.rpm -y
```
### 安装containerd
由于 containerd 需要调用 runc，所以我们也需要先安装 runc，不过 containerd 提供了一个包含相关依赖的压缩包 *`cri-containerd-cni-${VERSION}.${OS}-${ARCH}.tar.gz`*，可以直接使用这个包来进行安装。首先从 [release 页面](https://github.com/containerd/containerd/releases) 下载最新版本的压缩包，本文为 `1.5.5` 版本。
        
```shell
# 下载
[root@master-1 ~]# wget https://github.com/containerd/containerd/releases/download/v1.5.5/cri-containerd-cni-1.5.5-linux-amd64.tar.gz

# 解压缩
[root@master-1 ~]# tar xvf cri-containerd-cni-1.5.5-linux-amd64.tar.gz -C /
```
### 生成默认配置
```shell
# 创建目录
[root@master-1 ~]# mkdir -p /etc/containerd

# 生成默认配置文件
[root@master-1 ~]# containerd config default > /etc/containerd/config.toml
```
对于使用 systemd 作为 init system 的 Linux 的发行版，使用 `systemd` 作为容器的 `cgroup driver` 可以确保节点在资源紧张的情况更加稳定，所以推荐将 containerd 的 cgroup driver 配置为 systemd。
      
修改前面生成的配置文件 `/etc/containerd/config.toml`，在 `plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options` 配置块下面将 `SystemdCgroup` 设置为 true:
```shell
# 查看修改后配置
[root@master-1 ~]# grep SystemdCgroup /etc/containerd/config.toml 
            SystemdCgroup = true
    ....
```
**配置镜像加速器**：
      
为镜像仓库配置一个加速器，需要在 cri 配置块下面的 registry 配置块下面进行配置 registry.mirrors：
```shell
[root@master-1 ~]# vim /etc/containerd/config.toml
[plugins."io.containerd.grpc.v1.cri"]
  ...
  # sandbox_image = "k8s.gcr.io/pause:3.5"
  sandbox_image = "registry.aliyuncs.com/k8sxio/pause:3.7"
  ...
  [plugins."io.containerd.grpc.v1.cri".registry]
    [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
        endpoint = ["https://bqr1dr1n.mirror.aliyuncs.com"]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors."k8s.gcr.io"]
        endpoint = ["https://registry.aliyuncs.com/k8sxio"]
```
>如果不能正常获取 `k8s.gcr.io` 的镜像，那么我们需要在上面重新配置 `sandbox_image` 镜像，否则后面 kubelet 覆盖该镜像不会生效：`Warning: For remote container runtime, --pod-infra-container-image is ignored in kubelet, which should be set in that remote runtime instead`。

### 启动服务并验证    
由于上面我们下载的 containerd 压缩包中包含一个 `etc/systemd/system/containerd.service` 的文件，这样我们就可以通过 systemd 来配置 containerd 作为守护进程运行了，现在我们就可以启动 containerd 了，直接执行下面的命令即可：
```shell
[root@master-1 ~]# systemctl daemon-reload
[root@master-1 ~]# systemctl enable containerd --now

# 查看服务状态
[root@master-1 ~]# systemctl status containerd.service 
● containerd.service - containerd container runtime
   Loaded: loaded (/etc/systemd/system/containerd.service; enabled; vendor preset: disabled)
   Active: active (running) since Mon 2023-07-17 19:46:55 CST; 1h 36min ago
     Docs: https://containerd.io
 Main PID: 942 (containerd)
   CGroup: /system.slice/containerd.service
           └─942 /usr/local/bin/containerd

Jul 17 19:46:55 localhost.localdomain systemd[1]: Started containerd container runtime.
Jul 17 19:46:55 localhost.localdomain containerd[942]: time="2023-07-17T19:46:55.828687235+08:00" level=info msg=serving... address=/run/containerd/containerd.sock.ttrpc
Jul 17 19:46:55 localhost.localdomain containerd[942]: time="2023-07-17T19:46:55.828729547+08:00" level=info msg=serving... address=/run/containerd/containerd.sock
Jul 17 19:46:55 localhost.localdomain containerd[942]: time="2023-07-17T19:46:55.829076054+08:00" level=info msg="containerd successfully booted in 0.119603s"
Jul 17 19:46:55 localhost.localdomain containerd[942]: time="2023-07-17T19:46:55.830050886+08:00" level=info msg="Start subscribing containerd event"
Jul 17 19:46:55 localhost.localdomain containerd[942]: time="2023-07-17T19:46:55.830683397+08:00" level=info msg="Start recovering state"
Jul 17 19:46:55 localhost.localdomain containerd[942]: time="2023-07-17T19:46:55.831068732+08:00" level=info msg="Start event monitor"
Jul 17 19:46:55 localhost.localdomain containerd[942]: time="2023-07-17T19:46:55.831229331+08:00" level=info msg="Start snapshots syncer"
Jul 17 19:46:55 localhost.localdomain containerd[942]: time="2023-07-17T19:46:55.831408844+08:00" level=info msg="Start cni network conf syncer"
Jul 17 19:46:55 localhost.localdomain containerd[942]: time="2023-07-17T19:46:55.831558251+08:00" level=info msg="Start streaming server"
```

启动完成后就可以使用 containerd 的本地 CLI 工具 `ctr` 和 `crictl` 了，比如查看版本
```shell
[root@master-1 ~]# ctr version
Client:
  Version:  v1.5.5
  Revision: 72cec4be58a9eb6b2910f5d10f1c01ca47d231c0
  Go version: go1.16.6

Server:
  Version:  v1.5.5
  Revision: 72cec4be58a9eb6b2910f5d10f1c01ca47d231c0
  UUID: 20f13f12-8e7e-47fc-8b67-df2d76fcb273

[root@master-1 ~]# crictl version
Version:  0.1.0
RuntimeName:  containerd
RuntimeVersion:  v1.5.5
RuntimeApiVersion:  v1alpha2
```
         
## 使用 kubeadm 部署 Kubernetes
### 添加软件源
上面的相关环境配置也完成了，现在我们就可以来安装 Kubeadm 了，我们这里是通过指定 yum 源的方式来进行安装：
```shell
[root@master-1 ~]# cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
        http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
```

### 安装kubeadm、kubelet、kubectl
```shell
# --disableexcludes 禁掉除了kubernetes之外的别的仓库
[root@master-1 ~]# yum makecache fast
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * base: mirrors.aliyun.com
 * extras: mirrors.aliyun.com
 * updates: mirrors.aliyun.com
base                                                                                                                                                                                       | 3.6 kB  00:00:00     
docker-ce-stable                                                                                                                                                                           | 3.5 kB  00:00:00     
epel                                                                                                                                                                                       | 4.7 kB  00:00:00     
extras                                                                                                                                                                                     | 2.9 kB  00:00:00     
kubernetes/signature                                                                                                                                                                       |  454 B  00:00:00     
kubernetes/signature                                                                                                                                                                       | 1.4 kB  00:00:00 !!! 
updates                                                                                                                                                                                    | 2.9 kB  00:00:00     
Metadata Cache Created

# 安装
[root@master-1 ~]# yum install -y kubelet-1.24.3 kubeadm-1.24.3 kubectl-1.24.3 --disableexcludes=kubernetes

# 验证
[root@master-1 ~]# kubeadm version
kubeadm version: &version.Info{Major:"1", Minor:"24", GitVersion:"v1.24.3", GitCommit:"aef86a93758dc3cb2c658dd9657ab4ad4afc21cb", GitTreeState:"clean", BuildDate:"2022-07-13T14:29:09Z", GoVersion:"go1.18.3", Compiler:"gc", Platform:"linux/amd64"}
```
>到这里为止上面所有的操作都需要在所有节点执行配置。
       
可以看到安装的是 `v1.24.3` 版本，然后将 master 节点的 kubelet 设置成开机启动：
```shell
[root@master-1 ~]# systemctl enable --now kubelet
Created symlink from /etc/systemd/system/multi-user.target.wants/kubelet.service to /usr/lib/systemd/system/kubelet.service.
```
       
### 初始化集群
当我们执行 `kubelet --help` 命令的时候可以看到原来大部分命令行参数都被 `DEPRECATED` 了，这是因为官方推荐我们使用 `--config` 来指定配置文件，在配置文件中指定原来这些参数的配置，可以通过官方文档 [Set Kubelet parameters via a config file](https://kubernetes.io/docs/tasks/administer-cluster/kubelet-config-file/) 了解更多相关信息，这样 Kubernetes 就可以支持动态 Kubelet 配置（Dynamic Kubelet Configuration）了，参考 [Reconfigure a Node’s Kubelet in a Live Cluster](https://kubernetes.io/docs/tasks/administer-cluster/reconfigure-kubelet/)。
       
然后我们可以通过下面的命令在 master 节点上输出集群初始化默认使用的配置:
```shell
[root@master-1 ~]# kubeadm config print init-defaults --component-configs KubeletConfiguration > kubeadm.yaml
```
然后根据我们自己的需求修改配置，比如修改 `imageRepository` 指定集群初始化时拉取 Kubernetes 所需镜像的地址，kube-proxy 的模式为 ipvs，另外需要注意的是我们这里是准备安装 flannel 网络插件的，需要将 `networking.podSubnet` 设置为 `10.244.0.0/16`：
```yaml title=kubeadm.yaml
[root@master-1 ~]# cat kubeadm.yaml
apiVersion: kubeadm.k8s.io/v1beta3
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 192.168.91.47   # 指定master节点内网IP
  bindPort: 6443
nodeRegistration:
  criSocket: /run/containerd/containerd.sock # 使用 containerd的Unix socket 地址
  imagePullPolicy: IfNotPresent
  name: master   # 修改master节点名称
  taints: # 给master添加污点，master节点不能调度应用
    - effect: 'NoSchedule'
      key: 'node-role.kubernetes.io/master'
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs # kube-proxy 模式
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta3
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns: {}
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: registry.aliyuncs.com/google_containers
kind: ClusterConfiguration
kubernetesVersion: 1.24.3
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
  podSubnet: 10.244.0.0/16 # 指定 pod 子网
scheduler: {}
---
apiVersion: kubelet.config.k8s.io/v1beta1
authentication:
  anonymous:
    enabled: false
  webhook:
    cacheTTL: 0s
    enabled: true
  x509:
    clientCAFile: /etc/kubernetes/pki/ca.crt
authorization:
  mode: Webhook
  webhook:
    cacheAuthorizedTTL: 0s
    cacheUnauthorizedTTL: 0s
cgroupDriver: systemd
clusterDNS:
- 10.96.0.10
clusterDomain: cluster.local
cpuManagerReconcilePeriod: 0s
evictionPressureTransitionPeriod: 0s
fileCheckFrequency: 0s
healthzBindAddress: 127.0.0.1
healthzPort: 10248
httpCheckFrequency: 0s
imageMinimumGCAge: 0s
kind: KubeletConfiguration
logging:
  flushFrequency: 0
  options:
    json:
      infoBufferSize: "0"
  verbosity: 0
memorySwap: {}
nodeStatusReportFrequency: 0s
nodeStatusUpdateFrequency: 0s
rotateCertificates: true
runtimeRequestTimeout: 0s
shutdownGracePeriod: 0s
shutdownGracePeriodCriticalPods: 0s
staticPodPath: /etc/kubernetes/manifests
streamingConnectionIdleTimeout: 0s
syncFrequency: 0s
volumeStatsAggPeriod: 0s
```
     
对于上面的资源清单的文档比较杂，要想完整了解上面的资源对象对应的属性，可以查看对应的 godoc 文档，地址：[https://godoc.org/k8s.io/kubernetes/cmd/kubeadm/app/apis/kubeadm/v1beta3](https://godoc.org/k8s.io/kubernetes/cmd/kubeadm/app/apis/kubeadm/v1beta3)。
      
在开始初始化集群之前可以使用 `kubeadm config images pull --config kubeadm.yaml` 预先在各个服务器节点上拉取所 k8s 需要的容器镜像。
              
配置文件准备好过后，可以使用如下命令先将相关镜像 pull 下面：
```shell
[root@master-1 ~]# kubeadm config images pull --config kubeadm.yaml
W0717 22:05:34.921045   13662 initconfiguration.go:120] Usage of CRI endpoints without URL scheme is deprecated and can cause kubelet errors in the future. Automatically prepending scheme "unix" to the "criSocket" with value "/run/containerd/containerd.sock". Please update your configuration!
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-apiserver:v1.24.3
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-controller-manager:v1.24.3
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-scheduler:v1.24.3
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-proxy:v1.24.3
[config/images] Pulled registry.aliyuncs.com/google_containers/pause:3.7
[config/images] Pulled registry.aliyuncs.com/google_containers/etcd:3.5.3-0
[config/images] Pulled registry.aliyuncs.com/google_containers/coredns:v1.8.6
```
然后就可以使用上面的配置文件在 master 节点上进行初始化：
```shell
[root@master-1 ~]# kubeadm init --config kubeadm.yaml
......

[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.91.47:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash sha256:526066ed693936be82392de6aaf903035e37cbab73a1dff02f0f93f9358fc95f 
```
根据安装提示拷贝 kubeconfig 文件:
```shell
[root@master-1 ~]# mkdir -p $HOME/.kube
[root@master-1 ~]# sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
[root@master-1 ~]# sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
然后可以使用 kubectl 命令查看 master 节点已经初始化成功了：
```shell
[root@master-1 ~]# kubectl get nodes
NAME     STATUS   ROLES           AGE    VERSION
master   Ready    control-plane   117s   v1.24.3
```
### 添加节点
记住初始化集群上面的配置和操作要提前做好，将 master 节点上面的 `$HOME/.kube/config` 文件拷贝到 node 节点对应的文件中，安装 kubeadm、kubelet、kubectl（可选），然后执行上面初始化完成后提示的 join 命令即可：
```shell
# 添加node-1
[root@node-1 ~]# kubeadm join 192.168.91.47:6443 --token abcdef.0123456789abcdef \
> --discovery-token-ca-cert-hash sha256:526066ed693936be82392de6aaf903035e37cbab73a1dff02f0f93f9358fc95f
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.

# 添加node-2
[root@node-2 ~]# systemctl restart containerd.service 
[root@node-2 ~]# kubeadm join 192.168.91.47:6443 --token abcdef.0123456789abcdef \
> --discovery-token-ca-cert-hash sha256:526066ed693936be82392de6aaf903035e37cbab73a1dff02f0f93f9358fc95f
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```
:::tip 重新获取 JOIN 命令
如果忘记了上面的 join 命令可以使用命令 `kubeadm token create --print-join-command` 重新获取。
:::
      
返回master查看node节点
```shell
[root@master-1 ~]# kubectl get nodes
NAME     STATUS   ROLES           AGE     VERSION
master   Ready    control-plane   4m16s   v1.24.3
node-1   Ready    <none>          48s     v1.24.3
node-2   Ready    <none>          46s     v1.24.3
```
### 实现 kubectl 命令补全
```shell
[root@master-1 ~]# kubectl completion bash > /etc/profile.d/kubectl_completion.sh
[root@master-1 ~]# source /etc/profile.d/kubectl_completion.sh
```
         
### 安装网络插件
这个时候其实集群还不能正常使用，因为还没有安装网络插件，接下来安装网络插件，可以在文档[https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)中选择我们自己的网络插件，这里我们安装 flannel:
      
[flannel项目地址](https://github.com/flannel-io/flannel)
```yaml
# 下载flannel资源部署文件
[root@master-1 ~]# wget https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

# 编辑flannel部署文件
[root@master-1 ~]# vim kube-flannel.yml
......
      containers:
      - args:
        - --ip-masq
        - --kube-subnet-mgr
        - --iface=eth0   # 如果是多网卡的话，指定内网网卡的名称
        command:
        - /opt/bin/flanneld
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: EVENT_QUEUE_DEPTH
          value: "5000"
        image: docker.io/flannel/flannel:v0.22.0
        name: kube-flannel
......

# 部署flannel
[root@master-1 ~]# kubectl apply -f kube-flannel.yml 
namespace/kube-flannel created
serviceaccount/flannel created
clusterrole.rbac.authorization.k8s.io/flannel created
clusterrolebinding.rbac.authorization.k8s.io/flannel created
configmap/kube-flannel-cfg created
daemonset.apps/kube-flannel-ds created
```

查看pod运行状态
```shell
[root@master-1 ~]# kubectl -n kube-flannel get pods
NAME                    READY   STATUS    RESTARTS   AGE
kube-flannel-ds-ghdc6   1/1     Running   0          5m26s
kube-flannel-ds-p8x2r   1/1     Running   0          5m26s
kube-flannel-ds-t7b8c   1/1     Running   0          5m26s
```
:::tip
当我们部署完网络插件后执行 `ifconfig` 命令，正常会看到新增的 `cni0` 与 `flannel1` 这两个虚拟设备，但是如果没有看到 cni0这个设备也不用太担心，我们可以观察 `/var/lib/cni` 目录是否存在，如果不存在并不是说部署有问题，而是该节点上暂时还没有应用运行，我们只需要在该节点上运行一个 Pod 就可以看到该目录会被创建，并且 `cni0` 设备也会被创建出来。
:::

仔细观察可以发现上面的 CoreDNS 分配的 IP 段是 10.88.xx.xx，而初始化配置的 podSubnet 为 10.244.0.0/16，通过查看 CNI 的配置文件发现：
```shell
[root@master-1 ~]# ls -la /etc/cni/net.d/
total 8
drwxr-xr-x 2 1001  116  67 Jul 17 22:26 .
drwxr-xr-x 3 1001  116  19 Jul 30  2021 ..
-rw-r--r-- 1 1001  116 604 Jul 30  2021 10-containerd-net.conflist
-rw-r--r-- 1 root root 292 Jul 17 22:26 10-flannel.conflist
```
可以看到里面包含两个配置，一个是 `10-containerd-net.conflist` ，另外一个是我们上面创建的 Flannel 网络插件生成的配置，我们的需求肯定是想使用 Flannel 的这个配置，我们可以查看下 `containerd` 这个自带的 cni 插件配置：
```json
[root@master-1 ~]# cat /etc/cni/net.d/10-containerd-net.conflist
{
  "cniVersion": "0.4.0",
  "name": "containerd-net",
  "plugins": [
    {
      "type": "bridge",
      "bridge": "cni0",
      "isGateway": true,
      "ipMasq": true,
      "promiscMode": true,
      "ipam": {
        "type": "host-local",
        "ranges": [
          [{
            "subnet": "10.88.0.0/16"
          }],
          [{
            "subnet": "2001:4860:4860::/64"
          }]
        ],
        "routes": [
          { "dst": "0.0.0.0/0" },
          { "dst": "::/0" }
        ]
      }
    },
    {
      "type": "portmap",
      "capabilities": {"portMappings": true}
    }
  ]
}
```

可以看到上面的 IP 段恰好就是 10.88.0.0/16，但是这个 cni 插件类型是 bridge 网络，网桥的名称为 cni0：
```shell
[root@master-1 ~]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:0b:24:53 brd ff:ff:ff:ff:ff:ff
    inet 192.168.91.47/24 brd 192.168.91.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
3: cni0: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 56:61:e7:75:fd:a1 brd ff:ff:ff:ff:ff:ff
    inet 10.88.0.1/16 brd 10.88.255.255 scope global cni0
       valid_lft forever preferred_lft forever
    inet6 2001:4860:4860::1/64 scope global 
       valid_lft forever preferred_lft forever
    inet6 fe80::5461:e7ff:fe75:fda1/64 scope link 
       valid_lft forever preferred_lft forever
......
```

但是使用 bridge 网络的容器无法跨多个宿主机进行通信，跨主机通信需要借助其他的 cni 插件，比如上面我们安装的 Flannel，或者 Calico 等等，由于我们这里有两个 cni 配置，所以我们需要将 `10-containerd-net.conflist` 这个配置删除，因为如果这个目录中有多个 cni 配置文件，kubelet 将会使用按文件名的字典顺序排列的第一个作为配置文件，所以前面默认选择使用的是 `containerd-net` 这个插件。
```shell
[root@master-1 ~]# mv /etc/cni/net.d/10-containerd-net.conflist /etc/cni/net.d/10-containerd-net.conflist.bak
[root@master-1 ~]# ifconfig cni0 down && ip link delete cni0
-bash: ifconfig: command not found

#安装ifconfig命令 
[root@master-1 ~]# yum install -y net-tools

# 再次执行
[root@master-1 ~]# ifconfig cni0 down && ip link delete cni0

# 重新加载systemd文件并重启服务
[root@master-1 ~]# systemctl daemon-reload
[root@master-1 ~]# systemctl restart containerd kubelet
```

重新构建coredns服务
```shell
# 滚动重启coredns
[root@master-1 ~]# kubectl -n kube-system rollout restart deployment coredns 
deployment.apps/coredns restarted

# 查看coredns IP地址
# 重建后 Pod 的 IP 地址已经正常
[root@master-1 ~]# kubectl -n kube-system get pods -owide -l k8s-app=kube-dns
NAME                       READY   STATUS    RESTARTS   AGE   IP           NODE     NOMINATED NODE   READINESS GATES
coredns-7dddd4d99f-cpc89   1/1     Running   0          80s   10.244.2.2   node-2   <none>           <none>
coredns-7dddd4d99f-kwbsp   1/1     Running   0          80s   10.244.1.2   node-1   <none>           <none>
```