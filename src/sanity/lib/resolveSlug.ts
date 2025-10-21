import { BLOG_DIR, EVENTS_DIR } from '@/lib/env'

export default function resolveSlug({
	_type,
	internal,
	params,
	external,
}: {
	// internal
	_type?: string
	internal?: string
	params?: string
	// external
	external?: string
}) {
	if (external) return external

	if (internal) {
		let segment = '/'
		if (_type === 'blog.post') {
			segment = `/${BLOG_DIR}/`
		} else if (_type === 'schedule') {
			segment = `/${EVENTS_DIR}/`
		}

		const path = internal === 'index' ? null : internal

		return [segment, path, params].filter(Boolean).join('')
	}

	return undefined
}
