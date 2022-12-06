// 全局的一些配置
export default {
  rootPath: '', // 发布到服务器的根目录，需以/开头但不能有尾/，如果只有/，请填写空字符串
  port: 8080, // 本地开发服务器的启动端口
  domain: 'sentinelguard.io', // 站点部署域名，无需协议和path等
  defaultSearch: 'google', // 默认搜索引擎，baidu或者google
  defaultLanguage: 'zh-cn',
  'en-us': {
    pageMenu: [
      {
        key: 'home', // 用作顶部菜单的选中
        text: 'HOME',
        link: '/en-us/index.html',
      },
      {
        key: 'docs',
        text: 'DOCS',
        link: '/en-us/docs/introduction.html',
      }, {
        key: 'solution',
        text: 'SOLUTIONS',
        link: '',
        imgUrl: 'https://img.alicdn.com/tfs/TB1esl_m.T1gK0jSZFrXXcNCXXa-200-200.png',
        children: [{
          key: 'ahas',
          text: 'High-availability solution',
          link: 'https://www.aliyun.com/product/ahas?spm=sentinel-website.topbar.0.0.0'
        }, {
          key: 'micoservice',
          text: 'Microservice solutions',
          link: 'https://www.aliyun.com/product/aliware/mse?spm=sentinel-website.topbar.0.0.0'
        }, {
          key: 'serverless',
          text: 'Serverless solution for miscoservices',
          link: 'https://cn.aliyun.com/product/aliware/sae?spm=sentinel-website.topbar.0.0.0'
        },
        {
          key: 'appas',
          text: 'APaaS solution',
          link: 'https://www.aliyun.com/product/edas?spm=sentinel-website.topbar.0.0.0'
        }, {
          key: 'mesh',
          text: 'Service mesh solution',
          link: 'https://www.aliyun.com/product/servicemesh?spm=sentinel-website.topbar.0.0.0',
        }
        ]
      },
      {
        key: 'developers',
        text: 'DEVELOPERS',
        link: '/en-us/docs/developers/developers_dev.html',
      },
      {
        key: 'blog',
        text: 'BLOG',
        link: '/en-us/blog/index.html',
      },
      {
        key: 'community',
        text: 'COMMUNITY',
        link: '/en-us/community/index.html',
      },
    ],
    disclaimer: {
      title: 'Disclaimer',
      content: 'Sentinel is an open-source project under Apache License 2.0.',
    },
    documentation: {
      title: 'Documentation',
      list: [
        {
          text: 'Overview',
          link: '/en-us/docs/introduction.html',
        },
        {
          text: 'Quick start',
          link: '/en-us/docs/quick-start.html',
        },
        {
          text: 'Developer guide',
          link: '/en-us/docs/contribution/contribution-guideline.html',
        },
      ],
    },
    resources: {
      title: 'Resources',
      list: [
        {
          text: 'Blog',
          link: '/en-us/blog/index.html',
        },
        {
          text: 'Community',
          link: '/en-us/community/index.html',
        },
      ],
    },
    copyright: 'Copyright © 2018 - 2022 The Sentinel Authors | An Alibaba Middleware (Aliware) Project',
  },
  'zh-cn': {
    pageMenu: [
      {
        key: 'home',
        text: '首页',
        link: '/zh-cn/index.html',
      },
      {
        key: 'docs',
        text: '文档',
        link: '/zh-cn/docs/introduction.html',
      }, {
        key: 'solution',
        text: '解决方案',
        link: '',
        imgUrl: 'https://img.alicdn.com/tfs/TB1esl_m.T1gK0jSZFrXXcNCXXa-200-200.png',
        children: [{
          key: 'micoservice',
          text: '微服务解决方案',
          link: 'https://www.aliyun.com/product/aliware/mse?spm=sentinel-website.topbar.0.0.0'
        }, {
          key: 'ahas',
          text: '高可用解决方案',
          link: 'https://www.aliyun.com/product/ahas?spm=sentinel-website.topbar.0.0.0'
        }, {
          key: 'serverless',
          text: '微服务Serverless解决方案',
          link: 'https://cn.aliyun.com/product/aliware/sae?spm=sentinel-website.topbar.0.0.0'
        },
        {
          key: 'appas',
          text: 'APaaS解决方案',
          link: 'https://www.aliyun.com/product/edas?spm=sentinel-website.topbar.0.0.0'
        }, {
          key: 'mesh',
          text: '服务网格解决方案',
          link: 'https://www.aliyun.com/product/servicemesh?spm=sentinel-website.topbar.0.0.0',
        }
        ]
      },
      {
        key: 'developers',
        text: '开发者',
        link: '/zh-cn/docs/developers/developers_dev.html',
      },
      {
        key: 'blog',
        text: '博客',
        link: '/zh-cn/blog/index.html',
      },
      {
        key: 'community',
        text: '社区',
        link: '/zh-cn/community/index.html',
      },
      {
        key: 'mse-governance',
        text: '服务治理白皮书',
        link: 'https://developer.aliyun.com/ebook/7565?spm=sentinel-website.topbar.0.0.0',
        imgUrl: 'https://img.alicdn.com/tfs/TB1esl_m.T1gK0jSZFrXXcNCXXa-200-200.png',
      },
      {
        key: 'mse-ahas',
        text: '企业版 Sentinel',
        link: 'https://www.aliyun.com/product/aliware/mse?spm=sentinel-website.topbar.0.0.0',
        imgUrl: 'https://img.alicdn.com/tfs/TB1esl_m.T1gK0jSZFrXXcNCXXa-200-200.png',
      },
    ],
    disclaimer: {
      title: 'Disclaimer',
      content: 'Sentinel is an open-source project under Apache License 2.0.',
    },
    documentation: {
      title: '文档',
      list: [
        {
          text: '概览',
          link: '/zh-cn/docs/introduction.html',
        },
        {
          text: '快速开始',
          link: '/zh-cn/docs/quick-start.html',
        },
        {
          text: '开发者指南',
          link: '/zh-cn/docs/contribution/contribution-guideline.html',
        },
      ],
    },
    resources: {
      title: '资源',
      list: [
        {
          text: '博客',
          link: '/zh-cn/blog/index.html',
        },
        {
          text: '社区',
          link: '/zh-cn/community/index.html',
        },
      ],
    },
    copyright: 'Copyright © 2018 - 2022 The Sentinel Authors | An Alibaba Middleware (Aliware) Project',
  },
};
