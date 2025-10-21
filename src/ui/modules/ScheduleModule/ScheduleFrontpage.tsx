import moduleProps from '@/lib/moduleProps'
import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'
import SchedulePreview from './SchedulePreview'

interface ScheduleFrontpageProps extends Sanity.Module {
	_type: 'schedule-frontpage'
	sortBy?: 'date-asc' | 'date-desc' | 'created-desc' | 'title-asc'
	itemsPerPage?: number
	showPastEvents?: boolean
	eventTypeFilter?: 'all' | 'timed' | 'allDay'
}

export default async function ScheduleFrontpage({
	sortBy = 'date-asc',
	itemsPerPage = 6,
	showPastEvents = false,
	eventTypeFilter = 'all',
	...props
}: ScheduleFrontpageProps) {
	// Build the order clause based on sortBy
	const getOrderClause = () => {
		switch (sortBy) {
			case 'date-desc':
				return 'order(coalesce(eventSchedule.startDateTime, eventSchedule.allDayStartDate) desc)'
			case 'created-desc':
				return 'order(_createdAt desc)'
			case 'title-asc':
				return 'order(title asc)'
			case 'date-asc':
			default:
				return 'order(coalesce(eventSchedule.startDateTime, eventSchedule.allDayStartDate) asc)'
		}
	}

	// Build the filter conditions
	const filters = ['_type == "schedule"']

	if (!showPastEvents) {
		const now = new Date().toISOString()
		filters.push(`(
			eventSchedule.eventType == "allDay" && eventSchedule.allDayStartDate >= "${now.split('T')[0]}" ||
			eventSchedule.eventType == "timed" && eventSchedule.startDateTime >= "${now}"
		)`)
	}

	if (eventTypeFilter !== 'all') {
		filters.push(`eventSchedule.eventType == "${eventTypeFilter}"`)
	}

	const whereClause = filters.join(' && ')

	const query = groq`
		*[${whereClause}] | ${getOrderClause()} [0...${itemsPerPage}] {
			_id,
			_type,
			title,
			content,
			eventSchedule,
			metadata,
			categories[]-> {
				_id,
				title
			},
			relatedContent[]-> {
				_id,
				_type,
				title,
				metadata
			}
		}
	`

	const schedules = await client.fetch<Sanity.Schedule[]>(query)

	return (
		<section {...moduleProps(props)}>
			<div className="section">
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{schedules.map((schedule) => (
						<SchedulePreview key={schedule._id} schedule={schedule} />
					))}
				</div>

				{schedules.length === 0 && (
					<div className="py-12 text-center">
						<p className="text-gray-600">No scheduled events found.</p>
					</div>
				)}
			</div>
		</section>
	)
}
