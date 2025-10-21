import errors from './errors'

export const dev = process.env.NODE_ENV === 'development'

export const netlifyPreview = process.env.CONTEXT === 'deploy-preview'

if (!process.env.NEXT_PUBLIC_BASE_URL) {
	throw new Error(errors.missingBaseUrl)
}

export const BLOG_DIR = 'blog'
export const EVENTS_DIR = 'events'

export const BASE_URL = dev
	? 'http://localhost:3000'
	: process.env.NEXT_PUBLIC_BASE_URL!
