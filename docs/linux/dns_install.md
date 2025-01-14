---
title: DNS域名解析安装部署
sidebar_position: 6
---
## DNS软件bind
### 程序包
  - bind：服务器
  - bind-utils：客户端
  - bind-libs：相关库，依赖关系自动安装
  - bind-chroot：安全包，将dns相关文件放至/var/named/chroot
### 安装bind
```shell
# ubuntu
root@ubuntu:~# apt install -y bind9 bind9-utils

# centos
[root@localhost ~]# yum install -y bind bind-utils
```
### bind包相关文件
 - bind主程序： /usr/sbin/named
 - 服务脚本和unit名称：/etc/rd.c/init.d/named，/usr/lib/systemd/system/named.service
 - 主配置文件： /etc/named.conf,/etc/named.rfc1912.zones,/etc/rndc.key
 - 管理工具：/usr/sbin/rndc：remote name domain controller，默认与bind安装在同一主机，且只能通过127.0.0.1连接named进程，提供辅助性的管理功能；953/tcp
 - 解析库文件：/var/named/ZONE_NAME.ZONE
     
注意：   
  - 一台物理服务器可同时为多个区域提供解析    
  - 必须要有根区域文件；named.ca   
  - 应该有两个（如果包括ipv6的，应该更多）实现localhost和本地回环地址的解析库
### 主配置文件
  - 全局配置: options{};
  - 日志子系统配置: logging{};
  - 区域定义: 本机能够为哪些zone进行解析，就要定义哪些zone   
     zone "ZONE_NAME" IN {};
## 实现主dns服务器
### 主dns服务器配置
1. 在主配置文件中定义区域
```shell
[root@localhost ~]# vim /etc/named.conf
            
#注释掉下面两行
// listen-on port 53 { 127.0.0.1; };
// allow-query     { localhost; };
zone "ZONE_NAME" IN {
   type {master|slave|hint|forward};
   file "ZONE_NAME.zone";
};
```
   
2. 定义区域解析库文件
内容包括：
  - 宏定义
  - 资源记录
     
示例：
```shell
$TTL 86400
$ORIGIN example.com
@       IN      SOA     ns1.example.com     admin.example.com(
            2015042201
            1H
            5M
            7D
            1D)
        IN      NS      ns1
        IN      NS      ns2
ns1     IN      A       172.16.41.100
ns2     IN      A       172.16.41.101
mx1     IN      A       172.16.41.102
mx2     IN      A       172.16.41.103
web     IN      A       172.16.41.104
web     IN      A       172.16.41.105
www     IN      A       172.16.41.106
```
### 主配置文件语法检查
```shell
[root@localhost ~]# named-checkconf 
```
### 解析库文件语法检查
```
[root@localhost ~]# named-checkzone  example.com <config_file_path>
    
# example.com： dns区域名称，应该与区域文件中的SOA记录中的区域名称匹配
# config_file_path： 区域文件的路径，区域文件包含了dns区域的所有记录
```
### 配置生效
```shell
# 三种方式
[root@localhost ~]# rndc reload
[root@localhost ~]# systemctl reload named
[root@localhost ~]# service named reload
```

## DNS测试和管理工具
### dig命令
>dig只用于测试dns系统，不会查询hosts文件进行解析
命令格式：
```shell
[root@localhost ~]# dig [-t type] name [@SERVER] [query options]
query options：
   +[no]trace：跟踪解析过程 : dig +trace example.com
   +[no]recurse：进行递归解析
```
示例：
```shell
#测试反向解析
dig -x IP = dig –t ptr reverseip.in-addr.arpa
   
#模拟区域传送
dig -t axfr ZONE_NAME @SERVER
dig -t axfr example.com @172.16.41.60
dig –t axfr 100.1.10.in-addr.arpa @172.16.1.1
dig -t NS . @114.114.114.114
dig -t NS . @a.root-servers.net
```
### host命令
命令格式：
```
host [-t type] name [SERVER]
```
示例：
```shell
host -t NS example.com 172.16.41.60
host -t soa example.com
host -t mx example.com
host -t axfr example.com
host 1.2.3.4
```
### nslookup命令
nslookup 可以支持交互和非交互式两种方式执行
    
命令格式：   
```
nslookup [-option] [name | -] [server]
```

交互式模式：
```shell
nslookup>
server IP: 指明使用哪个DNS server进行查询
set q=RR_TYPE: 指明查询的资源记录类型
NAME: 要查询的名称
```
### rndc命令
利用rndc工具可以实现管理dns功能   
rndc监听端口：953/tcp
命令格式：
```shell
rndc COMMAND
COMMAND:
   status: 查看状态
   reload: 重载主配置文件和区域解析库文件
   reload zonename: 重载区域解析库文件
   retransfer zonename: 手动启动区域传送，而不管序列号是否增加
   notify zonename: 重新对区域传送发通知
   reconfig: 重载主配置文件
   querylog: 开启或关闭查询日志文件/var/log/message
   trace: 递增debug一个级别
   trace LEVEL: 指定使用的级别
   notrace：将调试级别设置为 0
   flush：清空DNS服务器的所有缓存记录
```
## 案例：实现dns正向主服务器
### 目的
```
搭建dns正向主服务器，实现web服务器基于FQDN（域名）访问
```
### 环境要求
```
需要三台主机
DNS服务端：172.16.41.8
web服务器：172.16.41.7
DNS客户端：172.16.41.6
```
### 前提准备
```shell
关闭selinux
关闭防火墙
时间同步
```
### dns服务端安装bind
```shell
yum install -y bind bind-utils
```

### 修改配置文件
修改主配置文件
```shell
vim /etc/named.conf
# 注释下面两行
// listen-on port 53 { 127.0.0.1; };
// allow-query     { localhost; };
```
修改区域文件
```shell
vim /etc/named.rfc1912.zones
# 添加如下内容
zone "exmaple.com" IN {
    type master;
    file "example.com.zone";
    };
```
### dns区域数据库文件
```shell
cp -p /var/named/named.localhost /var/named/example.com.zone
    
#如果没有加-p选项，需要修改所有者或权限。chgrp named example.com.zone
   
vim /var/named/example.com.zone
$TTL 1D
@ IN SOA master admin.example.com. (
        2019042210 ; serial
        1D; refresh
        1H; retry
        1W; expire
        3H); minimum
            NS master
master      A    172.16.41.8         
www         A    172.16.41.7
```
### 检查配置文件格式
```shell
named-checkconf
named-checkzone example.com /var/named/example.com.zone

# 启动服务
systemctl enable --now # 首次启动
rndc reload            # 非首次启动
```
### 实现web服务
实现步骤省略

在客户端实现测试
```shell
# 修改dns记录
vim /etc/sysconfig/network-scripts/ifcfg-eth0
dns1=172.16.41.8

# 重启网卡
systemctl restart network

#验证dns
cat /etc/resolv.conf

nameserver 172.16.41.8

# 测试网页,能显示就是成功
curl www.example.com
```

## 允许动态更新
动态更新：可以通过远程更新区域数据库的资源记录     
实现动态更新，需要在制定的zone语句块中：
```shell
Allow-update {any;};
```
示例：
```shell
chmod 770 /var/named

# 执行命令，交互式
nsupdate
>server 127.0.0.1
>zone example.com
>update add ftp.example.com 86400 IN A 6.6.6.6
>send
>update delete www.example.com A
>send

# 测试
dig ftp.example.com @127.0.0.1
ls -l /var/named/example.com.zone.jnl
cat /var/named/example.com.zone
```

## 启用dns客户端缓存功能
>在高并发的服务器场景应用中，对dns的服务器查询性能有较高的要求，若在客户端启用dns缓存功能，可以大幅度减轻dns服务器的压力，同时也能提高dns客户端明星解析速度。
### centos启用客户端缓存
>centos默认没有启用dns客户端缓存，需要借助第三方软件，安装nscd包可以支持dns缓存功能，减少dns服务器的压力，提高dns查询速度
```shell
# 安装
yum install -y nscd
# 启动服务
systemctl enable --now nscd
     
# 查看缓存统计信息
nscd -g

# 清除dns客户端缓存
nscd -i hosts
```
### ubuntu启用dns客户端缓存
>ubuntu默认会启用dns客户端缓存
```shell
systemctl status systemd-resolved.service

#  查看帮助
systemd-resolve --help

# 清空缓存
systemd-resolve --flush-caches
systemd-resolve --statistics
```

## 实现反向解析区域
### 反向解析配置
  - 反向区域：即将IP反向解析为域名
  - 区域名称：网络地址反写.ip-addr.arpa
    
示例：
```shell
172.16.100.  --> 100.16.172.in-addr.arpa.
```

1)定义区域
```shell
zone "ZONE_NAME" IN {
  type {master|slave|forward};
  file "网络地址.zone"  
};
```
2)定义区域解析库文件   
注意：不需要A记录，以PTR记录为主   
示例：
```shell
$TTL 86400
$ORIGIN 16.172.in-addr.arpa.
@     IN    SOA   ns1.example.com.    admin.example.com. (
            20250114
            1H
            5M
            7D
            1D)
      IN    NS    ns1.example.com.
1.2   IN    PTR   www.example.com.
3.4   IN    PTR   mx.example.com.
```
实现以下解析：
```shell
172.16.1.2 www.example.com
172.16.3.4 mx.example.com
```