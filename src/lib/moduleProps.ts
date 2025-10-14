import { stegaClean } from 'next-sanity'
import { dev } from './env'

function moduleProps({
	_type,
	options,
	_key,
	...props
}: Partial<Sanity.Module>) {
	return {
		id: stegaClean(options?.uid) || 'module-' + _key,
		'data-module': _type,
		hidden: !dev && options?.hidden,
		...props,
	}
}

export default moduleProps
