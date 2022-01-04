# Envoy global rate limiting support

Sentinel provides the `sentinel-cluster-server-envoy-rls` module, enabling support for [Envoy rate limiting gRPC service](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting#arch-overview-rate-limit).

<div style="text-align: center;">
<img src="https://user-images.githubusercontent.com/9434884/68639837-d2266980-0540-11ea-8997-05084e2e47bb.png" alt="Envoy RLS Sentinel overview" style="width: 60%;" />
</div>

## Build

Build the executable jar:

```bash
cd sentinel-cluster-server-envoy-rls
mvn clean package -P prod
```

## Rule configuration

Currently Sentinel RLS token server supports dynamic rule configuration via the yaml file.
The file may provide rules for one *domain* (defined in Envoy's conf file).
In Envoy, one rate limit request might carry multiple *rate limit descriptors*
(which will be generated from [Envoy rate limit actions](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/route/v3/route_components.proto#envoy-v3-api-msg-config-route-v3-ratelimit)).
One rate limit descriptor may have multiple entries (key-value pair).
We may set different threshold for each rate limit descriptors.

A sample rule configuration file:

```yaml
domain: foo
descriptors:
  - resources:
    - key: "destination_cluster"
      value: "service_httpbin"
    count: 1
```

This rule only takes effect for domain `foo`. It will limit the max QPS to 1 for
all requests targeted to the `service_httpbin` cluster.

We need to provide the path to yaml file via the `SENTINEL_RLS_RULE_FILE_PATH` env
(or `-Dcsp.sentinel.rls.rule.file` opts). Then as soon as the content in the rule file has been changed,
Sentinel will reload the new rules from the file to the `EnvoyRlsRuleManager`.

We may check the logs in `~/logs/csp/sentinel-record.log.xxx` to see whether the rules has been loaded.
We may also retrieve the converted `FlowRule` via the command API `localhost:8719/cluster/server/flowRules`.

## Configuration items

The configuration list:

| Item (env) | Item (JVM property) | Description | Default Value | Required |
|--------|--------|--------|--------|--------|
| `SENTINEL_RLS_GRPC_PORT` | `csp.sentinel.grpc.server.port` | The RLS gRPC server port | **10240** | false |
| `SENTINEL_RLS_RULE_FILE_PATH` | `csp.sentinel.rls.rule.file` | The path of the RLS rule yaml file | - | **true** |
| `SENTINEL_RLS_ACCESS_LOG` | - | Whether to enable the access log (`on` for enable) | off | false |

## Samples

- [Kubernetes sample](https://github.com/alibaba/Sentinel/tree/master/sentinel-cluster/sentinel-cluster-server-envoy-rls/sample/k8s)