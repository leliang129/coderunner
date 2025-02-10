---
title: Prometheus 面试题
description: Prometheus 面试题
keywords: [prometheus]
sidebar_position: 300
---
# Prometheus 相关问题解答

## **Q1: Prometheus 的工作流程**
**A**:  
1. **数据采集（Scraping）**：Prometheus 定期从目标（targets）拉取监控数据（metrics）。
2. **存储（Storage）**：数据存入本地 TSDB（时间序列数据库）。
3. **查询（Querying）**：用户通过 PromQL 查询数据。
4. **告警（Alerting）**：Prometheus 评估规则并触发告警，告警管理器（Alertmanager）负责通知。
5. **数据可视化（Visualization）**：结合 Grafana 等工具展示数据。

---

## **Q2: Metric 的几种类型？分别是什么？**
**A**: Prometheus 提供 4 种数据类型：
- **Counter（计数器）**：单调递增，如 `http_requests_total`。
- **Gauge（仪表盘）**：可增可减，如 `memory_usage_bytes`。
- **Histogram（直方图）**：用于统计分布，如 `request_duration_seconds`。
- **Summary（摘要）**：类似 Histogram，但提供分位数，如 `http_request_duration_seconds`.

---

## **Q3: Prometheus 有哪几种服务发现？**
**A**:
1. **静态配置（Static Config）**：手动指定 `targets`。
2. **Kubernetes 服务发现**：自动发现 K8s Pod/Service/Endpoints。
3. **Consul 服务发现**：通过 Consul 自动发现服务。
4. **Etcd 服务发现**：适用于分布式存储和服务注册。
5. **File-based（文件服务发现）**：通过 JSON/YAML 文件定义 `targets`。
6. **其他云厂商集成**：如 AWS EC2、Azure、GCE 发现实例。

---

## **Q4: Prometheus 常用函数**
**A**:
- **rate()**：计算时间窗口内 Counter 变化率。
- **irate()**：计算瞬时速率（适合短时间窗口）。
- **increase()**：计算 Counter 在时间窗口内增长值。
- **delta()**：计算 Gauge 变化值。
- **topk()**/**bottomk()**：取最大/最小 K 个值。
- **avg()**/**sum()**/**min()**/**max()**：聚合计算。
- **quantile()**：计算分位数。

---

## **Q5: Thanos 架构**
**A**:
Thanos 是用于扩展 Prometheus 的分布式存储方案，核心组件：
1. **Sidecar**：连接 Prometheus，实现远程存储和数据查询。
2. **Store Gateway**：存储历史数据，优化查询。
3. **Query**：统一查询多个 Prometheus 实例。
4. **Compact**：对数据进行压缩，降低存储成本。
5. **Ruler**：处理告警规则，类似 Prometheus Rule 组件。
6. **Receive**：替代 Prometheus，支持推送模式。

---

## **Q6: Thanos 与 VictoriaMetrics 对比**
**A**:
| 方案 | Thanos | VictoriaMetrics |
|------|--------|----------------|
| 架构 | 分布式 | 单节点/分布式 |
| 存储 | 基于对象存储 | 自研存储 |
| 查询性能 | 适合大规模查询 | 读性能更优 |
| 易用性 | 部署复杂 | 部署简单 |
| 适用场景 | 多 Prometheus 集群 | 适合高写入场景 |

---

## **Q7: Thanos Sidecar 和 Receive 区别**
**A**:
- **Sidecar**：依赖 Prometheus，提供数据存储和查询能力。
- **Receive**：可直接接受远程写入，不依赖 Prometheus，可用于接收推送模式数据。

---

## **Q8: Thanos Rule 组件和 Prometheus 的区别**
**A**:
- **Prometheus Rule**：在本地评估告警规则。
- **Thanos Rule**：集中化管理多个 Prometheus 实例的规则评估。

---

## **Q9: Prometheus 告警从触发到收到通知的延迟在哪**
**A**:
- **Prometheus 评估周期**（默认 15s）。
- **Alertmanager 聚合和去重时间**（默认 30s）。
- **通知通道的延迟**（如邮件、Slack）。

---

## **Q10: 告警抑制怎么做**
**A**:
- Alertmanager 通过 `inhibit_rules` 配置抑制规则。
- 高优先级告警触发时，自动抑制低优先级告警。

---

## **Q11: 告警架构高可用怎么做**
**A**:
- 部署多个 Alertmanager 并进行集群 HA 配置。
- Prometheus 通过 `federation` 或 Thanos 进行高可用。

---

## **Q12: Pod 指标 WSS 和 RSS 区别**
**A**:
- **WSS（Working Set Size）**：实际使用的物理内存。
- **RSS（Resident Set Size）**：包含共享内存的驻留内存。

---

## **Q13: 监控四个黄金指标**
**A**:
1. **请求延迟（Latency）**
2. **流量（Traffic）**
3. **错误率（Errors）**
4. **饱和度（Saturation）**

---

## **Q14: 大规模环境下如何优化 Prometheus**
**A**:
- 使用 Thanos 或 VictoriaMetrics 进行长时间存储。
- 降低 `scrape_interval`，避免过高抓取频率。
- 调整 `retention` 限制 TSDB 磁盘占用。
- 过滤无用指标，减少 Prometheus 内存压力。

---

## **Q15: 如何实现告警的自动化响应**
**A**:
- 结合 Alertmanager Webhook 触发自动化脚本。
- 使用 ArgoCD 或 K8s Operator 进行自动恢复。

---

## **Q16: Prometheus 数据压缩和持久化实现原理**
**A**:
- 采用 TSDB 存储，数据以 **block** 方式存储。
- 使用 **Gorilla 算法** 进行时间序列数据压缩。

---

## **Q17: kubectl top 输出与 Linux free 命令不一致原因**
**A**:
- `kubectl top` 仅统计 Pod 级别的资源，而 `free` 统计整个系统的资源。
- K8s 可能使用了 cgroups 进行资源隔离。

---

## **Q18: 用到了哪些 exporter，功能是什么**
**A**:
- **node-exporter**：采集主机 CPU、内存、磁盘等指标。
- **kube-state-metrics**：监控 K8s 资源状态。
- **cAdvisor**：采集容器级别的资源使用情况。

---

## **Q19: 是否自己开发过 exporter**
**A**:
- 自定义 Exporter 需要实现 `/metrics` 接口，使用 `prometheus_client` 库。
- 例如开发 MySQL 自定义指标导出。

---

## **Q20: Target Down 的情况如何排查**
**A**:
1. `kubectl logs prometheus` 查看错误日志。
2. `kubectl get svc` 确保 Service 端口正确。
3. `curl http://target-ip:port/metrics` 测试可访问性。

---

## **Q21: Exporter 停止工作，如何监控？**
**A**:
- 配置 `up` 指标告警 (`up == 0`)。
- 监控 Exporter 进程存活。

---

## **Q22: Prometheus 拉取模式 vs Zabbix 推送模式**
**A**:
- **拉取（Prometheus）**：更灵活，可动态发现目标。
- **推送（Zabbix）**：适用于 IoT、离线设备监控。

---

## **Q23: Prometheus Operator 如何添加 Targets 和告警规则**
**A**:
- 通过 `ServiceMonitor` 定义 Target 发现规则。
- 通过 `PrometheusRule` 定义告警规则。

---

## **Q24: K8s 集群外 Exporter 如何使用 Prometheus 监控**
**A**:
- 通过 `StaticConfig` 手动指定 Target。
- 通过 `NodePort` 或 `Ingress` 公开 Exporter。

