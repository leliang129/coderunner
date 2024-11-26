---
title: Linux基础命令
sidebar_position: 1
---

# Linux 基础命令

本文档介绍 Linux 系统中最常用的基本命令。

## 1. 文件和目录操作

### 1.1 目录操作

```bash
# 显示当前目录
pwd

# 切换目录
cd /path/to/directory  # 切换到指定目录
cd ..                  # 切换到上级目录
cd ~                   # 切换到用户主目录
cd -                   # 切换到上一个工作目录

# 列出目录内容
ls              # 列出当前目录内容
ls -l           # 详细信息
ls -a           # 显示隐藏文件
ls -lh          # 以人类可读的方式显示文件大小
```

### 1.2 文件操作

```bash
# 创建文件
touch file.txt          # 创建空文件
echo "text" > file.txt  # 创建并写入内容

# 复制文件
cp source.txt dest.txt  # 复制文件
cp -r dir1 dir2        # 复制目录

# 移动/重命名文件
mv old.txt new.txt     # 重命名文件
mv file.txt /path/to/  # 移动文件

# 删除文件
rm file.txt            # 删除文件
rm -r directory        # 删除目录
rm -f file.txt        # 强制删除文件
```

## 2. 文件内容操作

### 2.1 查看文件内容

```bash
# 查看文件内容
cat file.txt           # 显示整个文件内容
head file.txt          # 显示文件开头
head -n 5 file.txt    # 显示前5行
tail file.txt         # 显示文件结尾
tail -n 5 file.txt    # 显示最后5行
tail -f file.txt      # 实时查看文件更新

# 分页查看
less file.txt         # 分页查看文件内容
more file.txt         # 分页查看文件内容
```

### 2.2 文本搜索

```bash
# grep 搜索
grep "pattern" file.txt           # 搜索文件内容
grep -r "pattern" directory       # 递归搜索目录
grep -i "pattern" file.txt       # 忽略大小写搜索
grep -n "pattern" file.txt       # 显示行号

# find 查找文件
find /path -name "*.txt"         # 按名称查找文件
find /path -type f -mtime -7     # 查找7天内修改的文件
find /path -size +100M           # 查找大于100M的文件
```

## 3. 系统和进程

### 3.1 系统信息

```bash
# 系统信息
uname -a               # 显示系统信息
df -h                 # 显示磁盘使用情况
free -h               # 显示内存使用情况
top                   # 显示进程信息
htop                  # 交互式进程查看器

# 网络信息
ifconfig              # 显示网络接口信息
ip addr               # 显示IP地址信息
netstat -tulpn        # 显示网络连接信息
```

### 3.2 进程管理

```bash
# 进程操作
ps aux                # 显示所有进程
ps -ef | grep process # 查找特定进程
kill PID              # 终止进程
kill -9 PID           # 强制终止进程
killall process_name  # 终止指定名称的所有进程
```

## 4. 权限管理

### 4.1 文件权限

```bash
# 修改权限
chmod 755 file.txt    # 修改文件权限
chmod -R 755 directory # 递归修改目录权限
chown user:group file.txt # 修改文件所有者
chown -R user:group directory # 递归修改目录所有者
```

### 4.2 用户管理

```bash
# 用户操作
sudo command          # 以管理员权限执行命令
su username          # 切换用户
passwd               # 修改密码
useradd username     # 添加用户
userdel username     # 删除用户
```

## 5. 压缩和解压

```bash
# tar 操作
tar -czf file.tar.gz directory/  # 压缩目录
tar -xzf file.tar.gz            # 解压文件
tar -tvf file.tar.gz            # 查看压缩文件内容

# zip 操作
zip -r file.zip directory/      # 压缩目录
unzip file.zip                  # 解压文件
```

## 6. 网络工具

### 6.1 基本网络命令

```bash
# ping: 测试网络连接
ping www.google.com            # 持续 ping
ping -c 4 www.google.com      # 只 ping 4次
ping -i 2 www.google.com      # 每2秒 ping 一次

# curl: 发送 HTTP 请求
curl http://example.com                    # 获取网页内容
curl -o file.html http://example.com       # 下载并保存到文件
curl -I http://example.com                 # 只获取 HTTP 头信息

# wget: 下载文件
wget http://example.com/file.zip           # 下载文件
wget -c http://example.com/file.zip        # 断点续传
wget -b http://example.com/file.zip        # 后台下载

# ssh: 远程连接
ssh user@host                             # 基本连接
ssh -p 2222 user@host                     # 指定端口
ssh -i key.pem user@host                  # 使用密钥文件

# scp: 远程复制
scp file.txt user@host:/path              # 上传文件
scp user@host:/path/file.txt .            # 下载文件
scp -r folder user@host:/path             # 复制整个目录
```

### 6.2 网络诊断工具

```bash
# 安装常用网络工具（CentOS/RHEL）
yum install bind-utils net-tools iproute2

# 安装常用网络工具（Ubuntu/Debian）
apt-get install dnsutils net-tools iproute2

# nslookup: DNS 查询
nslookup www.google.com                   # 查询域名对应的 IP
nslookup -type=mx google.com              # 查询邮件服务器
nslookup -type=ns google.com              # 查询域名服务器

# dig: DNS 查询工具（更详细）
dig www.google.com                        # 完整的 DNS 查询信息
dig +short www.google.com                 # 只显示 IP 地址
dig @8.8.8.8 www.google.com              # 使用指定 DNS 服务器查询
dig -x 8.8.8.8                           # 反向 DNS 查询

# ip 命令（新版网络工具）
ip addr                                   # 显示网络接口信息
ip link                                   # 显示网络接口状态
ip route                                  # 显示路由表
ip neigh                                  # 显示 ARP 表

# netstat（传统网络工具）
netstat -tulpn                           # 显示所有监听端口
netstat -an                              # 显示所有连接
netstat -r                               # 显示路由表

# traceroute/tracepath: 路由跟踪
traceroute www.google.com                # 跟踪数据包路由
tracepath www.google.com                 # 跟踪路径（不需要 root 权限）

# tcpdump: 网络数据包分析
tcpdump -i eth0                          # 监控指定网络接口
tcpdump host www.google.com              # 监控指定主机的数据包
tcpdump port 80                          # 监控指定端口的数据包

# ss: 查看网络连接状态（新版替代 netstat）
ss -tulpn                               # 显示所有监听端口
ss -s                                   # 显示网络统计信息
```

### 6.3 网络配置工具

```bash
# ifconfig（传统命令）
ifconfig                                 # 显示所有网络接口
ifconfig eth0 up                         # 启用网络接口
ifconfig eth0 down                       # 禁用网络接口

# nmcli（NetworkManager 命令行工具）
nmcli device status                      # 显示设备状态
nmcli connection show                    # 显示所有连接
nmcli connection up "连接名"             # 启用连接
nmcli connection down "连接名"           # 禁用连接

# hostnamectl: 主机名管理
hostnamectl                             # 显示主机信息
hostnamectl set-hostname newname        # 设置主机名
```

### 6.4 防火墙相关

```bash
# firewall-cmd（CentOS/RHEL）
firewall-cmd --state                    # 查看防火墙状态
firewall-cmd --list-all                 # 查看防火墙规则
firewall-cmd --add-port=80/tcp          # 开放端口
firewall-cmd --remove-port=80/tcp       # 关闭端口

# ufw（Ubuntu）
ufw status                              # 查看防火墙状态
ufw allow 80/tcp                        # 开放端口
ufw deny 80/tcp                         # 关闭端口
```

## 注意事项

1. 使用 `rm` 命令时要特别小心，建议使用 `rm -i` 进行交互式删除
2. 在执行危险操作前，先使用 `--dry-run` 或类似选项测试
3. 使用 `sudo` 时要确保了解命令的作用
4. 定期备份重要数据
5. 注意文件权限的安全性

## 常用快捷键

1. `Ctrl + C`: 终止当前命令
2. `Ctrl + Z`: 暂停当前命令
3. `Ctrl + D`: 退出当前终端
4. `Ctrl + L`: 清屏
5. `Ctrl + R`: 搜索历史命令