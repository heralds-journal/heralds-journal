import Link from 'next/link'
import resolveUrl from '@/lib/resolveUrl'
import { cn } from '@/lib/utils'

function formatEventTime(schedule: Sanity.Schedule) {
	const { eventSchedule } = schedule
	if (!eventSchedule) return null

	const { eventType } = eventSchedule

	if (eventType === 'allDay') {
		const start = eventSchedule.allDayStartDate
		const end = eventSchedule.allDayEndDate

		if (!start) return 'All day'

		const startDate = new globalThis.Date(`${start}T00:00:00`)
		const endDate = end ? new globalThis.Date(`${end}T00:00:00`) : null

		if (endDate && startDate.getTime() !== endDate.getTime()) {
			return `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
		}
		return `${startDate.toLocaleDateString()} (All day)`
	}

	// Timed event
	const start = eventSchedule.startDateTime
		? new globalThis.Date(eventSchedule.startDateTime)
		: null
	const end = eventSchedule.endDateTime
		? new globalThis.Date(eventSchedule.endDateTime)
		: null

	if (!start) return null

	const dateStr = start.toLocaleDateString()
	const startTime = start.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	})
	const endTime = end
		? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		: ''

	return endTime
		? `${dateStr} · ${startTime} – ${endTime}`
		: `${dateStr} · ${startTime}`
}

export default function SchedulePreview({
	schedule,
	skeleton,
}: {
	schedule?: Sanity.Schedule
	skeleton?: boolean
}) {
	const url = schedule ? resolveUrl(schedule) : '#'
	const eventTime = schedule ? formatEventTime(schedule) : null

	return (
		<div className={cn('group flex flex-col gap-4', skeleton && 'skeleton')}>
			<div className="space-y-2">
				<Link
					className="group-hover:underline"
					href={skeleton ? '#' : url}
					tabIndex={skeleton ? -1 : undefined}
				>
					<h3 className="h4 line-clamp-2 text-balance empty:h-[2lh]">
						{schedule?.metadata?.title || schedule?.title}
					</h3>
				</Link>
			</div>

			<div className="grow">
				<p className="line-clamp-3 text-sm empty:h-[3lh]">
					{schedule?.metadata?.description || schedule?.content}
				</p>
			</div>

			{(eventTime || skeleton) && (
				<div className="flex items-center gap-2 text-sm">
					<span className="text-xs">📅</span>
					<span>{eventTime || 'Event time'}</span>
				</div>
			)}

			{(schedule?.categories?.length || skeleton) && (
				<div className="flex flex-wrap gap-2">
					{skeleton ? (
						<div className="h-5 w-16 rounded bg-gray-200" />
					) : (
						schedule?.categories?.map((category) => (
							<span
								key={category._id}
								className="rounded-full bg-gray-100 px-2 py-1 text-xs"
							>
								{category.title}
							</span>
						))
					)}
				</div>
			)}

			{(schedule?.relatedContent?.length || skeleton) && (
				<div className="pt-2 text-xs text-gray-600">
					{skeleton
						? 'Related content'
						: `${schedule?.relatedContent?.length} related item${schedule?.relatedContent?.length !== 1 ? 's' : ''}`}
				</div>
			)}
		</div>
	)
}
