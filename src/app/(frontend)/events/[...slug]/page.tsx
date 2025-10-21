import { notFound } from 'next/navigation'
import Modules from '@/ui/modules'
import processMetadata from '@/lib/processMetadata'
import { client } from '@/sanity/lib/client'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { EVENTS_DIR } from '@/lib/env'
import {
	MODULES_QUERY,
	SCHEDULE_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import { languages, type Lang } from '@/lib/i18n'
import errors from '@/lib/errors'

type Params = { slug: string[] }

type Props = {
	params: Promise<Params>
}

export default async function Page({ params }: Props) {
	const schedule = await getSchedule(await params)
	console.log({ schedule })
	if (!schedule) notFound()
	return <Modules modules={schedule.modules} schedule={schedule} />
}

export async function generateMetadata({ params }: Props) {
	const schedule = await getSchedule(await params)
	console.log({ schedule })
	if (!schedule) notFound()

	return processMetadata(schedule)
}

export async function generateStaticParams() {
	const slugs = await client.fetch<string[]>(
		groq`*[_type == 'schedule' && defined(metadata.slug.current)].metadata.slug.current`,
	)

	return slugs.map((slug) => ({ slug: slug.split('/') }))
}

async function getSchedule(params: Params) {
	const eventsTemplateExists = await fetchSanityLive<boolean>({
		query: groq`count(*[_type == 'global-module' && path == '${EVENTS_DIR}/']) > 0`,
	})

	if (!eventsTemplateExists) throw new Error(errors.missingEventsTemplate)

	const { slug, lang } = processSlug(params)

	return await fetchSanityLive<Sanity.Schedule & { modules: Sanity.Module[] }>({
		query: groq`*[
			_type == 'schedule'
			&& metadata.slug.current == $slug
			${lang ? `&& language == '${lang}'` : ''}
		][0]{
			${SCHEDULE_QUERY},
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			'modules': (
				// global modules (before)
				*[_type == 'global-module' && path == '*'].before[]{ ${MODULES_QUERY} }
				// path modules (before)
				+ *[_type == 'global-module' && path == '${EVENTS_DIR}/'].before[]{ ${MODULES_QUERY} }
				// path modules (after)
				+ *[_type == 'global-module' && path == '${EVENTS_DIR}/'].after[]{ ${MODULES_QUERY} }
				// global modules (after)
				+ *[_type == 'global-module' && path == '*'].after[]{ ${MODULES_QUERY} }
			),
			${TRANSLATIONS_QUERY},
		}`,
		params: { slug },
	})
}

function processSlug(params: Params) {
	const lang = languages.includes(params.slug[0] as Lang)
		? params.slug[0]
		: undefined

	const slug = params.slug.join('/')

	return {
		slug: lang ? slug.replace(new RegExp(`^${lang}/`), '') : slug,
		lang,
	}
}
