'use strict';

const Docma = require('docma');
const Package = require('./package');

Docma.create()
	.build({
		dest: './docs',
		clean: false,
		app: {
			title: Package.name,
			meta: [
				{charset: 'utf-8'},
				{name: 'viewport', content: 'width=device-width,initial-scale=1.0'},
				{property: 'og:url', content: 'endb.js.org'},
				{property: 'og:title', content: 'Endb'},
				{property: 'og:description', content: Package.description},
				{property: 'og:image', content: '/docs/media/logo.png'}
			],
			base: '/',
			entrance: 'content:readme',
			routing: Docma.RoutingMethod.QUERY,
			server: Docma.ServerType.GITHUB
		},
		src: [
			'./src/**/*.js',
			{endb: './src/index.js', util: './src/util.js'},
			{readme: './README.md'}
		],
		template: {
			path: 'default',
			options: {
				title: Package.name,
				outline: 'flat',
				badges: true,
				navbar: true,
				sidebar: true,
				search: true,
				navItems: [
					{
						label: 'README',
						href: '?content=readme',
						iconClass: 'ico-md ico-info'
					},
					{
						label: 'Documentation',
						href: '?api=endb',
						iconClass: 'ico-book'
					},
					{
						label: 'GitHub',
						href: Package.repository.url.split('+')[1],
						target: '_blank',
						iconClass: 'ico-md ico-github'
					}
				]
			}
		}
	})
	.then(() => console.log('Sucessfully built the documentation.'))
	.catch(console.error);
