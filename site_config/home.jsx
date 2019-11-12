import React from 'react';

export default {
  'zh-cn': {
    brand: {
      brandName: 'Sentinel',
      briefIntroduction: '面向分布式服务架构的流量控制组件',
      buttons: [
        {
          text: '快速开始',
          link: '/zh-cn/docs/quick-start.html',
          type: 'primary',
        },
        {
          text: '前往 GitHub',
          link: 'https://github.com/alibaba/Sentinel',
          type: 'normal',
        },
      ],
    },
    introduction: {
      title: '简介',
      desc: 'Sentinel 是面向分布式服务架构的轻量级流量控制组件，主要以流量为切入点，从流量控制、熔断降级、系统自适应保护等多个维度来帮助用户保障服务的稳定性。',
      img: '/img/sentinel-flow-index-overview-cn.jpg',
    },
    features: {
      title: '特性一览',
      list: [
        {
          img: '/img/feature_maintenance.png',
          title: '丰富的应用场景',
          content: '阿里巴巴 10 年双十一积累的丰富流量场景，包括秒杀、双十一零点持续洪峰、热点商品探测、预热、消息队列削峰填谷等多样化的场景',
        },
        {
          img: '/img/feature_transpart.png',
          title: '易于使用，快速接入',
          content: '简单易用，开源生态广泛，针对 Dubbo、Spring Cloud、gRPC、Zuul、Reactor 等框架只需要引入适配模块即可快速接入',
        },
        {
          img: '/img/feature_service.png',
          title: '多样化的流量控制',
          content: '资源粒度、调用关系、指标类型、控制效果等多维度的流量控制',
        },
        {
          img: '/img/feature_hogh.png',
          title: '可视化的监控和规则管理',
          content: '功能完善的 Sentinel 控制台',
        },
      ],
    },
    start: {
      title: '快速开始',
      desc: '只需 5 分钟即可快速熟悉 Sentinel',
      img: '/img/quick_start.png',
      button: {
        text: '阅读更多',
        link: '/zh-cn/docs/quick-start.html',
      },
    },
    users: {
      title: 'Who is using Sentinel',
      desc: <p>请在 <a href="https://github.com/alibaba/Sentinel/issues/18">此处</a> 登记并提供反馈来帮助 Sentinel 做的更好 :)</p>,
      list: [
        'https://docs.alibabagroup.com/assets2/images/en/global/logo_header.png',
        'http://www.cntaiping.com/tplresource/cms/www/taiping/img/home_new/tp_logo_img.png',
        'https://user-images.githubusercontent.com/9434884/48463502-2f48eb80-e817-11e8-984f-2f9b1b789e2d.png',
        'https://user-images.githubusercontent.com/9434884/48463559-6cad7900-e817-11e8-87e4-42952b074837.png',
        'https://user-images.githubusercontent.com/9434884/49358468-bc43de00-f70d-11e8-97fe-0bf05865f29f.png',
        'http://cdn.52shangou.com/shandianbang/official-source/3.1.1/build/images/logo.png',
      ],
    },
  },
  'en-us': {
    brand: {
      brandName: 'Sentinel',
      briefIntroduction: 'The Flow Sentinel of Your Services',
      buttons: [
        {
          text: 'Quick Start',
          link: '/en-us/docs/quick-start.html',
          type: 'primary',
        },
        {
          text: 'View on Github',
          link: 'https://github.com/alibaba/Sentinel',
          type: 'normal',
        },
      ],
    },
    introduction: {
      title: 'Overview',
      desc: 'Sentinel is a lightweight powerful flow-control component enabling reliability (flow control, circuit breaking, adaptive system protection) and real-time monitoring for microservices',
      img: '/img/sentinel-flow-index-overview-en.jpg',
    },
    features: {
      title: 'Feature List',
      list: [
        {
          img: '/img/feature_maintenance.png',
          title: 'Rich scanerios',
          content: 'Rich production-level scanerios from Alibaba such as peak load shifting, spikes in pulse flow and adaptive system protection.',
        },
        {
          img: '/img/feature_transpart.png',
          title: 'Easy to use',
          content: 'Provides annotation support and out-of-box integrations with popular open-source frameworks such as Dubbo, Spring Cloud and gRPC.',
        },
        {
          img: '/img/feature_service.png',
          title: 'Advanced flow control',
          content: 'Support advanced flow control by various metric types, relation and traffic shaping effect.',
        },
        {
          img: '/img/feature_hogh.png',
          title: 'Real-time monitoring and rule configuration',
          content: 'Provides a powerful dashboard for real-time monitoring and rule configuration.',
        },
      ]
    },
    start: {
      title: 'Quick start',
      desc: 'This guide gets you started with Sentinel quickly in a few minutes.',
      img: '/img/quick_start.png',
      button: {
        text: 'READ MORE',
        link: '/en-us/docs/quick-start.html',
      },
    },
    users: {
      title: 'Who is using Sentinel',
      desc: <p>Please <a href="https://github.com/alibaba/Sentinel/issues/18">leave a comment here</a> to tell us your scenario to make Sentinel better :)</p>,
      list: [
        'https://docs.alibabagroup.com/assets2/images/en/global/logo_header.png',
        'http://www.cntaiping.com/tplresource/cms/www/taiping/img/home_new/tp_logo_img.png',
        'https://user-images.githubusercontent.com/9434884/48463502-2f48eb80-e817-11e8-984f-2f9b1b789e2d.png',
        'https://user-images.githubusercontent.com/9434884/48463559-6cad7900-e817-11e8-87e4-42952b074837.png',
        'https://home.missfresh.cn/statics/img/logo.png',
        'https://user-images.githubusercontent.com/9434884/49358468-bc43de00-f70d-11e8-97fe-0bf05865f29f.png',
        'https://user-images.githubusercontent.com/9434884/49355264-c6f87600-f701-11e8-8109-054cf91df868.png',
        'http://cdn.52shangou.com/shandianbang/official-source/3.1.1/build/images/logo.png',
      ],
    },
  },
};
