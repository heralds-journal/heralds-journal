import { BLOG_DIR, EVENTS_DIR, BASE_URL } from './env'
import { DEFAULT_LANG } from './i18n'
import { stegaClean } from 'next-sanity'

export default function resolveUrl(
	page?: Sanity.PageBase,
	{
		base = true,
		params,
		language,
	}: {
		base?: boolean
		params?: string
		language?: string
	} = {},
) {
	let segment = '/'

	if (page?._type === 'blog.post') {
		segment = `/${BLOG_DIR}/`
	} else if (page?._type === 'schedule') {
		segment = `/${EVENTS_DIR}/`
	}

	const lang = language && language !== DEFAULT_LANG ? `/${language}` : ''
	const slug = page?.metadata?.slug?.current
	const path = slug === 'index' ? null : slug

	return [
		base && BASE_URL,
		lang,
		segment,
		path,
		stegaClean(params),
	]
		.filter(Boolean)
		.join('')
}
