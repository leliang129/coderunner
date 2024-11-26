---
title: MySQL常用SQL语句
description: MySQL常用SQL语句及其使用场景
keywords: [mysql, sql]
sidebar_position: 4
---

# MySQL 常用 SQL 语句



## 1. 数据定义语言（DDL）

### 1.1 CREATE 语句

```sql
# 创建数据库
CREATE DATABASE database_name
  [CHARACTER SET charset_name]
  [COLLATE collation_name];

# 创建表
CREATE TABLE table_name (
    column1 datatype [constraints],
    column2 datatype [constraints],
    ...
    [table_constraints]
) [ENGINE=engine_name];

# 示例：创建用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

### 1.2 ALTER 语句

```sql
# 修改表结构
ALTER TABLE table_name
    [ADD column_name datatype [constraints]]
    [MODIFY column_name datatype [constraints]]
    [DROP column_name]
    [RENAME TO new_table_name];

# 示例：添加列
ALTER TABLE users ADD phone VARCHAR(20);

# 示例：修改列属性
ALTER TABLE users MODIFY email VARCHAR(150) NOT NULL;

# 示例：添加索引
ALTER TABLE users ADD INDEX idx_username (username);
```

### 1.3 DROP 语句

```sql
# 删除数据库
DROP DATABASE database_name;

# 删除表
DROP TABLE table_name;

# 删除索引
DROP INDEX index_name ON table_name;
```

## 2. 数据操作语言（DML）

### 2.1 INSERT 语句

```sql
# 插入单行数据
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);

# 插入多行数据
INSERT INTO table_name (column1, column2, ...)
VALUES 
    (value1, value2, ...),
    (value1, value2, ...);

# 从其他表插入数据
INSERT INTO table1 (column1, column2, ...)
SELECT column1, column2, ...
FROM table2
WHERE condition;
```

### 2.2 UPDATE 语句

```sql
# 更新数据
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;

# 示例：更新用户邮箱
UPDATE users
SET email = 'new@example.com'
WHERE id = 1;

# 使用子查询更新
UPDATE table1 t1
SET column1 = (SELECT column2 FROM table2 t2 WHERE t1.id = t2.id);
```

### 2.3 DELETE 语句

```sql
# 删除数据
DELETE FROM table_name
WHERE condition;

# 示例：删除指定用户
DELETE FROM users
WHERE id = 1;

# 删除全表数据
DELETE FROM table_name;

# 使用 JOIN 删除数据
DELETE t1 FROM table1 t1
JOIN table2 t2 ON t1.id = t2.id
WHERE condition;
```

## 3. 数据查询语言（DQL）

### 3.1 基本查询

```sql
# 基本 SELECT 语句
SELECT column1, column2, ...
FROM table_name
WHERE condition
GROUP BY column
HAVING group_condition
ORDER BY column [ASC|DESC]
LIMIT offset, count;

# 示例：查询用户列表
SELECT id, username, email
FROM users
WHERE created_at >= '2024-01-01'
ORDER BY created_at DESC
LIMIT 10;
```

### 3.2 JOIN 查询

```sql
# INNER JOIN
SELECT t1.column1, t2.column2
FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.id;

# LEFT JOIN
SELECT t1.column1, t2.column2
FROM table1 t1
LEFT JOIN table2 t2 ON t1.id = t2.id;

# RIGHT JOIN
SELECT t1.column1, t2.column2
FROM table1 t1
RIGHT JOIN table2 t2 ON t1.id = t2.id;
```

### 3.3 子查询

```sql
# WHERE 子句中的子查询
SELECT column1
FROM table1
WHERE column2 IN (SELECT column2 FROM table2);

# FROM 子句中的子查询
SELECT t1.column1
FROM (SELECT * FROM table2) t1;

# 相关子查询
SELECT *
FROM table1 t1
WHERE column1 > (
    SELECT AVG(column1)
    FROM table1 t2
    WHERE t2.group = t1.group
);
```

## 4. 数据控制语言（DCL）

### 4.1 用户管理

```sql
# 创建用户
CREATE USER 'username'@'host' 
IDENTIFIED BY 'password';

# 修改密码
ALTER USER 'username'@'host' 
IDENTIFIED BY 'new_password';

# 删除用户
DROP USER 'username'@'host';
```

### 4.2 权限管理

```sql
# 授予权限
GRANT privilege_type
ON database_name.table_name
TO 'username'@'host';

# 撤销权限
REVOKE privilege_type
ON database_name.table_name
FROM 'username'@'host';

# 查看权限
SHOW GRANTS FOR 'username'@'host';
```

## 5. 事务控制语言（TCL）

```sql
# 开始事务
START TRANSACTION;
或
BEGIN;

# 提交事务
COMMIT;

# 回滚事务
ROLLBACK;

# 设置保存点
SAVEPOINT savepoint_name;

# 回滚到保存点
ROLLBACK TO savepoint_name;
```

## 注意事项

1. 在执行 DELETE 或 UPDATE 操作前，建议先用 SELECT 验证条件
2. 大批量数据操作时，注意使用事务和批量操作语句
3. 复杂查询要注意性能优化，可以通过 EXPLAIN 分析执行计划
4. 使用 JOIN 时要注意连接条件，避免笛卡尔积
5. 合理使用索引提高查询性能

## 最佳实践

1. 使用预处理语句防止 SQL 注入
2. 使用合适的字段类型和长度
3. 遵循最小权限原则进行权限管理
4. 合理使用事务确保数据一致性
5. 定期检查和优化 SQL 语句性能 

## 6. MySQL 5.7 与 8.0 SQL 使用差异

### 6.1 GROUP BY 语句

```sql
-- MySQL 5.7
-- GROUP BY 隐式排序
SELECT name, COUNT(*) 
FROM users 
GROUP BY name;  -- 结果会自动按 name 排序

-- MySQL 8.0
-- GROUP BY 不再隐式排序
SELECT name, COUNT(*) 
FROM users 
GROUP BY name;  -- 结果不保证顺序
-- 如需排序，必须显式指定
SELECT name, COUNT(*) 
FROM users 
GROUP BY name 
ORDER BY name;
```

### 6.2 用户管理和权限

```sql
-- MySQL 5.7
GRANT ALL PRIVILEGES ON database.* TO 'user'@'host' IDENTIFIED BY 'password';

-- MySQL 8.0
-- 需要先创建用户，再授权
CREATE USER 'user'@'host' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON database.* TO 'user'@'host';
```

### 6.3 默认认证方式

```sql
-- MySQL 5.7
-- 默认使用 mysql_native_password

-- MySQL 8.0
-- 默认使用 caching_sha2_password
-- 如需使用旧认证方式，需要显式指定
CREATE USER 'user'@'host' 
IDENTIFIED WITH mysql_native_password BY 'password';

-- 或修改已有用户的认证方式
ALTER USER 'user'@'host' 
IDENTIFIED WITH mysql_native_password BY 'password';
```

### 6.4 索引

```sql
-- MySQL 8.0 新增功能：不可见索引
CREATE INDEX idx_name ON users(name) INVISIBLE;
ALTER TABLE users ALTER INDEX idx_name VISIBLE;

-- MySQL 8.0 新增功能：降序索引
CREATE INDEX idx_age_desc ON users(age DESC);

-- MySQL 8.0 新增功能：函数索引
CREATE INDEX idx_upper_name ON users((UPPER(name)));
```

### 6.5 公用表表达式（CTE）

```sql
-- MySQL 8.0 新增功能：WITH 子句
WITH RECURSIVE cte AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM cte WHERE n < 5
)
SELECT * FROM cte;
```

### 6.6 窗口函数

```sql
-- MySQL 8.0 新增功能：窗口函数
SELECT 
    name,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) as salary_rank,
    LAG(salary) OVER (ORDER BY salary DESC) as prev_salary
FROM employees;
```

### 6.7 CHECK 约束

```sql
-- MySQL 8.0 新增功能：CHECK 约束
CREATE TABLE employees (
    id INT PRIMARY KEY,
    age INT CHECK (age >= 18),
    salary DECIMAL(10,2) CHECK (salary > 0)
);
```

### 6.8 JSON 功能增强

```sql
-- MySQL 5.7
-- 基本 JSON 操作
SELECT JSON_EXTRACT(data, '$.name') FROM users;

-- MySQL 8.0
-- 新增 JSON 表格函数
SELECT * FROM 
JSON_TABLE(
    '[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]',
    '$[*]' COLUMNS(
        name VARCHAR(50) PATH '$.name',
        age INT PATH '$.age'
    )
) AS jt;
```

### 6.9 其他重要差异

1. 字符集：
   - 5.7 默认字符集为 latin1
   - 8.0 默认字符集为 utf8mb4

2. 临时表：
   - 5.7 使用 MEMORY 存储引擎
   - 8.0 使用 TempTable 存储引擎

3. 自增列：
   - 8.0 自增列值持久化到重启后

4. 外键命名：
   - 8.0 支持显式指定外键名称

注意事项：
1. 升级到 8.0 时需要注意认证方式的变化
2. GROUP BY 语句可能需要显式添加 ORDER BY
3. 创建用户和授权需要分开操作
4. 注意默认字符集的变化
5. 可以利用 8.0 的新特性优化查询性能 

### 6.10 修改密码方式的差异

```sql
-- MySQL 5.7 修改密码的方式：

-- 方式1：使用 SET PASSWORD 命令
SET PASSWORD FOR 'root'@'localhost' = PASSWORD('new_password');

-- 方式2：使用 UPDATE 命令直接更新 mysql.user 表
UPDATE mysql.user 
SET authentication_string = PASSWORD('new_password') 
WHERE User = 'root' AND Host = 'localhost';
FLUSH PRIVILEGES;

-- 方式3：使用 GRANT 命令
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY 'new_password';


-- MySQL 8.0 修改密码的方式：

-- 方式1：使用 ALTER USER 命令（推荐）
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';

-- 方式2：使用 SET PASSWORD 命令（新语法）
SET PASSWORD FOR 'root'@'localhost' = 'new_password';
-- 或者当前用户
SET PASSWORD = 'new_password';

-- 注意：MySQL 8.0 中
-- 1. 移除了 PASSWORD() 函数
-- 2. 不再支持通过直接更新 mysql.user 表的方式修改密码
-- 3. GRANT 命令不再支持同时设置密码
```

主要区别：
1. MySQL 8.0 移除了 PASSWORD() 函数
2. MySQL 8.0 不再支持直接更新用户表修改密码
3. MySQL 8.0 的 GRANT 语句不再包含设置密码的功能
4. MySQL 8.0 推荐使用 ALTER USER 命令修改密码
5. MySQL 8.0 的密码管理更加严格和安全 