import { useEffect, useState } from "react";
import type { NamedList } from "@bcn/core";

type Props = {
    images: NamedList[];
    name: string;
    onClose: () => void;
};

export function ImageGalleryModal({ images, name, onClose }: Props) {
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key !== "Escape") return;
            if (selected !== null) {
                setSelected(null);
            } else {
                onClose();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selected, onClose]);

    // Lock body scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 bg-white flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="All photos"
        >
            {selected ? (
                /* ── Fullscreen single image ── */
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 px-6 py-4 border-b border-[#EBEBEB] shrink-0">
                        <button
                            onClick={() => setSelected(null)}
                            className="flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#FF385C] transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Back
                        </button>
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
                        <img
                            src={selected}
                            alt={name}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </div>
            ) : (
                /* ── Gallery browse ── */
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB] shrink-0">
                        <h2 className="font-display text-xl font-semibold text-[#222222]">
                            All photos
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors"
                            aria-label="Close"
                        >
                            <svg
                                className="w-5 h-5 text-[#222222]"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                        {images.map((section) => (
                            <div key={section.title}>
                                {section.title && (
                                    <h3 className="text-base font-semibold text-[#222222] mb-4">
                                        {section.title}
                                    </h3>
                                )}
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                                    {section.items.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelected(url)}
                                            className="shrink-0 w-64 h-48 rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
                                        >
                                            <img
                                                src={url}
                                                alt={`${section.title || name} ${i + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
