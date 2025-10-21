import type {
	StructureBuilder,
	ListItemBuilder,
	ListItem,
	Divider,
} from 'sanity/structure'
import { apiVersion } from '@/sanity/lib/env'

export const singleton = (
	S: StructureBuilder,
	id: string,
	title?: string,
): ListItemBuilder =>
	S.listItem()
		.id(id)
		.title(
			title ||
			id
				.split(/(?=[A-Z])/)
				.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(' '),
		)
		.child(S.editor().id(id).schemaType(id).documentId(id))

export const group = (
	S: StructureBuilder,
	title: string,
	items: (ListItemBuilder | ListItem | Divider)[],
): ListItemBuilder =>
	S.listItem().title(title).child(S.list().title(title).items(items))

type OrderingMenuItem = ReturnType<StructureBuilder['orderingMenuItem']>

export const directory = (
	S: StructureBuilder,
	path: string,
	{
		maxLevel,
		menuItems,
	}: { maxLevel?: number; menuItems?: OrderingMenuItem[] } = {},
) =>
	S.listItem()
		.title(`/${path}`)
		.schemaType('page')
		.child(
			S.documentList()
				.id(`page.${path.replaceAll('/', '-')}`)
				.filter(
					`_type == "page" && string::startsWith(metadata.slug.current, $path)
					${maxLevel !== undefined ? `&& count(string::split(metadata.slug.current, '/')) <= ${maxLevel + 1}` : ''}`,
				)
				.apiVersion(apiVersion)
				.params({ path: path + '/' })
				.menuItems(
					menuItems ?? [
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
					],
				)
				.defaultOrdering([
					{ field: 'metadata.slug.current', direction: 'asc' },
				]),
		)
