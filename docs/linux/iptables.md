---
title: iptables介绍以及常用命令
sidebar_position: 5
---
# iptables 介绍与常用命令

## 什么是 iptables？

iptables 是 Linux 系统中的一个强大的防火墙工具，它允许系统管理员配置 IPv4 数据包过滤规则、NAT 规则以及数据包修改规则。iptables 通过在内核中实现 netfilter 框架来工作。

## 基本概念

### 表 (Tables)
iptables 包含多个表，每个表用于不同的目的：
- filter 表：默认表，用于过滤数据包
- nat 表：用于网络地址转换
- mangle 表：用于修改数据包
- raw 表：用于配置数据包是否被连接跟踪

### 链 (Chains)
每个表包含多个预定义的链：
- INPUT：处理进入本机的数据包
- OUTPUT：处理从本机发出的数据包
- FORWARD：处理经过本机转发的数据包
- PREROUTING：用于修改到达的数据包（nat 表）
- POSTROUTING：用于修改即将离开的数据包（nat 表）

### 规则 (Rules)
规则是 iptables 的基本构建块，每个规则包含匹配条件和目标动作。

## 常用命令

### 0. 协议控制
允许/阻止 ICMP (ping):
```bash
# 允许 ICMP
iptables -A INPUT -p icmp -j ACCEPT

# 阻止 ICMP
iptables -A INPUT -p icmp -j DROP
```

允许特定 UDP 端口 (如 DNS 53):
```bash
iptables -A INPUT -p udp --dport 53 -j ACCEPT
```

阻止特定 TCP 端口 (如 Telnet 23):
```bash
iptables -A INPUT -p tcp --dport 23 -j DROP
```

### 1. 查看当前规则
```bash
iptables -L -n -v
```

### 2. 允许特定端口
允许 TCP 端口 22（SSH）：
```bash
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

### 3. 阻止特定 IP
阻止来自 192.168.1.100 的所有流量：
```bash
iptables -A INPUT -s 192.168.1.100 -j DROP
```

### 4. 允许回环接口
```bash
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT
```

### 5. 允许已建立的连接
```bash
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```

### 6. 端口转发
将 8080 端口转发到 80 端口：
```bash
iptables -t nat -A PREROUTING -p tcp --dport 8080 -j REDIRECT --to-port 80
```

### 7. 删除规则
删除 INPUT 链中的第一条规则：
```bash
iptables -D INPUT 1
```

### 8. 保存规则
```bash
iptables-save > /etc/iptables/rules.v4
```

### 9. 恢复规则
```bash
iptables-restore < /etc/iptables/rules.v4
```

### 10. 清空所有规则
```bash
iptables -F
iptables -t nat -F
iptables -t mangle -F
iptables -X
```

## 实用示例

### 1. 基本防火墙配置
```bash
# 清空现有规则
iptables -F

# 设置默认策略
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 允许已建立的连接
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 允许回环接口
iptables -A INPUT -i lo -j ACCEPT

# 允许 SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许 HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

### 2. NAT 配置
```bash
# 启用 IP 转发
echo 1 > /proc/sys/net/ipv4/ip_forward

# 配置 NAT
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -A FORWARD -i eth1 -o eth0 -j ACCEPT
iptables -A FORWARD -i eth0 -o eth1 -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```

## 注意事项
1. 修改 iptables 规则时要小心，错误的配置可能导致无法远程访问服务器
2. 建议在修改规则前备份现有配置
3. 对于生产环境，建议使用 iptables-persistent 或类似工具来保存规则
4. 可以使用 `iptables -L -n -v` 来验证规则是否按预期工作

## 参考文档
- iptables 官方手册：`man iptables`
- [iptables 教程](https://www.netfilter.org/documentation/)
