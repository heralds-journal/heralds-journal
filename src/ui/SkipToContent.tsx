export default function SkipToContent() {
	return (
		<a
			href="#main-content"
			className="bg-canvas text-ink absolute top-0 left-0 z-20 not-focus:sr-only"
			tabIndex={0}
		>
			Skip to content
		</a>
	)
}
