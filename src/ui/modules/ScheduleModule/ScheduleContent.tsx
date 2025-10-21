import moduleProps from '@/lib/moduleProps'

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

export default function ScheduleContent({
	schedule,
	...props
}: { schedule?: Sanity.Schedule } & Sanity.Module) {
	if (!schedule) return null

	const eventTime = formatEventTime(schedule)

	return (
		<article {...moduleProps(props)}>
			<header className="section space-y-6 text-center">
				<h1 className="h1 text-balance">
					{schedule.metadata?.title || schedule.title}
				</h1>

				{eventTime && (
					<div className="flex items-center justify-center gap-2 text-lg">
						<span>📅</span>
						<span>{eventTime}</span>
					</div>
				)}

				{schedule.categories?.length && (
					<div className="flex flex-wrap items-center justify-center gap-2">
						{schedule.categories.map((category) => (
							<span
								key={category._id}
								className="rounded-full bg-gray-100 px-3 py-1 text-sm"
							>
								{category.title}
							</span>
						))}
					</div>
				)}
			</header>

			{(schedule.content || schedule.metadata?.description) && (
				<div className="section max-w-screen-md space-y-4">
					{schedule.metadata?.description && (
						<p className="text-lg text-gray-600">
							{schedule.metadata.description}
						</p>
					)}

					{schedule.content && (
						<div className="prose max-w-none">
							<p style={{ whiteSpace: 'pre-wrap' }}>{schedule.content}</p>
						</div>
					)}
				</div>
			)}

			{schedule.relatedContent?.length && (
				<div className="section space-y-4">
					<h2 className="h2">Related Content</h2>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{schedule.relatedContent.map((item) => (
							<div key={item._id} className="rounded border p-4">
								<h3 className="font-medium">
									{item._type === 'blog.post'
										? item.metadata?.title
										: item.title}
								</h3>
								{item.metadata?.description && (
									<p className="mt-2 line-clamp-2 text-sm text-gray-600">
										{item.metadata.description}
									</p>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</article>
	)
}
