import React from 'react';

export default {
  'en-us': {
    barText: 'Community',
    events: {
      title: 'Events & News',
      list: [
        {
          img: '/img/brhtqqzh.jpeg',
          title: 'this is the title',
          content: 'this is the content',
          dateStr: 'May 12nd，2018',
          link: '/en-us/blog/blog1.html',
        },
        {
          img: '/img/brhtqqzh.jpeg',
          title: 'this is the title',
          content: 'this is the content',
          dateStr: 'May 12nd，2018',
          link: '/en-us/blog/blog2.html',
        },
        {
          img: '/img/brhtqqzh.jpeg',
          title: 'this is the title',
          content: 'this is the content',
          dateStr: 'May 12nd，2018',
          link: '/en-us/blog/blog3.html',
        },
      ]
    },
    contacts: {
      title: 'Talk To Us',
      desc: 'Feel free to contact us via the following channel.',
      list: [
        {
          img: '/img/mailinglist.png',
          imgHover: '/img/mailinglist_hover.png',
          title: 'Mailing List',
          link: ''
        },
        {
          img: '/img/alibaba.png',
          imgHover: '/img/alibaba_hover.png',
          title: 'gitter',
          link: '',
        },
        {
          img: '/img/segmentfault.png',
          imgHover: '/img/segmentfault_hover.png',
          title: 'Segment Fault',
          link: ''
        },
        {
          img: '/img/weibo.png',
          imgHover: '/img/weibo_hover.png',
          title: 'weibo',
          link: '',
        },
      ],
    },
    contributorGuide: {
      title: 'Contributor Guide',
      desc: 'some description',
      list: [
        {
          img: '/img/mailinglist.png',
          title: 'Mailing List',
          content: <span>this is the content</span>,
        },
        {
          img: '/img/issue.png',
          title: 'Issue',
          content: <span>this is the content</span>,
        },
        {
          img: '/img/documents.png',
          title: 'Documents',
          content: <span>this is the content</span>,
        },
        {
          img: '/img/pullrequest.png',
          title: 'Pull Request',
          content: <span>this is the content</span>,
        },
      ],
    },
    ecos: {
      title: 'Eco System',
      list: [
        {
          title: 'Eco1',
          content: <span>Eco System1</span>,
          tags: [
            {
              text: 'tag1',
              link: '',
              bgColor: '#7A63FC',
            },
            {
              text: 'tag2',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'tag3',
              link: '',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Eco2',
          content: <span>Eco System2</span>,
          tags: [
            {
              text: 'tag1',
              link: '',
              bgColor: '#7A63FC',
            },
            {
              text: 'tag2',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'tag3',
              link: '/en-us/docs/demo1.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'tag4',
              link: '',
              bgColor: '#00D0D9',
            },
          ],
        },
      ],
    },
  },
  'zh-cn': {
    barText: '社区',
    events: {
      title: '事件 & 新闻',
      list: [
        {
          img: '/img/brhtqqzh.jpeg',
          title: 'Sentinel 1.3.0 GA 重磅发布',
          content: 'Sentinel 1.3.0 GA 版本正式发布，提供功能完善的控制台。',
          dateStr: 'Oct 30th，2018',
          link: '/zh-cn/blog/sentinel-1-3-0-release.html',
        },
        {
          img: '/img/brhtqqzh.jpeg',
          title: 'Sentinel 0.2.0 GA 重磅发布',
          content: '介绍 Sentinel 0.2.0 的核心功能，包括异步调用支持、热点参数限流等。',
          dateStr: 'Sep 27th，2018',
          link: '/zh-cn/blog/sentinel-0-2-0-release.html',
        },
      ]
    },
    contacts: {
      title: '联系我们',
      desc: '有问题需要反馈？请通过一下方式联系我们。',
      list: [
        {
          img: '/img/mailinglist.png',
          imgHover: '/img/mailinglist_hover.png',
          title: '邮件列表',
          link: 'mailto:sentinel@linux.alibaba.com'
        },
        {
          img: '/img/alibaba.png',
          imgHover: '/img/alibaba_hover.png',
          title: 'Gitter',
          link: 'https://gitter.im/alibaba/Sentinel',
        },
        {
          img: '/img/sentinel.png',
          imgHover: '/img/sentinel.png',
          title: 'Google Groups',
          link: 'https://groups.google.com/forum/#!forum/sentinel-users'
        },
        {
          img: '/img/twitter.png',
          imgHover: '/img/twitter_hover.png',
          title: 'Twitter',
          link: 'https://twitter.com/AlibabaSentinel',
        },
      ],
    },
    contributorGuide: {
      title: '贡献指南',
      desc: 'Sentinel 社区欢迎任何形式的贡献！',
      list: [
        {
          img: '/img/mailinglist.png',
          title: '邮件列表',
          content: <p>在 <a href="mailto:sentinel@linux.alibaba.com">邮件列表</a> 参与讨论</p>,
        },
        {
          img: '/img/issue.png',
          title: 'Issue',
          content: <p>通过 <a href="https://github.com/alibaba/Sentinel/issues">GitHub Issues</a> 来报告缺陷或提交反馈</p>,
        },
        {
          img: '/img/documents.png',
          title: '文档',
          content: <span>完善 Sentinel 相关文档或文章</span>,
        },
        {
          img: '/img/pullrequest.png',
          title: 'Pull Request',
          content: <p>提交 <a href="https://github.com/alibaba/Sentinel/pulls">Pull Request</a> 来修复问题或贡献 Feature</p>,
        },
      ],
    },
    ecos: {
      title: '生态系统',
      list: [
        {
          title: '开源整合',
          content: <span>Sentinel 针对常用的框架和库进行了适配。</span>,
          tags: [
            {
              text: 'Dubbo',
              link: 'https://github.com/dubbo/dubbo-sentinel-support',
              bgColor: '#7A63FC',
            },
            {
              text: 'Spring Cloud',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Servlet',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'gRPC',
              link: '',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: '动态规则源',
          content: <span>Sentinel 提供多种动态规则源适配。</span>,
          tags: [
            {
              text: 'Nacos',
              link: '',
              bgColor: '#7A63FC',
            },
            {
              text: 'ZooKeeper',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Apollo',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Redis',
              link: '',
              bgColor: '#00D0D9',
            },
          ],
        },
      ],
    },
  },
};
