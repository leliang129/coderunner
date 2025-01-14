---
title: DNS域名解析介绍
sidebar_position: 5
---

## DNS 域名系统简介

DNS (Domain Name System) 是互联网的一项核心服务，主要解决了以下问题：

1. 可读性：
   - 将容易记忆的域名转换为计算机使用的 IP 地址（例如将域名转换为 142.250.190.78）
   - 避免用户需要记忆复杂的 IP 地址

2. 灵活性：
   - 实现了域名和 IP 地址的解耦
   - 当服务器 IP 变更时，只需修改 DNS 记录，用户仍可通过相同域名访问
   - 支持负载均衡，一个域名可以对应多个 IP 地址

3. 可扩展性：
   - 分层的域名结构便于管理
   - 分布式的 DNS 服务器系统保证了可靠性和性能

DNS 系统通过全球范围内的 DNS 服务器网络，提供了域名解析、邮件路由等重要功能，是现代互联网基础设施的重要组成部分。

## DNS 服务工作原理

DNS 系统采用分层查询的方式工作，主要包含以下关键组件和过程：

### 1. DNS 层次结构

DNS 使用树形的层次结构组织域名空间：
- 根域（.）
- 顶级域（例如 .com、.org、.cn）
- 二级域（例如 example.com）
- 子域（例如 mail.example.com）

### 2. DNS 服务器类型

1. 根域名服务器：
   - 管理根域（.）的权威信息
   - 全球共有 13 组根服务器
   - 提供顶级域名服务器的信息

2. 顶级域名服务器：
   - 管理特定顶级域（例如 .com）的信息
   - 提供二级域名服务器的信息

3. 权威域名服务器：
   - 保存特定域名的实际记录
   - 提供域名到 IP 的最终映射

4. 递归域名服务器：
   - 通常由 ISP 提供
   - 缓存查询结果以提高性能
   - 代表客户端进行递归查询

### 3. 解析过程

当用户访问某个域名时：

1. 本地查询：
   - 首先检查浏览器缓存
   - 然后检查操作系统缓存
   - 查看本地 hosts 文件

2. 递归查询：
   - 向本地配置的 DNS 服务器发起查询
   - 如果有缓存，直接返回结果
   - 如果没有缓存，开始递归查询

3. 迭代查询：
   - 从根域名服务器开始
   - 依次查询顶级域名服务器
   - 最后到达权威域名服务器
   - 获取最终的 IP 地址

4. 返回结果：
   - 将查询结果返回给客户端
   - 同时在本地 DNS 服务器缓存结果
   - 缓存时间由 TTL（生存时间）决定

### 4. 完整的查询请求
```
Client --> hosts文件 --> Client DNS Service Local Cache --> DNS Server (recursion递归) --> DNS Server 
Cache --> DNS iteration(迭代) --> 根 --> 顶级域名DNS --> 二级域名DNS…
```

## DNS服务相关概念和技术
### dns服务器的类型
  - 主dns服务器
  - 从dns服务器
  - 缓存dns服务器（转发器）
### 主dns服务器
管理和维护所负责解析的域内解析库的服务器
### 从dns服务器
从主dns服务器上获取解析库的副本，并自动更新
 - 序列号：解析库版本号，主服务器解析库变化时，其序列递增
 - 刷新时间间隔：从服务器从主服务器请求同步解析的时间间隔
 - 重试时间间隔：从服务器请求同步失败后，再次请求同步的时间间隔
 - 过期时间：从服务器联系不到主服务器时，多久后停止服务
 - 通知机制：主服务器解析库发生变化时，会主动通知从服务器
### 区域传输
 - 完全传输：传送整个解析库
 - 增量传输：传递解析库变化的部分
### 解析形式
  - 正向：将域名转换为IP地址
  - 反向：将IP地址转换为域名
### 解析答案
  - 肯定答案：存在对应的查询结果
  - 否定答案：请求的条目不存在等原因导致无法返回结果
  - 权威答案：直接由存有此查询结果的dns服务器（权威服务器）返回的答案
  - 非权威答案：由其它非权威服务器返回的查询答案
## 各种资源记录
区域解析库：由众多资源记录RR（Resource Record）组成
记录类型：A,AAAA,PTR,SOA,NS,CNAME,MX
  - SOA：起始授权记录；一个区域解析库有且仅能有一个SOA记录，必须位于解析库的第一条记录
  - A：将域名映射为IPv4地址
  - AAAA：将域名映射为IPv6地址
  - PTR：将IP地址映射为域名
  - NS：专用与标明当前区域的dns服务器
  - CNAME：将域名映射为别名
  - MX：将域名映射为邮件服务器
  - TXT：文本记录，对域名进行标识和说明的一种方式，一般做验证记录时会使用此项
#### 资源记录定义
```
name  [TTL]  IN  rr_type  value
```
:::info
1. TTL可从全局继承
2. 使用 "@" 符号可用于引用当前区域的域名
3. 同一个名字可以通过多条记录定义多个不同的值；此时DNS服务器会以轮询方式响应
4. 同一个值也可能有多个不同的定义名字；通过多个不同的名字指向同一个值进行定义；此仅表示通过多个不同的名字可以找到同一个主机
:::
### SOA记录
name: 当前区域名称,例如：example.com
value: 有多部分组成
  - 序列号
  - 刷新时间
  - 重试时间
  - 过期时间
  - 通知时间   
     
注意：
  1. 当前区域的主dns服务器的FQDN，也可以使用当前区域的名字，只是注释功能，可以不需要配置对应的NS记录和A记录
  2. 当前区域管理员的邮箱地址，地址中不能使用@符号，一般使用.代替，例如：admin.example.com
  3. 主从服务区域传输相关定义以及否定的答案的统一的TTL
     
示例：
```shell
example.com.  86400  IN  SOA  ns1.example.com.  admin.example.com. (
  2024010101    ; 序列号
  3600          ; 刷新时间
  600           ; 重试时间
  86400         ; 过期时间
  60            ; 否定答案的TTL值
)
```
### NS记录
name: 当前区域名称,例如：example.com
value: 当前区域的主dns服务器名称,例如ns1.example.com
     
注意：
  1. 相邻的两个资源记录的name相同时，后续可省略
  2. 对于NS记录而言，任何一个ns记录后面的服务器名字，都应该在后续有一个A记录
  3. 一个区域可以有多个NS记录
     
示例：
```shell
example.com.  86400  IN  NS  ns1.example.com.
```
### MX记录
name: 当前区域名称,例如：example.com
value: 当前区域的某个邮件服务器（smtp服务器）的主机名
    
注意：
  1. 一个区域内，MX记录可以有多个，但每个记录的value之前应该有一个数字（0-99）,表示此服务器的优先级，数字越小，优先级越高。
  2. 对MX记录而言，任何一个MX记录后面的服务器名字，都应该在后续有一个A记录
     
示例：
```shell
example.com.  86400  IN  MX  10  mail.example.com.
mail          86400  IN  A   172.16.41.100
```
### A记录
name: 当前区域名称,例如：www.example.com
value: 当前区域的主机名对应的IPv4地址
     
避免用户写错名称时给错答案，可通过泛域名解析进行解析至某特定地址
     
示例：
```shell
www.example.com.  86400  IN  A   172.16.41.101
*.example.com.    86400  IN  A   172.16.41.102
example.com.      86400  IN  A   172.16.41.103
    
#注意：如果有和DNS的IP相同的多个同名的A记录，优先返回DNS的本机IP
```
### AAAA记录
name: 当前区域名称,例如：www.example.com   
value: 当前区域的主机名对应的IPv6地址
     
示例：
```shell
www.example.com.  86400  IN  AAAA  2001:0db8:85a3:0000:0000:8a2e:0370:7334
```

### PTR记录
name: 当前区域名称,例如：172.16.41.100    
value: 当前区域的主机名对应的域名
     
注意：网络地址以及后缀可以省略；主机地址依然需要反着写
     
示例：
```shell
100.41.16.172.in-addr.arpa.  86400  IN  PTR  www.example.com.
```
### CNAME记录
name: 当前区域名称,例如：www.example.com    
value: 当前区域的主机名对应的别名
     
示例：
```shell
www.example.com.  86400  IN  CNAME  webapp.example.com.
```
### 子域授权
每个域的名称服务器，都是通过其上级名称服务器在解析库进行授权,类似根域授权tld   
glue record：粘合记录，父域授权子域的记录
    
示例：
```shell
.com.            IN   NS   ns1.com.
.com.            IN   NS   ns2.com.
ns1.com.         IN   A    2.2.2.1
ns2.com.         IN   A    2.2.2.2
   
#example.com. 在.com的名称服务器上，解析库中添加资源记录
   
example.com.     IN   NS   ns1.example.com.
example.com.     IN   NS   ns2.example.com.
example.com.     IN   NS   ns3.example.com.
ns1.example.com. IN   A    3.3.3.1
ns2.example.com. IN   A    3.3.3.2
ns3.example.com. IN   A    3.3.3.3
```
### 域名信息查询
查询命令：whois
```shell
# 安装
root@localhost:~# apt install whois

# 查询域名
root@localhost:~# whois 1cobot.com
```
网站查询：[1cobot.com](https://whois.aliyun.com/domain/1cobot.com?spm=5176.29379033.J_fUNSUVBzhRP-3yTOu3xXF.whois-just-search)
```
https://whois.aliyun.com/domain/1cobot.com?spm=5176.29379033.J_fUNSUVBzhRP-3yTOu3xXF.whois-just-search
```