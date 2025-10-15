// import { GoogleTagManager } from '@next/third-parties/google'
import '@/styles/app.css'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import Root from '@/ui/Root'
import SkipToContent from '@/ui/SkipToContent'
import Announcement from '@/ui/Announcement'
import Header from '@/ui/header'
import Footer from '@/ui/footer'
import VisualEditingControls from '@/ui/VisualEditingControls'


export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<Root>
			{/* <GoogleTagManager gtmId="" /> */}
			<body className="bg-canvas text-ink antialiased">
				<NuqsAdapter>
					<SkipToContent />
					<Announcement />
					<Header />
					<main id="main-content" role="main" tabIndex={-1}>
						{children}
					</main>
					<Footer />

					<VisualEditingControls />
				</NuqsAdapter>
			</body>
		</Root>
	)
}
