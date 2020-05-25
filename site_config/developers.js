export default {
    'en-us': {
        sidemenu: [
            {
                title: 'Developers',
                children: [
                    {
                        title: 'Developers',
                        link: '/en-us/docs/developers/developers_dev.html',
                    },
                ],
            },
            {
                title: 'Contributor Guide',
                children: [
                    {
                        title: 'New contributor guide',
                        link: '/en-us/docs/developers/contributor-guide/new-contributor-guide_dev.html',
                    },
                    {
                        title: 'How to become a committer',
                        link: '/en-us/docs/developers/contributor-guide/become-a-committer_dev.html',
                    },
                ]
            },
            {
                title: 'Committer Guide',
                children: [
                    {
                        title: 'New Committer guide',
                        link: '/en-us/docs/developers/committer-guide/new-committer-guide_dev.html',
                    },
                    {
                        title: 'Label an Issue',
                        link: '/en-us/docs/developers/committer-guide/label-an-issue-guide_dev.html',
                    },
                    {
                        title: 'Website Guide',
                        link: '/en-us/docs/developers/committer-guide/website-guide_dev.html',
                    },
                    {
                        title: 'Release Guide',
                        link: '/en-us/docs/developers/committer-guide/release-guide_dev.html',
                    }
                ]
            },
        ],
        barText: 'Developers',
    },
    'zh-cn':
        {
            sidemenu: [
                {
                    title: '开发者列表',
                    children: [
                        {
                            title: '开发人员',
                            link: '/zh-cn/docs/developers/developers_dev.html',
                        }
                    ],
                },
                {
                    title: '贡献者指南',
                    children: [
                        {
                            title: '贡献指南',
                            link: '/zh-cn/docs/developers/contribution-guide_dev.html',
                        },
                        {
                            title: '如何成为 Committer',
                            link: '/zh-cn/docs/developers/contributor-guide/become-a-committer_dev.html',
                        },
                    ]
                },
                {
                    title: '提交者指南',
                    children: [
                        {
                            title: 'Committer 指南',
                            link: '/zh-cn/docs/developers/committer-guide/new-committer-guide_dev.html',
                        },
                        {
                            title: 'Issue/PR 标签指南',
                            link: '/zh-cn/docs/developers/committer-guide/issue-pr-label-guide_dev.html',
                        },
                        {
                            title: '网站维护指南',
                            link: '/zh-cn/docs/developers/committer-guide/website-guide_dev.html',
                        },
                        {
                            title: '版本发布指南',
                            link: '/zh-cn/docs/developers/committer-guide/release-guide_dev.html',
                        }
                    ]
                },
            ],
            barText:
                '开发者',
        }
};
