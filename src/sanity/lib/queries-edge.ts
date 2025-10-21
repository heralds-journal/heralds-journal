// Edge-runtime-safe fetch implementation

type Translation = {
	slug: string
	translations?: {
		slug: string
		slugBlogAlt?: string
		language: string
	}[]
}

import { BLOG_DIR, EVENTS_DIR } from '@/lib/env'
import { projectId, dataset, apiVersion } from '@/sanity/lib/env'

export async function getTranslationsEdge(): Promise<Translation[]> {
	const query = `*[_type in ['page', 'blog.post', 'schedule'] && defined(language)]{
				'slug': '/' + select(
						_type == 'blog.post' => '${BLOG_DIR}/' + metadata.slug.current,
						_type == 'schedule' => '${EVENTS_DIR}/' + metadata.slug.current,
						metadata.slug.current != 'index' => metadata.slug.current,
						''
				),
				'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
						'slug': '/' + select(
								_type == 'blog.post' => '${BLOG_DIR}/' + language + '/' + metadata.slug.current,
								_type == 'schedule' => '${EVENTS_DIR}/' + language + '/' + metadata.slug.current,
								metadata.slug.current != 'index' => language + '/' + metadata.slug.current,
								language
						),
						_type == 'blog.post' => {
								'slugBlogAlt': '/' + language + '/${BLOG_DIR}/' + metadata.slug.current
						},
						_type == 'schedule' => {
								'slugEventsAlt': '/' + language + '/${EVENTS_DIR}/' + metadata.slug.current
						},
						language
				}
		}`

	const url = new URL(
		`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
	)
	url.searchParams.set('query', query)

	const headers: HeadersInit = {}
	if (process.env.SANITY_API_READ_TOKEN) {
		headers.Authorization = `Bearer ${process.env.SANITY_API_READ_TOKEN}`
	}

	const res = await fetch(url, { headers, next: { revalidate: 60 } } as any)
	if (!res.ok) return []
	const { result } = (await res.json()) as { result?: Translation[] }

	return result ?? []
}
