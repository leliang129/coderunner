---
title: 应用监控与节点监控
description: 应用监控与节点监控
keywords: [prometheus,node_exporter]
sidebar_position: 3
---

## 应用监控
Prometheus 的数据指标是通过一个公开的 HTTP(S) 数据接口获取到的，我们不需要单独安装监控的 agent，只需要暴露一个 `metrics` 接口，Prometheus 就会定期去拉取数据；对于一些普通的 HTTP 服务，我们完全可以直接重用这个服务，添加一个 `/metrics` 接口暴露给 Prometheus
      
因此现在很多服务从一开始就内置了一个 `/metrics` 接口，比如 Kubernetes 的各个组件都直接提供了数据指标接口，有一些服务即使没有原生集成该接口，也完全可以使用一些 `exporter` 来获取到指标数据，比如 `mysqld_exporter`、`node_exporter`，这些 exporter 就有点类似于传统监控服务中的 agent，作为服务一直存在，用来收集目标服务的指标数据然后直接暴露给 Prometheus。
    
### 普通应用
对于普通应用只需要能够提供一个满足 Prometheus 格式要求的 `/metrics` 接口就可以让 Prometheus 来接管监控，比如 Kubernetes 集群中非常重要的 CoreDNS 插件，一般默认情况下就开启了 `/metrics` 接口
```shell
root@master01:~# kubectl -n kube-system get cm coredns -oyaml
apiVersion: v1
data:
  Corefile: |
    .:53 {
        errors
        health {
           lameduck 5s
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           pods insecure
           fallthrough in-addr.arpa ip6.arpa
           ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf {
           max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
kind: ConfigMap
metadata:
  creationTimestamp: "2023-05-09T06:20:43Z"
  name: coredns
  namespace: kube-system
  resourceVersion: "244"
  uid: 5e23458b-bfe8-4915-8ef7-681d9af1fc1f
```
    
上述configmap中 `prometheus:9153` 就是开启 prometheus 的插件
     
```shell
root@master01:~# kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide
NAME                       READY   STATUS    RESTARTS         AGE   IP            NODE               NOMINATED NODE   READINESS GATES
coredns-74586cf9b6-zkpnf   1/1     Running   10 (4h32m ago)   66d   10.244.2.61   node02.k8s.local   <none>           <none>
coredns-74586cf9b6-zz5v5   1/1     Running   10 (4h32m ago)   66d   10.244.2.60   node02.k8s.local   <none>           <none>
```
   
首先可以通过手动的方式去访问一下 `/metrics` 接口，看是否有数据显示
```shell
root@master01:~# curl http://10.244.2.61:9153/metrics
# HELP coredns_build_info A metric with a constant '1' value labeled by version, revision, and goversion from which CoreDNS was built.
# TYPE coredns_build_info gauge
coredns_build_info{goversion="go1.17.1",revision="13a9191",version="1.8.6"} 1
# HELP coredns_cache_entries The number of elements in the cache.
# TYPE coredns_cache_entries gauge
coredns_cache_entries{server="dns://:53",type="denial"} 34
coredns_cache_entries{server="dns://:53",type="success"} 7
# HELP coredns_cache_hits_total The count of cache hits.
# TYPE coredns_cache_hits_total counter
coredns_cache_hits_total{server="dns://:53",type="denial"} 430
coredns_cache_hits_total{server="dns://:53",type="success"} 584
# HELP coredns_cache_misses_total The count of cache misses. Deprecated, derive misses from cache hits/requests counters.
# TYPE coredns_cache_misses_total counter
coredns_cache_misses_total{server="dns://:53"} 1446
# HELP coredns_cache_requests_total The count of cache requests.
# TYPE coredns_cache_requests_total counter
coredns_cache_requests_total{server="dns://:53"} 2460
# HELP coredns_dns_request_duration_seconds Histogram of the time (in seconds) each request took per zone.
......
```
     
我们可以看到可以正常访问到，从这里可以看到 CoreDNS 的监控数据接口是正常的了，然后我们就可以将这个 `/metrics` 接口配置到 `prometheus.yml` 中去了，直接加到默认的 prometheus 这个 job 下面
```yaml title=prometheus-cm.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      scrape_timeout: 15s

    scrape_configs:
    - job_name: 'prometheus'
      static_configs:
        - targets: ['localhost:9090']

    - job_name: 'coredns'
      static_configs:
        - targets: ['10.244.2.60:9153', '10.244.2.61:9153']
```
    
`scrape_configs` 下面可以支持很多参数，例如:
  - `basic_auth` 和 `bearer_token` ：比如我们提供的 /metrics 接口需要 basic 认证的时候，通过传统的用户名/密码或者在请求的 header 中添加对应的 token 都可以支持
  - `kubernetes_sd_configs` 或 `consul_sd_configs` ：可以用来自动发现一些应用的监控数据
      
重新更新这个configmap资源对象:
```shell
root@master01:~/monitoring# kubectl apply -f prometheus-cm.yaml 
configmap/prometheus-config configured
```
     
配置文件内容变更后，隔一会儿被挂载到 Pod 中的 `prometheus.yml` 文件也会更新，由于我们之前的 Prometheus 启动参数中添加了 `--web.enable-lifecycle` 参数，所以现在我们只需要执行一个 reload 命令即可让配置生效：
```shell
# 查看prometheus pod ip
root@master01:~/monitoring# kubectl -n monitoring get pods -owide
NAME                         READY   STATUS    RESTARTS   AGE     IP            NODE               NOMINATED NODE   READINESS GATES
prometheus-5c879447f-9qv6q   1/1     Running   0          3h50m   10.244.2.64   node02.k8s.local   <none>           <none>

# 执行reload命令
root@master01:~/monitoring# curl -X POST "http://10.244.2.64:9090/-/reload"
```
>由于 ConfigMap 通过 Volume 的形式挂载到 Pod 中去的热更新需要一定的间隔时间才会生效。
    
查看Prometheus 的 Dashboard 中查看采集的目标数据：
     
![coredns监控](https://pic.imgdb.cn/item/64b0f4311ddac507ccd5a16d.jpg)
      
可以看到我们刚刚添加的 coredns 这个任务已经出现了，然后同样的我们可以切换到 Graph 下面去，我们可以找到一些 CoreDNS 的指标数据，至于这些指标数据代表什么意义，一般情况下，我们可以去查看对应的 `/metrics` 接口，里面一般情况下都会有对应的注释:
    
![coredns metrics](https://pic.imgdb.cn/item/64b0f4b01ddac507ccd780dc.jpg)
    
至此，我们就在 Prometheus 上配置了第一个 Kubernetes 应用。
     
### 使用exporter监控
上述说明了程序自带的 `/metrics` 接口可以提供给Prometheus使用，如果出现应用没有自身的 `/metrics` 接口,就需要使用官方提供的 `exporter` 服务为 Prometheus 提供指标数据。
    
Prometheus 官方为许多应用就提供了对应的 exporter 应用，也有许多第三方的实现，我们可以前往官方网站进行查看：[exporters](https://prometheus.io/docs/instrumenting/exporters/)
      
下面将使用 `redis_exporter` 来监控redis服务，对于这类应用，我们一般会以 `sidecar` 的形式和主应用部署在同一个 Pod 中，比如我们这里来部署一个 redis 应用，并用 redis-exporter 的方式来采集监控数据供 Prometheus 使用.
    
部署清单如下：
```yaml title=redis-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:4
          resources:
            requests:
              cpu: 100m
              memory: 100Mi
          ports:
            - containerPort: 6379
        - name: redis-exporter
          image: oliver006/redis_exporter:latest
          resources:
            requests:
              cpu: 100m
              memory: 100Mi
          ports:
            - containerPort: 9121
---
kind: Service
apiVersion: v1
metadata:
  name: redis
  namespace: monitoring
spec:
  selector:
    app: redis
  ports:
    - name: redis
      port: 6379
      targetPort: 6379
    - name: prom
      port: 9121
      targetPort: 9121
```
    
从清单文件中可以看出共包含两个容器，一个为redis应用的容器，另一个则是我们的redis_exporter容器，创建上述应用：
```shell
# 创建pod
root@master01:~/monitoring# kubectl apply -f redis-deploy.yaml
deployment.apps/redis created
service/redis created

# 查看pod状态
root@master01:~/monitoring# kubectl -n monitoring get pods -owide
NAME                         READY   STATUS    RESTARTS   AGE     IP            NODE               NOMINATED NODE   READINESS GATES
prometheus-5c879447f-9qv6q   1/1     Running   0          4h10m   10.244.2.64   node02.k8s.local   <none>           <none>
redis-85786844f5-7fr48       2/2     Running   0          3m43s   10.244.4.71   node04.k8s.local   <none>           <none>
```
     
通过 9121 端口来校验是否能够采集到数据：
```shell
# 查看metrics接口数据
root@master01:~/monitoring# curl http://10.244.4.71:9121/metrics
# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles.
# TYPE go_gc_duration_seconds summary
go_gc_duration_seconds{quantile="0"} 0
go_gc_duration_seconds{quantile="0.25"} 0
go_gc_duration_seconds{quantile="0.5"} 0
go_gc_duration_seconds{quantile="0.75"} 0
go_gc_duration_seconds{quantile="1"} 0
go_gc_duration_seconds_sum 0
go_gc_duration_seconds_count 0
# HELP go_goroutines Number of goroutines that currently exist.
......
```
     
同样的也需要更新prometheus的配置文件：
```yaml
- job_name: "redis"
  static_configs:
    - targets: ["redis:9121"]  # 同一个命名空间内，可以直接使用service_name通信
```
    
由于redis_exporter和redis应用处在同一命名空间内，所以可以直接通过service_name去通信。    
更新配置文件，重新加载：
```shell
root@master01:~/monitoring# kubectl apply -f prometheus-cm.yaml
configmap/prometheus-config configured

#重新加载
root@master01:~/monitoring# curl -X POST "http://10.244.2.64:9090/-/reload"
```
    
再去 Prometheus 的 dashboard 中查看采集的目标数据：
     
![redis exporter](https://pic.imgdb.cn/item/64b0f9711ddac507ccec3c18.jpg)
     
从 Prometheus 页面上可以看到，redis的监控已经生效。
    
切换到 Graph 下面可以看到很多关于 redis 的指标数据:      
     
![redis metrics](https://pic.imgdb.cn/item/64b0fa521ddac507ccefd707.jpg)

## 节点监控
   
上次说到了用Promethues 来监控 Kubernetes 集群中的应用，但是对于 Kubernetes 集群本身的监控也是非常重要的，我们需要时时刻刻了解集群的运行状态。
     
### 监控方案
     
对于集群的监控一般我们需要考虑以下几个方面： 
  - Kubernetes 节点的监控：比如节点的 cpu、load、disk、memory 等指标
  - 内部系统组件的状态：比如 kube-scheduler、kube-controller-manager、kubedns/coredns 等组件的详细运行状态
  - 编排级的 metrics：比如 Deployment 的状态、资源请求、调度和 API 延迟等数据指标

Kubernetes 集群的监控方案目前主要有以下几种方案：
  - `cAdvisor` [：cAdvisor](https://github.com/google/cadvisor) 是 Google 开源的容器资源监控和性能分析工具，它是专门为容器而生，本身也支持 Docker 容器。
  - `kube-state-metrics`：[kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) 通过监听 API Server 生成有关资源对象的状态指标，比如 Deployment、Node、Pod，需要注意的是 kube-state-metrics 只是简单提供一个 metrics 数据，并不会存储这些指标数据，所以我们可以使用 Prometheus 来抓取这些数据然后存储。
  - `metrics-server`：metrics-server 也是一个集群范围内的资源数据聚合工具，是 Heapster 的替代品，同样的，metrics-server 也只是显示数据，并不提供数据存储服务。
     
不过 kube-state-metrics 和 metrics-server 之间还是有很大不同的，二者的主要区别如下：
  - kube-state-metrics 主要关注的是业务相关的一些元数据，比如 Deployment、Pod、副本状态等
  - metrics-server 主要关注的是资源度量 API 的实现，比如 CPU、文件描述符、内存、请求延时等指标。
     
### 监控集群节点
要监控节点同样我们这里使用 [node_exporter](https://github.com/prometheus/node_exporter)，由于每个节点我们都需要获取到监控指标数据，所以我们可以通过 DaemonSet 控制器来部署该服务，这样每一个节点都会自动运行一个 node-exporter 的 Pod，如果我们从集群中删除或者添加节点后，也会进行自动扩展。    
     
如下资源清单：
```yaml title=prometheus-node.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: monitoring
  labels:
    app: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      hostPID: true
      hostIPC: true
      hostNetwork: true
      nodeSelector:
        kubernetes.io/os: linux
      containers:
        - name: node-exporter
          image: prom/node-exporter:v1.3.1
          args:
            - --web.listen-address=$(HOSTIP):9100
            - --path.procfs=/host/proc
            - --path.sysfs=/host/sys
            - --path.rootfs=/host/root
            - --no-collector.hwmon # 禁用不需要的一些采集器
            - --no-collector.nfs
            - --no-collector.nfsd
            - --no-collector.nvme
            - --no-collector.dmi
            - --no-collector.arp
            - --collector.filesystem.ignored-mount-points=^/(dev|proc|sys|var/lib/containerd/.+|/var/lib/docker/.+|var/lib/kubelet/pods/.+)($|/)
            - --collector.filesystem.ignored-fs-types=^(autofs|binfmt_misc|cgroup|configfs|debugfs|devpts|devtmpfs|fusectl|hugetlbfs|mqueue|overlay|proc|procfs|pstore|rpc_pipefs|securityfs|sysfs|tracefs)$
          ports:
            - containerPort: 9100
          env:
            - name: HOSTIP
              valueFrom:
                fieldRef:
                  fieldPath: status.hostIP
          resources:
            requests:
              cpu: 150m
              memory: 180Mi
            limits:
              cpu: 150m
              memory: 180Mi
          securityContext:
            runAsNonRoot: true
            runAsUser: 65534
          volumeMounts:
            - name: proc
              mountPath: /host/proc
            - name: sys
              mountPath: /host/sys
            - name: root
              mountPath: /host/root
              mountPropagation: HostToContainer
              readOnly: true
      tolerations: # 添加容忍
        - operator: "Exists"
      volumes:
        - name: proc
          hostPath:
            path: /proc
        - name: dev
          hostPath:
            path: /dev
        - name: sys
          hostPath:
            path: /sys
        - name: root
          hostPath:
            path: /
```
    
由于我们要获取到的数据是主机的监控指标数据，而我们的 `node-exporter` 是运行在容器中的，所以我们在 Pod 中需要配置一些 Pod 的安全策略，这里我们就添加了 `hostPID: true`、`hostIPC: true`、`hostNetwork: true` 3 个策略，用来使用主机的 `PID namespace`、`IPC namespace` 以及主机网络，这些 namespace 就是用于容器隔离的关键技术，要注意这里的 namespace 和集群中的 namespace 是两个完全不相同的概念。
    
另外我们还将主机的 `/dev`、`/proc`、`/sys` 这些目录挂载到容器中，这些因为我们采集的很多节点数据都是通过这些文件夹下面的文件来获取到的，比如我们在使用 `top` 命令可以查看当前 cpu 使用情况，数据就来源于文件 `/proc/stat`，使用 `free` 命令可以查看当前内存使用情况，其数据来源是来自 `/proc/meminfo` 文件。
     
另外由于我们集群使用的是 `kubeadm` 搭建的，所以如果希望 master 节点也一起被监控，则需要添加相应的容忍，然后直接创建上面的资源对象：
```shell
root@master01:~/monitoring# kubectl apply -f prometheus-node.yaml
daemonset.apps/node-exporter created

# 查看pod运行状态
root@master01:~/monitoring# kubectl -n monitoring get pods -l app=node-exporter -owide
NAME                  READY   STATUS    RESTARTS   AGE     IP             NODE                 NOMINATED NODE   READINESS GATES
node-exporter-6qfcv   1/1     Running   0          5m29s   172.16.41.22   node02.k8s.local     <none>           <none>
node-exporter-8qbwr   1/1     Running   0          5m29s   172.16.41.23   node03.k8s.local     <none>           <none>
node-exporter-nlw7c   1/1     Running   0          5m29s   172.16.41.20   master01.k8s.local   <none>           <none>
node-exporter-pzggv   1/1     Running   0          5m29s   172.16.41.21   node01.k8s.local     <none>           <none>
node-exporter-vd87w   1/1     Running   0          5m29s   172.16.41.24   node04.k8s.local     <none>           <none>
```
      
部署完成后，我们可以看到在 5 个节点上都运行了一个 Pod，由于我们指定了 `hostNetwork=true`，所以在每个节点上就会绑定一个端口 9100，我们可以通过这个端口去获取到监控指标数据：
```shell
# 查看node节点的metrics
root@master01:~/monitoring# curl http://172.16.41.22:9100/metrics
......
# TYPE go_gc_duration_seconds summary
go_gc_duration_seconds{quantile="0"} 6.4176e-05
go_gc_duration_seconds{quantile="0.25"} 6.4176e-05
go_gc_duration_seconds{quantile="0.5"} 6.4176e-05
go_gc_duration_seconds{quantile="0.75"} 6.4176e-05
go_gc_duration_seconds{quantile="1"} 6.4176e-05
go_gc_duration_seconds_sum 6.4176e-05
go_gc_duration_seconds_count 1
# HELP go_goroutines Number of goroutines that currently exist.
# TYPE go_goroutines gauge
go_goroutines 7
# HELP go_info Information about the Go environment.
......
```
     
更新Prometheus配置文件：
```yaml
- job_name: 'node_exporter'
  static_configs:
    - targets: ['172.16.41.20:9100','172.16.41.21:9100','172.16.41.22:9100','172.16.41.23:9100','172.16.41.24:9100']
```
    
重新apply这个 configmap 资源对象：
```shell
root@master01:~/monitoring# kubectl apply -f prometheus-cm.yaml
configmap/prometheus-config configured

# 热更新prometheus配置文件
root@master01:~/monitoring# curl -X POST "http://10.244.2.64:9090/-/reload"
```
     
返回 Prometheus 的 Dashboard 中查看采集的目标数据：
     
![node exporter targets](https://pic.imgdb.cn/item/64b103541ddac507cc132afe.jpg)