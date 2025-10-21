import moduleProps from '@/lib/moduleProps'
import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'
import SchedulePreview from './SchedulePreview'
import Content from '../RichtextModule/Content'

interface ScheduleListProps extends Sanity.Module {
	_type: 'schedule-list'
	pretitle?: string
	intro?: any[]
	layout?: 'grid' | 'carousel'
	sortBy?: 'date-asc' | 'date-desc' | 'created-desc' | 'title-asc'
	showPastEvents?: boolean
	eventTypeFilter?: 'all' | 'timed' | 'allDay'
	displayFilters?: boolean
	limit?: number
	filteredCategory?: { _id: string; title: string }
}

export default async function ScheduleList({
	pretitle,
	intro,
	layout = 'grid',
	sortBy = 'date-asc',
	showPastEvents = false,
	eventTypeFilter = 'all',
	limit = 6,
	filteredCategory,
	...props
}: ScheduleListProps) {
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

	if (filteredCategory) {
		filters.push(`references("${filteredCategory._id}")`)
	}

	const whereClause = filters.join(' && ')

	const query = groq`
		*[${whereClause}] | ${getOrderClause()} [0...${limit || 100}] {
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
				{(pretitle || intro) && (
					<header className="text-center">
						{pretitle && (
							<p className="text-sm font-medium tracking-wide text-gray-600 uppercase">
								{pretitle}
							</p>
						)}

						{intro && (
							<div className="prose mx-auto mt-4">
								<Content value={intro} />
							</div>
						)}
					</header>
				)}

				<div
					className={
						layout === 'carousel'
							? 'flex gap-6 overflow-x-auto pb-4'
							: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
					}
				>
					{schedules.map((schedule) => (
						<div
							key={schedule._id}
							className={layout === 'carousel' ? 'min-w-[300px]' : ''}
						>
							<SchedulePreview schedule={schedule} />
						</div>
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
