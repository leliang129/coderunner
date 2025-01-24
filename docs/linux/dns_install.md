---
title: DNS域名解析安装部署
sidebar_position: 7
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
## 案例：反向解析
1) 查看主配置文件
```shell
cat /etc/named.conf 

options {
 ......
 listen-on port 53 { localhost; };
 ......
 allow-query     { any; };
 ......
}
```
2）编辑区域文件
```shell
vim /etc/named.rfc1912.zones

zone "0.0.10.in-addr.arpa" {
   type master;
   file "10.0.0.zone";
};
```
3) 编辑区域数据库文件
```shell
cat 10.0.0.zone 
$TTL 1D
@     IN    SOA     ns1.example.com. admin.example.com. (
            0; serial
            1D; refresh
            1H; retry
            1W; expire
            3H ); minimum
             NS ns1.example.com. # NS记录必须以点结束，否则配置A记录才可以启动
100 PTR www.example.com.
200 PTR mx.example.com.
```

4) 检查配置文件格式
```shell
named-checkconf
named-checkzone 10.0.0.in-addr.arpa /var/named/10.0.0.zone
```

5) 启动服务
```shell
systemctl restart named
rndc reload
```

## 实现dns主从服务器
>只有一台主DNS服务器，存在单点失败的问题，可以建立主DNS服务器的备份服务器，即从服务器来实现DNS服务的容错机制。从服务器可以自动和主服务器进行单向的数据同步，从而和主DNS服务器一样，也可以对外提供查询服务，但从服务器不提供数据更新服务。
### DNS主从服务器
 - 应该是一台独立的名称服务器
 - 主服务器的区域解析库文件中必须有一条NS记录指向从服务器
 - 从服务器的区域解析库文件中必须有一条SOA记录指向主服务器从服务器只需要定义区域，而无须提供解析库文件；解析库文件应该放置于/var/named/slaves/目录中
 - 主服务器得允许从服务器作区域传送
 - 主从服务器时间应该同步，可通过ntp进行
 - bind程序的版本应该保持一致；否则，应该从高，主低

### 定义从区域
格式：
```shell
zone "ZONE_NAME" IN {
 type slave;
 masters { MASTER_IP; };
 file "slaves/ZONE_NAME.zone";
};
```
## 案例：实现dns主从服务器
### 实验目的
```shell
搭建DNS主从服务器架构，实现DNS服务冗余
```
### 实验环境
```shell
# 需要四台主机
DNS主服务器：172.16.41.8
DNS从服务器:172.16.41.18
web服务器：172.16.41.7
DNS客户端：172.16.41.6
```
### 前提准备
```shell
关闭selinux
关闭防火墙
时间同步
```
### 实现步骤
1）主dns服务器配置
```shell
# 安装
yum install bind -y
# 修改主配置文件
vim /etc/named.conf
#注释掉下面两行
// listen-on port 53 { 127.0.0.1; };
// allow-query     { localhost; };
#只允许从服务器进行区域传输
allow-transfer { 从服务器IP;}; 
vim /etc/named.rfc1912.zones    
#加上这段
zone "example.com" {
   type master;
   file  "example.com.zone";
};
```
2) 编辑区域数据库文件
```shell
cp -p /var/named/named.localhost /var/named/example.com.zone
#如果没有-p，需要改权限。chgrp named example.com.zone
vim /var/named/example.com.zone
$TTL 1D
@    IN     SOA    master admin.example.com. (
        1 ; serial
        1D ; refresh
        1H ; retry
        1W ; expire
        3H ) ; minimum
            NS   master
            NS slave
master      A    172.16.41.8
slave       A    172.16.41.18
```
3) 检查配置文件格式
```shell
named-checkconf
named-checkzone example.com /var/named/example.com.zone
```
4) 启动主dns服务
```shell
systemctl restart named
rndc reload
```

5) 从服务器配置
```shell
# 安装
yum install bind -y

# 修改主配置文件
vim /etc/named.conf

// listen-on port 53 { 127.0.0.1; };
// allow-query     { localhost; };
#不允许其它主机进行区域传输
   allow-transfer { none;};

vim /etc/named.rfc1912.zones

zone "example.com" {
   type slave;
   masters { 主服务器IP;};                                                       
         
   file "slaves/example.com.slave";
};
```
6）检查配置文件格式
```shell
named-checkconf
named-checkzone example.com /var/named/slaves/example.com.slave
```
7) 启动从dns服务
```shell
systemctl restart named
rndc reload
```
8) 测试
```shell
# 修改客户端dns
vim /etc/sysconfig/network-scripts/ifcfg-eth0
DNS1=主服务器
DNS2=从服务器

# 重启网卡
systemctl restart network
# 测试
dig www.example.com 
curl www.example.com

#在主服务器上停止DNS服务
systemctl stop named

#验证从DNS服务器仍然可以查询
dig www.example.com 
curl www.example.com
```
## 实现子域
>将子域委派给其它主机管理，实现分布式DNS数据库
正向解析区域子域方法    
范例：定义两个子域区域
```shell
shanghai.example.com. IN NS ns1.ops.example.com.
shanghai.example.com. IN NS ns2.ops.example.com.
shenzhen.example.com. IN NS ns1.shenzhen.example.com.
shenzhen.example.com. IN NS ns2.shenzhen.example.com.
ns1.shanghai.example.com. IN A 1.1.1.1
ns2.shanghai.example.com. IN A 1.1.1.2
ns1.shenzhen.example.com. IN A 1.1.1.3
ns2.shenzhen.example.com. IN A 1.1.1.4
```
## 案例：实现子域
![](https://pic1.imgdb.cn/item/6786680ed0e0a243d4f43dde.png)
### 实验目的
```
搭建DNS父域和子域服务器
``` 
### 环境要求
```shell
# 需要五台主机
DNS父域服务器：172.16.41.8
DNS子域服务器：172.16.41.18
父域的web服务器：172.16.41.7，www.example.org
子域的web服务器：172.16.41.17,www.shanghai.example.org
DNS客户端：172.16.41.6
```
### 前提准备
```shell
关闭SElinux
关闭防火墙
时间同步
```
### 实现步骤
1）在父域DNS服务器上实现主example.com域的主DNS服务
```shell
# 安装
yum install bind -y

# 编辑主配置文件
vim /etc/named.conf

#注释掉下面两行
// listen-on port 53 { 127.0.0.1; };
// allow-query     { localhost; };

#只允许从服务器进行区域传输
allow-transfer { 从服务器IP;}; 

#建议关闭加密验证
dnssec-enable no; 
dnssec-validation no;


# 编辑区域文件
vim /etc/named.rfc1912.zones
#加上这段
zone "example.com" {
   type master;
   file  "example.com.zone";
};

# 编辑区域数据库文件
cp -p /var/named/named.localhost /var/named/example.com.zone
#如果没有-p，需要改权限。chgrp named example.com.zone

vim /var/named/example.com.zone 

$TTL 1D
@     IN    SOA     master    admin.example.com. (
          1 ; serial
          1D ; refresh
          1H ; retry
          1W ; expire
          3H ) ; minimum
            NS   master
shanghai    NS   shanghains
master      A    172.16.41.8
shanghains  A    172.16.41.18 
www         A    172.16.41.7

# 启动服务
systemctl start named   # 首次启动
rndc reload             # 非首次启动
```

2）实现子域的DNS服务器
```shell
# 安装
yum install bind -y

# 编辑配置文件
// listen-on port 53 { 127.0.0.1; };
// allow-query     { localhost; };
allow-transfer { none;};

# 编辑区域文件
vim /etc/named.rfc1912.zones

zone "shanghai.example.com" {
   type master;
   file "shanghai.example.com.zone";
};

# 编辑区域数据库文件
cp -p /var/named/named.localhost /var/named/shanghai.example.com.zone
#如果没有-p，需要改权限。chgrp named example.com.zone
vim /var/named/shanghai.example.com.zone
$TTL 1D
@   IN  SOA   master  admin.example.com. (
                   2019042214 ; serial
                   1D ; refresh
                   1H ; retry
                   1W ; expire
                   3H )   ; minimum
         NS   master
master   A    10.0.0.18
www      A    10.0.0.17

# 启动服务
systemctl start named   # 首次启动
rndc reload             # 非首次启动
```
3）实现web服务器
略

4）测试
```shell
dig www.shanghai.example.com
www.shanghai.example.com
```

## 实现 DNS 转发（缓存）服务器
### DNS转发
>利用DNS转发，可以将用户的DNS请求，转发至指定的DNS服务，而非默认的根DNS服务器，并将指定服务器查询的返回结果进行缓存，提高效率。
    
注意:
  - 被转发的服务器需要能够为请求者做递归，否则转发请求不予进行
  - 在/etc/named.conf的全局配置块中，关闭dnssec功能
```shell
dnssec-enable no;
dnssec-validation no;
```
### 转发方式
1）全局转发
>对非本机所负责解析区域的请求，全转发给指定的服务器
在全局配置块中实现：
```shell
Options {
   forward first|only;
   forwarders { ip;};
};
```
2）特定区域转发
>仅转发对特定的区域的请求，比全局转发优先级高
```shell
zone "ZONE_NAME" IN {
   type forward;
   forward first|only;
   forwarders { ip;};
};
```
:::info
first：先转发至指定DNS服务器，如果无法解析查询请求，则本服务器再去根服务器查询    
only: 先转发至指定DNS服务器，如果无法解析查询请求，则本服务器将不再去根服务器查询   
:::

## 案例：实现DNS forward（缓存）服务器
### 实验目的
```shell
搭建DNS转发（缓存）服务器
```
### 实验环境
```shell
# 需要四台主机
DNS主服务器：172.16.41.8
DNS从服务器:172.16.41.18
web服务器：172.16.41.7
DNS客户端：172.16.41.6
```
### 前提准备
```shell
关闭selinux
关闭防火墙
时间同步
```
### 实现步骤
1）实现转发（只缓存）DNS服务器
```shell
# 安装
yum install bind -y

# 编辑配置文件
vim /etc/named.conf  

#注释掉两行
// listen-on port 53 { 127.0.0.1; };
// allow-query     { localhost; };
forward first;
forwarders { 172.16.41.18;};

#关闭dnsec功能
dnssec-enable no;
dnssec-validation no;

# 重启服务
systemctl start named          # 首次启动
rndc reload                    # 非首次启动
```
2）实现主DNS服务器
```shell
# 安装
yum install bind -y

# 编辑配置文件
vim /etc/named.conf             
#注释掉两行
// listen-on port 53 { 127.0.0.1; };
// allow-query     { localhost; };

# 编辑区域文件
vim /etc/named.rfc1912.zones    
#加上下面这段
zone "example.com" {
   type master;
   file  "example.com.zone";
};

# 编辑区域数据库文件
cp -p /var/named/named.localhost /var/named/example.com.zone
#如果没有-p，需要改权限。chgrp named example.com.zone

vim /var/named/example.com.zone
$TTL 1D
@       IN    SOA     master    admin.example.com. (
                   20250114; serial
                   1D; refresh
                   1H; retry
                   1W; expire
                   3H); minimum
              NS      master
master        A       172.16.41.18
websrv        A       172.16.41.7                          
www           CNAME   websrv

# 启动服务
systemctl start named   # 首次启动
rndc reload             # 非首次启动
```
3） 实现web服务   
略

4）测试
```shell
#客户端配置（参看前面案例，略）
dig www.example.com    
curl www.example.com
```

## 智能DNS相关技术
### bind中ACL
ACL：把一个或多个地址归并为一个集合，并通过一个统一的名称调用   
注意：只能先定义后使用；因此一般定义在配置文件中，处于options的前面   
格式：
```shell
acl <acl_name> {
    ip;
    net/prelen;
    ......
};
```

示例：
```shell
acl beijingnet {
    172.16.0.0/16;
    10.10.10.10;
};
```
### 内置acl
 - none：没有一个主机
 - any：任意主机
 - localhost：本机
 - localnet：本机的ip同掩码运算后得到的网络地址
### 访问控制的指令
 - allow-query {}： 允许查询的主机；白名单
 - allow-transfer {}：允许区域传送的主机；白名单
 - allow-recursion {}: 允许递归的主机,建议全局使用
 - allow-update {}: 允许更新区域数据库中的内容

### view视图
>View：视图，将ACL和区域数据库实现对应关系，以实现智能DNS
  - 一个bind服务器可定义多个view，每个view中可定义一个或多个zone
  - 每个view用来匹配一组客户端
  - 多个view内可能需要对同一个区域进行解析，但使用不同的区域解析库文件
     
注意：
  - 一旦启用了view，所有的zone都只能定义在view中
  - 仅在允许递归请求的客户端所在view中定义根区域
  - 客户端请求到达时，是自上而下检查每个view所服务的客户端列表
     
**view格式**
```shell
view VIEW_NAME {
    match-clients { beijingnet; };
    zone "example.com" {
    type master;
    file "example.com.zone.bj"; 
 };
    include "/etc/named.rfc1912.zones";
};

view VIEW_NAME {
    match-clients { shanghainet; };
    zone "example.com" {
    type master;
    file "example.com.zone.sh"; 
 };
    include "/etc/named.rfc1912.zones";
};
```
## 案例：利用view实现智能dns
### 实验目的
```shell
搭建DNS主从服务器架构，实现DNS服务冗余
```
### 环境要求
```
需要五台主机
DNS主服务器和web服务器1：10.0.0.8/24，172.16.0.8/16
web服务器2：10.0.0.7/24
web服务器3：172.16.0.7/16
DNS客户端1：10.0.0.6/24 
DNS客户端2：172.16.0.6/16
```
### 前提准备
```
关闭SElinux
关闭防火墙
时间同步
```
### 实现步骤
1）dns服务器网卡配置
```
#配置两个IP地址
#eth0：10.0.0.8/24
#eth1: 172.16.0.8/16
```
2）主dns服务端配置文件实现view
```
# 安装
yum install bind -y

# 编辑配置文件
vim /etc/named.conf

#在文件最前面加下面行
acl beijingnet {
    10.0.0.0/24;
};
acl shanghainet {
    172.16.0.0/16;
};
acl othernet {
   any;
};

#注释掉下面两行
// listen-on port 53 { 127.0.0.1; };
// allow-query     { localhost; };
#其它略

# 创建view
view beijingview {
   match-clients { beijingnet;};
   include "/etc/named.rfc1912.zones.bj";
};
view shanghaiview {
   match-clients { shanghainet;};
   include "/etc/named.rfc1912.zones.sh";
};
view otherview {
   match-clients { othernet;};
   include "/etc/named.rfc1912.zones.other";
};
include "/etc/named.root.key";
```
3）实现区域配置文件
```
vim /etc/named.rfc1912.zones.bj

zone "." IN {
   type hint;
   file "named.ca";
};
zone "example.com" {
   type master;
   file "example.com.zone.bj";
};

vim /etc/named.rfc1912.zones.sh

zone "." IN {
   type hint;
   file "named.ca";
};
zone "example.com" {
   type master;
   file "example.com.zone.sh";
};

vim /etc/named.rfc1912.zones.other

zone "." IN {
   type hint;
   file "named.ca";
};
zone "example.com" {
   type master;
   file "example.com.zone.other";
};

chgrp named /etc/named.rfc1912.zones.bj
chgrp named /etc/named.rfc1912.zones.sh
chgrp named /etc/named.rfc1912.zones.other
```
4）创建区域数据库文件
```shell
vim /var/named/example.com.zone.bj

$TTL 1D
@           IN      SOA     master admin.example.com. (
                    2019042214 ; serial
                    1D ; refresh
                    1H ; retry
                    1W ; expire
                    3H )   ; minimum
                    NS     master
master              A      10.0.0.8
websrv              A      10.0.0.7                          
www                 CNAME  websrv

vim /var/named/example.com.zone.sh
$TTL 1D
@           IN      SOA     master admin.example.com. (
                    2019042214 ; serial
                    1D ; refresh
                    1H ; retry
                    1W ; expire
                    3H )   ; minimum
                    NS     master
master              A      10.0.0.8
websrv              A      172.16.0.7                          
www                 CNAME  websrv

vim /var/named/example.com.zone.other
$TTL 1D
@           IN      SOA     master     admin.example.com. (
                    2019042214 ; serial
                    1D ; refresh
                    1H ; retry
                    1W ; expire
                    3H )   ; minimum
                    NS     master
master              A      10.0.0.8
websrv              A      127.0.0.1                          
www                 CNAME  websrv

# 修改权限
chgrp named /var/named/example.com.zone.bj
chgrp named /var/named/example.com.zone.sh
chgrp named /var/named/example.com.zone.other

# 重启服务
systemctl start named          # 首次启动
rndc reload                    # 非首次启动
```
5）实现位于不同区域的web服务器
```
#分别在三台主机上安装http服务
#在web服务器1：10.0.0.8/24实现
yum install httpd                        
echo www.example.com in Other > /var/www/html/index.html

# 重启服务
systemctl start httpd  

#在web服务器2：10.0.0.7/16
echo www.example.com in Beijing > /var/www/html/index.html

# 重启服务
systemctl start httpd  

#在web服务器3：172.16.0.7/16
yum install httpd                        
echo www.example.com in Shanghai > /var/www/html/index.html

# 重启服务
systemctl start httpd
```
6）测试
```shell
#分别在三台主机上访问

#DNS客户端1：10.0.0.6/24 实现，确保DNS指向10.0.0.8
curl www.example.com
www.example.com in Beijing 

#DNS客户端2：172.16.0.6/16 实现，确保DNS指向172.16.0.8
curl www.example.com
www.example.com in Shanghai

#DNS客户端3：10.0.0.8 实现，，确保DNS指向127.0.0.1
curl www.example.com
www.example.com in Other
```
## dns排错
dns服务常见故障
 - SERVFAIL：The nameserver encountered a problem while processing the query.
   - 可使用dig +trace排错，可能是网络和防火墙导致
 - NXDOMAIN：The queried name does not exist in the zone.
   - 可能是CNAME对应的A记录不存在导致
 - REFUSED：The nameserver refused the client's DNS request due to policy restrictions
   - 可能是DNS策略导致