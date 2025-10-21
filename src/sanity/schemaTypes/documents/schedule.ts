import { defineField, defineType } from 'sanity'
import { VscMegaphone, VscCalendar } from 'react-icons/vsc'

export default defineType({
	name: 'schedule',
	title: 'Scheduled Event',
	icon: VscMegaphone,
	type: 'document',
	groups: [
		{ name: 'content', title: 'Content', default: true },
		{ name: 'metadata', title: 'Metadata' },
	],
	fields: [
		defineField({
			name: 'title',
			title: 'Schedule title',
			type: 'string',
			validation: (Rule) => Rule.required(),
			group: 'content',
		}),
		defineField({
			name: 'content',
			type: 'text',
			group: 'content',
			rows: 3,
		}),
		defineField({
			name: 'eventSchedule',
			title: 'Schedule',
			group: 'content',
			type: 'object',
			fields: [
				defineField({
					name: 'eventType',
					title: 'Event type',
					type: 'string',
					initialValue: 'timed',
					options: {
						list: [
							{ title: 'Timed', value: 'timed' },
							{ title: 'All day', value: 'allDay' },
						],
						layout: 'radio',
					},
					validation: (Rule) => Rule.required(),
				}),
				defineField({
					name: 'startDateTime',
					title: 'Start (date and time)',
					type: 'datetime',
					hidden: ({ parent }) => parent?.eventType === 'allDay',
					validation: (Rule) =>
						Rule.custom((value, context) => {
							const parent = context.parent as any
							if (parent?.eventType !== 'timed') {
								return true
							}
							return value ? true : 'Set a start date and time'
						}),
				}),
				defineField({
					name: 'endDateTime',
					title: 'End (date and time)',
					type: 'datetime',
					hidden: ({ parent }) => parent?.eventType === 'allDay',
					description: 'Leave empty for open-ended sessions.',
					validation: (Rule) =>
						Rule.custom((value, context) => {
							const parent = context.parent as any
							if (parent?.eventType !== 'timed' || !value) {
								return true
							}
							const startDateTime = parent?.startDateTime
							if (startDateTime && value <= startDateTime) {
								return 'End must be after the start'
							}
							return true
						}),
				}),
				defineField({
					name: 'allDayStartDate',
					title: 'All-day start date',
					type: 'date',
					hidden: ({ parent }) => parent?.eventType !== 'allDay',
					validation: (Rule) =>
						Rule.custom((value, context) => {
							const parent = context.parent as any
							if (parent?.eventType !== 'allDay') {
								return true
							}
							return value ? true : 'Set a start date'
						}),
				}),
				defineField({
					name: 'allDayEndDate',
					title: 'All-day end date',
					type: 'date',
					description: 'Optional; use for multi-day events.',
					hidden: ({ parent }) => parent?.eventType !== 'allDay',
					validation: (Rule) =>
						Rule.custom((value, context) => {
							const parent = context.parent as any
							if (parent?.eventType !== 'allDay' || !value) {
								return true
							}
							const allDayStartDate = parent?.allDayStartDate
							if (allDayStartDate && value < allDayStartDate) {
								return 'End date must be on or after the start date'
							}
							return true
						}),
				}),
			],
		}),

		defineField({
			name: 'relatedContent',
			title: 'Related content',
			type: 'array',
			group: 'content',
			description: 'Optional related blog posts or pages.',
			of: [
				{
					type: 'reference',
					to: [{ type: 'blog.post' }, { type: 'page' }],
				},
			],
		}),
		defineField({
			name: 'categories',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'blog.category' }],
				},
			],
			group: 'content',
		}),
		defineField({
			name: 'metadata',
			type: 'metadata',
			group: 'metadata',
		}),
		defineField({
			name: 'language',
			type: 'string',
			readOnly: true,
			hidden: true,
		}),
	],
	preview: {
		select: {
			title: 'title',
			content: 'content',
			eventSchedule: 'eventSchedule',
		},
		prepare: ({ title: documentTitle, content, eventSchedule }) => {
			let subtitle = 'No schedule set'
			const schedule = eventSchedule || {}
			const title =
				typeof documentTitle === 'string' && documentTitle.trim().length > 0
					? documentTitle.trim()
					: (typeof content === 'string' && content.trim()) || 'Untitled Event'
			const eventType = schedule.eventType || 'timed'
			if (eventType === 'allDay') {
				const toDate = (value?: string) =>
					value ? new Date(`${value}T00:00:00`) : null
				const start = schedule.allDayStartDate
					? toDate(schedule.allDayStartDate)
					: null
				const end = schedule.allDayEndDate
					? toDate(schedule.allDayEndDate)
					: null
				const startStr = start ? start.toLocaleDateString() : 'No start date'
				subtitle = end
					? `${startStr} – ${end.toLocaleDateString()}`
					: `${startStr} (all day)`
			} else {
				const start = schedule.startDateTime
					? new Date(schedule.startDateTime)
					: null
				const end = schedule.endDateTime ? new Date(schedule.endDateTime) : null
				if (start) {
					const dateStr = start.toLocaleDateString()
					const startTime = start.toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})
					const endTime = end
						? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
						: ''
					subtitle = endTime
						? `${dateStr} · ${startTime} – ${endTime}`
						: `${dateStr} · ${startTime}`
				} else {
					subtitle = 'No date set'
				}
			}
			return {
				title,
				subtitle,
				media: VscCalendar,
			}
		},
	},
})
