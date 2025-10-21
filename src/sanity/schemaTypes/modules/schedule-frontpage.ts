import { defineField, defineType } from 'sanity'
import { VscCalendar } from 'react-icons/vsc'

export default defineType({
	name: 'schedule-frontpage',
	title: 'Schedule frontpage',
	icon: VscCalendar,
	type: 'object',
	fields: [
		defineField({
			name: 'sortBy',
			description: 'Choose how to sort the schedules',
			type: 'string',
			options: {
				list: [
					{ title: 'Event start date (ascending)', value: 'date-asc' },
					{ title: 'Event start date (descending)', value: 'date-desc' },
					{ title: 'Created date (newest first)', value: 'created-desc' },
					{ title: 'Title (A-Z)', value: 'title-asc' },
				],
				layout: 'dropdown',
			},
			initialValue: 'date-asc',
		}),
		defineField({
			name: 'itemsPerPage',
			type: 'number',
			initialValue: 6,
			validation: (Rule) => Rule.required().min(1),
		}),
		defineField({
			name: 'showPastEvents',
			description: 'Include events that have already passed',
			type: 'boolean',
			initialValue: false,
		}),
		defineField({
			name: 'eventTypeFilter',
			description: 'Filter by event type',
			type: 'string',
			options: {
				list: [
					{ title: 'All events', value: 'all' },
					{ title: 'Timed events only', value: 'timed' },
					{ title: 'All-day events only', value: 'allDay' },
				],
				layout: 'radio',
			},
			initialValue: 'all',
		}),
	],
	preview: {
		select: {
			sortBy: 'sortBy',
			showPastEvents: 'showPastEvents',
		},
		prepare: ({ sortBy, showPastEvents }) => ({
			title: 'Schedule frontpage',
			subtitle: `Sort: ${sortBy || 'date-asc'}${showPastEvents ? ' (includes past)' : ''}`,
		}),
	},
})
