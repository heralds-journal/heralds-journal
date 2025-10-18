'use client'

import pkg from './package.json' with { type: 'json' }
import { defineConfig } from 'sanity'
import { projectId, dataset, apiVersion } from '@/sanity/lib/env'
import { structure } from './src/sanity/structure'
import { presentation } from './src/sanity/presentation'
import { icon } from '@/sanity/ui/Icon'
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
import { pageActions } from '@/sanity/schemaTypes/actions/page'

const singletonTypes = ['site']

export default defineConfig({
	title: 'SanityPress',
	icon,
	projectId,
	dataset,
	basePath: '/studio',

	plugins: [
		dashboardTool({
			name: 'dashboard',
			title: 'Dashboard',
			widgets: [
				projectInfoWidget(),
				projectUsersWidget(),
				InfoWidget({ version: pkg.version }),
			],
		}),
		structure,
		presentation,
		visionTool({ defaultApiVersion: apiVersion }),
		codeInput(),
		documentInternationalization({
			supportedLanguages,
			schemaTypes: ['page', 'blog.post'],
		}),
	],

	schema: {
		types: schemaTypes,
		templates: (templates: any[]) =>
			templates.filter(
				({ schemaType }: any) => !singletonTypes.includes(schemaType),
			),
	},
	document: {
		productionUrl: async (prev: any, { document }: any) => {
			if (['page', 'blog.post'].includes(document?._type)) {
				return resolveUrl(document as Sanity.PageBase, { base: true })
			}
			return prev
		},

		actions: (input: any[], ctx: any) => {
			const schemaType = ctx?.schemaType
			const schemaTypeName =
				typeof schemaType === 'string' ? schemaType : schemaType?.name
			if (singletonTypes.includes(schemaTypeName)) {
				return input.filter(
					({ action }: any) =>
						action && ['publish', 'discardChanges', 'restore'].includes(action),
				)
			}

			if (schemaTypeName === 'page') {
				try {
					console.log('[sanity.config] actions: wiring pageActions', {
						schemaTypeName,
						count: input?.length,
					})
				} catch {}

				return pageActions(input, ctx)
			}

			return input
		},
	},
})
