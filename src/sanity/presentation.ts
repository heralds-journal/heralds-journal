'use client'

import { defineLocations, presentationTool } from 'sanity/presentation'
import { groq } from 'next-sanity'
import { BLOG_DIR, EVENTS_DIR } from '@/lib/env'

export const presentation = presentationTool({
	name: 'editor',
	title: 'Editor',
	previewUrl: {
		previewMode: {
			enable: '/api/draft-mode/enable',
		},
	},
	resolve: {
		mainDocuments: [
			{
				route: '/',
				filter: groq`_type == 'page' && metadata.slug.current == 'index'`,
			},
			{
				route: '/:slug',
				filter: groq`_type == 'page' && metadata.slug.current == $slug`,
			},
			{
				route: `/${BLOG_DIR}/:slug`,
				filter: groq`_type == 'blog.post' && metadata.slug.current == $slug`,
			},
		],
		locations: {
			site: defineLocations({
				message: 'This document is used on all pages',
				locations: [
					{
						title: 'Home',
						href: '/',
					},
				],
			}),
			page: defineLocations({
				select: {
					title: 'title',
					metaTitle: 'metadata.title',
					slug: 'metadata.slug.current',
				},
				resolve: (doc) => ({
					locations: [
						{
							title: doc?.title || doc?.metaTitle || 'Untitled',
							href: doc?.slug
								? doc.slug === 'index'
									? '/'
									: `/${doc.slug}`
								: '/',
						},
					],
				}),
			}),
			'blog.post': defineLocations({
				select: {
					title: 'metadata.title',
					slug: 'metadata.slug.current',
				},
				resolve: (doc) => ({
					locations: [
						{
							title: doc?.title || 'Untitled',
							href: doc?.slug ? `/${BLOG_DIR}/${doc.slug}` : `/${BLOG_DIR}`,
						},
					],
				}),
			}),
			'blog.category': defineLocations({
				select: {
					title: 'title',
					slug: 'slug.current',
				},
				resolve: (doc) => ({
					locations: [
						{
							title: doc?.title || 'Untitled',
							href: doc?.slug
								? `/${BLOG_DIR}?category=${doc.slug}`
								: `/${BLOG_DIR}`,
						},
					],
				}),
			}),
			schedule: defineLocations({
				select: {
					title: 'title',
					slug: 'metadata.slug.current',
					eventType: 'eventSchedule.eventType',
					startDateTime: 'eventSchedule.startDateTime',
					endDateTime: 'eventSchedule.endDateTime',
					allDayStartDate: 'eventSchedule.allDayStartDate',
					allDayEndDate: 'eventSchedule.allDayEndDate',
					legacyTitle: 'eventSchedule.title',
					legacyStart: 'start',
					legacyEnd: 'end',
				},
				resolve: (doc) => {
					const title = doc?.title || doc?.legacyTitle || 'Untitled'
					const eventType =
						doc?.eventType ||
						(doc?.allDayStartDate || doc?.allDayEndDate ? 'allDay' : 'timed')
					const subtitle = (() => {
						if (eventType === 'allDay') {
							const start = doc?.allDayStartDate
								? new Date(
										`${doc.allDayStartDate}T00:00:00`,
									).toLocaleDateString()
								: null
							const end = doc?.allDayEndDate
								? new Date(`${doc.allDayEndDate}T00:00:00`).toLocaleDateString()
								: null
							if (start && end) {
								return `From ${start} to ${end}`
							}
							if (start) {
								return `All day on ${start}`
							}
							return 'No dates set'
						}
						const startSource = doc?.startDateTime || doc?.legacyStart
						const endSource = doc?.endDateTime || doc?.legacyEnd
						const start = startSource ? new Date(startSource) : null
						const end = endSource ? new Date(endSource) : null
						if (start && end) {
							return `From ${start.toLocaleString()} to ${end.toLocaleString()}`
						}
						if (start) {
							return `Starts ${start.toLocaleString()}`
						}
						if (end) {
							return `Ends ${end.toLocaleString()}`
						}
						return 'No dates set'
					})()
					return {
						locations: [
							{
								title,
								subtitle,
								href: doc?.slug
									? `/${EVENTS_DIR}/${doc.slug}`
									: `/${EVENTS_DIR}`,
							},
						],
					}
				},
			}),
		},
	},
})
