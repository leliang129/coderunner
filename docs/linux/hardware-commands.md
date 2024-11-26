---
title: Linux硬件相关命令
sidebar_position: 3
---

# Linux 硬件相关命令

本文档介绍 Linux 系统中与硬件相关的常用命令。

## 1. CPU 信息

### 1.1 查看 CPU 信息

```bash
# 查看 CPU 详细信息
cat /proc/cpuinfo

# 查看 CPU 核心数
nproc
lscpu | grep 'CPU(s):'

# 查看 CPU 使用情况
top
htop    # 需要安装
mpstat   # 需要安装 sysstat 包

# 查看 CPU 温度
sensors  # 需要安装 lm-sensors 包
```

### 1.2 CPU 负载监控

```bash
# 查看系统负载
uptime
w

# 查看进程 CPU 使用率
ps aux --sort=-%cpu | head -n 10  # 显示 CPU 使用率最高的10个进程

# 实时监控 CPU 使用情况
vmstat 1    # 每秒更新一次
sar -u 1 5  # 每秒采样一次，共采样5次
```

## 2. 内存信息

### 2.1 查看内存使用情况

```bash
# 查看内存使用情况
free -h     # 以人类可读的方式显示
free -m     # 以 MB 为单位显示

# 查看详细内存信息
cat /proc/meminfo

# 查看进程内存使用
ps aux --sort=-%mem | head -n 10  # 显示内存使用最多的10个进程
```

### 2.2 内存监控

```bash
# 使用 vmstat 监控内存
vmstat 1

# 使用 sar 监控内存
sar -r 1 5

# 查看内存使用趋势
watch -n 1 free -m
```

## 3. 磁盘信息

### 3.1 查看磁盘信息

```bash
# 查看磁盘分区信息
fdisk -l    # 需要 root 权限
lsblk       # 显示块设备信息

# 查看磁盘使用情况
df -h       # 显示文件系统使用情况
du -sh /*   # 显示根目录下各目录大小

# 查看磁盘详细信息
hdparm -i /dev/sda  # 需要安装 hdparm
smartctl -a /dev/sda  # 需要安装 smartmontools
```

### 3.2 磁盘性能监控

```bash
# 查看磁盘 I/O 状态
iostat -x 1    # 每秒更新一次
iotop         # 需要安装

# 测试磁盘读写速度
dd if=/dev/zero of=test bs=1M count=1000  # 写测试
dd if=test of=/dev/null bs=1M             # 读测试
```

## 4. 网络硬件

### 4.1 查看网络接口

```bash
# 查看网络接口信息
ip link
ifconfig    # 需要安装 net-tools

# 查看网卡详细信息
ethtool eth0    # 需要安装 ethtool
lspci | grep -i ethernet  # 查看以太网卡
lspci | grep -i network   # 查看无线网卡
```

### 4.2 网络性能监控

```bash
# 查看网络流量
iftop          # 需要安装
nethogs        # 需要安装
nload          # 需要安装

# 查看网络连接状态
netstat -i     # 显示网络接口状态
ss -s          # 显示网络统计信息
```

## 5. 硬件信息汇总

### 5.1 系统硬件概览

```bash
# 查看系统概要信息
uname -a
hostnamectl

# 查看所有硬件信息
lshw           # 需要安装
dmidecode      # 需要 root 权限

# 查看 PCI 设备
lspci
lspci -v       # 显示详细信息

# 查看 USB 设备
lsusb
lsusb -v       # 显示详细信息
```

### 5.2 硬件监控工具

```bash
# 图形化监控工具
gnome-system-monitor    # GNOME 桌面环境
ksysguard             # KDE 桌面环境

# 终端监控工具
htop
glances               # 需要安装
nmon                 # 需要安装
```

## 6. 常见硬件问题诊断

### 6.1 系统日志查看

```bash
# 查看系统日志
dmesg                # 显示内核环形缓冲区信息
journalctl -k        # 查看内核日志
tail -f /var/log/syslog  # 实时查看系统日志
```

### 6.2 硬件故障排查

```bash
# 检查硬盘健康状态
smartctl -H /dev/sda

# 检查内存问题
memtest86+           # 需要在启动时运行

# 检查系统温度
sensors
watch -n 1 sensors   # 实时监控温度
```

## 注意事项

1. 某些命令需要 root 权限才能执行
2. 部分命令需要安装额外的软件包
3. 在执行磁盘操作时要特别小心
4. 监控工具可能会消耗额外的系统资源
5. 定期检查硬件状态可以预防故障

## 常用软件包安装

```bash
# CentOS/RHEL
yum install sysstat lm_sensors smartmontools htop iotop

# Ubuntu/Debian
apt-get install sysstat lm-sensors smartmontools htop iotop
``` 