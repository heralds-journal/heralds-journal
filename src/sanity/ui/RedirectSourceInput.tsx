'use client'

import { useCallback } from 'react'
import { Button, Flex, Stack } from '@sanity/ui'
import type { StringInputProps, StringSchemaType } from 'sanity'
import { set, unset } from 'sanity'
import { nanoid } from 'nanoid'

const DEFAULT_LENGTH = 6

function normalizePrefix(prefix: string) {
	if (!prefix) return '/'
	const trimmed = prefix.trim()
	if (!trimmed) return '/'
	if (/^https?:\/\//.test(trimmed)) {
		return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
	}
	const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
	return withLeading === '/' ? '/' : `${withLeading.replace(/\/+$/g, '')}/`
}

export default function RedirectSourceInput(
	props: StringInputProps<StringSchemaType>,
) {
	const { onChange, renderDefault, schemaType } = props

	const { basePath, idLength } = (schemaType.options ?? {}) as {
		basePath?: string
		idLength?: number
	}

	const generateShortlink = useCallback(() => {
		const length = typeof idLength === 'number' && idLength > 0 ? idLength : DEFAULT_LENGTH
		const prefix = normalizePrefix(basePath ?? '/')
		const id = nanoid(length)
		const nextValue = prefix === '/' ? `/${id}` : `${prefix}${id}`
		onChange(id ? set(nextValue) : unset())
	}, [basePath, idLength, onChange])

	return (
		<Stack space={2}>
			{renderDefault(props)}
			<Flex justify="flex-end">
				<Button mode="ghost" onClick={generateShortlink} text="Generate shortlink" />
			</Flex>
		</Stack>
	)
}
