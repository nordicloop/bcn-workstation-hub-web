import { useEffect, useRef, useState } from "react";
import type { NamedList } from "@bcn/core";

type Props = {
    images: NamedList[];
    name: string;
    onClose: () => void;
};

function imageSpan(i: number): string {
    if (i % 5 === 0) return "col-span-2 row-span-2";
    if (i % 5 === 3) return "col-span-2";
    return "";
}

export function ImageGalleryModal({ images, name, onClose }: Props) {
    const [selected, setSelected] = useState<string | null>(null);
    // Retain the last selected URL so the fullscreen img doesn't blank out on close transition
    const lastSelected = useRef<string | undefined>(undefined);
    if (selected !== null) lastSelected.current = selected;

    const sections = images.filter((s) => s.title !== "Featured");
    const isFullscreen = selected !== null;

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key !== "Escape") return;
            if (selected !== null) setSelected(null);
            else onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selected, onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 bg-white"
            role="dialog"
            aria-modal="true"
            aria-label="All photos"
        >
            {/* ── Gallery browse ── */}
            <div
                className={`absolute inset-0 flex flex-col transition-opacity duration-200 ${isFullscreen ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"}`}
            >
                <div className="flex items-center justify-between px-8 py-5 border-b border-[#EBEBEB] shrink-0">
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

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto px-8 py-10 space-y-20">
                        {sections.map((section) => (
                            <div key={section.title} className="flex gap-14">
                                {/* Sticky title column */}
                                <div className="w-40 shrink-0">
                                    <div className="sticky top-8">
                                        <h3 className="text-lg font-semibold text-[#222222] leading-snug">
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-[#717171] mt-1">
                                            {section.items.length} photos
                                        </p>
                                    </div>
                                </div>

                                {/* Bento grid */}
                                <div className="flex-1 grid grid-cols-3 grid-flow-row-dense auto-rows-[180px] gap-2">
                                    {section.items.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelected(url)}
                                            className={`overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 ${imageSpan(i)}`}
                                        >
                                            <img
                                                src={url}
                                                alt={`${section.title || name} ${i + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                referrerPolicy="no-referrer"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Fullscreen single image ── */}
            <div
                className={`absolute inset-0 flex flex-col transition-opacity duration-200 ${isFullscreen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
            >
                <div className="flex items-center px-8 py-5 border-b border-[#EBEBEB] shrink-0">
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
                <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
                    <img
                        src={lastSelected.current}
                        alt={name}
                        className="max-w-full max-h-full object-contain rounded-2xl"
                        referrerPolicy="no-referrer"
                    />
                </div>
            </div>
        </div>
    );
}
