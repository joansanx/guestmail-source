"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import InputSearch from "@/components/InputSearch";
import { STOCK_PHOTO_SIZE, getStockPhotoUrl, getStockThumbUrl, searchStockPhotos } from "@/lib/stock-photos";
import { cn } from "@/lib/utils";

// guestmail: GuestMail's own photos in the image picker (components/DialogImagePicker.jsx): a search by what they show,
// in English or Spanish, and a grid, a venue's own kind first. A photo goes into the issue by its full address on this
// dashboard's host, which a sent email loads too, with its description in the venue's language as its alt text.
// kind: the venue's, or null. onSelect({ url, width, height, alt }).
export default function GridStockPhotos({ kind, language, currentUrl, isDisabled, onSelect }) {
	const [query, setQuery] = useState("");
	const photos = searchStockPhotos(query, kind);

	return (
		<section className="flex min-w-0 flex-col animate-fade-in">
			<div className="px-4">
				<InputSearch value={query} onChange={setQuery} placeholder="Search: room, pool, breakfast, wine…" aria-label="Search stock photos" autoFocus />
			</div>
			{photos.length === 0 ? (
				<p className="px-4 py-10 text-center text-sm text-muted-foreground">No stock photo matches “{query.trim()}”</p>
			) : (
				<div className="mt-3 max-h-[min(24rem,55dvh)] overflow-y-auto overscroll-contain border-t border-border/60">
					<ul className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
						{photos.map((photo) => {
							const alt = photo.alt[language] ?? photo.alt.en;
							const isCurrent = Boolean(currentUrl) && currentUrl.endsWith(`/stock/${photo.file}`);
							return (
								<li key={photo.id}>
									<button
										type="button"
										disabled={isDisabled}
										aria-current={isCurrent || undefined}
										aria-label={alt}
										title={alt}
										onClick={() => onSelect({ url: getStockPhotoUrl(photo, window.location.origin), ...STOCK_PHOTO_SIZE, alt })}
										className={cn(
											"group relative block aspect-[3/2] w-full overflow-hidden rounded-lg bg-muted shadow-border outline-none transition-[box-shadow,scale,opacity] duration-150 ease-out hover:shadow-border-hover focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] disabled:opacity-50",
											isCurrent && "ring-2 ring-foreground"
										)}
									>
										<Image
											src={getStockThumbUrl(photo)}
											alt=""
											fill
											unoptimized
											sizes="180px"
											loading="lazy"
											className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
										/>
										{isCurrent && (
											<span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background shadow-sm">
												<Check className="size-3" strokeWidth={3} />
											</span>
										)}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</section>
	);
}
