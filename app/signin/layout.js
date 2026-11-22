import TranslatePage from "@/components/TranslatePage";

// guestmail: this page in Spanish for whoever reads it in Spanish (components/TranslatePage.jsx). A layout of its own
// so upstream's page isn't touched.
export default function TranslatedLayout({ children }) {
	return (
		<>
			<TranslatePage />
			{children}
		</>
	);
}
