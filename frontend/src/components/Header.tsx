import { Link } from "react-router";

export function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-[#DDDDDD]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                    <img src="/logo.png" className="h-12 object-contain" alt="BCN Workstation Hub" />
                </Link>

                {/* User menu */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-[#DDDDDD] rounded-full px-3 py-2 hover:shadow-md transition-shadow cursor-pointer">
                        <svg
                            className="w-4 h-4 text-[#222222]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                        <div className="w-8 h-8 bg-[#717171] rounded-full flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-white"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
