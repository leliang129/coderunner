---
title: Prometheus的简介与安装
description: Prometheus的简介与安装
keywords: [prometheus,alertmanager,node_exporter]
sidebar_position: 2
---
## Prometheus简介   
   

[Prometheus官网地址： https://prometheus.io](https://prometheus.io/)
   

Prometheus是一款开源的监控系统和时间序列数据库，由SoundCloud开发并于2012年发布。它被广泛应用于容器化环境、云原生架构和微服务体系中。

以下是Prometheus的一些关键特性和概念：

  - 多维度数据模型： Prometheus使用多维度数据模型来描述监控数据。每个时间序列数据都由标识和一组键值对标签（labels）唯一标识。这样可以实现更灵活的查询和聚合。
    
  - 灵活的查询语言： Prometheus提供了PromQL查询语言，可以进行丰富的数据查询和分析操作。用户可以根据需要组合、聚合和过滤监控数据。
   
  - 实时监控和警报： Prometheus具有实时监控能力，可以按照设定的规则进行实时监测，并生成警报。用户可以定义自定义的警报规则，并通过警报通知渠道（如电子邮件、Slack等）接收警报信息。
  
  - 可视化和仪表盘： Prometheus提供了基本的数据可视化功能，并支持与Grafana等外部仪表盘工具集成，以实现更强大的数据可视化和监控仪表盘。
  
  - 可扩展性和高度可靠性： Prometheus的设计考虑了可扩展性和高度可靠性。它支持分布式架构，并具有自动发现和自动配置的能力。可以通过添加额外的Prometheus实例和使用适当的存储解决方案来实现水平扩展和高可用性。
   
  - 开放的生态系统： Prometheus具有活跃的开源社区，提供了丰富的插件和集成，以扩展和定制其功能。它可以与各种应用和系统集成，包括容器编排平台（如Kubernetes）、云服务提供商和各种监控和警报工具。   
   

:::tip
总的来说，Prometheus是一个功能强大、易于使用和高度可扩展的监控系统，适用于监控和分析各种类型的系统、服务和应用程序。它为用户提供了实时监控、警报、可视化和数据查询等功能，帮助用户更好地了解系统的性能和健康状态。
:::
   
**Prometheus组件介绍：**
   
  - prometheus server：主服务，接受外部http请求，收集、存储与查询数据等
  - prometheus targets: 静态收集的⽬标服务数据
  - service discovery：动态发现服务
  - prometheus alerting：报警通知
  - push gateway：数据收集代理服务器(类似于zabbix proxy)
  - data visualization and export： 数据可视化与数据导出(访问客户端)   
   
**Prometheus架构图:**   
   

![prometheus架构图](https://pic.imgdb.cn/item/64a8179d1ddac507ccfb8b98.png)

## kubernetes安装Prometheus
         
### 安装
    
由于我们这里是要运行在 Kubernetes 系统中，所以我们直接用 Docker 镜像的方式运行。这里我们使用的实验环境是基于 Kubernetes v1.24.3 版本
```shell
root@master01:~# kubectl get nodes
NAME                 STATUS   ROLES           AGE   VERSION
master01.k8s.local   Ready    control-plane   65d   v1.24.3
node01.k8s.local     Ready    <none>          65d   v1.24.3
node02.k8s.local     Ready    <none>          65d   v1.24.3
node03.k8s.local     Ready    <none>          65d   v1.24.3
node04.k8s.local     Ready    <none>          65d   v1.24.3
```
     
为了方便管理，我们将监控相关的所有资源对象都安装在 `monitoring` 这个 namespace 下面，没有的话可以提前创建：
      
```shell
# 创建命名空间
root@master01:~# kubectl create ns monitoring
namespace/monitoring created
```
     
为了能够方便的管理配置文件，我们这里将 `prometheus.yml` 配置文件用 `ConfigMap` 的形式进行管理
     
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
```
    
我们这里暂时只配置了对 `prometheus` 本身的监控，直接创建该资源对象
```shell
root@master01:~/monitoring# kubectl apply -f prometheus-cm.yaml 
configmap/prometheus-config created
```
      
配置文件创建完成了，以后如果我们有新的资源需要被监控，我们只需要将上面的 ConfigMap 对象更新即可。现在我们来创建 prometheus 的 Pod 资源
```yaml title=prometheus-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
  labels:
    app: prometheus
spec:
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
        - image: prom/prometheus:v2.31.1
          name: prometheus
          args:
            - '--config.file=/etc/prometheus/prometheus.yml'
            - '--storage.tsdb.path=/prometheus' # 指定tsdb数据路径
            - '--storage.tsdb.retention.time=24h'
            - '--web.enable-admin-api' # 控制对admin HTTP API的访问，其中包括删除时间序列等功能
            - '--web.enable-lifecycle' # 支持热更新，直接执行localhost:9090/-/reload立即生效
          ports:
            - containerPort: 9090
              name: http
          volumeMounts:
            - mountPath: '/etc/prometheus'
              name: config-volume
            - mountPath: '/prometheus'
              name: data
          resources:
            requests:
              cpu: 200m
              memory: 1024Mi
            limits:
              cpu: 200m
              memory: 1024Mi
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: prometheus-data
        - configMap:
            name: prometheus-config
          name: config-volume
```
     
### 持久化数据
     
另外为了 prometheus 的性能和数据持久化我们这里是直接将通过一个 LocalPV 来进行数据持久化的，注意一定不能使用 nfs 来持久化数据，通过 `--storage.tsdb.path=/prometheus` 指定数据目录，创建如下所示的一个 PVC 资源对象，注意是一个 LocalPV，和 node2 节点具有亲和性

```yaml title=prometheus-pvpvc.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: prometheus-local
  labels:
    app: prometheus
spec:
  accessModes:
    - ReadWriteOnce
  capacity:
    storage: 20Gi
  storageClassName: local-storage
  local:
    path: /data/k8s/prometheus
  persistentVolumeReclaimPolicy: Retain
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - node02.k8s.local
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: prometheus-data
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: prometheus
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: local-storage
```
    
由于 prometheus 可以访问 Kubernetes 的一些资源对象，所以需要配置 rbac 相关认证，这里我们使用了一个名为 prometheus 的 serviceAccount 对象
     
```yaml title=prometheus-rbac.yaml
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: monitoring
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
  - apiGroups:
      - ''
    resources:
      - nodes
      - services
      - endpoints
      - pods
      - nodes/proxy
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - 'extensions'
    resources:
      - ingresses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - ''
    resources:
      - configmaps
      - nodes/metrics
    verbs:
      - get
  - nonResourceURLs:
      - /metrics
    verbs:
      - get
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
  - kind: ServiceAccount
    name: prometheus
    namespace: monitoring
```
     
由于我们要获取的资源信息，在每一个 namespace 下面都有可能存在，所以我们这里使用的是 `ClusterRole` 的资源对象，值得一提的是我们这里的权限规则声明中有一个 `nonResourceURLs` 的属性，是用来对非资源型 metrics 进行操作的权限声明，这个在以前我们很少遇到过，然后直接创建上面的资源对象即可
     
```shell
root@master01:~/monitoring# kubectl apply -f prometheus-rbac.yaml
serviceaccount/prometheus created
clusterrole.rbac.authorization.k8s.io/prometheus created
clusterrolebinding.rbac.authorization.k8s.io/prometheus created
```
     
现在我们就可以添加 promethues 的资源对象了
     
```shell
root@master01:~/monitoring# kubectl apply -f prometheus-deploy.yaml 
deployment.apps/prometheus created

# 查看pod状态
root@master01:~/monitoring# kubectl -n monitoring get pods 
NAME                          READY   STATUS   RESTARTS      AGE
prometheus-6d7f58745c-g46ch   0/1     Error    3 (28s ago)   79s

# 查看错误日志
root@master01:~/monitoring# kubectl -n monitoring logs -f prometheus-6d7f58745c-g46ch 
ts=2023-07-14T02:55:54.404Z caller=main.go:444 level=info msg="Starting Prometheus" version="(version=2.31.1, branch=HEAD, revision=411021ada9ab41095923b8d2df9365b632fd40c3)"
ts=2023-07-14T02:55:54.404Z caller=main.go:449 level=info build_context="(go=go1.17.3, user=root@9419c9c2d4e0, date=20211105-20:35:02)"
ts=2023-07-14T02:55:54.404Z caller=main.go:450 level=info host_details="(Linux 5.4.0-153-generic #170-Ubuntu SMP Fri Jun 16 13:43:31 UTC 2023 x86_64 prometheus-6d7f58745c-g46ch (none))"
ts=2023-07-14T02:55:54.404Z caller=main.go:451 level=info fd_limits="(soft=1048576, hard=1048576)"
ts=2023-07-14T02:55:54.404Z caller=main.go:452 level=info vm_limits="(soft=unlimited, hard=unlimited)"
ts=2023-07-14T02:55:54.405Z caller=query_logger.go:87 level=error component=activeQueryTracker msg="Error opening query log file" file=/prometheus/queries.active err="open /prometheus/queries.active: permission denied"
panic: Unable to create mmap-ed active query log

goroutine 1 [running]:
github.com/prometheus/prometheus/promql.NewActiveQueryTracker({0x7fff17f57e00, 0xb}, 0x14, {0x34442c0, 0xc0004bb9f0})
        /app/promql/query_logger.go:117 +0x3d7
main.main()
        /app/cmd/prometheus/main.go:491 +0x6bbf
```
      
### 权限
    
创建 Pod 后，我们可以看到并没有成功运行，出现了 `open /prometheus/queries.active: permission denied` 这样的错误信息，这是因为我们的 prometheus 的镜像中是使用的 nobody 这个用户，然后现在我们通过 LocalPV 挂载到宿主机上面的目录的 `ownership` 却是 `root`:
```shell
root@node02:~# ls -l /data/k8s/
total 4
drwxr-xr-x 2 root root 4096 Jul 14 10:50 prometheus
```
      
所以当然会出现操作权限问题了，这个时候我们就可以通过 `securityContext` 来为 Pod 设置下 volumes 的权限，通过设置 `runAsUser=0` 指定运行的用户为 root，也可以通过设置一个 `initContainer` 来修改数据目录权限
```yaml
initContainers:
- name: fix-permissions
  image: busybox
  command: [chown, -R, "nobody:nobody", /prometheus]
  volumeMounts:
  - name: data
    mountPath: /prometheus
```
      
重新更新一个`prometheus-deploy.yaml`文件
```shell
root@master01:~/monitoring# kubectl apply -f prometheus-deploy.yaml 
deployment.apps/prometheus configured

# 查看容器状态
root@master01:~/monitoring# kubectl -n monitoring get pods
NAME                         READY   STATUS    RESTARTS   AGE
prometheus-5c879447f-9qv6q   1/1     Running   0          46s

# 查看容器日志
root@master01:~/monitoring# kubectl -n monitoring logs -f prometheus-5c879447f-9qv6q 
Defaulted container "prometheus" out of: prometheus, fix-permissions (init)
ts=2023-07-14T03:10:13.118Z caller=main.go:444 level=info msg="Starting Prometheus" version="(version=2.31.1, branch=HEAD, revision=411021ada9ab41095923b8d2df9365b632fd40c3)"
ts=2023-07-14T03:10:13.118Z caller=main.go:449 level=info build_context="(go=go1.17.3, user=root@9419c9c2d4e0, date=20211105-20:35:02)"
ts=2023-07-14T03:10:13.118Z caller=main.go:450 level=info host_details="(Linux 5.4.0-153-generic #170-Ubuntu SMP Fri Jun 16 13:43:31 UTC 2023 x86_64 prometheus-5c879447f-9qv6q (none))"
ts=2023-07-14T03:10:13.118Z caller=main.go:451 level=info fd_limits="(soft=1048576, hard=1048576)"
ts=2023-07-14T03:10:13.118Z caller=main.go:452 level=info vm_limits="(soft=unlimited, hard=unlimited)"
ts=2023-07-14T03:10:13.205Z caller=web.go:542 level=info component=web msg="Start listening for connections" address=0.0.0.0:9090
ts=2023-07-14T03:10:13.206Z caller=main.go:839 level=info msg="Starting TSDB ..."
ts=2023-07-14T03:10:13.208Z caller=tls_config.go:195 level=info component=web msg="TLS is disabled." http2=false
ts=2023-07-14T03:10:13.209Z caller=head.go:479 level=info component=tsdb msg="Replaying on-disk memory mappable chunks if any"
ts=2023-07-14T03:10:13.209Z caller=head.go:513 level=info component=tsdb msg="On-disk memory mappable chunks replay completed" duration=2.474µs
ts=2023-07-14T03:10:13.209Z caller=head.go:519 level=info component=tsdb msg="Replaying WAL, this may take a while"
ts=2023-07-14T03:10:13.210Z caller=head.go:590 level=info component=tsdb msg="WAL segment loaded" segment=0 maxSegment=0
ts=2023-07-14T03:10:13.210Z caller=head.go:596 level=info component=tsdb msg="WAL replay completed" checkpoint_replay_duration=27.869µs wal_replay_duration=257.679µs total_replay_duration=307.596µs
ts=2023-07-14T03:10:13.211Z caller=main.go:866 level=info fs_type=EXT4_SUPER_MAGIC
ts=2023-07-14T03:10:13.211Z caller=main.go:869 level=info msg="TSDB started"
ts=2023-07-14T03:10:13.211Z caller=main.go:996 level=info msg="Loading configuration file" filename=/etc/prometheus/prometheus.yml
ts=2023-07-14T03:10:13.212Z caller=main.go:1033 level=info msg="Completed loading of configuration file" filename=/etc/prometheus/prometheus.yml totalDuration=1.55303ms db_storage=933ns remote_storage=1.444µs web_handler=486ns query_engine=1.306µs scrape=1.296118ms scrape_sd=29.621µs notify=930ns notify_sd=4.408µs rules=1.359µs
ts=2023-07-14T03:10:13.212Z caller=main.go:811 level=info msg="Server is ready to receive web requests."
```
     
Pod 创建成功后，为了能够在外部访问到 prometheus 的 webui 服务，我们还需要创建一个 `NodePort` 类型的Service 对象
```yaml title=prometheus-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: monitoring
  labels:
    app: prometheus
spec:
  selector:
    app: prometheus
  type: NodePort
  ports:
    - name: web
      port: 9090
      targetPort: http
```
    
也可以创建 `Ingress` 对象，通过域名来进行访问
     
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prometheus
  namespace: monitoring
spec:
  ingressClassName: nginx
  rules:
    - host: prometheus.k8s.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: 
                name: prometheus
                port:
                  number: 9090
```
```shell
# 创建上述资源
root@master01:~/monitoring# kubectl apply -f prometheus-svc.yaml
service/prometheus created

# 查看暴露的NodePort端口
root@master01:~/monitoring# kubectl -n monitoring get svc
NAME         TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
prometheus   NodePort   10.109.15.202   <none>        9090:31846/TCP   5s

或者

# 创建上述资源
root@master01:~/monitoring# kubectl apply -f prometheus-ingress.yaml 
ingress.networking.k8s.io/prometheus created

# 查看创建的ingress资源
root@master01:~/monitoring# kubectl -n monitoring get ingress
NAME         CLASS   HOSTS                  ADDRESS   PORTS   AGE
prometheus   nginx   prometheus.k8s.local             80      3m57s
```
      
如上所述，通过`http://任意节点IP:31846`访问 prometheus 的 webui 服务即可
     
![prometheus ui](https://pic.imgdb.cn/item/64b0bed21ddac507cc0b770f.jpg)
     
