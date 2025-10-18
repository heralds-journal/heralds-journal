import { defineField, defineType } from 'sanity'
import { apiVersion } from '@/sanity/lib/env'
import { CharacterCount } from '@/sanity/ui/CharacterCount'
import PreviewOG from '@/sanity/ui/PreviewOG'

export default defineType({
	name: 'metadata',
	title: 'Metadata',
	description: 'For search engines',
	type: 'object',
	fields: [
		defineField({
			name: 'slug',
			type: 'slug',
			description: 'URL path or permalink',
			options: {
				source: (doc: any) => doc.title || doc.metadata?.title,
				slugify: (value: string) =>
					(value || '')
						.normalize('NFKD')
						// remove diacritics (combining marks)
						.replace(/[\u0300-\u036f]+/g, '')
						.toLowerCase()
						// allow slashes, convert spaces/underscores to dashes
						.replace(/[^a-z0-9\/-]+/g, '-')
						.replace(/[_\s]+/g, '-')
						// collapse multiple dashes or slashes
						.replace(/-+/g, '-')
						.replace(/\/+/g, '/')
						// trim leading/trailing slashes and dashes
						.replace(/^\/+|\/+$/g, '')
						.replace(/^-+|-+$/g, ''),
				isUnique: async (slug: string, ctx: any) => {
					if (!slug) return true
					const { document, getClient } = ctx as any
					const lang: string | undefined = document?.language
					const id: string | undefined = document?._id
					const publishedId = id?.startsWith('drafts.') ? id.slice(7) : id
					const draftId = publishedId ? `drafts.${publishedId}` : undefined
					const client = getClient({ apiVersion })
					const params: Record<string, any> = { slug, publishedId, draftId }
					let filter = `_type == "page" && metadata.slug.current == $slug && !(_id in [$publishedId, $draftId])`
					if (lang) {
						filter += ` && language == $lang`
						params.lang = lang
					} else {
						filter += ` && !defined(language)`
					}
					const exists = await client.fetch(`count(*[${filter}]) > 0`, params)
					return !exists
				},
			},
			validation: (Rule: any) =>
				Rule.required().custom(async (val: any, ctx: any) => {
					const current = (val as any)?.current as string | undefined
					if (!current) return true
					// format: lowercase letters, numbers, dashes and slashes only; no leading/trailing slash; no empty segments
					if (
						!/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)(?:\/(?:[a-z0-9]+(?:-[a-z0-9]+)*))*$/.test(
							current,
						) &&
						current !== 'index'
					) {
						return 'Use lowercase letters, numbers, and dashes; use "/" to nest. Example: docs/getting-started'
					}
					// parent existence check
					if (current !== 'index' && current.includes('/')) {
						const parent = current.split('/').slice(0, -1).join('/')
						const { getClient, document } = ctx as any
						const client = getClient({ apiVersion })
						const lang: string | undefined = document?.language
						let filter = `_type == "page" && metadata.slug.current == $parent`
						const params: Record<string, any> = { parent }
						if (lang) {
							filter += ` && language == $lang`
							params.lang = lang
						} else {
							filter += ` && !defined(language)`
						}
						const exists = await client.fetch(`count(*[${filter}]) > 0`, params)
						if (!exists) return `Parent page "/${parent}" does not exist`
					}
					return true
				}),
		}),
		defineField({
			name: 'title',
			type: 'string',
			validation: (Rule: any) => Rule.max(60).warning(),
			components: {
				input: (props: any) => (
					<CharacterCount max={60} {...(props as any)}>
						<PreviewOG title={props.elementProps.value} />
					</CharacterCount>
				),
			},
		}),
		defineField({
			name: 'description',
			type: 'text',
			validation: (Rule: any) => Rule.max(160).warning(),
			components: {
				input: (props: any) => (
					<CharacterCount as="textarea" max={160} {...(props as any)} />
				),
			},
		}),
		defineField({
			name: 'image',
			description: 'Used for social sharing previews',
			type: 'image',
			options: {
				hotspot: true,
				metadata: ['lqip'],
			},
		}),
		defineField({
			name: 'noIndex',
			description: 'Prevent search engines from indexing this page',
			type: 'boolean',
			initialValue: false,
		}),
	],
})
