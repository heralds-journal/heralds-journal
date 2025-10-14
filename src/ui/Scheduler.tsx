'use client'

import { useCallback, useEffect, useState } from 'react'

export default function Scheduler({
	start,
	end,
	children,
}: Partial<{
	start: string
	end: string
	children: React.ReactNode
}>) {
	const checkActive = useCallback(() => {
		const now = new Date()
		return (!start || new Date(start) < now) && (!end || new Date(end) > now)
	}, [start, end])

	const [isActive, setIsActive] = useState(checkActive)

	useEffect(() => {
		if (!start && !end) return

		const interval = setInterval(() => setIsActive(checkActive()), 1000) // check every second
		return () => clearInterval(interval)
	}, [start, end, checkActive])

	if (!start && !end) return children
	if (!isActive) return null

	return children
}
