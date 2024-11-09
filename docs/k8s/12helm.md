---
title: Helm
description: Helm
keywords: [helm, k8s]
sidebar_position: 11
---
Helm 可以帮助我们管理 Kubernetes 应用程序 - Helm Charts 可以定义、安装和升级复杂的 Kubernetes 应用程序，Charts 包很容易创建、版本管理、分享和分布。     
Helm 对于 Kubernetes 来说就相当于 yum 对于 Centos 来说，如果没有 yum 的话，我们在 Centos 下面要安装一些应用程序是极度麻烦的，同样的，对于越来越复杂的 Kubernetes 应用程序来说，如果单纯依靠我们去手动维护应用程序的 YAML 资源清单文件来说，成本也是巨大的。
     
## 安装
### 安装helm
      
首先当然需要一个可用的 Kubernetes 集群，然后在我们使用 Helm 的节点上已经配置好可以通过 kubectl 访问集群，因为 Helm 其实就是读取的 kubeconfig 文件来访问集群的。    
      
由于 Helm V2 版本必须在 Kubernetes 集群中安装一个 Tiller 服务进行通信，这样大大降低了其安全性和可用性，所以在 V3 版本中移除了服务端，采用了通用的 Kubernetes CRD 资源来进行管理，这样就只需要连接上 Kubernetes 即可，而且 V3 版本已经发布了稳定版，所以我们这里来安装最新的 v3.8.0 版本，软件包下载地址为：[https://github.com/helm/helm/releases](https://github.com/helm/helm/releases)
       
根据自己系统选择合适的版本下载安装。
      
下载到本地解压后，将 helm 二进制包文件移动到任意的 PATH 路径下即可
```shell
# 下载安装包
root@master-1:~# wget https://get.helm.sh/helm-v3.9.4-linux-amd64.tar.gz

# 解压
root@master-1:~# tar xvf helm-v3.9.4-linux-amd64.tar.gz 
linux-amd64/
linux-amd64/helm
linux-amd64/LICENSE
linux-amd64/README.md

# 复制二级制文件到PATH
root@master-1:~# cd linux-amd64/
root@master-1:~/linux-amd64# ls -l
total 45304
-rwxr-xr-x 1 3434 3434 46374912 Aug 25  2022 helm    # 可执行文件
-rw-r--r-- 1 3434 3434    11373 Aug 25  2022 LICENSE
-rw-r--r-- 1 3434 3434     3367 Aug 25  2022 README.md

root@master-1:~/linux-amd64# mv helm /usr/local/bin/

# 验证
root@master-1:~# helm version
version.BuildInfo{Version:"v3.9.4", GitCommit:"dbc6d8e20fe1d58d50e6ed30f09a04a77e4c68db", GitTreeState:"clean", GoVersion:"go1.17.13"}
```
      
看到上面的版本信息证明已经成功了。
      

### 添加chart仓库
接下来可以添加 chart 仓库，当然最常用的就是官方的 Helm stable charts 仓库，但是由于官方的 charts 仓库地址需要科学上网，我们可以使用微软的 charts 仓库代替：
```shell
# 添加仓库
root@master-1:~# helm repo add stable http://mirror.azure.cn/kubernetes/charts/
"stable" has been added to your repositories

# 查看已有仓库
root@master-1:~# helm repo ls
NAME                           	URL                                                                                             
stable                         	http://mirror.azure.cn/kubernetes/charts/ 
```
     
安装完成后可以用 search 命令来搜索可以安装的 chart 包：
```shell
root@master-1:~# helm search repo stable
NAME                                 	CHART VERSION	APP VERSION            	DESCRIPTION                                       
stable/acs-engine-autoscaler         	2.2.2        	2.1.1                  	DEPRECATED Scales worker nodes within agent pools 
stable/aerospike                     	0.3.5        	v4.5.0.5               	DEPRECATED A Helm chart for Aerospike in Kubern...
stable/airflow                       	7.13.3       	1.10.12                	DEPRECATED - please use: https://github.com/air...
stable/ambassador                    	5.3.2        	0.86.1                 	DEPRECATED A Helm chart for Datawire Ambassador   
stable/anchore-engine                	1.7.0        	0.7.3                  	Anchore container analysis and policy evaluatio...
stable/apm-server                    	2.1.7        	7.0.0                  	DEPRECATED The server receives data from the El...
stable/ark                           	4.2.2        	0.10.2                 	DEPRECATED A Helm chart for ark                   
stable/artifactory                   	7.3.2        	6.1.0                  	DEPRECATED Universal Repository Manager support...
stable/artifactory-ha                	0.4.2        	6.2.0                  	DEPRECATED Universal Repository Manager support...
stable/atlantis                      	3.12.4       	v0.14.0                	DEPRECATED A Helm chart for Atlantis https://ww...
stable/auditbeat                     	1.1.2        	6.7.0                  	DEPRECATED A lightweight shipper to audit the a...
......
```

## 示例
### 安装MySQL
为了安装一个 chart 包，我们可以使用 `helm install` 命令，Helm 有多种方法来找到和安装 chart 包，但是最简单的方法当然是使用官方的 `stable` 这个仓库直接安装：  
    
首先从仓库中将可用的 charts 信息同步到本地，可以确保我们获取到最新的 charts 列表：
     
```shell
# 更新chart仓库
root@master-1:~# helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "stable" chart repository
Update Complete. ⎈ Happy Helming!⎈
```
     
现在已安装一个 `MySQL` 为例：
```shell
root@master-1:~# helm install stable/mysql --generate-name
WARNING: This chart is deprecated
NAME: mysql-1689336108
LAST DEPLOYED: Fri Jul 14 20:01:49 2023
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
MySQL can be accessed via port 3306 on the following DNS name from within your cluster:
mysql-1689336108.default.svc.cluster.local

To get your root password run:

    MYSQL_ROOT_PASSWORD=$(kubectl get secret --namespace default mysql-1689336108 -o jsonpath="{.data.mysql-root-password}" | base64 --decode; echo)

To connect to your database:

1. Run an Ubuntu pod that you can use as a client:

    kubectl run -i --tty ubuntu --image=ubuntu:16.04 --restart=Never -- bash -il

2. Install the mysql client:

    $ apt-get update && apt-get install mysql-client -y

3. Connect using the mysql cli, then provide your password:
    $ mysql -h mysql-1689336108 -p

To connect to your database directly from outside the K8s cluster:
    MYSQL_HOST=127.0.0.1
    MYSQL_PORT=3306

    # Execute the following command to route the connection:
    kubectl port-forward svc/mysql-1689336108 3306

    mysql -h ${MYSQL_HOST} -P${MYSQL_PORT} -u root -p${MYSQL_ROOT_PASSWORD}
```
    
我们可以看到 `stable/mysql` 这个 chart 已经安装成功了，我们将安装成功的这个应用叫做一个 `release` ，由于我们在安装的时候指定了 `--generate-name` 参数，所以生成的 release 名称是随机生成的，名为 `mysql-1689336108`。我们可以用下面的命令来查看 release 安装以后对应的 Kubernetes 资源的状态：
```shell
root@master-1:~# kubectl get all -l release=mysql-1689336108
NAME                                    READY   STATUS            RESTARTS   AGE
pod/mysql-1689336108-5c997d5598-w47ml   0/2     PodInitializing   0          53s

NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/mysql-1689336108   ClusterIP   10.110.110.143   <none>        3306/TCP   54s

NAME                               READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/mysql-1689336108   0/1     1            0           54s

NAME                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/mysql-1689336108-5c997d5598   1         1         0       53s
```
     
我们也可以 `helm show chart` 命令来了解 MySQL 这个 chart 包的一些特性：
```shell
root@master-1:~# helm show chart stable/mysql
apiVersion: v1
appVersion: 5.7.30
deprecated: true
description: DEPRECATED - Fast, reliable, scalable, and easy to use open-source relational
  database system.
home: https://www.mysql.com/
icon: https://www.mysql.com/common/logos/logo-mysql-170x115.png
keywords:
- mysql
- database
- sql
name: mysql
sources:
- https://github.com/kubernetes/charts
- https://github.com/docker-library/mysql
version: 1.6.9
```

如果想要了解更多信息，可以用 `helm show all` 命令：
```shell
root@master-1:~# helm show all stable/mysql
......
```
     
需要注意的是无论什么时候安装 chart，都会创建一个新的 release，所以一个 chart 包是可以多次安装到同一个集群中的，每个都可以独立管理和升级。

同样我们也可以用 Helm 很容易查看到已经安装的 release：
```shell
root@master-1:~# helm ls
NAME            	NAMESPACE	REVISION	UPDATED                                	STATUS  	CHART      	APP VERSION
mysql-1689336108	default  	1       	2023-07-14 20:01:49.683483253 +0800 CST	deployed	mysql-1.6.9	5.7.30 
```
     
如果需要删除这个 release，也很简单，只需要使用 `helm uninstall` 命令即可：
```shell
root@master-1:~# helm uninstall mysql-1689336108
release "mysql-1689336108" uninstalled

root@master-1:~# kubectl get all -l release=mysql-1689336108
No resources found in default namespace.

root@master-1:~# helm status mysql-1689336108
Error: release: not found
```
     
`uninstall` 命令会从 Kubernetes 中删除 release，也会删除与 release 相关的所有 Kubernetes 资源以及 release 历史记录。也可以在删除的时候使用 `--keep-history` 参数，则会保留 release 的历史记录，可以获取该 release 的状态就是 `UNINSTALLED` ，而不是找不到 release了:
```shell
root@master-1:~# helm uninstall mysql-1689337366 --keep-history
release "mysql-1689337366" uninstalled


root@master-1:~# helm status mysql-1689337366
NAME: mysql-1689337366
LAST DEPLOYED: Fri Jul 14 20:22:47 2023
NAMESPACE: default
STATUS: uninstalled
REVISION: 1
NOTES:
MySQL can be accessed via port 3306 on the following DNS name from within your cluster:
mysql-1689337366.default.svc.cluster.local
.......
```
     
### 定制安装MySQL
以上都是直接使用的 `helm install` 命令安装的 chart 包，这种情况下只会使用 chart 的默认配置选项，但是更多的时候，是各种各样的需求，索引我们希望根据自己的需求来定制 `chart` 包的配置参数。
    
我们可以使用 `helm show values` 命令来查看一个 chart 包的所有可配置的参数选项：
```yaml
root@master-1:~# helm show values stable/mysql
## mysql image version
## ref: https://hub.docker.com/r/library/mysql/tags/
##
image: "mysql"
imageTag: "5.7.30"

strategy:
  type: Recreate

busybox:
  image: "busybox"
  tag: "1.32"

testFramework:
  enabled: true
  image: "bats/bats"
  tag: "1.2.1"
  imagePullPolicy: IfNotPresent
  securityContext: {}
......
```
    
上面我们看到的所有参数都是可以用自己的数据来覆盖的，可以在安装的时候通过 YAML 格式的文件来传递这些参数：
    
```yaml
root@master-1:~# vim values.yaml
root@master-1:~# cat values.yaml 
mysqlUser:
  user0
mysqlPassword: user0pwd
mysqlDatabase: user0db
persistence:
  enabled: false
```
   
使用自定义的values值安装MySQL：
```shell
root@master-1:~# helm install mysql stable/mysql -f values.yaml 
WARNING: This chart is deprecated
NAME: mysql
LAST DEPLOYED: Fri Jul 14 20:36:57 2023
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
MySQL can be accessed via port 3306 on the following DNS name from within your cluster:
mysql.default.svc.cluster.local

To get your root password run:

    MYSQL_ROOT_PASSWORD=$(kubectl get secret --namespace default mysql -o jsonpath="{.data.mysql-root-password}" | base64 --decode; echo)

To connect to your database:

1. Run an Ubuntu pod that you can use as a client:

    kubectl run -i --tty ubuntu --image=ubuntu:16.04 --restart=Never -- bash -il

2. Install the mysql client:

    $ apt-get update && apt-get install mysql-client -y

3. Connect using the mysql cli, then provide your password:
    $ mysql -h mysql -p

To connect to your database directly from outside the K8s cluster:
    MYSQL_HOST=127.0.0.1
    MYSQL_PORT=3306

    # Execute the following command to route the connection:
    kubectl port-forward svc/mysql 3306

    mysql -h ${MYSQL_HOST} -P${MYSQL_PORT} -u root -p${MYSQL_ROOT_PASSWORD}
```
    
release 安装成功后，可以查看对应的 Pod 信息:
```shell
# 查看pod运行状态
root@master-1:~# kubectl get pod -l release=mysql
NAME                     READY   STATUS            RESTARTS   AGE
mysql-77486675b4-khzvg   0/2     PodInitializing   0          34s

# 查看pod详细信息
root@master-1:~# kubectl describe pods mysql-77486675b4-khzvg
......
    Environment:
      MYSQL_ROOT_PASSWORD:  <set to the key 'mysql-root-password' in secret 'mysql'>  Optional: false
      MYSQL_PASSWORD:       <set to the key 'mysql-password' in secret 'mysql'>       Optional: false
      MYSQL_USER:           user0
      MYSQL_DATABASE:       user0db
    Mounts:
      /var/lib/mysql from data (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-gs86n (ro)
......
```
     
可以看到环境变量 `MYSQL_USER=user0`，`MYSQL_DATABASE=user0db` 的值和我们上面配置的值是一致的。在安装过程中，有两种方法可以传递配置数据：
  - `--values（或者 -f）`：指定一个 YAML 文件来覆盖 values 值，可以指定多个值，最后边的文件优先
  - `--set`：在命令行上指定覆盖的配置
     
:::tip
如果同时使用这两个参数，`--values(-f)` 将被合并到具有更高优先级的 `--set`，使用 `--set` 指定的值将持久化在 ConfigMap 中，对于给定的 release，可以使用 `helm get values <release-name>` 来查看已经设置的值，已设置的值也通过允许 `helm upgrade` 并指定 `--reset` 值来清除。
:::
     
`--set` 选项接收零个或多个 name/value 对，最简单的用法就是 `--set name=value`，相当于 YAML 文件中的：
```yaml
name: value
```
      
多个值之间用字符串“,”隔开，用法就是 `--set a=b,c=d`，相当于 YAML 文件中的：
```yaml
a: b
c: d
```
         
也支持更加复杂的表达式，例如 `--set outer.inner=value`，对应 YAML：
```yaml
outer:
  inner: value
```
        
对于列表数组可以用 `{}` 来包裹，比如 `--set name={a, b, c}`，对应 YAML：
```yaml
name:
 - a
 - b
 - c
```
     
从 Helm 2.5.0 开始，就可以使用数组索引语法来访问列表中某个项，比如 `--set servers[0].port=80`，对应的 YAML 为：
```yaml
servers:
 - port: 80
```
也可以这样设置多个值，比如 `--set servers[0].port=80,servers[0].host=example`，对应的 YAML 为：
```yaml
servers
  - port: 80
    host: example
```
有时候你可能需要在 `--set` 选项中使用特殊的字符，这个时候可以使用反斜杠来转义字符，比如 `--set name=value1\,value2`，对应的 YAML 为：
```yaml
name: "value1,value2"
```
类似的，你还可以转义`.`，当 chart 模板中使用 `toYaml` 函数来解析 annotations、labels 以及 node selectors 之类的时候，这非常有用，比如 `--set nodeSelector."kubernetes\.io/role"=master`，对应的 YAML 文件：
```yaml
nodeSelector:
  kubernetes.io/role: master
```
深度嵌套的数据结构可能很难使用 --set 来表示，所以一般推荐还是使用 YAML 文件来进行覆盖，当然在设计 chart 模板的时候也可以结合考虑到 --set 这种用法，尽可能的提供更好的支持。
     
### 更多安装方式
`helm install` 命令可以从多个源进行安装：
  - chart 仓库（类似于上面我们提到的）
  - 本地 chart 压缩包（helm install foo-0.1.1.tgz）
  - 本地解压缩的 chart 目录（helm install foo path/to/foo）
  - 在线的 URL（helm install fool [https://example.com/charts/foo-1.2.3.tgz](https://example.com/charts/foo-1.2.3.tgz)）
     
### 升级和回滚
当新版本的 chart 包发布的时候，或者当你要更改 release 的配置的时候，你可以使用 `helm upgrade` 命令来操作。升级需要一个现有的 release，并根据提供的信息对其进行升级。因为 Kubernetes charts 可能很大而且很复杂，Helm 会尝试以最小的侵入性进行升级，它只会更新自上一版本以来发生的变化：
```shell
root@master-1:~# helm upgrade mysql stable/mysql -f values.yaml 
WARNING: This chart is deprecated
Release "mysql" has been upgraded. Happy Helming!
NAME: mysql
LAST DEPLOYED: Fri Jul 14 20:59:04 2023
NAMESPACE: default
STATUS: deployed
REVISION: 2
......
```
     
我们这里 `mysql` 这个 release 用相同的 chart 包进行升级，但是新增了一个配置项：
```shell
mysqlRootPassword: passw0rd
```
     
我们可以使用 `helm get values` 来查看新设置是否生效：
```shell
root@master-1:~# helm get values mysql
USER-SUPPLIED VALUES:
mysqlDatabase: user0db
mysqlPassword: user0pwd
mysqlRootPassword: passw0rd
mysqlUser: user0
persistence:
  enabled: false
```
     
`helm get` 命令是查看集群中 release 的非常有用的命令，正如我们在上面看到的，它显示了 `panda.yaml` 中的新配置值被部署到了集群中，现在如果某个版本在发布期间没有按计划进行，那么可以使用 `helm rollback [RELEASE] [REVISION]` 命令很容易回滚到之前的版本：
        
```shell
# 查看当前实例数
root@master-1:~# helm ls
NAME 	NAMESPACE	REVISION	UPDATED                               	STATUS  	CHART      	APP VERSION
mysql	default  	3       	2023-07-14 21:00:41.33047392 +0800 CST	deployed	mysql-1.6.9	5.7.30 

# 查看历史版本
root@master-1:~# helm history mysql
REVISION	UPDATED                 	STATUS    	CHART      	APP VERSION	DESCRIPTION     
1       	Fri Jul 14 20:36:57 2023	superseded	mysql-1.6.9	5.7.30     	Install complete
2       	Fri Jul 14 20:59:04 2023	superseded	mysql-1.6.9	5.7.30     	Upgrade complete
3       	Fri Jul 14 21:00:41 2023	deployed  	mysql-1.6.9	5.7.30     	Upgrade complete

# 回滚到指定版本
root@master-1:~# helm rollback mysql 1
Rollback was a success! Happy Helming!

# 查看release pod运行状态
root@master-1:~# kubectl get pods -l release=mysql
NAME                     READY   STATUS    RESTARTS   AGE
mysql-77486675b4-khzvg   2/2     Running   0          165m

# 查看回滚后values配置
root@master-1:~# helm get values mysql
USER-SUPPLIED VALUES:
mysqlDatabase: user0db
mysqlPassword: user0pwd
mysqlUser: user0
persistence:
  enabled: false
```
     
可以看到 values 配置已经回滚到之前的版本了。上面的命令回滚到了 release 的第一个版本，每次进行安装、升级或回滚时，修订号都会加 1，第一个修订号始终为1，我们可以使用 `helm history [RELEASE]` 来查看某个版本的修订号。
       
除此之外我们还可以指定一些有用的选项来定制 install/upgrade/rollback 的一些行为，要查看完整的参数标志，我们可以运行 `helm <command> --help` 来查看，这里我们介绍几个有用的参数：
  - `--timeout`: 等待 Kubernetes 命令完成的时间，默认是 300（5分钟）
       
  - `--wait`: 等待直到所有 Pods 都处于就绪状态、PVCs 已经绑定、Deployments 具有处于就绪状态的最小 Pods 数量（期望值减去 maxUnavailable）以及 Service 有一个 IP 地址，然后才标记 release 为成功状态。它将等待与 `--timeout` 值一样长的时间，如果达到超时，则 release 将标记为失败。注意：在 Deployment 将副本设置为 1 并且作为滚动更新策略的一部分，maxUnavailable 未设置为0的情况下，`--wait` 将返回就绪状态，因为它已满足就绪状态下的最小 Pod 数量
       
  - `--no-hooks`: 将会跳过命令的运行 hooks
      
  - `--recreate-pods`: 仅适用于 upgrade 和 rollback，这个标志将导致重新创建所有的 Pods。（Helm3 中启用了）