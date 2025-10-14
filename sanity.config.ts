'use client'

import pkg from './package.json' with { type: 'json' }
import { defineConfig } from 'sanity'
import { projectId, dataset, apiVersion } from '@/sanity/lib/env'
import { structure } from './src/sanity/structure'
import { presentation } from './src/sanity/presentation'
// import { icon } from '@/sanity/ui/Icon'
import { InfoWidget } from '@/sanity/ui/InfoWidget'
import {
	dashboardTool,
	projectInfoWidget,
	projectUsersWidget,
} from '@sanity/dashboard'
import { visionTool } from '@sanity/vision'
import { codeInput } from '@sanity/code-input'
import { supportedLanguages } from '@/lib/i18n'
import { documentInternationalization } from '@sanity/document-internationalization'
import { schemaTypes } from './src/sanity/schemaTypes'
import resolveUrl from '@/lib/resolveUrl'
// import { netlifyWidget } from "sanity-plugin-dashboard-widget-netlify";

const singletonTypes = ['site']

export default defineConfig({
	// title: 'SanityPress',
	// icon,
	projectId,
	dataset,
	basePath: '/studio',

	plugins: [
		structure,
		presentation,
		dashboardTool({
			name: 'deployment',
			title: 'Deployment',
			widgets: [
				/*
				TODO(@Milo): Enable widget when first deployed

				netlifyWidget({
					title: 'My Netlify deploys',
					sites: [
						// apiId - The Netfliy API ID of your site(see Site Settings > General > Site Details > Site Information -> API ID).
						// buildHookId - The id of a build hook you have created for your site within the Netlify administration panel(see Site Settings > Build & Deploy > Continuous Deployment -> Build Hooks).
						// name - The Netlify site name
						// title - Override the site name with a custom title
						// url - Optionally override site deployment url.By default it is inferred to be https://netlify-site-name.netlify.app.
						// branch - Optionally pass the name of a branch to deploy

						// {
						// 	title: 'Sanity Studio',
						// 	apiId: 'xxxxx-yyyy-zzzz-xxxx-yyyyyyyy',
						// 	buildHookId: 'xxxyyyxxxyyyyxxxyyy',
						// 	name: 'sanity-gatsby-blog-20-studio',
						// },
						// {
						// 	title: 'Website',
						// 	apiId: 'yyyyy-xxxxx-zzzz-xxxx-yyyyyyyy',
						// 	buildHookId: 'yyyyxxxxxyyyxxdxxx',
						// 	name: 'sanity-gatsby-blog-20-web',
						// 	url: 'https://my-sanity-deployment.com',
						// }
					]
				})
				*/
			],
		}),
		dashboardTool({
			name: 'info',
			title: 'Info',
			widgets: [
				projectInfoWidget(),
				projectUsersWidget(),
				InfoWidget({ version: pkg.version }),
			],
		}),
		visionTool({ defaultApiVersion: apiVersion }),
		codeInput(),
		documentInternationalization({
			supportedLanguages,
			schemaTypes: ['page', 'blog.post'],
		}),
	],

	schema: {
		types: schemaTypes,
		templates: (templates) =>
			templates.filter(
				({ schemaType }) => !singletonTypes.includes(schemaType),
			),
	},
	document: {
		productionUrl: async (prev, { document }) => {
			if (['page', 'blog.post'].includes(document?._type)) {
				return resolveUrl(document as Sanity.PageBase, { base: true })
			}
			return prev
		},

		actions: (input, { schemaType }) => {
			if (singletonTypes.includes(schemaType)) {
				return input.filter(
					({ action }) =>
						action && ['publish', 'discardChanges', 'restore'].includes(action),
				)
			}

			return input
		},
	},
})

function netlifyWidget(arg0: { title: string; sites: ({ title: string; apiId: string; buildHookId: string; name: string; } | { title: string; apiId: string; buildHookId: string; name: string; url: string; })[]; }): import("@sanity/dashboard").DashboardWidget {
	throw new Error('Function not implemented.');
}
