import { structureTool } from 'sanity/structure'
import { apiVersion } from '@/sanity/lib/env'
import { singleton, group, directory } from './lib/builders'
import { VscFiles, VscSettings } from 'react-icons/vsc'

const pageSortMenuItems = (S: any) => [
	S.orderingMenuItem({
		name: 'slugAsc',
		title: 'URL slug (A→Z)',
		by: [{ field: 'metadata.slug.current', direction: 'asc' }],
	}),
	S.orderingMenuItem({
		name: 'updatedDesc',
		title: 'Last updated',
		by: [
			{ field: '_updatedAt', direction: 'desc' },
			{ field: '_createdAt', direction: 'desc' },
		],
	}),
]

export const structure = structureTool({
	structure: (S: any) =>
		S.list()
			.title('Content')
			.items([
				singleton(S, 'site', 'Site settings').icon(VscSettings),
				S.divider(),

				S.documentTypeListItem('page')
					.title('All pages')
					.icon(VscFiles)
					.child(
						S.documentList()
							.id('all-pages')
							.title('All pages')
							.filter(`_type == "page"`)
							.menuItems(pageSortMenuItems(S))
							.apiVersion(apiVersion)
							.defaultOrdering([
								{ field: 'metadata.slug.current', direction: 'asc' },
							]),
					),

				// customize page directories
				group(S, 'Directories', [
					directory(S, 'docs', {
						maxLevel: 1,
						menuItems: pageSortMenuItems(S),
					}).title('Docs'),
					directory(S, 'docs/modules', {
						menuItems: pageSortMenuItems(S),
					}).title('Docs › Modules'),
				]),

				S.documentTypeListItem('global-module').title('Global modules'),
				S.divider(),

				S.documentTypeListItem('schedule')
					.title('Scheduled Events')
					.child(
						S.documentList()
							.id('scheduled-events')
							.title('Scheduled Events')
							.filter(`_type == "schedule"`)
							.apiVersion(apiVersion)
							.defaultOrdering([
								{ field: 'eventSchedule.startDateTime', direction: 'desc' },
								{ field: 'eventSchedule.allDayStartDate', direction: 'desc' },
								{ field: '_createdAt', direction: 'desc' },
							]),
					),

				S.documentTypeListItem('blog.post').title('Blog posts'),
				S.documentTypeListItem('blog.category').title('Blog categories'),
				S.divider(),

				S.documentTypeListItem('navigation'),
				S.documentTypeListItem('redirect').title('Redirects'),

				group(S, 'Miscellaneous', [
					S.documentTypeListItem('announcement').title('Announcements'),
					S.documentTypeListItem('logo').title('Logos'),
					S.documentTypeListItem('person').title('People'),
					S.documentTypeListItem('pricing').title('Pricing tiers'),
					S.documentTypeListItem('reputation'),
					S.documentTypeListItem('testimonial').title('Testimonials'),
				]),
			]),
})
