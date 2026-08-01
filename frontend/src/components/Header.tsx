import { Link, useNavigate } from "react-router";

export function Header() {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-[#DDDDDD]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-center h-20">
                {/* Logo - Centered. Double-click for host dashboard */}
                <Link
                    to="/"
                    className="flex items-center gap-2 group shrink-0"
                    onDoubleClick={(e) => {
                        e.preventDefault();
                        navigate("/host-dashboard");
                    }}
                >
                    <img src="/logo.png" className="h-12 object-contain" alt="BCN Workstation Hub" />
                </Link>
            </div>
        </header>
    );
}
