export default {
  'en-us': {
    sidemenu: [
      {
        title: 'header title',
        children: [
          {
            title: 'demo1',
            link: '/en-us/docs/demo1.html',
          },
          {
            title: 'demo2',
            link: '/en-us/docs/demo2.html',
          },
          /*{
            title: 'dir',
            opened: true,
            children: [
              {
                title: 'demo3',
                link: '/en-us/docs/dir/demo3.html',
              },
            ],
          },*/
        ],
      },
    ],
    barText: 'Documentation',
  },
  'zh-cn': {
    sidemenu: [
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
