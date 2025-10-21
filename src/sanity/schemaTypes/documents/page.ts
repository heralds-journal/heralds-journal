import { defineField, defineType } from 'sanity'
import modules from '../fragments/modules'
import {
	VscHome,
	VscQuestion,
	VscEyeClosed,
	VscSearch,
	VscEdit,
	VscMortarBoard,
	VscMegaphone
} from 'react-icons/vsc'
import { BLOG_DIR, EVENTS_DIR } from '@/lib/env'

export default defineType({
	name: 'page',
	title: 'Page',
	type: 'document',
	groups: [{ name: 'content', default: true }, { name: 'metadata' }],
	fields: [
		defineField({
			name: 'title',
			type: 'string',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			...modules,
			group: 'content',
		}),
		defineField({
			name: 'metadata',
			type: 'metadata',
			group: 'metadata',
		}),
		defineField({
			name: 'language',
			type: 'string',
			readOnly: true,
			hidden: true,
		}),
	],
	preview: {
		select: {
			title: 'title',
			slug: 'metadata.slug.current',
			media: 'metadata.image',
			noindex: 'metadata.noIndex',
			language: 'language',
		},
		prepare: ({ title, slug, media, noindex, language }) => ({
			title: `${'– '.repeat(slug?.match(/\//g)?.length ?? 0)}${title}`,
			subtitle: [
				language && `[${language}] `,
				slug && (slug === 'index' ? '/' : `/${slug}`),
			]
				.filter(Boolean)
				.join(''),
			media:
				media ||
				(slug === 'index' && VscHome) ||
				(slug === 'not-found' && VscQuestion) ||
				(slug === 'search' && VscSearch) ||
				(slug === BLOG_DIR && VscEdit) ||
				(slug === EVENTS_DIR && VscMegaphone) ||
				(slug?.startsWith('docs') && VscMortarBoard) ||
				(noindex && VscEyeClosed),
		}),
	},
})
