---
title: Linux文本处理工具
sidebar_position: 2
---

# Linux 文本处理工具（awk、sed、grep）

本文档介绍 Linux 中最常用的三个文本处理工具：awk、sed 和 grep。

## 1. grep 命令

grep（Global Regular Expression Print）用于在文本中搜索匹配的行。

### 1.1 基本用法

```bash
# 基本搜索
grep "pattern" file.txt           # 搜索文件中包含 pattern 的行
grep "error" /var/log/syslog     # 搜索日志文件中的错误

# 常用选项
grep -i "pattern" file.txt       # 忽略大小写
grep -v "pattern" file.txt       # 显示不匹配的行
grep -n "pattern" file.txt       # 显示行号
grep -r "pattern" directory/     # 递归搜索目录
grep -l "pattern" *.txt          # 只显示匹配的文件名
```

### 1.2 高级用法

```bash
# 使用正则表达式
grep "^start" file.txt          # 匹配以 start 开头的行
grep "end$" file.txt           # 匹配以 end 结尾的行
grep "[0-9]{3}" file.txt       # 匹配包含三个连续数字的行

# 组合使用
grep -E "pattern1|pattern2" file.txt    # 匹配多个模式
grep -A 2 "pattern" file.txt           # 显示匹配行及后两行
grep -B 2 "pattern" file.txt           # 显示匹配行及前两行
grep -C 2 "pattern" file.txt           # 显示匹配行及前后两行
```

## 2. sed 命令

sed（Stream Editor）是一个流编辑器，用于文本替换、删除、插入等操作。

### 2.1 基本替换

```bash
# 基本替换语法
sed 's/old/new/' file.txt           # 替换每行第一次匹配
sed 's/old/new/g' file.txt         # 替换所有匹配
sed -i 's/old/new/g' file.txt      # 直接修改文件

# 指定行号操作
sed '3s/old/new/' file.txt         # 只替换第3行
sed '1,5s/old/new/' file.txt       # 替换1-5行
```

### 2.2 高级操作

```bash
# 删除操作
sed '3d' file.txt                  # 删除第3行
sed '/pattern/d' file.txt          # 删除匹配行
sed '1,5d' file.txt               # 删除1-5行

# 插入和追加
sed '2i\新行' file.txt             # 在第2行前插入
sed '2a\新行' file.txt             # 在第2行后追加

# 多重编辑
sed -e 's/old1/new1/g' -e 's/old2/new2/g' file.txt

# 使用正则表达式
sed 's/[0-9]\{3\}/number/g' file.txt  # 替换三位数字
```

### 2.3 常用示例

```bash
# 删除空行
sed '/^$/d' file.txt

# 删除注释行
sed '/^#/d' file.txt

# 在每行开头添加字符
sed 's/^/> /' file.txt

# 在每行结尾添加字符
sed 's/$/ ;/' file.txt

# 替换特定范围内的文本
sed '10,20s/old/new/g' file.txt
```

## 3. awk 命令

awk 是一个强大的文本处理工具，特别适合处理格式化文本。

### 3.1 基本语法

```bash
# 打印特定列
awk '{print $1}' file.txt         # 打印第一列
awk '{print $1,$3}' file.txt      # 打印第一和第三列
awk -F: '{print $1}' /etc/passwd  # 指定分隔符

# 使用条件
awk '$3 > 100' file.txt           # 打印第三列大于100的行
awk 'length($0) > 80' file.txt    # 打印长度超过80的行
```

### 3.2 高级用法

```bash
# 内置变量
awk '{print NR, $0}' file.txt     # NR: 行号
awk '{print NF, $0}' file.txt     # NF: 列数
awk '{print FILENAME}' file.txt    # FILENAME: 文件名

# BEGIN 和 END 块
awk 'BEGIN {print "开始"} {print $0} END {print "结束"}' file.txt

# 条件和循环
awk '{
    sum = 0
    for(i=1; i<=NF; i++)
        sum += $i
    print "Sum:", sum
}' file.txt
```

### 3.3 实用示例

```bash
# 计算文件大小总和
ls -l | awk '{sum += $5} END {print "Total:", sum}'

# 统计单词出现次数
awk '{
    for(i=1; i<=NF; i++)
        count[$i]++
    }
    END {
        for(word in count)
            print word, count[word]
    }' file.txt

# 格式化输出
awk '{printf "%-20s %s\n", $1, $2}' file.txt

# 处理 CSV 文件
awk -F, '{print $1,$3}' data.csv
```

### 3.4 awk 内置变量

```bash
# 记录相关变量
NR    # Number of Record: 当前处理的行号（从文件开始）
FNR   # File Number of Record: 当前文件中的行号（每个文件重新计数）
NF    # Number of Field: 当前行的字段数
$0    # 当前行的完整内容
$1    # 当前行的第一个字段
$NF   # 当前行的最后一个字段
$(NF-1) # 当前行的倒数第二个字段

# 分隔符相关变量
FS    # Field Separator: 输入字段分隔符，默认是空格或制表符
OFS   # Output Field Separator: 输出字段分隔符，默认是空格
RS    # Record Separator: 输入记录分隔符，默认是换行符
ORS   # Output Record Separator: 输出记录分隔符，默认是换行符

# 文件相关变量
FILENAME # 当前处理的文件名
ARGC    # 命令行参数个数
ARGV    # 命令行参数数组
FNR     # 当前文件中的行号
RSTART  # match函数匹配的起始位置
RLENGTH # match函数匹配的长度

# 使用示例
awk '
BEGIN {
    print "文件处理开始"
    FS=":"        # 设置字段分隔符为冒号
    OFS="|"       # 设置输出分隔符为竖线
}
{
    print "当前文件:", FILENAME
    print "当前行号(全局):", NR
    print "当前行号(文件内):", FNR
    print "当前行字段数:", NF
    print "当前行内容:", $0
    print "第一个字段:", $1
    print "最后一个字段:", $NF
    print "倒数第二个字段:", $(NF-1)
}
END {
    print "文件处理结束"
}' /etc/passwd

# 实际应用示例
# 1. 显示行号和字段数
awk '{print "行号:" NR, "字段数:" NF}' file.txt

# 2. 使用不同的分隔符
awk 'BEGIN{FS=":"; OFS="|"} {print $1, $3}' /etc/passwd

# 3. 多文件处理时区分行号
awk '{print FILENAME, FNR, NR}' file1.txt file2.txt

# 4. 获取最后一个字段
awk '{print $(NF)}' file.txt

# 5. 计算每行的字段数
awk '{print NF}' file.txt | sort | uniq -c

# 6. 使用 FNR 重置计数
awk 'FNR==1{print "新文件开始:"} {print $0}' file1.txt file2.txt
```

## 4. 组合使用

### 4.1 管道组合

```bash
# grep 和 awk 组合
ps aux | grep nginx | awk '{print $2}'  # 获取 nginx 进程 ID

# 三个命令组合
cat file.txt | grep "pattern" | sed 's/old/new/g' | awk '{print $1}'
```

### 4.2 实际应用示例

```bash
# 分析 Apache 访问日志
cat access.log | \
    grep "POST" | \
    awk '{print $1}' | \
    sort | uniq -c | \
    sort -nr | head -n 10

# 处理系统日志
tail -f /var/log/syslog | \
    grep -i error | \
    sed 's/error/ERROR/g' | \
    awk '{print strftime("%Y-%m-%d %H:%M:%S"), $0}'
```

## 注意事项

1. sed 的 `-i` 选项要谨慎使用，建议先测试或备份
2. awk 的字段分隔符可以是正则表达式
3. grep 的正则表达式语法可能因版本而异
4. 处理大文件时注意性能影响
5. 在脚本中使用时注意转义字符的处理

## 最佳实践

1. 在修改文件前先做备份
2. 使用 `-n` 选项预览 sed 的修改结果
3. 对于复杂的文本处理，考虑组合使用这些工具
4. 处理特殊字符时使用适当的引号和转义
5. 编写脚本时注意添加错误处理 