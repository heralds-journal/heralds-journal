import { apiVersion } from '@/sanity/lib/env'
import type { DocumentActionComponent, SanityClient } from 'sanity'

export function pageActions(
	input: DocumentActionComponent[],
	envCtx: any,
): DocumentActionComponent[] {
	return input.map((action: any) => {
		const wrapped: DocumentActionComponent = (props: any) => {
			// Invoke the original action to get its description first
			const original = action?.(props)
			if (!original) return original

			const type = original.action ?? action?.action
			const label = `${original?.label || original?.title || ''}`.toLowerCase()
			const isPublish = type === 'publish' || label.includes('publish')
			if (isPublish) {
				const originalOnHandle = original.onHandle?.bind(original)
				return {
					...original,
					onHandle: async () => {
						console.log({ props })
						console.log('envCtx type:', typeof envCtx)
						console.log('envCtx.getClient:', typeof envCtx?.getClient)

						try {
							const draft: any = props?.draft
							const lang: string | undefined = draft?.language
							const id: string | undefined = props?.id

							const client = envCtx.getClient({ apiVersion }) as SanityClient
							if (!client) {
								console.warn(
									'[pageActions] publish: no client available; skipping cascade',
								)
								props.toast?.push?.({
									status: 'warning',
									title: 'Publish: no client',
									description: 'Skipping child slug cascade.',
								})
								await originalOnHandle?.()
								return
							}

							const publishedId =
								id && id.startsWith('drafts.') ? id.slice(7) : id
							const previous = await client.fetch(
								`*[_id == $id][0]{ 'slug': metadata.slug.current, language }`,
								{ id: publishedId },
							)
							const prevSlug: string | undefined = previous?.slug
							console.log(
								'[pageActions] publish: prevSlug, lang, publishedId',
								prevSlug,
								lang,
								publishedId,
							)

							// Run the original publish action first
							await originalOnHandle?.()

							// Propagate changes
							const changed: any = props?.draft
							const newSlug: string | undefined =
								changed?.metadata?.slug?.current
							console.log('[pageActions] publish: newSlug', newSlug)

							if (prevSlug && newSlug && prevSlug !== newSlug) {
								const prefix = prevSlug + '/'
								const newPrefix = newSlug + '/'

								props.toast?.push?.({
									status: 'info',
									title: 'Cascading slug changes',
									description: `Updating children from ${prefix} to ${newPrefix}`,
								})

								let filter = `_type == "page" && !(_id in path("drafts.**")) && defined(metadata.slug.current) && string::startsWith(metadata.slug.current, $prefix)`
								const params: Record<string, any> = { prefix }
								if (lang) {
									filter += ` && (!defined(language) || language == $lang)`
									params.lang = lang
								} else {
									filter += ` && !defined(language)`
								}

								const children: Array<{ _id: string; slug: string }> =
									await client.fetch(
										`*[${filter}]{ _id, 'slug': metadata.slug.current }`,
										params,
									)

								if (children.length) {
									const draftIds = children.map((c) => `drafts.${c._id}`)
									const existingDrafts = await client.fetch(
										`*[_id in $draftIds][]._id`,
										{ draftIds },
									)
									const draftSet = new Set(existingDrafts)

									const mutations: any[] = []
									for (const c of children) {
										const newSlug = c.slug.replace(prefix, newPrefix)

										mutations.push({
											patch: {
												id: c._id,
												set: {
													'metadata.slug': { _type: 'slug', current: newSlug },
												},
											},
										})
										if (draftSet.has(`drafts.${c._id}`)) {
											const draftId = `drafts.${c._id}`

											mutations.push({
												patch: {
													id: draftId,
													set: {
														'metadata.slug': {
															_type: 'slug',
															current: newSlug,
														},
													},
												},
											})
										}
									}

									/* const result = */ await client.mutate(mutations, {
										tag: 'page.cascade.slug',
										returnDocuments: false,
									})

									props.toast?.push?.({
										status: 'success',
										title: 'Child slugs updated',
										description: `Updated ${children.length} item(s).`,
									})
								}
							} else {
								props.toast?.push?.({
									status: 'info',
									title: 'No cascade needed',
									description: 'Slug prefix did not change.',
								})
							}
						} catch (err) {
							console.error('[pageActions] publish: error', err)
							props.toast?.push?.({
								status: 'error',
								title: 'Cascade failed',
								description: (err as Error).message,
							})
						}
					},
				}
			}

			const isDelete = type === 'delete' || label.includes('delete')
			if (isDelete) {
				const originalOnHandle = original.onHandle?.bind(original)
				return {
					...original,
					onHandle: async () => {
						const snapshot: any = props?.published || props?.draft
						const slug: string | undefined = snapshot?.metadata?.slug?.current
						const lang: string | undefined = snapshot?.language

						if (!slug) return originalOnHandle?.()

						if (slug === 'index' || slug === '/' || slug === '/index') {
							props.toast?.push?.({
								status: 'warning',
								title: 'Delete blocked',
								description: 'Cannot delete the homepage.',
							})
							return
						}

						const client = envCtx.getClient({ apiVersion }) as SanityClient
						if (!client) return originalOnHandle?.()

						const prefix = slug + '/'
						let filter = `_type == "page" && !(_id in path("drafts.**")) && defined(metadata.slug.current) && string::startsWith(metadata.slug.current, $prefix)`
						const params: Record<string, any> = { prefix }
						if (lang) {
							filter += ` && (!defined(language) || language == $lang)`
							params.lang = lang
						} else {
							filter += ` && !defined(language)`
						}

						const count: number = await client.fetch(
							`count(*[${filter}])`,
							params,
						)

						if (count > 0) {
							props.toast?.push?.({
								status: 'warning',
								title: 'Delete blocked',
								description: `This page has ${count} child page(s). Delete or reassign them first.`,
							})
							return
						}

						await originalOnHandle?.()
					},
				}
			}

			return original
		}

		return wrapped
	})
}
