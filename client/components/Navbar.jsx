import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SlCompass } from "react-icons/sl";

function Navbar({ openLogin, isDashboard, user, tripView }) {

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();

    const navigate = useNavigate();
    const { id } = useParams();

    const list = [
        { name: 'Features', id: 'Features' },
        { name: 'How it Works', id: 'HowItWorks' }
    ];

    const handleScroll = (id) => {
        const section = document.getElementById(id);
        section?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`w-full flex items-center sticky top-0 z-50
        ${tripView
            ? "h-16 bg-white border-b border-gray-200 px-6 md:px-10"
            : "h-20 bg-white/10 backdrop-blur-md border-b border-white/30 px-10"
        }`}>

            {/* LOGO */}
            <h1
                onClick={() => navigate(`/dashboard`)}
                className="flex items-center gap-2 text-lg font-semibold text-[#00685f] cursor-pointer"
            >
                <SlCompass className="text-xl"/>
                <span className="whitespace-nowrap">
                    {tripView ? "The Ethereal Wayfinder" : "WayFinder"}
                </span>
            </h1>

            {/* CENTER NAV (RESPONSIVE) */}
            {tripView && (
                <div className="hidden md:flex mx-auto gap-10 text-sm font-medium text-gray-500">

                    <span
                        onClick={() => navigate(`/trip/${id}`)}
                        className="cursor-pointer hover:text-gray-800"
                    >
                        Workspace
                    </span>

                    <span
                        onClick={() => navigate(`/trip/${id}/itinerary`)}
                        className="cursor-pointer hover:text-gray-800"
                    >
                        Itinerary
                    </span>

                    <span
                        onClick={() => navigate(`/trip/${id}/proposals`)}
                        className="cursor-pointer hover:text-gray-800"
                    >
                        Proposals
                    </span>

                </div>
            )}

            <div className="ml-auto flex items-center gap-6">

                {/* LANDING NAV */}
                {!isDashboard && !tripView && (
                    <>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                            {list.map((item, index) => (
                                <span
                                    key={index}
                                    onClick={() => handleScroll(item.id)}
                                    className="cursor-pointer hover:text-[#00685f]"
                                >
                                    {item.name}
                                </span>
                            ))}
                        </div>

                        <button
                            onClick={openLogin}
                            className="bg-gradient-to-r from-[#00685f] to-[#008378]
                            text-white px-5 py-2.5 rounded-full text-sm font-semibold">
                            Start Planning
                        </button>
                    </>
                )}

                {/* PROFILE */}
                {(tripView || isDashboard) && (
                    <div className="relative" ref={dropdownRef}>
                        <div
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <span className="hidden md:block text-gray-700 text-sm font-medium">
                                {user?.name || "User"}
                            </span>

                            <div className="w-9 h-9 rounded-full bg-[#00685f] text-white flex items-center justify-center">
                                {(user?.name || "U").charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {open && (
                            <div className="absolute right-0 mt-3 w-40 bg-white rounded-lg shadow-lg border border-gray-200">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Navbar;