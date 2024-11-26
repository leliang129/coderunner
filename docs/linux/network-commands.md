---
title: Linux网络工具命令
sidebar_position: 4
---

# Linux 网络工具命令

本文档介绍 Linux 系统中常用的网络工具命令。

## 1. 网络连接工具

### 1.1 curl

```bash
# 下载文件
curl http://example.com/file.iso --silent           # 静默下载
curl http://example.com/file.iso -o filename.iso    # 指定输出文件名
curl http://example.com/file.iso -O                 # 使用远程文件名
curl http://example.com/file.iso --progress         # 显示进度条

# HTTP 请求
curl -X POST http://api.example.com/data            # POST 请求
curl -H "Content-Type: application/json" \          # 设置请求头
     -d '{"key":"value"}' \
     http://api.example.com/data
```

### 1.2 wget

```bash
# 下载文件
wget http://example.com/file.zip                    # 基本下载
wget -c http://example.com/file.zip                 # 断点续传
wget -b http://example.com/file.zip                 # 后台下载
wget -i urls.txt                                    # 从文件中读取 URL 下载
```

### 1.3 telnet

```bash
# 连接远程主机
telnet hostname 80                                  # 连接指定主机和端口
telnet 192.168.1.100 22                            # 测试 SSH 端口连通性
```

## 2. IP 和路由工具

### 2.1 ip 命令

```bash
# 网络接口操作
ip link show                                        # 显示网络接口信息
ip link set eth0 up                                # 启用网卡
ip link set eth0 down                              # 禁用网卡

# IP 地址操作
ip addr show                                        # 显示 IP 地址信息
ip addr add 192.168.1.100/24 dev eth0              # 添加 IP 地址
ip addr del 192.168.1.100/24 dev eth0              # 删除 IP 地址

# 路由操作
ip route show                                       # 显示路由表
ip route add default via 192.168.1.1               # 添加默认网关
ip route del default                               # 删除默认路由
```

### 2.2 ifconfig（传统命令）

```bash
# 网络接口配置
ifconfig                                           # 显示所有网络接口
ifconfig eth0                                      # 显示特定接口信息
ifconfig eth0 192.168.1.100                        # 设置 IP 地址
ifconfig eth0 up                                   # 启用接口
ifconfig eth0 down                                 # 禁用接口
```

### 2.3 route（传统命令）

```bash
# 路由表操作
route -n                                           # 显示路由表
route add default gw 192.168.1.1                   # 添加默认网关
route del default                                  # 删除默认路由
route add -net 192.168.2.0/24 gw 192.168.1.1      # 添加静态路由
```

## 3. DNS 工具

### 3.1 host

```bash
# DNS 查询
host example.com                                   # 基本 DNS 查询
host -t MX example.com                            # 查询邮件服务器
host -t NS example.com                            # 查询域名服务器
```

### 3.2 nslookup

```bash
# DNS 查询和调试
nslookup example.com                              # 交互式 DNS 查询
nslookup -type=mx example.com                     # 查询邮件记录
nslookup -type=ns example.com                     # 查询域名服务器
nslookup example.com 8.8.8.8                      # 使用指定 DNS 服务器查询
```

### 3.3 dig

```bash
# 详细 DNS 查询
dig example.com                                   # 完整的 DNS 查询信息
dig +short example.com                            # 简短格式显示结果
dig @8.8.8.8 example.com                         # 使用指定 DNS 服务器
dig -x 8.8.8.8                                   # 反向 DNS 查询
```

## 4. 网络诊断工具

### 4.1 ping

```bash
# 网络连通性测试
ping example.com                                  # 持续 ping
ping -c 4 example.com                            # 发送指定次数
ping -i 2 example.com                            # 设置间隔时间
ping -s 1000 example.com                         # 设置数据包大小
```

### 4.2 traceroute

```bash
# 路由跟踪
traceroute example.com                           # 跟踪路由路径
traceroute -n example.com                        # 不解析主机名
traceroute -m 30 example.com                     # 设置最大跳数
```

### 4.3 netcat (nc)

```bash
# 网络连接测试和数据传输
nc -v -z -w2 192.168.1.100 22                    # 端口扫描
nc -l 1234                                       # 监听端口
nc 192.168.1.100 1234                           # 连接到远程主机
nc -l 1234 > received_file                       # 接收文件
nc 192.168.1.100 1234 < file_to_send            # 发送文件
```

## 5. 网络监控工具

### 5.1 netstat

```bash
# 网络连接状态
netstat -tulpn                                   # 显示所有监听端口
netstat -an                                      # 显示所有连接
netstat -r                                       # 显示路由表
netstat -i                                       # 显示网络接口统计
```

### 5.2 ss（Socket Statistics）

```bash
# 套接字统计
ss -tulpn                                        # 显示所有监听端口
ss -s                                           # 显示统计摘要
ss -t state established                         # 显示已建立的连接
```

### 5.3 iptraf

```bash
# 网络流量监控（需要安装）
iptraf-ng                                       # 启动交互式界面
iptraf-ng -i eth0                               # 监控特定接口
```

## 6. 防火墙工具

### 6.1 firewall-cmd (firewalld)

```bash
# 防火墙管理（CentOS 7+）
firewall-cmd --state                            # 查看防火墙状态
firewall-cmd --list-all                         # 查看所有规则
firewall-cmd --add-port=80/tcp --permanent      # 开放端口
firewall-cmd --remove-port=80/tcp --permanent   # 关闭端口
firewall-cmd --reload                           # 重载规则
```

### 6.2 iptables

```bash
# 传统防火墙管理
iptables -L                                     # 列出所有规则
iptables -A INPUT -p tcp --dport 80 -j ACCEPT   # 允许访问 80 端口
iptables -A INPUT -s 192.168.1.0/24 -j ACCEPT   # 允许特定网段访问
iptables -P INPUT DROP                          # 设置默认策略
```

## 注意事项

1. 某些命令需要 root 权限
2. 修改网络配置前先备份当前配置
3. 远程操作时要特别小心，避免断开连接
4. 防火墙规则修改要谨慎，避免锁定系统
5. 使用 ping 等工具时注意目标主机可能禁止 ICMP

## 常用软件包安装

```bash
# CentOS/RHEL
yum install net-tools        # 安装 ifconfig、netstat 等工具
yum install bind-utils       # 安装 dig、host、nslookup
yum install traceroute
yum install nmap-ncat       # 安装 netcat

# Ubuntu/Debian
apt-get install net-tools
apt-get install dnsutils
apt-get install traceroute
apt-get install netcat
``` 