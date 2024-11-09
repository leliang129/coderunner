---
title: MySQL的安装与配置
description: MySQL的安装与配置
keywords: [mysql]
sidebar_position: 2
---

# MySQL的安装与配置

## 软件源方式安装
以centos-7为例
```shell
#1 下载yum文件，注意版本
wget https://repo.mysql.com//mysql80-community-release-el7-7.noarch.rpm

#2 添加yum源
yum -y localinstall mysql80-community-release-el7-7.noarch.rpm

#3 检查yum源
yum repolist enabled | grep "mysql.*-community.*"
yum repolist all | grep mysql

#4 禁止5.7 
#（yum -y install yum-utils）yum-config-manager 需要
sudo yum-config-manager --disable mysql57-community
sudo yum-config-manager --enable mysql80-community

#5 安装
# 先删除 mariadb 
# yum -y remove mariadb*
sudo yum install mysql-community-server

#6 启动
systemctl start mysqld

#7 检查
systemctl status mysqld

#8 登录
cat /var/log/mysqld.log | grep password  # 获取初始化密码
mysql -uroot -p

#9 第一次登录需要修改密码
ALTER USER 'root'@'localhost' IDENTIFIED with mysql_native_password BY 'cK3!iB7=';   # 8.0第一次改密码必须用这个命令

#10 再次登录
mysql -uroot -p'cK3!iB7=' # 密码最好不要明文输入
```

## 二进制安装-推荐

### 获取 MySQL软件

**[mysql下载页面](https://downloads.mysql.com/archives/community/)**
```shell
https://downloads.mysql.com/archives/community/
```

### 开始部署安装
```shell
#1 下载安装包
wget https://cdn.mysql.com//Downloads/MySQL-8.0/mysql-8.0.32-el7-x86_64.tar.gz

#2 依赖安装 
yum search libaio  # search for info
yum install libaio # install library
# yum install ncurses-compat-libs （centos8需要，centos7不需要）

#3 删除系统自动mariadb
yum -y remove mariadb*

#4 添加用户和组
groupadd mysql
useradd -r -g mysql -s /bin/false mysql

#5 解压安装包
cd /usr/local  # 这个路径可以根据自己需求配置 一般放/usr/local 单机单实例 或者放数据盘 /data/下某个某路下也行 只要后面配置一直就行

tar xvf mysql-8.0.32-el7-x86_64.tar.gz 

mv mysql-8.0.32-el7-x86_64 mysql

cd /usr/local/mysql/support-files/

cp mysql.server /etc/init.d/mysqld


#6 设置环境变量
export PATH=$PATH:/usr/local/mysql/bin 

#7 建立软连接 
ln -s /usr/local/mysql/bin/* /usr/bin/

#8 创建数据存放文件夹
mkdir /data/mysql_data /data/mysql_log /data/mysql_slow -p

#9 修改文件夹权限与用户、用户组
chown -R mysql:mysql /data/

#10 编辑配置文件 
#######################################
vim /etc/my.cnf

[client]
port            = 3306
socket          = /tmp/mysql.sock
default-character-set=utf8mb4

# server参数设置
[mysqld]
# generic configuration options
port            = 3306
socket          = /tmp/mysql.sock
datadir=/data/mysql_data
skip-name-resolve
default_time_zone='+8:00'
character-set-server=utf8mb4
collation-server = utf8mb4_unicode_ci
init_connect='SET NAMES utf8mb4'
lower_case_table_names=1
back_log = 500
# 最大连接数，根据实际情况调整，太小有可能不够用，太大会消耗内存。mysql服务启动时分配内存的依据参数之一。
max_connections = 1500
max_connect_errors =100000
# 同最大连接数
table_open_cache = 2048
#external-locking
max_allowed_packet = 64M
binlog_cache_size = 2M
max_heap_table_size = 16M
sort_buffer_size = 4M
join_buffer_size = 4M
read_buffer_size = 2M
ft_min_word_len = 4
thread_cache_size = 100
bulk_insert_buffer_size = 32M
bind-address = 0.0.0.0

#memlock
thread_stack = 192K
tmp_table_size = 16M
log-bin=/data/mysql_log/mysql-bin
#binlog格式
binlog_format = ROW
#binlog刷盘
sync_binlog = 1
log_output=file
log_slave_updates
# 实例id，主从不能相同
server-id = 2013306
auto_increment_increment=1
auto_increment_offset=1
master_info_repository = TABLE
relay_log_info_repository = TABLE
relay_log_recovery = 1
#replicate-ignore-db=mysql
#replicate-ignore-db=test
slow_query_log_file=/data/mysql_slow/slow.log
slow_query_log
long_query_time=1
log_error_verbosity = 1
log_error = /data/mysql_log/error.log
tmpdir =/tmp
relay-log=/data/mysql_log/relay-bin 
#并行类型复制参数
slave-parallel-type=LOGICAL_CLOCK
#并行复制-并行数
slave-parallel-workers=4
#从库回放binlog顺序
slave_preserve_commit_order=1
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
log_timestamps = SYSTEM

#*** MyISAM Specific options
key_buffer_size = 64M

# *** INNODB Specific options ***
#default_table_type = InnoDB
# 隔离级别，对一致性要求高设置REPEATABLE-READ，高并发下数据一致性要求不高的情况下可设置READ-COMMITTED
transaction_isolation = REPEATABLE-READ
# 重要参数，一般独专情况下，设置为机器内存的60-70%，比如10G内存，设置7G
innodb_buffer_pool_size = 1G
# 表空间自动扩展 一定要设置
innodb_data_file_path = ibdata1:1000M:autoextend
# 每张表独立表空间，一定要设置
innodb_file_per_table=1
# 事务提交立即刷盘，一定要设置
innodb_flush_log_at_trx_commit = 1
innodb_log_buffer_size = 16M
# redo大小
innodb_log_file_size = 256M
innodb_log_files_in_group = 2
# 热点数据内存刷新比例，一般建议60-80
innodb_max_dirty_pages_pct = 80
lock_wait_timeout = 20
innodb_lock_wait_timeout = 20
# 磁盘直接写，根据磁盘类型设置，建议ssd下设置O_DIRECT
innodb_flush_method=O_DIRECT
innodb_io_capacity = 1000
#slave-skip-errors=1062,1032,1872
explicit_defaults_for_timestamp = 0
default_authentication_plugin = mysql_native_password
binlog_expire_logs_seconds = 604800


[mysqldump]
quick
max_allowed_packet = 64M

[mysql]
#重要 自动哈希，一般禁止
no-auto-rehash
#safe-updates

[myisamchk]
key_buffer_size = 64M
sort_buffer_size = 64M
read_buffer = 8M
write_buffer = 8M

[mysqlhotcopy]
interactive-timeout

[mysqld_safe]
open-files-limit = 65535
log_error_verbosity = 1
log_error = /data/mysql_log/error.log
pid-file=/data/mysql_data/mysql.pid
################################################################

# 11 初始化
mysqld --defaults-file=/etc/my.cnf --initialize --user=mysql

# 12 启动
mysql_ssl_rsa_setup
mysqld_safe --defaults-file=/etc/my.cnf --user=mysql &

# 13 登录
cat /data/mysql_log/error.log | grep password  # 获取初始化密码
mysql -uroot -p

# 14 第一次登录需要修改密码
ALTER USER 'root'@'localhost' IDENTIFIED with mysql_native_password BY 'cK3!iB7=';   # 8.0第一次改密码必须用这个命令

# 15 再次登录
mysql -uroot -p'cK3!iB7=' # 密码最好不要明文输入

```

### 设置systemd管理
```shell
# 编辑systemd管理的service文件
vim /usr/lib/systemd/system/mysqld.service

[Unit]
Description=MySQL Server
Documention=man.mysqld(8)
After=network.target
After=syslog.target 

[Service]
User=mysql
Group=mysql
Type=notify
PIDFile=/data/mysql_data/mysqld.pid
ExecStart=/usr/local/mysql/bin/mysqld --defaults-file=/etc/my.cnf -h /data/mysql_data/ --socket=/tmp/mysql.sock --pid-file=/data/mysql_data/mysqld.pid
RuntimeDirectory=mysql
TimeoutSec=0

[Install]
WantedBy=multi-user.target


# 重新加载某个服务的配置文件
systemctl daemon-reload

# 配置开机启动
systemctl enable mysqld

# 重启mysql
systemctl restart mysqld 
```