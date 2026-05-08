import { Link, useLocation } from 'react-router'

export function Header() {
    const location = useLocation()
    const isHome = location.pathname === '/'

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-[#DDDDDD]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                    <svg className="w-8 h-8 text-[#FF385C]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.96.23-1.78.75-2.49 1.32C8.87 6.4 7.85 10.07 9.07 13.22c.04.1.08.2.08.33 0 .22-.15.42-.35.5-.22.1-.46.04-.65-.12a.868.868 0 0 1-.19-.24c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.26c-.21-.46-.77-1.26-.77-1.26z"/>
                    </svg>
                    <span
                        className="text-[#FF385C] text-xl tracking-tight font-display font-semibold"
                    >
                        BCN Workation Hub
                    </span>
                </Link>

                {/* Center nav pill */}
                <nav className="hidden md:flex items-center gap-1 bg-white border border-[#DDDDDD] rounded-full px-1 py-1 shadow-sm">
                    <Link
                        to="/"
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${isHome ? 'bg-[#222222] text-white' : 'text-[#222222] hover:bg-gray-100'}`}
                    >
                        Stays
                    </Link>
                    <button className="px-5 py-2 rounded-full text-sm font-medium text-[#717171] hover:bg-gray-100 transition-colors cursor-not-allowed">
                        Experiences
                    </button>
                    <button className="px-5 py-2 rounded-full text-sm font-medium text-[#717171] hover:bg-gray-100 transition-colors cursor-not-allowed">
                        Online
                    </button>
                </nav>

                {/* User menu */}
                <div className="flex items-center gap-3">
                    <button className="hidden md:block text-sm font-semibold text-[#222222] hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
                        Become a host
                    </button>
                    <div className="flex items-center gap-2 border border-[#DDDDDD] rounded-full px-3 py-2 hover:shadow-md transition-shadow cursor-pointer">
                        <svg className="w-4 h-4 text-[#222222]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                        <div className="w-8 h-8 bg-[#717171] rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
