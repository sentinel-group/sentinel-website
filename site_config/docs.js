export default {
  'en-us': {
    sidemenu: [
      {
        title: 'Overview',
        children: [
          {
            title: 'Introduction to Sentinel',
            link: '/en-us/docs/introduction.html',
          },
          {
            title: 'Quick Start',
            link: '/en-us/docs/quick-start.html',
          }
        ]
      },
      {
        title: 'User Guide',
        children: [
          {
            title: 'How Sentinel Works',
            link: '/en-us/docs/basic-implementation.html',
          },
          {
            title: 'API Guide (resource and rule)',
            link: '/en-us/docs/basic-api-resource-rule.html',
          },
          {
            title: 'Flow Control',
            link: '/en-us/docs/flow-control.html',
          },
          {
            title: 'Parameter Flow Control',
            link: '/en-us/docs/parameter-flow-control.html',
          },
          {
            title: 'Cluster Flow Control',
            link: '/en-us/docs/cluster-flow-control.html',
          },
          {
            title: 'API Gateway Flow Control',
            link: '/en-us/docs/api-gateway-flow-control.html',
          },
          {
            title: 'Circuit Breaking',
            link: '/en-us/docs/circuit-breaking.html',
          },
          {
            title: 'System Adaptive Protection',
            link: '/en-us/docs/system-adaptive-protection.html',
          },
          {
            title: 'Microservice Framework Integrations',
            link: '/en-us/docs/open-source-framework-integrations.html',
          },
          {
            title: 'Dashboard',
            link: '/en-us/docs/dashboard.html',
          },
          {
            title: 'General Configuration',
            link: '/en-us/docs/general-configuration.html',
          },
          {
            title: 'Logs',
            link: '/en-us/docs/logs.html',
          },
        ],
      },
    ],
    barText: 'Documentation',
  },
  'zh-cn': {
    sidemenu: [
      {
        title: '用户文档',
        children: [
          {
            title: '入门',
            children: [
              {
                title: 'Sentinel 介绍',
                link: '/zh-cn/docs/introduction.html',
              },
              {
                title: '快速开始',
                link: '/zh-cn/docs/quick-start.html',
              },
              {
                title: '基本原理',
                link: '/zh-cn/docs/basic-implementation.html',
              },
            ],
          },
          {
            title: 'FAQ',
            link: '/zh-cn/docs/faq.html',
          },
          {
            title: '使用文档',
            children: [
              {
                title: '基本使用（资源与规则）',
                link: '/zh-cn/docs/basic-api-resource-rule.html',
              },
              {
                title: '流量控制',
                link: '/zh-cn/docs/flow-control.html',
              },
              {
                title: '熔断降级',
                link: '/zh-cn/docs/circuit-breaking.html',
              },
              {
                title: '系统自适应保护',
                link: '/zh-cn/docs/system-adaptive-protection.html',
              },
              {
                title: '集群流量控制',
                link: '/zh-cn/docs/cluster-flow-control.html',
              },
              {
                title: '网关流量控制',
                link: '/zh-cn/docs/api-gateway-flow-control.html',
              },
              {
                title: '热点参数限流',
                link: '/zh-cn/docs/parameter-flow-control.html',
              },
              {
                title: '来源访问控制',
                link: '/zh-cn/docs/origin-authority-control.html',
              },
              {
                title: '注解支持',
                link: '/zh-cn/docs/annotation-support.html',
              },
              {
                title: '动态规则扩展',
                link: '/zh-cn/docs/dynamic-rule-configuration.html',
              },
              {
                title: '日志',
                link: '/zh-cn/docs/logs.html',
              },
              {
                title: '实时监控',
                link: '/zh-cn/docs/metrics.html',
              },
              {
                title: '启动配置项',
                link: '/zh-cn/docs/general-configuration.html',
              },
            ],
          },
          {
            title: 'Sentinel 控制台',
            link: '/zh-cn/docs/dashboard.html',
          },
          {
            title: '开源框架适配',
            link: '/zh-cn/docs/open-source-framework-integrations.html',
          },
          {
            title: '多语言支持',
            link: '/zh-cn/docs/polyglot-support.html',
          },
        ],
      },
      {
        title: '多语言文档',
        children: [
          {
            title: 'Sentinel Go',
            children: [
              {
                title: '基本 API 使用指南',
                link: '/zh-cn/docs/golang/basic-api-usage.html',
              },
              {
                title: '流量控制',
                link: '/zh-cn/docs/golang/flow-control.html',
              },
              {
                title: '熔断降级',
                link: '/zh-cn/docs/golang/circuit-breaking.html',
              },
              {
                title: '并发隔离控制',
                link: '/zh-cn/docs/golang/concurrency-limiting-isolation.html',
              },
              {
                title: '系统自适应保护',
                link: '/zh-cn/docs/golang/system-adaptive-protection.html',
              },
              {
                title: '热点参数流控',
                link: '/zh-cn/docs/golang/hotspot-param-flow-control.html',
              },
              {
                title: '动态规则扩展',
                link: '/zh-cn/docs/golang/dynamic-data-source-usage.html',
              },
              {
                title: '通用配置',
                link: '/zh-cn/docs/golang/general-configuration.html',
              },
              {
                title: '日志',
                link: '/zh-cn/docs/golang/logging.html',
              },
            ],
          },
        ],
      },
      {
        title: '贡献手册',
        children: [
          {
            title: '开源贡献指南',
            link: '/zh-cn/docs/contribution/contribution-guideline.html',
          },
        ],
      },
    ],
    barText: '文档',
  },
};
