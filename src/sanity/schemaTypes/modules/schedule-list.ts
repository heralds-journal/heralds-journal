import { defineField, defineType } from 'sanity'
import { VscCalendar } from 'react-icons/vsc'
import { getBlockText } from '@/lib/utils'

export default defineType({
	name: 'schedule-list',
	title: 'Schedule list',
	icon: VscCalendar,
	type: 'object',
	groups: [
		{ name: 'content', default: true },
		{ name: 'filtering' },
		{ name: 'options' },
	],
	fields: [
		defineField({
			name: 'options',
			type: 'module-options',
			group: 'options',
		}),
		defineField({
			name: 'pretitle',
			type: 'string',
			group: 'content',
		}),
		defineField({
			name: 'intro',
			type: 'array',
			of: [{ type: 'block' }],
			group: 'content',
		}),
		defineField({
			name: 'layout',
			type: 'string',
			options: {
				list: ['grid', 'carousel'],
				layout: 'radio',
			},
			initialValue: 'grid',
			group: 'options',
		}),
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
			group: 'filtering',
		}),
		defineField({
			name: 'showPastEvents',
			description: 'Include events that have already passed',
			type: 'boolean',
			initialValue: false,
			group: 'filtering',
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
			group: 'filtering',
		}),
		defineField({
			name: 'displayFilters',
			title: 'Display category filter buttons',
			description: 'Allows for on-page filtering of schedules by category',
			type: 'boolean',
			initialValue: false,
			group: 'filtering',
			hidden: ({ parent }) => !!parent.filteredCategory,
		}),
		defineField({
			name: 'limit',
			title: 'Number of schedules to show',
			description: 'Leave empty to show all schedules',
			type: 'number',
			initialValue: 6,
			validation: (Rule) => Rule.min(1).integer(),
			group: 'filtering',
		}),
		defineField({
			name: 'filteredCategory',
			title: 'Filter schedules by a category',
			description: 'Leave empty to show all schedules',
			type: 'reference',
			to: [{ type: 'blog.category' }],
			group: 'filtering',
		}),
	],
	preview: {
		select: {
			intro: 'intro',
		},
		prepare: ({ intro }) => ({
			title: getBlockText(intro),
			subtitle: 'Schedule list',
		}),
	},
})
