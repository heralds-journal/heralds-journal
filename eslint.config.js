import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
})

const config = [
	{
		ignores: [
			'node_modules/**',
			'.next/**',
			'out/**',
			'build/**',
			'dist/**',
			'public/studio/static/**',
			'*.log',
			'.env*',
			'next-env.d.ts',
		],
	},
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@next/next/no-img-element': 'off',
		},
	},
]

export default config
