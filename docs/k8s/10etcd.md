---
title: etcd的介绍与常用命令
description: etcd的常用命令，备份恢复等等
keywords: [etcd, k8s]
sidebar_position: 8
---

## etcd介绍
etcd官网：[https://etcd.io](https://etcd.io)    
etcd是一个分布式键值存储系统，常用做在分布式系统中存储关键数据，它是由coreos团队开发并开源的分布式键值存储系统，具备以下特点：    

  - 简单：基于http+json的API可以轻松使用
  - 安全：支持SSL证书验证
  - 快速：每个实例每秒支持一千次写操作
  - 可靠：使用Raft协议保证分布式系统数据的可靠性和一致性   

etcd常用使用场景：   

  - 配置管理
  - 服务发现
  - 分布式锁
  - 消息订阅发不
  - 分布式队列

## etcd常用命令
**查看集群成员**
```shell
ETCDCTL_API=3 etcdctl  --write-out=table \
--endpoints=172.16.41.17:2379 \
--cacert=/etc/kubernetes/ssl/ca.pem \
--cert=/etc/kubernetes/ssl/etcd.pem \
--key=/etc/kubernetes/ssl/etcd-key.pem member list
```

**查看集群成员健康状态**

```shell
ETCDCTL_API=3 export NODE_IPS="172.16.41.17 172.16.41.18 172.16.41.19"	#指定etcd节点地址
for ip in ${NODE_IPS};do etcdctl  --write-out=table \
--endpoints=https://${ip}:2379 \
--cacert=/etc/kubernetes/ssl/ca.pem \
--cert=/etc/kubernetes/ssl/etcd.pem \
--key=/etc/kubernetes/ssl/etcd-key.pem endpoint health ;done
```

**查看集群成员详细状态**
```shell
ETCDCTL_API=3 export NODE_IPS="172.16.41.17 172.16.41.18 172.16.41.19"
for ip in ${NODE_IPS};do etcdctl  --write-out=table \
--endpoints=https://${ip}:2379 \
--cacert=/etc/kubernetes/ssl/ca.pem \
--cert=/etc/kubernetes/ssl/etcd.pem \
--key=/etc/kubernetes/ssl/etcd-key.pem endpoint status ;done
```

**碎片整理**

```shell
ETCDCTL_API=3 export NODE_IPS="172.16.41.17 172.16.41.18 172.16.41.19"
for ip in ${NODE_IPS};do etcdctl  --write-out=table \
--endpoints=https://${ip}:2379 \
--cacert=/etc/kubernetes/ssl/ca.pem \
--cert=/etc/kubernetes/ssl/etcd.pem \
--key=/etc/kubernetes/ssl/etcd-key.pem defrag ;done
```

**查看集群所有的key**

```shell
ETCDCTL_API=3 etcdctl get / --keys-only --prefix
```

**获取key对应的值**
```shell
ETCDCTL_API=3 etcdctl get /registry/pods/default/sleep-6c94bff6c-sftq
```

**插入数据**
```shell
#插入一条数据，key是/node，value是172.16.41.20
ETCDCTL_API=3 etcdctl put /node 172.16.41.20
```

**删除数据**
```shell
#删除key为/node的数据
ETCDCTL_API=3 etcdctl delete /node
```
**watch数据**   
etcd的数据watch机制基于不断监视数据，数据发生变化时就主动通知客户端，Etcd V3的watch机制支持watch某个固定的key，也支持watch一个范围
```shell
#watch /node这个key，即使key不存在也可以watch，后期再创建
ETCDCTL_API=3 etcdctl watch /node
```

**备份数据**
```shell
#备份etcd的数据到snapshot.db这个文件
ETCDCTL_API=3 etcdctl snapshot save snapshot.db
```

**恢复数据**
```shell
#恢复备份数据到当前目录下的etcd-data目录，目录下不能有内容
etcdctl snapshot restore --data-dir=./etcd-data snapshot.db
```