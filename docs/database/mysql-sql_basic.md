---
title: SQL基础
description: SQL基础-DDL,DML,DCL,DQL等语句
keywords: [mysql]
sidebar_position: 3
---

## SQL语言概述
SQL=Structured Query Language，简称SQL。   
结构化查询语言包含6个部分：   
  - 数据查询语言（DQL: Data Query Language）： SELECT
  - 数据操作语言（DML：Data Manipulation Language）：INSERT、DELETE、UPDATE。 
  - 事务控制语言（TCL）：BEGIN、COMMIT（提交）命令、SAVEPOINT（保存点）命令、ROLLBACK（回滚）命令
  - 数据控制语言（DCL）：GRANT、REVOKE
  - 数据定义语言（DDL）：CREATE、ALTER、DROP 
  - 指针控制语言（CCL）：DECLARE CURSOR，FETCH INTO、UPDATE WHERE CURRENT等
    

## 数据库、表、列和行的概念
** MySQL逻辑结构 **  
     
  - 库：库名，属性（字符集，校对规则，表空间加密）    
  - 表：表名，表属性（存储引擎，字符集，校对，表空间加密），列（列名，列属性），数据行
    
**数据库连接方式**    
    
  1. TCP/IP套接字方式
  ```shell
  #TCP/IP 方法
  [root@localhost ~]# mysql -uroot  -h 127.0.0.1 -P3306  -p
  [root@localhost ~]# mysql -udba_test –pxxxx -h121.36.208.67 -P3306
  ```
     
  2. Unix套接字方式
  ```shell
  #Socket 方法
  [root@localhost ~]# mysql -uroot--socket=/tmp/mysql.sock -p
  ```
     
**数据库连接**   
```shell
# 登录数据库
[root@localhost ~]# mysql -u root -h 192.168.91.36 -p
Enter password: ****

# 退出数据库
mysql> QUIT
Bye
或者
mysql>\q
```
**MySQL连接工具**    
   

`DBeaver`: 可以支持几乎所有的数据库。   
    
  - [DBeaver下载链接：https://dbeaver.io/download/](https://dbeaver.io/download/)

`MysqlWorkBench`: mysql官方推出的mysql客户端软件   
    
  - [MysqlWorkBench下载链接：https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)   
     
     
**示例**
```sql
# 查看库
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sakila             |
| sys                |
| tpcc1000           |
+--------------------+
6 rows in set (0.00 sec)

# 连接到database
mysql> use tpcc1000;
Database changed

# 查看当前库
mysql> select database();
+------------+
| database() |
+------------+
| tpcc1000   |
+------------+
1 row in set (0.00 sec)

# 查看表
mysql> show tables;
+--------------------+
| Tables_in_tpcc1000 |
+--------------------+
| customer           |
| district           |
| history            |
| item               |
| new_orders         |
| order_line         |
| orders             |
| stock              |
| warehouse          |
+--------------------+
9 rows in set (0.00 sec)
```
**字符集**
```sql
mysql> show charaset;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'charaset' at line 1
mysql> show charset;
+----------+---------------------------------+---------------------+--------+
| Charset  | Description                     | Default collation   | Maxlen |
+----------+---------------------------------+---------------------+--------+
| armscii8 | ARMSCII-8 Armenian              | armscii8_general_ci |      1 |
| ascii    | US ASCII                        | ascii_general_ci    |      1 |
| big5     | Big5 Traditional Chinese        | big5_chinese_ci     |      2 |
| binary   | Binary pseudo charset           | binary              |      1 |
| cp1250   | Windows Central European        | cp1250_general_ci   |      1 |
| cp1251   | Windows Cyrillic                | cp1251_general_ci   |      1 |
| cp1256   | Windows Arabic                  | cp1256_general_ci   |      1 |
| cp1257   | Windows Baltic                  | cp1257_general_ci   |      1 |
| cp850    | DOS West European               | cp850_general_ci    |      1 |
| cp852    | DOS Central European            | cp852_general_ci    |      1 |
| cp866    | DOS Russian                     | cp866_general_ci    |      1 |
| cp932    | SJIS for Windows Japanese       | cp932_japanese_ci   |      2 |
| dec8     | DEC West European               | dec8_swedish_ci     |      1 |
| eucjpms  | UJIS for Windows Japanese       | eucjpms_japanese_ci |      3 |
| euckr    | EUC-KR Korean                   | euckr_korean_ci     |      2 |
| gb18030  | China National Standard GB18030 | gb18030_chinese_ci  |      4 |
| gb2312   | GB2312 Simplified Chinese       | gb2312_chinese_ci   |      2 |
| gbk      | GBK Simplified Chinese          | gbk_chinese_ci      |      2 |
| geostd8  | GEOSTD8 Georgian                | geostd8_general_ci  |      1 |
| greek    | ISO 8859-7 Greek                | greek_general_ci    |      1 |
| hebrew   | ISO 8859-8 Hebrew               | hebrew_general_ci   |      1 |
| hp8      | HP West European                | hp8_english_ci      |      1 |
| keybcs2  | DOS Kamenicky Czech-Slovak      | keybcs2_general_ci  |      1 |
| koi8r    | KOI8-R Relcom Russian           | koi8r_general_ci    |      1 |
| koi8u    | KOI8-U Ukrainian                | koi8u_general_ci    |      1 |
| latin1   | cp1252 West European            | latin1_swedish_ci   |      1 |
| latin2   | ISO 8859-2 Central European     | latin2_general_ci   |      1 |
| latin5   | ISO 8859-9 Turkish              | latin5_turkish_ci   |      1 |
| latin7   | ISO 8859-13 Baltic              | latin7_general_ci   |      1 |
| macce    | Mac Central European            | macce_general_ci    |      1 |
| macroman | Mac West European               | macroman_general_ci |      1 |
| sjis     | Shift-JIS Japanese              | sjis_japanese_ci    |      2 |
| swe7     | 7bit Swedish                    | swe7_swedish_ci     |      1 |
| tis620   | TIS620 Thai                     | tis620_thai_ci      |      1 |
| ucs2     | UCS-2 Unicode                   | ucs2_general_ci     |      2 |
| ujis     | EUC-JP Japanese                 | ujis_japanese_ci    |      3 |
| utf16    | UTF-16 Unicode                  | utf16_general_ci    |      4 |
| utf16le  | UTF-16LE Unicode                | utf16le_general_ci  |      4 |
| utf32    | UTF-32 Unicode                  | utf32_general_ci    |      4 |
| utf8mb3  | UTF-8 Unicode                   | utf8mb3_general_ci  |      3 |
| utf8mb4  | UTF-8 Unicode                   | utf8mb4_0900_ai_ci  |      4 |
+----------+---------------------------------+---------------------+--------+
41 rows in set (0.00 sec)
```
   
**校对(排序规则)规则**   
    
```sql
mysql> show collation;
+-----------------------------+----------+-----+---------+----------+---------+---------------+
| Collation                   | Charset  | Id  | Default | Compiled | Sortlen | Pad_attribute |
+-----------------------------+----------+-----+---------+----------+---------+---------------+
| armscii8_bin                | armscii8 |  64 |         | Yes      |       1 | PAD SPACE     |
| armscii8_general_ci         | armscii8 |  32 | Yes     | Yes      |       1 | PAD SPACE     |
| ascii_bin                   | ascii    |  65 |         | Yes      |       1 | PAD SPACE     |
| ascii_general_ci            | ascii    |  11 | Yes     | Yes      |       1 | PAD SPACE     |
| big5_bin                    | big5     |  84 |         | Yes      |       1 | PAD SPACE     |
| big5_chinese_ci             | big5     |   1 | Yes     | Yes      |       1 | PAD SPACE     |
| binary                      | binary   |  63 | Yes     | Yes      |       1 | NO PAD        |
| cp1250_bin                  | cp1250   |  66 |         | Yes      |       1 | PAD SPACE     |
| cp1250_croatian_ci          | cp1250   |  44 |         | Yes      |       1 | PAD SPACE     |
| cp1250_czech_cs             | cp1250   |  34 |         | Yes      |       2 | PAD SPACE     |
| cp1250_general_ci           | cp1250   |  26 | Yes     | Yes      |       1 | PAD SPACE     |
| cp1250_polish_ci            | cp1250   |  99 |         | Yes      |       1 | PAD SPACE     |
| cp1251_bin                  | cp1251   |  50 |         | Yes      |       1 | PAD SPACE     |
| cp1251_bulgarian_ci         | cp1251   |  14 |         | Yes      |       1 | PAD SPACE     |
.....
| utf8mb4_vi_0900_as_cs       | utf8mb4  | 300 |         | Yes      |       0 | NO PAD        |
| utf8mb4_zh_0900_as_cs       | utf8mb4  | 308 |         | Yes      |       0 | NO PAD        |
+-----------------------------+----------+-----+---------+----------+---------+---------------+
286 rows in set (0.01 sec)
```

**存储引擎**
```sql
mysql> show engines;
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                        | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
| ndbcluster         | NO      | Clustered, fault-tolerant tables                               | NULL         | NULL | NULL       |
| FEDERATED          | NO      | Federated MySQL storage engine                                 | NULL         | NULL | NULL       |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables      | NO           | NO   | NO         |
| InnoDB             | DEFAULT | Supports transactions, row-level locking, and foreign keys     | YES          | YES  | YES        |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                             | NO           | NO   | NO         |
| MyISAM             | YES     | MyISAM storage engine                                          | NO           | NO   | NO         |
| ndbinfo            | NO      | MySQL Cluster system information storage engine                | NULL         | NULL | NULL       |
| MRG_MYISAM         | YES     | Collection of identical MyISAM tables                          | NO           | NO   | NO         |
| BLACKHOLE          | YES     | /dev/null storage engine (anything you write to it disappears) | NO           | NO   | NO         |
| CSV                | YES     | CSV storage engine                                             | NO           | NO   | NO         |
| ARCHIVE            | YES     | Archive storage engine                                         | NO           | NO   | NO         |
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
11 rows in set (0.00 sec)
```
## SQL基础讲解-DDL
### CREATE语句
```sql
# 创建库
mysql> CREATE DATABASE menagerie;

# 创建表
mysql>CREATE TABLE district4 (
d_id bigint NOT NULL,
d_w_id smallint NOT NULL,
d_name varchar(10),
d_street_1 varchar(20),
d_street_2 varchar(20),
d_city varchar(20),
d_state char(2),
d_zip char(9),
d_tax decimal(4, 2),
d_ytd decimal(12, 2),
d_next_o_id int,
PRIMARY KEY (d_w_id, d_id),
key idx_dzip (d_zip)
) ENGINE = InnoDB;
# sql 语法检查工具 https://tool.lu/ --> sql工具

# 创建同结构表 ***重要知识点
mysql> CREATE TABLE t2 LIKE t1;

#查看表结构
mysql> desc district；
mysql> show create table district;

# 创建索引
mysql> create index ---不建议 8.0.13之前用法

语法：
mysql> CREATE INDEX part_of_name ON customer (name(10));
例子:
mysql> show create table item\G
*************************** 1. row ***************************
       Table: item
Create Table: CREATE TABLE `item` (
  `i_id` int NOT NULL,
  `i_im_id` int DEFAULT NULL,
  `i_name` varchar(24) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `i_price` decimal(5,2) DEFAULT NULL,
  `i_data` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`i_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
1 row in set (0.00 sec)

mysql> create index aa on item(i_name);
alter table xxx add index --- 推荐写法

#等价写法
mysql> alter table item add index aab(i_name);
```

### ALTER语句

**alert table案例**    
     

```sql
# alert table

mysql> CREATE TABLE t1 (a INTEGER, b CHAR(10));
# 重命名表
mysql> ALTER TABLE t1 RENAME t2;

like + rename
#####归档方法
mysql> create table t1_new like t1;
mysql> ALTER TABLE t1 RENAME t1_old;
mysql> ALTER TABLE t1_new RENAME t1;
#####

# 修改字段属性
mysql> ALTER TABLE t2 MODIFY a TINYINT NOT NULL, modify b CHAR(30) ;

# 加列
mysql> ALTER TABLE t2 ADD d datetime;

# 加索引、加主键
mysql> ALTER TABLE t2 ADD INDEX (d), ADD primary key (a);

# 删除列
mysql> ALTER TABLE t2 DROP COLUMN c;

# 加列，加主键
mysql> ALTER TABLE t2 ADD c INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ADD PRIMARY KEY (c);

# 修改主键
mysql> alter table t2 drop primary key, add primary key e(e);
```

**alert user案例**    
    
```sql
# alter user 
# 修改密码
mysql> ALTER USER 'user_name'@'ip' IDENTIFIED with mysql_native_password BY 'auth_string';
```

### DROP语句
**drop user**   
```sql
mysql> create user 'aaa'@'%' identified by 'abc123';
mysql> grant all on *.* to 'aaa'@'%';
mysql> select user, host from mysql.user;
mysql> delete from mysql.user where user='aaa';
mysql> create user 'aaa'@'%' identified by 'abc123';
```

## SQL基础讲解-DML
**包括DQL-select**   
   
### SELECT语句
```sql
#基本的SELECT语句：
mysql> SELECT column1, column2, ... FROM table_name;

eg：
mysql> select i_id, i_name, i_price from item ;

#使用WHERE子句过滤数据：
mysql> SELECT column1, column2, ... FROM table_name WHERE condition;
mysql> select i_id, i_name, i_price from item  where i_id > 99995;
mysql> select i_id, i_name, i_price from item  where i_id in( 99995, 99996);
mysql> select i_id, i_name, i_price from item  where i_id not in(100000);

#使用ORDER BY子句对结果排序：
mysql> SELECT column1, column2, ... FROM table_name ORDER BY column_name [ASC升序|DESC降序];
mysql> select i_id, i_name, i_price from item order by i_price limit 50;
mysql> select i_id, i_name, i_price from item order by i_price desc ;
mysql> select i_id, i_name, i_price from item order by i_price desc;

#使用LIMIT子句限制返回的行数：
mysql> SELECT column1, column2, ... FROM table_name LIMIT number;
mysql> select i_id, i_name, i_price from item order by i_price limit 50;

#使用JOIN子句连接多个表：
mysql> SELECT column1, column2, ... FROM table1 JOIN table2 ON condition;
mysql> select email, username from staff s join address a on s.address_id=a.address_id;

#使用DISTINCT关键字去除重复的行：
mysql> SELECT DISTINCT column1, column2, ... FROM table_name;
mysql> select DISTINCT first_name,last_name from actor;

#使用聚合函数计算统计信息：
mysql> SELECT COUNT(column_name), AVG(column_name), SUM(column_name), MAX(column_name), MIN(column_name) FROM table_name;
mysql> select count(*) from actor;

#使用GROUP BY子句进行分组：
mysql> SELECT column1, column2, ... FROM table_name GROUP BY column_name;
mysql> select * from actor group by first_name;

#使用HAVING子句过滤分组后的结果：
#HAVING子句出现在GROUP BY子句之后，用于对分组后的结果进行筛选。可以在HAVING子句中使用聚合函数、列名、常量和比较运算符来构建筛选条件
mysql> SELECT column1, column2, ... FROM table_name GROUP BY column_name HAVING condition;
mysql> select * from actor group by first_name having actor_id > 50;

#使用子查询嵌套查询：
mysql> SELECT column1, column2, ... FROM table_name WHERE column_name IN (SELECT column_name FROM table_name);
mysql> select * from film where film_id in (select actor_id from actor);
```
### INSERT语句
```sql
#基本用法
mysql> INSERT INTO table_name (列1, 列2, 列3, ...) VALUES (值1, 值2, 值3, ...);
eg:
mysql> INSERT INTO students (id, name, age) VALUES (1, 'Alice', 20);

# 谨慎使用
mysql> INSERT INTO 表1 (列1, 列2, 列3, ...) SELECT 列1, 列2, 列3, ... FROM 表2 WHERE 条件;
```

### DELETE语句
```sql
# 1.删除整个表中的数据：
mysql> DELETE FROM 表名;
mysql> DELETE FROM item;
# 这种用法会删除表中的所有数据记录，但保留表的结构。

# 2.删除满足条件的数据记录： 采用
DELETE FROM 表名 WHERE 条件;
mysql> delete from item where i_id > 50000;
# 这种用法可以根据指定的条件删除满足条件的数据记录。

# 3.删除部分数据记录：
mysql> DELETE FROM 表名 LIMIT 行数;
# 这种用法会删除表中指定行数的数据记录。

# 4.删除表中的重复记录：
mysql> DELETE t1 FROM 表名 t1, 表名 t2 WHERE t1.列名 = t2.列名 AND t1.主键 > t2.主键;
# 这种用法可以删除表中的重复记录，保留其中一个记录。

# 5.删除与其他表相关联的数据记录：
mysql> DELETE t1 FROM 表1 t1 INNER JOIN 表2 t2 ON t1.列名 = t2.列名 WHERE 条件;
# 这种用法可以删除与另一个表相关联的数据记录，根据指定的条件进行筛选。
# 需要注意的是，DELETE语句执行后会永久删除数据记录，因此在使用DELETE语句之前，应该谨慎确认删除的数据记录。同时，为了避免误操作，可以在执行DELETE语句之前先使用SELECT语句进行验证。
```

### UPDATE语句
```sql
# 基本语法如下：
mysql> UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;

# 示例
mysql> UPDATE students
SET age = 20, name = 'John'
WHERE id = 1;

# 示例
mysql> UPDATE students
SET age = 20
WHERE id IN (1, 2, 3);
```

## SQL基础讲解-DCL
   
**DCL理论上包括，grant和revoke语句**   
    
结合用户权限管理一起说明    
    
在MySQL中，一个`可用的账号`= `用户名` + `主机ip/ip段` + `密码`
```sql
select user,host,authentication_string from mysql.user where user='root';

例子：
show grants for 'root'@'10.10.%'\G
grant select on sakila.actor 'root'@'10.10.%';
```
**创建用户并授权、回收权限**    
     
```sql
#创建用户、授权、回收权限
mysql> create user 'dba_test'@'%' identified with mysql_native_password by 'abc123';
Query OK, 0 rows affected (0.16 sec)

# 授权
mysql> grant select on sakila.actor to 'dba_test'@'%';
Query OK, 0 rows affected (0.01 sec)

# 刷新权限
mysql> flush privileges;
Query OK, 0 rows affected (0.01 sec)


# 回收
mysql> REVOKE select ON sakila.actor FROM 'dba_test'@'%';
Query OK, 0 rows affected (0.01 sec)
```
     
**各版本权限管理命令的变化**    
    
![各版本权限管理命令的变化](https://pic.imgdb.cn/item/64ad74841ddac507cc696a5c.png)
## 常用函数
  1. 字符串函数：CONCAT、SUBSTRING、LENGTH、UPPER、LOWER、TRIM、REPLACE等。
  ```sql
  SELECT CONCAT(2,' test');
  SELECT 38.8, CONCAT(38.8);
  ```
    
  2. 数值函数：ABS、ROUND、CEIL、FLOOR、MOD、RAND等
  ```sql
  SELECT ABS(-32);
  ```
     
  3. 日期和时间函数：NOW、CURDATE、CURTIME、DATE、TIME、YEAR、MONTH、DAY等。
  ```sql
  select now();
  SELECT CURTIME();
  ```
    
  4. 条件函数：IF、CASE等。
  ```sql
  一般存储过程等写，不建议mysql中使用存储过程，业务逻辑尽量在业务代码中实现。
  ```
       
  5. 聚合函数：COUNT、SUM、AVG、MIN、MAX等。
  ```sql
  一般在查询中使用。
  ```
    
  6. 分组函数：GROUP_CONCAT、GROUP BY等。 --行 转 列 GROUP_CONCAT
  ```sql
  SELECT student_name, AVG(test_score) FROM student GROUP BY student_name;
  SELECT student_name,GROUP_CONCAT(test_score) FROM student GROUP BY student_name;
  ```
      
  7. 转换函数：CAST、CONVERT等。
  ```sql
  SELECT 38.8, CAST(38.8 AS CHAR);
  ```
       
  8. 数据类型函数：CAST、CONVERT、DATE_FORMAT等。
  ```sql
  # convert常用于字符集操作
  SELECT CONVERT('abc' USING utf8mb4);
  ```
     
  9. 数据库函数：DATABASE、USER、VERSION等。
  ```sql
  select database();
  select user();
  SELECT VERSION();
  ```
     
  10. 系统函数：SLEEP等。
  ```sql
  select sleep(5);
  ```