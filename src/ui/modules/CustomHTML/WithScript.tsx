'use client'

import { ComponentProps, useEffect, useRef, useState } from 'react'
import moduleProps from '@/lib/moduleProps'

/**
 * @description If the code includes a <script> tag, ensure the script is re-run on each render
 */
export default function WithScript({
	code,
	className,
	...props
}: Sanity.CustomHTML['html'] & Sanity.Module & ComponentProps<'section'>) {
	const ref = useRef<HTMLElement>(null)
	const [firstRender, setFirstRender] = useState(true)

	useEffect(() => {
		if (!code) return

		if (firstRender) {
			setFirstRender(false)
		} else {
			const parsed = document.createRange().createContextualFragment(code)
			ref.current?.appendChild(parsed)
		}
	}, [firstRender, code])

	if (!code) return null

	return <section ref={ref} className={className} {...moduleProps(props)} />
}
