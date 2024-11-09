---
title: 服务发现
description: 服务发现
keywords: [prometheus,node_exporter，service-discover]
---

# 服务发现

由于我们这里每个节点上面都运行了 `node-exporter` 程序，当然我们也可以手动的把所有节点用静态的方式配置到 Prometheus 中去，但是以后要新增或者去掉节点的时候就还得手动去配置，那么有没有一种方式可以让 Prometheus 去自动发现我们节点的 `node-exporter` 程序，并且按节点进行分组呢？这就是 Prometheus 里面非常重要的**服务发现**功能。
      
## 节点发现
在 Kubernetes 下，Promethues 通过与 Kubernetes API 集成，主要支持 5 中服务发现模式，分别是：`Node` 、`Service` 、`Pod` 、`Endpoints` 、`Ingress`。
         
我们通过 kubectl 命令可以很方便的获取到当前集群中的所有节点信息：
```shell
root@master-1:~# kubectl get nodes
NAME       STATUS   ROLES           AGE    VERSION
master-1   Ready    control-plane   150d   v1.24.3
node-1     Ready    <none>          150d   v1.24.3
node-2     Ready    <none>          150d   v1.24.3
node-3     Ready    <none>          145d   v1.24.3
node-4     Ready    <none>          21d    v1.24.3
```
但是要让 Prometheus 也能够获取到当前集群中的所有节点信息的话，我们就需要利用 Node 的服务发现模式，同样的，在 `prometheus.yml` 文件中配置如下的 job 任务即可：
```yaml
- job_name: 'nodes'
  kubernetes_sd_configs:
    - role: node
```
通过指定 `kubernetes_sd_configs` 的模式为node，Prometheus 就会自动从 Kubernetes 中发现所有的 `node` 节点并作为当前 job 监控的目标实例，发现的节点 `/metrics` 接口是默认的 kubelet 的 HTTP 接口。
      
prometheus 的 ConfigMap 更新完成后，同样的我们执行 reload 操作，让配置生效：
```shell
root@master-1:~/monitor# kubectl apply -f prometheus-cm.yaml

# 隔一会儿执行reload操作
curl -X POST "http://10.244.3.168:9090/-/reload"
```