import { defineField, defineType } from 'sanity'
import { VscCalendar } from 'react-icons/vsc'

export default defineType({
	name: 'schedule-post-content',
	title: 'Schedule post content',
	icon: VscCalendar,
	type: 'object',
	fields: [
		defineField({
			name: 'options',
			title: 'Module options',
			type: 'module-options',
		}),
	],
	preview: {
		select: {
			uid: 'options.uid',
		},
		prepare: ({ uid }) => ({
			title: 'Schedule post content',
			subtitle: uid && `#${uid}`,
		}),
	},
})
