'use strict';

const Docma = require('docma');
const Package = require('./package');

Docma
    .create()
    .build({
        dest: './docs',
        clean: false,
        app: {
            title: Package.name,
            routing: 'query',
            entrance: 'content:readme',
            base: '/',
            server: Docma.ServerType.GITHUB
        },
        src: [
            { endb: './src/index.js', util: './src/util.js' },
            { readme: './README.md' },
        ],
        jsdoc: {
            package: './package.json'
        },
        template: {
            path: 'default',
            options: {
                title: Package.name,
                outline: 'flat',
                badges: true,
                navbar: true,
                sidebar: true,
                search: true,
                navItems: [{

                        label: 'README',
                        href: '?content=readme',
                        iconClass: 'ico-md ico-info'
                    },
                    {
                        label: 'Documentation',
                        href: '?api=endb',
                        iconClass: 'ico-book',
                    },
                    {
                        label: 'GitHub',
                        href: Package.repository.url.split('+')[1],
                        target: '_blank',
                        iconClass: 'ico-md ico-github',
                    }
                ],
            },
        }
    })
    .then(() => console.log('Sucessfully built the documentation.'))
    .catch(console.error);